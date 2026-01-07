import { useState, useMemo, useEffect } from 'react'

export default function ContactTable({
  contacts,
  onEdit,
  onDelete,
  onViewHistory
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('All')
  const [triggerFilter, setTriggerFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [selectedContacts, setSelectedContacts] = useState(new Set())
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 40,
    name: 180,
    company: 200,
    title: 180,
    product: 120,
    trigger: 140,
    calls: 80,
    lastCall: 140,
    actions: 160
  })
  const [resizing, setResizing] = useState(null)

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    if (productFilter !== 'All') {
      filtered = filtered.filter(c => c.product === productFilter)
    }

    if (triggerFilter !== 'All' && productFilter === 'Muspell') {
      filtered = filtered.filter(c => c.trigger_type === triggerFilter)
    }

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

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, productFilter, triggerFilter])

  // Column resizing
  const handleMouseDown = (column, e) => {
    e.preventDefault()
    setResizing({ column, startX: e.pageX, startWidth: columnWidths[column] })
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizing) {
        const diff = e.pageX - resizing.startX
        const newWidth = Math.max(40, resizing.startWidth + diff)
        setColumnWidths(prev => ({ ...prev, [resizing.column]: newWidth }))
      }
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizing])

  // Selection handlers
  const handleSelectAll = () => {
    const allIds = new Set(paginatedContacts.map(c => c.id))
    setSelectedContacts(allIds)
  }

  const handleDeselectAll = () => {
    setSelectedContacts(new Set())
  }

  const handleToggleContact = (contactId) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }

  const handleCallClick = (contactId) => {
    window.open(`/call/${contactId}`, '_blank')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters - Fixed */}
      <div className="flex-none bg-white border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredContacts.length} of {contacts.length} contacts
            {selectedContacts.size > 0 && ` · ${selectedContacts.size} selected`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Table - Scrollable body */}
      <div className="flex-1 overflow-auto bg-white border-l border-r border-b border-gray-200 mt-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th
                style={{ width: columnWidths.checkbox }}
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-t border-b border-l border-gray-200"
              >
                ✓
              </th>
              <th
                style={{ width: columnWidths.name }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Name
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('name', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.company }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Company
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('company', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.title }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Title
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('title', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.product }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Product
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('product', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.trigger }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Trigger
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('trigger', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.calls }}
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Calls
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('calls', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.lastCall }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Last Call
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('lastCall', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.actions }}
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-t border-b border-gray-200"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-12 text-center text-gray-500 border-b border-l border-r border-gray-200">
                  {searchQuery || productFilter !== 'All' || triggerFilter !== 'All'
                    ? 'No contacts match your filters'
                    : 'No contacts yet. Add one to get started.'}
                </td>
              </tr>
            ) : (
              paginatedContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center border-r border-b border-l border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => handleToggleContact(contact.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-200">
                    {contact.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap border-r border-b border-gray-200">
                    {contact.company}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap border-r border-b border-gray-200">
                    {contact.title || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap border-r border-b border-gray-200">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      contact.product === 'Dexit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {contact.product}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap border-r border-b border-gray-200">
                    {contact.trigger_type || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center whitespace-nowrap border-r border-b border-gray-200">
                    {contact.call_count || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap border-r border-b border-gray-200">
                    {contact.last_call_date ? new Date(contact.last_call_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center whitespace-nowrap border-r border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCallClick(contact.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Call
                      </button>
                      <button
                        onClick={() => onViewHistory(contact)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        History
                      </button>
                      <button
                        onClick={() => onEdit(contact)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(contact.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {filteredContacts.length > itemsPerPage && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between sticky bottom-0">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
