import { useState, useMemo } from 'react'
import { useCompanies } from '../hooks/useCompanies'
import CompanyCard from '../components/CompanyCard'
import AddCompanyModal from '../components/AddCompanyModal'
import CompanyProfileModal from '../components/CompanyProfileModal'

/**
 * CompaniesPage - Main page for managing companies
 * Replaces the old ContactsPage
 */
export default function CompaniesPage() {
  const {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany
  } = useCompanies()

  const [searchTerm, setSearchTerm] = useState('')
  const [dmsFilter, setDmsFilter] = useState('All')
  const [triggerFilter, setTriggerFilter] = useState('All')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [editingCompany, setEditingCompany] = useState(null)

  // Get unique DMS systems for filter dropdown
  const dmsSystems = useMemo(() => {
    const systems = new Set(companies.map(c => c.dms_system).filter(Boolean))
    return ['All', ...Array.from(systems).sort()]
  }, [companies])

  // Get unique trigger types for filter dropdown
  const triggerTypes = useMemo(() => {
    const triggers = new Set(
      companies
        .map(c => c.trigger_type)
        .filter(t => t && t !== 'None')
    )
    return ['All', ...Array.from(triggers).sort()]
  }, [companies])

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    let filtered = companies

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(term) ||
        company.industry?.toLowerCase().includes(term) ||
        company.company_notes?.toLowerCase().includes(term)
      )
    }

    // Apply DMS filter
    if (dmsFilter !== 'All') {
      filtered = filtered.filter(company => company.dms_system === dmsFilter)
    }

    // Apply trigger filter
    if (triggerFilter !== 'All') {
      filtered = filtered.filter(company => company.trigger_type === triggerFilter)
    }

    return filtered
  }, [companies, searchTerm, dmsFilter, triggerFilter])

  const handleAddCompany = () => {
    setEditingCompany(null)
    setShowAddModal(true)
  }

  const handleEditCompany = (company) => {
    setEditingCompany(company)
    setShowAddModal(true)
    setShowProfileModal(false)
  }

  const handleViewCompany = (company) => {
    setSelectedCompany(company)
    setShowProfileModal(true)
  }

  const handleSaveCompany = async (formData) => {
    if (editingCompany) {
      // Update existing company
      return await updateCompany(editingCompany.id, formData)
    } else {
      // Create new company
      return await createCompany(formData)
    }
  }

  const handleDeleteCompany = async (id) => {
    return await deleteCompany(id)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingCompany(null)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
    setSelectedCompany(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading companies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading companies: {error}</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your companies and start calls
            </p>
          </div>
          <button
            onClick={handleAddCompany}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            + Add New
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* DMS Filter */}
          <div className="w-48">
            <select
              value={dmsFilter}
              onChange={(e) => setDmsFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dmsSystems.map(dms => (
                <option key={dms} value={dms}>
                  {dms === 'All' ? 'All DMS' : dms}
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Filter */}
          <div className="w-48">
            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {triggerTypes.map(trigger => (
                <option key={trigger} value={trigger}>
                  {trigger === 'All' ? 'All Triggers' : trigger}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="p-6">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || dmsFilter !== 'All' || triggerFilter !== 'All'
                ? 'No companies found'
                : 'No companies yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || dmsFilter !== 'All' || triggerFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first company'}
            </p>
            {!searchTerm && dmsFilter === 'All' && triggerFilter === 'All' && (
              <button
                onClick={handleAddCompany}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                + Add Company
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={() => handleEditCompany(company)}
                  onView={() => handleViewCompany(company)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSave={handleSaveCompany}
        company={editingCompany}
      />

      <CompanyProfileModal
        isOpen={showProfileModal}
        onClose={handleCloseProfileModal}
        company={selectedCompany}
        onEdit={() => handleEditCompany(selectedCompany)}
        onDelete={handleDeleteCompany}
      />
    </div>
  )
}
