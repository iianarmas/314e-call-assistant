import { useState, useEffect } from 'react'

export function useCallSession(contactId) {
  const [sessionData, setSessionData] = useState({
    qualificationData: {},
    notes: {},
    objections: [],
    outcome: null
  })

  const [autoSaveTimer, setAutoSaveTimer] = useState(null)

  // Update qualification data
  const updateQualificationData = (data, completedItems, isDemoEligible) => {
    setSessionData(prev => ({
      ...prev,
      qualificationData: {
        ...data,
        completedItems,
        isDemoEligible
      }
    }))
  }

  // Update notes (for Muspell)
  const updateNotes = (data) => {
    setSessionData(prev => ({
      ...prev,
      notes: data
    }))
  }

  // Add objection to log
  const logObjection = (objection, response) => {
    setSessionData(prev => ({
      ...prev,
      objections: [
        ...prev.objections,
        {
          objection,
          response,
          timestamp: new Date().toISOString()
        }
      ]
    }))
  }

  // Set call outcome
  const setOutcome = (outcome) => {
    setSessionData(prev => ({
      ...prev,
      outcome
    }))
  }

  // Auto-save trigger (every time session data changes)
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Trigger auto-save after 3 seconds of no changes
    const timer = setTimeout(() => {
      // Auto-save logic would go here
      console.log('Auto-saving session data...', sessionData)
    }, 3000)

    setAutoSaveTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [sessionData])

  return {
    sessionData,
    updateQualificationData,
    updateNotes,
    logObjection,
    setOutcome
  }
}
