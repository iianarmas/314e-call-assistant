import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all contacts with call stats
  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch contacts
      const { data: contactsData, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Fetch call counts and last call dates for each contact
      const { data: callStats, error: statsError } = await supabase
        .from('call_logs')
        .select('contact_id, created_at')

      if (statsError) throw statsError

      // Aggregate call stats
      const statsMap = {}
      if (callStats) {
        callStats.forEach(log => {
          if (!statsMap[log.contact_id]) {
            statsMap[log.contact_id] = {
              count: 0,
              lastCall: log.created_at
            }
          }
          statsMap[log.contact_id].count++
          if (new Date(log.created_at) > new Date(statsMap[log.contact_id].lastCall)) {
            statsMap[log.contact_id].lastCall = log.created_at
          }
        })
      }

      // Merge stats with contacts
      const contactsWithStats = (contactsData || []).map(contact => ({
        ...contact,
        call_count: statsMap[contact.id]?.count || 0,
        last_call_date: statsMap[contact.id]?.lastCall || null
      }))

      setContacts(contactsWithStats)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new contact
  const addContact = async (contactData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()

      if (insertError) throw insertError

      setContacts(prev => [data[0], ...prev])
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error adding contact:', err)
      return { success: false, error: err.message }
    }
  }

  // Bulk import contacts
  const bulkImportContacts = async (contactsArray) => {
    try {
      const { data, error: insertError } = await supabase
        .from('contacts')
        .insert(contactsArray)
        .select()

      if (insertError) throw insertError

      setContacts(prev => [...data, ...prev])
      return { success: true, count: data.length }
    } catch (err) {
      console.error('Error bulk importing contacts:', err)
      return { success: false, error: err.message }
    }
  }

  // Update contact
  const updateContact = async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      setContacts(prev =>
        prev.map(contact => contact.id === id ? data[0] : contact)
      )
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error updating contact:', err)
      return { success: false, error: err.message }
    }
  }

  // Delete contact
  const deleteContact = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setContacts(prev => prev.filter(contact => contact.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting contact:', err)
      return { success: false, error: err.message }
    }
  }

  // Search contacts
  const searchContacts = (query) => {
    if (!query.trim()) return contacts

    const lowerQuery = query.toLowerCase()
    return contacts.filter(contact =>
      contact.name?.toLowerCase().includes(lowerQuery) ||
      contact.company?.toLowerCase().includes(lowerQuery) ||
      contact.title?.toLowerCase().includes(lowerQuery)
    )
  }

  // Filter by product
  const filterByProduct = (product) => {
    if (product === 'All') return contacts
    return contacts.filter(contact => contact.product === product)
  }

  // Filter by trigger type (for Muspell)
  const filterByTrigger = (triggerType) => {
    if (!triggerType || triggerType === 'All') return contacts
    return contacts.filter(contact => contact.trigger_type === triggerType)
  }

  // Load contacts on mount
  useEffect(() => {
    fetchContacts()
  }, [])

  return {
    contacts,
    loading,
    error,
    addContact,
    bulkImportContacts,
    updateContact,
    deleteContact,
    searchContacts,
    filterByProduct,
    filterByTrigger,
    refetch: fetchContacts
  }
}
