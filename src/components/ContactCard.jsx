import { useNavigate } from 'react-router-dom'

export default function ContactCard({ contact, onEdit, onDelete }) {
  const navigate = useNavigate()

  const handleStartCall = () => {
    navigate(`/call/${contact.id}`)
  }

  const getTriggerBadgeColor = (triggerType) => {
    const colors = {
      'Migration': 'bg-blue-100 text-blue-800',
      'Merger': 'bg-purple-100 text-purple-800',
      'Acquisition': 'bg-green-100 text-green-800',
      'Upgrade': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[triggerType] || 'bg-gray-100 text-gray-800'
  }

  const getProductColor = (product) => {
    return product === 'Dexit'
      ? 'text-blue-600'
      : 'text-green-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {contact.name}
          </h3>
          <p className="text-sm text-gray-600">{contact.title}</p>
          <p className="text-sm text-gray-500">{contact.company}</p>
        </div>

        {/* Product badge */}
        <span className={`text-sm font-medium ${getProductColor(contact.product)}`}>
          {contact.product}
        </span>
      </div>

      {/* Trigger badge (for Muspell) */}
      {contact.product === 'Muspell' && contact.trigger_type && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTriggerBadgeColor(contact.trigger_type)}`}>
            {contact.trigger_type}
          </span>
          {contact.trigger_details && (
            <p className="text-xs text-gray-600 mt-1">{contact.trigger_details}</p>
          )}
        </div>
      )}

      {/* Notes preview */}
      {contact.notes && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {contact.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleStartCall}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Start Call
        </button>
        <button
          onClick={() => onEdit(contact)}
          className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
