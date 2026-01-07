import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCallLog() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Save call log to database
   */
  const saveCallLog = async (contactId, callData) => {
    try {
      setSaving(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('call_logs')
        .insert([{
          contact_id: contactId,
          qualification_data: callData.qualificationData || null,
          notes: callData.notes || null,
          objections_handled: callData.objections || [],
          outcome: callData.outcome || null, // 'demo', 'discovery', 'no_meeting', etc.
          opening_script_id: callData.openingScriptId || null,
          closing_script_id: callData.closingScriptId || null,
          objection_responses: callData.objectionResponses || null,
          ai_generated: callData.aiGenerated || false,
          regeneration_count: callData.regenerationCount || 0,
          created_at: new Date().toISOString()
        }])
        .select()

      if (insertError) throw insertError

      setSaving(false)
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error saving call log:', err)
      setError(err.message)
      setSaving(false)
      return { success: false, error: err.message }
    }
  }

  /**
   * Auto-save call data (for periodic saves during call)
   */
  const autoSave = async (contactId, partialData) => {
    // Silently save without showing errors to user
    try {
      await saveCallLog(contactId, partialData)
    } catch (err) {
      console.warn('Auto-save failed:', err)
    }
  }

  /**
   * Get call history for a contact
   */
  const getCallHistory = async (contactId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return { success: true, data }
    } catch (err) {
      console.error('Error fetching call history:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    saving,
    error,
    saveCallLog,
    autoSave,
    getCallHistory
  }
}
