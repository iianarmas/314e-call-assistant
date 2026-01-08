import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadAllCallFlows } from '../utils/callFlowParser'
import { mergeScriptsIntoCallFlows, mergeCompetitorObjectionsIntoFlows } from '../utils/mergeScriptsIntoCallFlows'
import { useCallFlowNavigation } from '../hooks/useCallFlowNavigation'
import { useAIPitchBuilder } from '../hooks/useAIPitchBuilder'
import { useCallSession } from '../hooks/useCallSession'
import { useCallLog } from '../hooks/useCallLog'
import CallFlowNavigator from '../components/CallFlowNavigator'
import CallFlowContentPanel from '../components/CallFlowContentPanel'
import SmartNotesPanel from '../components/SmartNotesPanel'
import { JOB_TITLES, getSuggestedCallFlow } from '../constants/jobTitles'

/**
 * CallPage with 3-Panel Call Flow Navigator - Company-First Architecture
 * Now uses companyId instead of contactId
 * Contact name/title entered on-the-fly (session only, not saved to DB)
 */
export default function CallPageWithFlowNavigator() {
  const { companyId } = useParams()
  const navigate = useNavigate()

  // Company and call flows state
  const [company, setCompany] = useState(null)
  const [callFlows, setCallFlows] = useState([])
  const [selectedCallFlow, setSelectedCallFlow] = useState(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [loadingCallFlows, setLoadingCallFlows] = useState(true)

  // Session-only contact state (not saved to database)
  const [contactName, setContactName] = useState('')
  const [product, setProduct] = useState('Dexit')
  const [jobTitle, setJobTitle] = useState('')
  const [callFlow, setCallFlow] = useState('')

  // Notes and AI state
  const [callNotes, setCallNotes] = useState('')
  const [aiPitch, setAiPitch] = useState(null)
  const [selectedAIModel, setSelectedAIModel] = useState('sonnet') // Only Sonnet 4 available

  // Expanded competitors for auto-expansion based on company DMS
  const [expandedCompetitors, setExpandedCompetitors] = useState({})

  // Hooks
  const { activeSection, navigateToSection, jumpToSectionByNumber } = useCallFlowNavigation(selectedCallFlow)
  const { generateCustomPitch, generating, tokenUsage, estimateTokens } = useAIPitchBuilder()
  const { sessionData, updateNotes, logObjection, setOutcome } = useCallSession(companyId)
  const { saveCallLog } = useCallLog()
  const [refreshKey, setRefreshKey] = useState(0)

  // Load company from database
  useEffect(() => {
    async function fetchCompany() {
      try {
        setLoadingCompany(true)
        setCompany(null)

        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single()

        if (error) throw error

        console.log('Loaded company:', data)
        setCompany(data)
      } catch (err) {
        console.error('Error loading company:', err)
        alert('Error loading company')
        navigate('/companies')
      } finally {
        setLoadingCompany(false)
      }
    }

    fetchCompany()
  }, [companyId, navigate, refreshKey])

  // Load call flows and merge database scripts
  useEffect(() => {
    async function initCallFlows() {
      try {
        // Load markdown call flows
        const flows = await loadAllCallFlows()
        console.log('Loaded call flows from markdown:', flows.map(f => ({ name: f.name, approach: f.approach })))

        // Load database scripts
        const { data: dbScripts, error } = await supabase
          .from('scripts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading database scripts:', error)
        }

        // Merge database scripts into call flows
        let mergedFlows = mergeScriptsIntoCallFlows(flows, dbScripts || [])
        console.log('Merged call flows with database scripts:', mergedFlows.map(f => ({
          name: f.name,
          approach: f.approach,
          sections: {
            opening: f.sections.opening.versions.length,
            discovery: f.sections.discovery.length,
            objections: f.sections.objections.length,
            closing: f.sections.closing.versions.length
          }
        })))

        // Load competitor objections markdown
        try {
          const response = await fetch('/docs/dobj-main.md')
          if (response.ok) {
            const competitorMd = await response.text()
            // Merge competitor objections into all call flows
            mergedFlows = mergeCompetitorObjectionsIntoFlows(mergedFlows, competitorMd, dbScripts || [])
            console.log('Merged competitor objections:', mergedFlows[0]?.sections?.competitor_objections?.competitors?.length || 0, 'competitors')
          } else {
            console.warn('Competitor objections document not found')
          }
        } catch (compError) {
          console.error('Error loading competitor objections:', compError)
        }

        setCallFlows(mergedFlows)
      } catch (err) {
        console.error('Error loading call flows:', err)
      } finally {
        setLoadingCallFlows(false)
      }
    }

    initCallFlows()
  }, [])

  // Auto-select call flow based on product and job title
  useEffect(() => {
    if (product && jobTitle && callFlows.length > 0) {
      // Filter flows by product
      const matchingFlows = callFlows.filter(flow =>
        flow.product?.toLowerCase() === product.toLowerCase()
      )

      if (matchingFlows.length === 0) {
        if (callFlows.length > 0) {
          setSelectedCallFlow(callFlows[0])
        }
        return
      }

      // Try to match by approach/call flow name
      const flowToUse = matchingFlows.find(flow =>
        flow.approach?.toLowerCase().includes(callFlow.toLowerCase()) ||
        flow.name?.toLowerCase().includes(callFlow.toLowerCase())
      ) || matchingFlows[0]

      setSelectedCallFlow(flowToUse)
    }
  }, [product, jobTitle, callFlow, callFlows])

  // Auto-expand competitor objections based on company DMS
  useEffect(() => {
    if (company?.dms_system && callFlows.length > 0) {
      const competitorId = getCompetitorIdFromDMS(company.dms_system)
      if (competitorId) {
        setExpandedCompetitors({ [competitorId]: true })
      }
    }
  }, [company, callFlows])

  // Keyboard shortcuts - FIXED: Removed Ctrl+N and Ctrl+G
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts if not typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      // Number keys 1-5: Jump to sections
      if (e.key >= '1' && e.key <= '5') {
        e.preventDefault()
        jumpToSectionByNumber(parseInt(e.key))
      }

      // Escape: Clear AI response
      if (e.key === 'Escape' && aiPitch) {
        setAiPitch(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aiPitch, jumpToSectionByNumber])

  // Handlers
  const handleNotesChange = (notes) => {
    setCallNotes(notes)
    updateNotes(notes)
  }

  const handleGenerateAIPitch = async () => {
    if (callNotes.length < 10) {
      alert('Please enter at least 10 characters of notes')
      return
    }

    // Build context with company + session contact data
    const context = buildContext()

    const result = await generateCustomPitch({
      contact: context.contact, // Virtual contact object
      company: company,
      callFlowType: selectedCallFlow?.approach || 'General',
      notes: callNotes,
      raisedObjections: [],
      discoveryAnswers: {},
      context: context,
      modelOverride: selectedAIModel
    })

    if (result.success) {
      setAiPitch(result.pitch)
    } else {
      alert('Error generating pitch: ' + result.error)
    }
  }

  // Build context for variable replacement and AI
  const buildContext = () => {
    const nameParts = contactName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return {
      company: company || {},
      contact: {
        name: contactName,
        title: jobTitle,
        first_name: firstName,
        last_name: lastName
      },
      rep: {
        name: localStorage.getItem('rep_name') || 'Chris Armas',
        first_name: localStorage.getItem('rep_first_name') || 'Chris',
        company: localStorage.getItem('rep_company') || 'Dexit Solutions'
      },
      product: {
        name: product
      },
      ehr: company?.ehr_system || '',
      dms: company?.dms_system || '',
      trigger: company?.trigger_type || '',
      callNotes: callNotes
    }
  }

  const handleCopyToCenter = () => {
    // Copy AI pitch to center panel by creating a custom section
    navigateToSection({
      section: 'ai_pitch',
      index: 0,
      data: {
        content: aiPitch,
        label: 'AI-Generated Pitch'
      }
    })
  }

  const handleEndCall = async () => {
    // Save call log with company context
    const callData = {
      notes: callNotes,
      objections: sessionData.objections || [],
      outcome: sessionData.outcome,
      call_notes: callNotes,
      structured_notes: {
        callFlowUsed: selectedCallFlow?.name,
        contactName: contactName,
        jobTitle: jobTitle,
        product: product,
        sectionsViewed: []
      },
      ai_pitch_generated: !!aiPitch,
      ai_tokens_used: tokenUsage.total || 0
    }

    await saveCallLog(companyId, callData)
    navigate('/companies')
  }

  // Loading states
  if (loadingCompany || loadingCallFlows) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading call interface...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Company not found</p>
          <button
            onClick={() => navigate('/companies')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Companies
          </button>
        </div>
      </div>
    )
  }

  console.log('Company data:', JSON.stringify(company, null, 2))

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Top Bar - Single Row */}
      <div className="flex-none bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Company + Contact Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate('/companies')}
              className="text-blue-100 hover:text-white text-sm whitespace-nowrap"
            >
              ← Back
            </button>
            <div className="border-l border-blue-400 pl-4 flex items-center gap-4 flex-1 min-w-0">
              <div className="min-w-0">
                <div className="text-white font-semibold text-sm truncate">{company?.name || 'Loading...'}</div>
                <div className="text-blue-100 text-xs">
                  {company?.dms_system || 'No DMS'} • {company?.ehr_system || 'No EHR'}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Call Prep Inputs - Inline */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              className="w-32 px-2 py-1 text-sm border border-blue-400 rounded bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-1 focus:ring-white"
            />
            <select
              value={product}
              onChange={(e) => {
                const newProduct = e.target.value
                setProduct(newProduct)
                setJobTitle('') // Reset title when product changes
                setCallFlow('') // Reset flow
              }}
              className="px-2 py-1 text-sm border border-blue-400 rounded bg-white text-blue-900 focus:outline-none focus:ring-1 focus:ring-white"
            >
              <option value="Dexit">Dexit</option>
              <option value="Muspell">Muspell</option>
            </select>
            <select
              value={jobTitle}
              onChange={(e) => {
                const newTitle = e.target.value
                setJobTitle(newTitle)
                // Auto-select call flow based on title
                const suggestedFlow = getSuggestedCallFlow(product, newTitle)
                if (suggestedFlow) {
                  setCallFlow(suggestedFlow)
                }
              }}
              className="px-2 py-1 text-sm border border-blue-400 rounded bg-white text-blue-900 focus:outline-none focus:ring-1 focus:ring-white"
              disabled={!product}
            >
              <option value="">Title...</option>
              {product && JOB_TITLES[product]?.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="text-white hover:bg-white/10 px-2 py-1 rounded text-sm"
              title="Refresh"
            >
              🔄
            </button>
            <button
              onClick={handleEndCall}
              className="px-3 py-1 bg-white text-blue-700 rounded text-sm font-medium hover:bg-blue-50"
            >
              End Call
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Navigation */}
        <div className="w-80 flex-shrink-0">
          <CallFlowNavigator
            callFlow={selectedCallFlow}
            activeSection={activeSection}
            onSectionSelect={navigateToSection}
            expandedCompetitors={expandedCompetitors}
            onToggleCompetitor={(competitorId) => {
              setExpandedCompetitors(prev => ({
                ...prev,
                [competitorId]: !prev[competitorId]
              }))
            }}
          />
        </div>

        {/* Center Panel: Content Display */}
        <div className="flex-1">
          <CallFlowContentPanel
            activeSection={activeSection}
            callFlow={selectedCallFlow}
            context={buildContext()}
            notes={callNotes}
          />
        </div>

        {/* Right Panel: Smart Notes & AI */}
        <div className="w-96 flex-shrink-0">
          <SmartNotesPanel
            notes={callNotes}
            onNotesChange={handleNotesChange}
            onGeneratePitch={handleGenerateAIPitch}
            aiResponse={aiPitch}
            generating={generating}
            tokenCost={estimateTokens(callNotes)}
            onCopyToCenter={handleCopyToCenter}
            company={company}
            contact={buildContext().contact}
            autoGenerate={true}
            selectedModel={selectedAIModel}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Map company DMS system to competitor ID for auto-expansion
 */
function getCompetitorIdFromDMS(dms) {
  if (!dms) return null

  const mapping = {
    'OnBase': 'onbase',
    'Epic Gallery': 'epic',
    'Cerner WQM': 'cerner',
    'RightFax': 'rightfax',
    'athenahealth': 'athena',
    'eClinicalWorks': 'ecw',
    'Nextgen': 'nextgen',
    'Custom': null, // No specific competitor
    'None': null // No competitor
  }

  return mapping[dms] || null
}
