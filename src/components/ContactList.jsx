import { useState, useMemo } from 'react'
import ContactCard from './ContactCard'

export default function ContactList({
  contacts,
  onEdit,
  onDelete
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('All')
  const [triggerFilter, setTriggerFilter] = useState('All')

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    // Product filter
    if (productFilter !== 'All') {
      filtered = filtered.filter(c => c.product === productFilter)
    }

    // Trigger filter (only for Muspell)
    if (triggerFilter !== 'All' && productFilter === 'Muspell') {
      filtered = filtered.filter(c => c.trigger_type === triggerFilter)
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [contacts, searchQuery, productFilter, triggerFilter])

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, company, or title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value)
                if (e.target.value !== 'Muspell') {
                  setTriggerFilter('All')
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Products</option>
              <option value="Dexit">Dexit</option>
              <option value="Muspell">Muspell</option>
            </select>
          </div>

          {/* Trigger Filter (only show for Muspell) */}
          {productFilter === 'Muspell' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Type
              </label>
              <select
                value={triggerFilter}
                onChange={(e) => setTriggerFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Triggers</option>
                <option value="Migration">Migration</option>
                <option value="Merger">Merger</option>
                <option value="Acquisition">Acquisition</option>
                <option value="Upgrade">Upgrade</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </div>
      </div>

      {/* Contact grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || productFilter !== 'All' || triggerFilter !== 'All'
              ? 'Try adjusting your filters'
              : 'Get started by adding a contact or importing from CSV'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
