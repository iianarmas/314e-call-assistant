import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useScripts() {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all scripts
  useEffect(() => {
    fetchScripts()
  }, [])

  async function fetchScripts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setScripts(data || [])
    } catch (err) {
      console.error('Error fetching scripts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new script
  async function addScript(scriptData) {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .insert([scriptData])
        .select()
        .single()

      if (error) throw error

      setScripts(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding script:', err)
      return { success: false, error: err.message }
    }
  }

  // Update script
  async function updateScript(scriptId, updates) {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .update(updates)
        .eq('id', scriptId)
        .select()
        .single()

      if (error) throw error

      setScripts(prev => prev.map(s => s.id === scriptId ? data : s))
      return { success: true, data }
    } catch (err) {
      console.error('Error updating script:', err)
      return { success: false, error: err.message }
    }
  }

  // Delete script
  async function deleteScript(scriptId) {
    try {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId)

      if (error) throw error

      setScripts(prev => prev.filter(s => s.id !== scriptId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting script:', err)
      return { success: false, error: err.message }
    }
  }

  // Toggle active status
  async function toggleActive(scriptId, currentStatus) {
    return updateScript(scriptId, { is_active: !currentStatus })
  }

  // Create new version
  async function createVersion(parentScriptId, newContent) {
    try {
      // Get parent script
      const { data: parent, error: fetchError } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', parentScriptId)
        .single()

      if (fetchError) throw fetchError

      // Create new version
      const newVersion = {
        name: parent.name,
        script_type: parent.script_type,
        product: parent.product,
        approach: parent.approach,
        trigger_type: parent.trigger_type,
        content: newContent,
        is_active: true,
        version: parent.version + 1,
        parent_script_id: parentScriptId
      }

      const { data, error } = await supabase
        .from('scripts')
        .insert([newVersion])
        .select()
        .single()

      if (error) throw error

      // Deactivate parent
      await updateScript(parentScriptId, { is_active: false })

      setScripts(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error creating version:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    scripts,
    loading,
    error,
    addScript,
    updateScript,
    deleteScript,
    toggleActive,
    createVersion,
    refreshScripts: fetchScripts
  }
}
