import { useState, useEffect } from 'react'

export default function NotesPanel({ contact, onDataChange }) {
  const [data, setData] = useState({
    current_archival_solution: '',
    current_data_conversion_vendor: '',
    rfp_status: '',
    timeline: '',
    notes: ''
  })

  // Notify parent of changes
  useEffect(() => {
    onDataChange?.(data)
  }, [data])

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Muspell Notes</h3>

        {/* Display trigger info */}
        {contact?.trigger_type && (
          <div className="mt-3 p-3 bg-purple-50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-purple-900">Trigger:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-900">
                {contact.trigger_type}
              </span>
            </div>
            {contact.trigger_details && (
              <p className="text-sm text-purple-800 mt-1">{contact.trigger_details}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Current Archival Solution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Archival Solution
          </label>
          <input
            type="text"
            value={data.current_archival_solution}
            onChange={(e) => handleChange('current_archival_solution', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Which vendor/system?"
          />
        </div>

        {/* Current Data Conversion Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Conversion Vendor
          </label>
          <input
            type="text"
            value={data.current_data_conversion_vendor}
            onChange={(e) => handleChange('current_data_conversion_vendor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Service provider if any"
          />
        </div>

        {/* RFP Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RFP Status
          </label>
          <select
            value={data.rfp_status}
            onChange={(e) => handleChange('rfp_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select status...</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="N/A">N/A</option>
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeline / Go-Live Date
          </label>
          <input
            type="text"
            value={data.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Q3 2026"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conversation Notes
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Key points from the conversation..."
          />
        </div>
      </div>
    </div>
  )
}
