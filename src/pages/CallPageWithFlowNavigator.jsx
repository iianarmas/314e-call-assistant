import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadAllCallFlows } from '../utils/callFlowParser'
import { mergeScriptsIntoCallFlows } from '../utils/mergeScriptsIntoCallFlows'
import { useCallFlowNavigation } from '../hooks/useCallFlowNavigation'
import { useAIPitchBuilder } from '../hooks/useAIPitchBuilder'
import { useCallSession } from '../hooks/useCallSession'
import { useCallLog } from '../hooks/useCallLog'
import CallFlowNavigator from '../components/CallFlowNavigator'
import CallFlowContentPanel from '../components/CallFlowContentPanel'
import SmartNotesPanel from '../components/SmartNotesPanel'

/**
 * CallPage with 3-Panel Call Flow Navigator
 * Replaces the old linear script display with instant call flow navigation
 */
export default function CallPageWithFlowNavigator() {
  const { contactId } = useParams()
  const navigate = useNavigate()

  // Contact and call flows state
  const [contact, setContact] = useState(null)
  const [callFlows, setCallFlows] = useState([])
  const [selectedCallFlow, setSelectedCallFlow] = useState(null)
  const [loadingContact, setLoadingContact] = useState(true)
  const [loadingCallFlows, setLoadingCallFlows] = useState(true)

  // Notes and AI state
  const [callNotes, setCallNotes] = useState('')
  const [aiPitch, setAiPitch] = useState(null)
  const [selectedAIModel, setSelectedAIModel] = useState('sonnet') // Only Sonnet 4 available

  // Hooks
  const { activeSection, navigateToSection, jumpToSectionByNumber } = useCallFlowNavigation(selectedCallFlow)
  const { generateCustomPitch, generating, tokenUsage, estimateTokens } = useAIPitchBuilder()
  const { sessionData, updateNotes, logObjection, setOutcome } = useCallSession(contactId)
  const { saveCallLog } = useCallLog()
  const [refreshKey, setRefreshKey] = useState(0)

  // Load contact from database
  useEffect(() => {
    async function fetchContact() {
      try {
        // Reset loading state and contact to force re-render
        setLoadingContact(true)
        setContact(null)

        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single()

        if (error) throw error

        console.log('Loaded contact:', data) // Debug log
        setContact(data)

        // Load contact's existing notes if any
        if (data.notes) {
          setCallNotes(data.notes)
        }
      } catch (err) {
        console.error('Error loading contact:', err)
        alert('Error loading contact')
        navigate('/contacts')
      } finally {
        setLoadingContact(false)
      }
    }

    fetchContact()
  }, [contactId, navigate, refreshKey])

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
        const mergedFlows = mergeScriptsIntoCallFlows(flows, dbScripts || [])
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

        setCallFlows(mergedFlows)
      } catch (err) {
        console.error('Error loading call flows:', err)
      } finally {
        setLoadingCallFlows(false)
      }
    }

    initCallFlows()
  }, [])

  // Auto-select appropriate call flow based on contact
  useEffect(() => {
    if (contact && callFlows.length > 0 && !selectedCallFlow) {
      // Select call flow based on contact's product and title
      const flow = selectCallFlowForContact(contact, callFlows)
      setSelectedCallFlow(flow)
    }
  }, [contact, callFlows, selectedCallFlow])

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

    const result = await generateCustomPitch({
      contact,
      callFlowType: selectedCallFlow?.approach || 'General',
      notes: callNotes,
      raisedObjections: [],
      discoveryAnswers: {},
      context: {},
      modelOverride: selectedAIModel // Pass selected model
    })

    if (result.success) {
      setAiPitch(result.pitch)
    } else {
      alert('Error generating pitch: ' + result.error)
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
    // Save notes to contact profile
    if (callNotes) {
      await supabase
        .from('contacts')
        .update({ notes: callNotes })
        .eq('id', contactId)
    }

    // Save call log with new fields
    const callData = {
      notes: callNotes,
      objections: sessionData.objections || [],
      outcome: sessionData.outcome,
      call_notes: callNotes,
      structured_notes: {
        callFlowUsed: selectedCallFlow?.name,
        sectionsViewed: []
      },
      ai_pitch_generated: !!aiPitch,
      ai_tokens_used: tokenUsage.total || 0
    }

    await saveCallLog(contactId, callData)
    navigate('/contacts')
  }

  // Loading states
  if (loadingContact || loadingCallFlows) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading call interface...</p>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Contact not found</p>
          <button
            onClick={() => navigate('/contacts')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Contacts
          </button>
        </div>
      </div>
    )
  }

  console.log('Contact data:', JSON.stringify(contact, null, 2))

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header - Contact Info Prominent */}
      <div className="flex-none bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/contacts')}
              className="text-blue-100 hover:text-white mb-3 flex items-center gap-2 text-sm"
            >
              ← Back to Contacts
            </button>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl">📞</span>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {contact.first_name && contact.last_name
                    ? `${contact.first_name} ${contact.last_name}`
                    : contact.name || 'Loading'}
                </h1>
                <p className="text-sm text-blue-100 font-medium mt-1">
                  {contact.title || 'No title'}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  {contact.organization || contact.company || 'No org'} • {contact.product || 'No product'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              title="Refresh contact data"
            >
              🔄 Refresh
            </button>

            {/* AI Model Badge - Sonnet 4 Only */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-md">
              <span className="text-sm text-white font-medium">AI Model:</span>
              <span className="text-sm text-white bg-purple-600 px-3 py-1 rounded-md font-semibold">
                Sonnet 4
              </span>
            </div>

            {/* Call Flow Selector */}
            {callFlows.length > 1 && (
              <select
                value={selectedCallFlow?.id || ''}
                onChange={(e) => {
                  const flow = callFlows.find(f => f.id === e.target.value)
                  setSelectedCallFlow(flow)
                }}
                className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {callFlows.map(flow => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleEndCall}
              className="px-4 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 shadow-md"
            >
              End Call & Save
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
          />
        </div>

        {/* Center Panel: Content Display */}
        <div className="flex-1">
          <CallFlowContentPanel
            activeSection={activeSection}
            callFlow={selectedCallFlow}
            contact={contact}
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
            contact={contact}
            autoGenerate={true}
            selectedModel={selectedAIModel}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Select the most appropriate call flow for a contact
 */
function selectCallFlowForContact(contact, callFlows) {
  if (!contact || !callFlows || callFlows.length === 0) {
    return null
  }

  const { product, title } = contact
  const titleLower = title?.toLowerCase() || ''

  // Filter by product first
  let matchingFlows = callFlows.filter(flow => {
    return flow.product.toLowerCase() === product.toLowerCase()
  })

  if (matchingFlows.length === 0) {
    // Fall back to first flow
    return callFlows[0]
  }

  // Determine approach based on title
  let targetApproach = 'HIM' // Default

  // Revenue Cycle keywords (check first)
  const rcKeywords = ['revenue cycle', 'revenue', 'billing', 'collections', 'ar', 'denials', 'claims']

  // IT keywords
  const itKeywords = ['it', 'information technology', 'technology', 'applications',
                      'systems', 'cio', 'cto', 'tech', 'digital', 'informatics',
                      'director of applications', 'information systems', 'data']

  // Provider keywords
  const providerKeywords = ['provider', 'physician', 'doctor', 'md', 'clinical',
                            'ambulatory', 'practice manager', 'medical director',
                            'clinic', 'practice', 'care']

  // HIM keywords
  const himKeywords = ['him', 'health information', 'medical records', 'privacy',
                       'compliance', 'coding', 'documentation', 'records']

  const isRC = rcKeywords.some(keyword => titleLower.includes(keyword))
  const isHIM = himKeywords.some(keyword => titleLower.includes(keyword))
  const isProvider = providerKeywords.some(keyword => titleLower.includes(keyword))
  const isIT = itKeywords.some(keyword => titleLower.includes(keyword))

  // Check in priority order: RC > HIM > Provider > IT
  if (isRC) targetApproach = 'Revenue Cycle'
  else if (isHIM) targetApproach = 'HIM'
  else if (isProvider) targetApproach = 'Ambulatory'
  else if (isIT) targetApproach = 'IT'

  console.log('Contact title:', title, '| Target approach:', targetApproach)
  console.log('Available flows:', matchingFlows.map(f => f.approach))

  // Find flow matching approach
  const exactMatch = matchingFlows.find(flow =>
    flow.approach.toLowerCase() === targetApproach.toLowerCase()
  )

  console.log('Selected flow:', exactMatch?.name || matchingFlows[0]?.name)

  return exactMatch || matchingFlows[0]
}
