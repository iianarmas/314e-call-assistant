import { useState, useEffect } from 'react'

export default function EditContactModal({ isOpen, onClose, onUpdate, contact }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    organization: '',
    title: '',
    product: 'Dexit',
    trigger_type: '',
    trigger_details: '',
    notes: ''
  })

  const [submitting, setSubmitting] = useState(false)

  // Load contact data when modal opens
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || contact.name?.split(' ')[0] || '',
        last_name: contact.last_name || contact.name?.split(' ').slice(1).join(' ') || '',
        organization: contact.organization || contact.company || '',
        title: contact.title || '',
        product: contact.product || 'Dexit',
        trigger_type: contact.trigger_type || '',
        trigger_details: contact.trigger_details || '',
        notes: contact.notes || ''
      })
    }
  }, [contact])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    // Prepare data
    const updates = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      organization: formData.organization.trim(),
      title: formData.title.trim() || null,
      product: formData.product,
      trigger_type: formData.trigger_type.trim() || null,
      trigger_details: formData.trigger_details.trim() || null,
      notes: formData.notes.trim() || null
    }

    const result = await onUpdate(contact.id, updates)

    setSubmitting(false)

    if (result.success) {
      onClose()
    } else {
      alert(`Error updating contact: ${result.error}`)
    }
  }

  if (!isOpen || !contact) return null

  const isMuspell = formData.product === 'Muspell'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Edit Contact
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Smith"
                />
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Memorial Hospital"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title / Position
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Dexit">Dexit</option>
                  <option value="Muspell">Muspell</option>
                </select>
              </div>

              {/* Trigger fields (only for Muspell) */}
              {isMuspell && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger Type
                    </label>
                    <select
                      name="trigger_type"
                      value={formData.trigger_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select trigger type...</option>
                      <option value="Migration">Migration</option>
                      <option value="Merger">Merger</option>
                      <option value="Acquisition">Acquisition</option>
                      <option value="Upgrade">Upgrade</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger Details
                    </label>
                    <input
                      type="text"
                      name="trigger_details"
                      value={formData.trigger_details}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
