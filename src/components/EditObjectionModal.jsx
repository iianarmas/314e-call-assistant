import { useState, useEffect } from 'react'

export default function EditObjectionModal({ isOpen, onClose, onUpdate, objection }) {
  const [formData, setFormData] = useState({
    product: 'Dexit',
    objection_text: '',
    response_text: ''
  })

  useEffect(() => {
    if (objection) {
      setFormData({
        product: objection.product || 'Dexit',
        objection_text: objection.objection_text || '',
        response_text: objection.response_text || ''
      })
    }
  }, [objection])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.objection_text.trim() || !formData.response_text.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const updates = {
      product: formData.product,
      objection_text: formData.objection_text.trim(),
      response_text: formData.response_text.trim(),
      updated_at: new Date().toISOString()
    }

    const result = await onUpdate(objection.id, updates)

    if (result.success) {
      onClose()
    } else {
      alert(`Error updating objection: ${result.error}`)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen || !objection) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Custom Objection</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                value={formData.product}
                onChange={(e) => handleChange('product', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Dexit">Dexit</option>
                <option value="Muspell">Muspell</option>
              </select>
            </div>

            {/* Objection Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objection Text *
              </label>
              <textarea
                value={formData.objection_text}
                onChange={(e) => handleChange('objection_text', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Response Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Text *
              </label>
              <textarea
                value={formData.response_text}
                onChange={(e) => handleChange('response_text', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
            </div>

            {/* Usage info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {new Date(objection.created_at).toLocaleDateString()} |{' '}
                <span className="font-medium">Usage:</span> {objection.usage_count || 0} times
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
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
