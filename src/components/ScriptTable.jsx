import { useState, useMemo, useEffect } from 'react'

export default function ScriptTable({
  scripts,
  onEdit,
  onDelete,
  onToggleActive,
  onCreateVersion
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [columnWidths, setColumnWidths] = useState({
    name: 200,
    type: 120,
    product: 120,
    approach: 140,
    version: 80,
    status: 100,
    usage: 80,
    created: 140,
    actions: 200
  })
  const [resizing, setResizing] = useState(null)

  // Filter and search scripts
  const filteredScripts = useMemo(() => {
    let filtered = scripts

    if (productFilter !== 'All') {
      filtered = filtered.filter(s => s.product === productFilter)
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(s => s.script_type === typeFilter)
    }

    if (statusFilter !== 'All') {
      const isActive = statusFilter === 'Active'
      filtered = filtered.filter(s => s.is_active === isActive)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.content?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [scripts, searchQuery, productFilter, typeFilter, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredScripts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedScripts = filteredScripts.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, productFilter, typeFilter, statusFilter])

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

  return (
    <div className="flex flex-col h-full">
      {/* Filters - Fixed */}
      <div className="flex-none bg-white border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Products</option>
              <option value="Dexit">Dexit</option>
              <option value="Muspell">Muspell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="opening">Opening</option>
              <option value="objection">Objection</option>
              <option value="closing">Closing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredScripts.length} of {scripts.length} scripts
          </div>
        </div>
      </div>

      {/* Table - Scrollable body */}
      <div className="flex-1 overflow-auto bg-white border-l border-r border-b border-gray-200 mt-4">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th
                style={{ width: columnWidths.name }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-l border-gray-200"
              >
                Name
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('name', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.type }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Type
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('type', e)}
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
                style={{ width: columnWidths.approach }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Approach/Trigger
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('approach', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.version }}
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Ver
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('version', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.status }}
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Status
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('status', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.usage }}
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Usage
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('usage', e)}
                />
              </th>
              <th
                style={{ width: columnWidths.created }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative border-r border-t border-b border-gray-200"
              >
                Created
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleMouseDown('created', e)}
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
            {paginatedScripts.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-12 text-center text-gray-500 border-b border-l border-r border-gray-200">
                  {searchQuery || productFilter !== 'All' || typeFilter !== 'All' || statusFilter !== 'All'
                    ? 'No scripts match your filters'
                    : 'No scripts yet. Add one to get started.'}
                </td>
              </tr>
            ) : (
              paginatedScripts.map(script => (
                <tr key={script.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-b border-l border-gray-200">
                    {script.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-b border-gray-200">
                    <span className="capitalize">{script.script_type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm border-r border-b border-gray-200">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      script.product === 'Dexit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {script.product}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-b border-gray-200">
                    {script.approach || script.trigger_type || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center border-r border-b border-gray-200">
                    v{script.version}
                  </td>
                  <td className="px-4 py-3 text-sm text-center border-r border-b border-gray-200">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      script.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {script.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center border-r border-b border-gray-200">
                    {script.usage_count || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-b border-gray-200">
                    {new Date(script.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-center border-r border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => onEdit(script)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onCreateVersion(script.id)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Version
                      </button>
                      <button
                        onClick={() => onToggleActive(script.id, script.is_active)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {script.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => onDelete(script.id)}
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
      {filteredScripts.length > itemsPerPage && (
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
