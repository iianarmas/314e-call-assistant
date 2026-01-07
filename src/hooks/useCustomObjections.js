import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCustomObjections() {
  const [objections, setObjections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all custom objections
  useEffect(() => {
    fetchObjections()
  }, [])

  async function fetchObjections() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('custom_objections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setObjections(data || [])
    } catch (err) {
      console.error('Error fetching custom objections:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new objection
  async function addObjection(objectionData) {
    try {
      const { data, error } = await supabase
        .from('custom_objections')
        .insert([objectionData])
        .select()
        .single()

      if (error) throw error

      setObjections(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding objection:', err)
      return { success: false, error: err.message }
    }
  }

  // Update objection
  async function updateObjection(objectionId, updates) {
    try {
      const { data, error } = await supabase
        .from('custom_objections')
        .update(updates)
        .eq('id', objectionId)
        .select()
        .single()

      if (error) throw error

      setObjections(prev => prev.map(o => o.id === objectionId ? data : o))
      return { success: true, data }
    } catch (err) {
      console.error('Error updating objection:', err)
      return { success: false, error: err.message }
    }
  }

  // Delete objection
  async function deleteObjection(objectionId) {
    try {
      const { error } = await supabase
        .from('custom_objections')
        .delete()
        .eq('id', objectionId)

      if (error) throw error

      setObjections(prev => prev.filter(o => o.id !== objectionId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting objection:', err)
      return { success: false, error: err.message }
    }
  }

  // Toggle active status
  async function toggleActive(objectionId, currentStatus) {
    return updateObjection(objectionId, { is_active: !currentStatus })
  }

  return {
    objections,
    loading,
    error,
    addObjection,
    updateObjection,
    deleteObjection,
    toggleActive,
    refreshObjections: fetchObjections
  }
}
