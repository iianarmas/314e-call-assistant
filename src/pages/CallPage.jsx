import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { loadScripts } from '../utils/scriptParser'
import { selectBaseScript } from '../utils/scriptGenerator'
import { buildObjectionLibrary, findRelevantExamples } from '../utils/objectionParser'
import { useScriptGeneration } from '../hooks/useScriptGeneration'
import { useCallSession } from '../hooks/useCallSession'
import { useCallLog } from '../hooks/useCallLog'
import ScriptDisplay from '../components/ScriptDisplay'
import QualificationTracker from '../components/QualificationTracker'
import NotesPanel from '../components/NotesPanel'
import ObjectionHandler from '../components/ObjectionHandler'

export default function CallPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()

  const [contact, setContact] = useState(null)
  const [scripts, setScripts] = useState(null)
  const [objectionLibrary, setObjectionLibrary] = useState({ dexit: [], muspell: [] })
  const [currentScript, setCurrentScript] = useState('')
  const [loadingContact, setLoadingContact] = useState(true)
  const [loadingScripts, setLoadingScripts] = useState(true)

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
        navigate('/')
      } finally {
        setLoadingContact(false)
      }
    }

    fetchContact()
  }, [contactId])

  // Load scripts from docs folder
  useEffect(() => {
    async function initScripts() {
      const loadedScripts = await loadScripts()
      if (loadedScripts) {
        setScripts(loadedScripts)
        const library = buildObjectionLibrary(loadedScripts)
        setObjectionLibrary(library)
      }
      setLoadingScripts(false)
    }

    initScripts()
  }, [])

  // Generate opening script when contact and scripts are loaded
  useEffect(() => {
    if (contact && scripts && !currentScript) {
      handleGenerateOpening()
    }
  }, [contact, scripts])

  const handleGenerateOpening = async () => {
    const baseScript = selectBaseScript(contact, scripts)
    const result = await generateOpeningScript(contact, baseScript?.content || '')

    if (result.success) {
      setCurrentScript(result.script)
    } else {
      setCurrentScript('Error generating script. Please try again.')
    }
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
    const result = await generateClosingScript(contact, qualData, closingType)

    if (result.success) {
      setCurrentScript(result.script)
      setOutcome(closingType)
    }
  }

  const handleEndCall = async () => {
    // Save call log to database
    const callData = {
      qualificationData: sessionData.qualificationData,
      notes: sessionData.notes,
      objections: sessionData.objections,
      outcome: sessionData.outcome
    }

    await saveCallLog(contactId, callData)

    // Navigate back to contacts
    navigate('/')
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
            onClick={() => navigate('/')}
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Interface</h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time assistance for your call
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Contacts
          </button>
        </div>

        {/* Main layout: Script (left) + Data Entry (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Script Display + Objection Handler + Closing */}
          <div className="space-y-4">
            <ScriptDisplay
              contact={contact}
              script={currentScript}
              loading={generating}
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
