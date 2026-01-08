import { useNavigate } from 'react-router-dom'

/**
 * CompanyProfileModal - View full company details
 * No contacts section - this is a CRM companion
 */
export default function CompanyProfileModal({ isOpen, onClose, company, onEdit, onDelete }) {
  const navigate = useNavigate()

  if (!isOpen || !company) return null

  const handleStartCall = () => {
    navigate(`/call/company/${company.id}`)
    onClose()
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      await onDelete(company.id)
      onClose()
    }
  }

  const hasTrigger = company.trigger_type && company.trigger_type !== 'None'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              {company.industry && (
                <p className="text-sm text-gray-500 mt-1">{company.industry}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            {/* Size */}
            {company.size && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Size</h3>
                <p className="text-gray-900">{company.size}</p>
              </div>
            )}

            {/* Systems Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                Systems
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">EHR System</p>
                  <p className="text-gray-900 font-medium">
                    {company.ehr_system || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DMS System</p>
                  <p className="text-gray-900 font-medium">
                    {company.dms_system || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Muspell Triggers Section */}
            {hasTrigger && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Muspell Triggers
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
                      {company.trigger_type}
                    </span>
                  </div>
                  {company.trigger_details && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Details</p>
                      <p className="text-gray-900">{company.trigger_details}</p>
                    </div>
                  )}
                  {company.trigger_timeline && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Timeline</p>
                      <p className="text-gray-900">{company.trigger_timeline}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Notes Section */}
            {company.company_notes && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Company Notes
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {company.company_notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleStartCall}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              📞 Start Call
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors font-medium"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
