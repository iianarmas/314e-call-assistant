import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setContacts(data || [])
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
