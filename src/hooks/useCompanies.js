import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook for managing companies
 * Provides CRUD operations for the companies table
 */
export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load all companies for the current user
  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setCompanies(data || [])
    } catch (err) {
      console.error('Error loading companies:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load companies on mount
  useEffect(() => {
    loadCompanies()
  }, [])

  // Create a new company
  const createCompany = async (companyData) => {
    try {
      // Try to get current user, but don't fail if not authenticated
      const { data: { user } } = await supabase.auth.getUser()

      // Add user_id if user exists, otherwise use a default UUID
      const dataWithUser = {
        ...companyData,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000'
      }

      const { data, error: insertError } = await supabase
        .from('companies')
        .insert([dataWithUser])
        .select()
        .single()

      if (insertError) {
        // If RLS error, provide helpful message
        if (insertError.code === '42501' || insertError.message.includes('row-level security')) {
          throw new Error('Database security error. Please disable RLS on companies table or set up authentication.')
        }
        throw insertError
      }

      // Add to local state
      setCompanies(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))

      return { success: true, data }
    } catch (err) {
      console.error('Error creating company:', err)
      return { success: false, error: err.message }
    }
  }

  // Update an existing company
  const updateCompany = async (id, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setCompanies(prev =>
        prev.map(company => company.id === id ? data : company)
          .sort((a, b) => a.name.localeCompare(b.name))
      )

      return { success: true, data }
    } catch (err) {
      console.error('Error updating company:', err)
      return { success: false, error: err.message }
    }
  }

  // Delete a company
  const deleteCompany = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Remove from local state
      setCompanies(prev => prev.filter(company => company.id !== id))

      return { success: true }
    } catch (err) {
      console.error('Error deleting company:', err)
      return { success: false, error: err.message }
    }
  }

  // Get a single company by ID
  const getCompany = async (id) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { success: true, data }
    } catch (err) {
      console.error('Error fetching company:', err)
      return { success: false, error: err.message }
    }
  }

  // Search companies by name
  const searchCompanies = (searchTerm) => {
    if (!searchTerm) return companies

    const term = searchTerm.toLowerCase()
    return companies.filter(company =>
      company.name.toLowerCase().includes(term) ||
      company.industry?.toLowerCase().includes(term)
    )
  }

  // Filter companies by DMS system
  const filterByDMS = (dmsSystem) => {
    if (!dmsSystem || dmsSystem === 'All') return companies
    return companies.filter(company => company.dms_system === dmsSystem)
  }

  // Filter companies by trigger type
  const filterByTrigger = (triggerType) => {
    if (!triggerType || triggerType === 'All') return companies
    return companies.filter(company => company.trigger_type === triggerType)
  }

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompany,
    searchCompanies,
    filterByDMS,
    filterByTrigger,
    refresh: loadCompanies
  }
}
