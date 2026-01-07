import { useState } from 'react'

export default function AddObjectionModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    product: 'Dexit',
    objection_text: '',
    response_text: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.objection_text.trim() || !formData.response_text.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const objectionData = {
      product: formData.product,
      objection_text: formData.objection_text.trim(),
      response_text: formData.response_text.trim(),
      is_active: true
    }

    const result = await onAdd(objectionData)

    if (result.success) {
      // Reset form
      setFormData({
        product: 'Dexit',
        objection_text: '',
        response_text: ''
      })
      onClose()
    } else {
      alert(`Error adding objection: ${result.error}`)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Custom Objection</h2>

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
                placeholder="e.g., We're happy with our current system"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the objection exactly as prospects typically phrase it
              </p>
            </div>

            {/* Response Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Text *
              </label>
              <textarea
                value={formData.response_text}
                onChange={(e) => handleChange('response_text', e.target.value)}
                placeholder="Enter your response to this objection..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This response will be available as a quick option during calls
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Add Objection
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
