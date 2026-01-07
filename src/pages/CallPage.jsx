import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadScripts } from '../utils/scriptParser'
import { selectBaseScript } from '../utils/scriptGenerator'
import { selectDatabaseScript, incrementScriptUsage } from '../utils/scriptSelector'
import { buildObjectionLibrary, findRelevantExamples } from '../utils/objectionParser'
import { useScriptGeneration } from '../hooks/useScriptGeneration'
import { useCallSession } from '../hooks/useCallSession'
import { useCallLog } from '../hooks/useCallLog'
import ScriptDisplay from '../components/ScriptDisplay'
import ScriptSelector from '../components/ScriptSelector'
import QualificationTracker from '../components/QualificationTracker'
import NotesPanel from '../components/NotesPanel'
import ObjectionHandler from '../components/ObjectionHandler'

export default function CallPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()

  const [contact, setContact] = useState(null)
  const [scripts, setScripts] = useState(null)
  const [databaseScripts, setDatabaseScripts] = useState([])
  const [objectionLibrary, setObjectionLibrary] = useState({ dexit: [], muspell: [] })
  const [currentScript, setCurrentScript] = useState('')
  const [loadingContact, setLoadingContact] = useState(true)
  const [loadingScripts, setLoadingScripts] = useState(true)
  const [callStarted, setCallStarted] = useState(false)
  const [selectedOpeningScriptId, setSelectedOpeningScriptId] = useState(null)
  const [autoSelectedOpeningScriptId, setAutoSelectedOpeningScriptId] = useState(null)
  const [usedScripts, setUsedScripts] = useState({
    opening: null,
    closing: null
  })

  const { generating, generateOpeningScript, generateObjectionResponse, generateClosingScript } = useScriptGeneration()
  const { sessionData, updateQualificationData, updateNotes, logObjection, setOutcome } = useCallSession(contactId)
  const { saveCallLog } = useCallLog()

  // Load contact from database
  useEffect(() => {
    async function fetchContact() {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single()

        if (error) throw error
        setContact(data)
      } catch (err) {
        console.error('Error loading contact:', err)
        alert('Error loading contact')
        navigate('/contacts')
      } finally {
        setLoadingContact(false)
      }
    }

    fetchContact()
  }, [contactId])

  // Load scripts from docs folder AND database
  useEffect(() => {
    async function initScripts() {
      // Load file-based scripts
      const loadedScripts = await loadScripts()
      if (loadedScripts) {
        setScripts(loadedScripts)
        const library = buildObjectionLibrary(loadedScripts)
        setObjectionLibrary(library)
      }

      // Load database scripts
      try {
        const { data, error } = await supabase
          .from('scripts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setDatabaseScripts(data || [])
      } catch (err) {
        console.error('Error loading database scripts:', err)
      }

      setLoadingScripts(false)
    }

    initScripts()
  }, [])

  const handleStartCall = async () => {
    // Auto-select script if none selected
    if (!selectedOpeningScriptId && databaseScripts.length > 0) {
      const autoScript = selectDatabaseScript(contact, databaseScripts, 'opening')
      if (autoScript) {
        setSelectedOpeningScriptId(autoScript.id)
        setAutoSelectedOpeningScriptId(autoScript.id)
      }
    }

    setCallStarted(true)
    handleGenerateOpening()
  }

  const handleGenerateOpening = async () => {
    let baseScriptContent = ''
    let scriptId = null

    // Use manually selected script, or auto-selected, or fallback to file-based
    if (selectedOpeningScriptId) {
      const dbScript = databaseScripts.find(s => s.id === selectedOpeningScriptId)
      if (dbScript) {
        baseScriptContent = dbScript.content
        scriptId = dbScript.id

        // Increment usage count
        await incrementScriptUsage(scriptId, supabase)

        // Track which script was used
        setUsedScripts(prev => ({ ...prev, opening: scriptId }))
      }
    } else {
      // Fall back to file-based scripts
      const baseScript = selectBaseScript(contact, scripts)
      baseScriptContent = baseScript?.content || ''
    }

    const result = await generateOpeningScript(contact, baseScriptContent)

    if (result.success) {
      setCurrentScript(result.script)
    } else {
      setCurrentScript('Error generating script. Please try again.')
    }
  }

  const handleRegenerateOpening = () => {
    handleGenerateOpening()
  }

  const handleObjectionResponse = async (objectionOrResponse, type) => {
    if (type === 'quick') {
      // Pre-written response (instant)
      setCurrentScript(objectionOrResponse)
      logObjection('Quick objection', objectionOrResponse)
    } else if (type === 'custom') {
      // Generate AI response
      const relevantExamples = findRelevantExamples(
        objectionOrResponse,
        objectionLibrary,
        contact.product
      )

      const result = await generateObjectionResponse(
        objectionOrResponse,
        contact,
        contact.product,
        relevantExamples
      )

      if (result.success) {
        setCurrentScript(result.response)
        logObjection(objectionOrResponse, result.response)
      } else {
        alert('Error generating response: ' + result.error)
      }
    }
  }

  const handleCloseCall = async (closingType) => {
    const qualData = contact.product === 'Dexit' ? sessionData.qualificationData : null

    // Try to find a database closing script
    const dbScript = selectDatabaseScript(contact, databaseScripts, 'closing')
    let closingScriptId = null

    if (dbScript) {
      closingScriptId = dbScript.id
      await incrementScriptUsage(closingScriptId, supabase)
      setUsedScripts(prev => ({ ...prev, closing: closingScriptId }))
    }

    const result = await generateClosingScript(contact, qualData, closingType)

    if (result.success) {
      setCurrentScript(result.script)
      setOutcome(closingType)
    }
  }

  const handleEndCall = async () => {
    // Save call log to database with script tracking
    const callData = {
      qualificationData: sessionData.qualificationData,
      notes: sessionData.notes,
      objections: sessionData.objections,
      outcome: sessionData.outcome,
      openingScriptId: usedScripts.opening,
      closingScriptId: usedScripts.closing,
      objectionResponses: sessionData.objections // Store objections as JSONB
    }

    await saveCallLog(contactId, callData)

    // Navigate back to contacts
    navigate('/contacts')
  }

  if (loadingContact || loadingScripts) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main layout: Script (left) + Data Entry (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Script Display + Objection Handler + Closing */}
          <div className="space-y-4">
            {/* Script Selector - shown before call starts */}
            {!callStarted && databaseScripts.length > 0 && (
              <ScriptSelector
                contact={contact}
                scripts={databaseScripts}
                scriptType="opening"
                selectedScriptId={selectedOpeningScriptId}
                onSelectScript={setSelectedOpeningScriptId}
                autoSelectedScriptId={autoSelectedOpeningScriptId}
              />
            )}

            <ScriptDisplay
              contact={contact}
              script={currentScript}
              loading={generating}
              onStartCall={handleStartCall}
              callStarted={callStarted}
              onRegenerate={callStarted ? handleRegenerateOpening : null}
            />

            {/* Objection Handler */}
            <ObjectionHandler
              product={contact.product}
              contact={contact}
              objectionLibrary={objectionLibrary}
              onGenerateResponse={handleObjectionResponse}
              generating={generating}
            />

            {/* Closing buttons */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Close Call</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCloseCall('discovery')}
                  disabled={generating}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Schedule Discovery Call
                </button>

                {contact.product === 'Dexit' && sessionData.qualificationData?.isDemoEligible && (
                  <button
                    onClick={() => handleCloseCall('demo')}
                    disabled={generating}
                    className="w-full bg-green-600 text-white px-4 py-2.5 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Schedule Demo ⭐
                  </button>
                )}

                <button
                  onClick={handleEndCall}
                  className="w-full bg-gray-600 text-white px-4 py-2.5 rounded-md font-medium hover:bg-gray-700 transition-colors"
                >
                  End Call & Save
                </button>
              </div>

              {contact.product === 'Dexit' && sessionData.qualificationData?.completedItems > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  {sessionData.qualificationData.isDemoEligible
                    ? '✓ Demo eligible! You can offer a product demo.'
                    : `Collect ${4 - (sessionData.qualificationData.completedItems || 0)} more items to offer a demo.`}
                </p>
              )}
            </div>
          </div>

          {/* Right: Data Entry */}
          <div>
            {contact.product === 'Dexit' ? (
              <QualificationTracker
                onDataChange={updateQualificationData}
              />
            ) : (
              <NotesPanel
                contact={contact}
                onDataChange={updateNotes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
