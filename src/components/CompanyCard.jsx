import { useNavigate } from 'react-router-dom'

/**
 * CompanyCard - Display company information in a card format
 * Shows company name, DMS, EHR, trigger type, and action buttons
 */
export default function CompanyCard({ company, onEdit, onView }) {
  const navigate = useNavigate()

  const handleCall = () => {
    navigate(`/call/company/${company.id}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Company Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3
            className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={onView}
          >
            {company.name}
          </h3>
          {company.industry && (
            <p className="text-sm text-gray-500">{company.industry}</p>
          )}
        </div>
      </div>

      {/* Systems Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">DMS:</span>
          <span className="text-gray-600">{company.dms_system || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">EHR:</span>
          <span className="text-gray-600">{company.ehr_system || 'Unknown'}</span>
        </div>
        {company.trigger_type && company.trigger_type !== 'None' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">Trigger:</span>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
              {company.trigger_type}
            </span>
          </div>
        )}
      </div>

      {/* Size badge */}
      {company.size && (
        <div className="mb-3">
          <span className="text-xs text-gray-500">{company.size}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCall}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          📞 Call
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  )
}
