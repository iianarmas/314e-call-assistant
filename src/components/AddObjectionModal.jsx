import { useState } from 'react'

export default function AddObjectionModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    product: 'Dexit',
    objection_text: '',
    responses: [{ label: 'Primary Response', content: '' }]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.objection_text.trim()) {
      alert('Please enter the objection text')
      return
    }

    // Check if at least one response has content
    const hasContent = formData.responses.some(r => r.content.trim())
    if (!hasContent) {
      alert('Please add at least one response')
      return
    }

    const validResponses = formData.responses.filter(r => r.content.trim())

    // Format responses as markdown
    const [primary, ...alternatives] = validResponses
    let formatted = `**Response:**\n${primary.content}`

    if (alternatives.length > 0) {
      alternatives.forEach((alt, i) => {
        formatted += `\n\n**Alternative ${i + 1}:**\n${alt.content}`
      })
    }

    const objectionData = {
      product: formData.product,
      objection_text: formData.objection_text.trim(),
      response_text: formatted,
      is_active: true
    }

    const result = await onAdd(objectionData)

    if (result.success) {
      // Reset form
      setFormData({
        product: 'Dexit',
        objection_text: '',
        responses: [{ label: 'Primary Response', content: '' }]
      })
      onClose()
    } else {
      alert(`Error adding objection: ${result.error}`)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addResponse = () => {
    setFormData(prev => ({
      ...prev,
      responses: [
        ...prev.responses,
        {
          label: `Alternative ${prev.responses.length}`,
          content: ''
        }
      ]
    }))
  }

  const removeResponse = (index) => {
    if (formData.responses.length === 1) {
      alert('You must have at least one response')
      return
    }
    setFormData(prev => ({
      ...prev,
      responses: prev.responses.filter((_, i) => i !== index)
    }))
  }

  const updateResponse = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      responses: prev.responses.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                placeholder="e.g., &quot;We're happy with our current system&quot; or &quot;How much does it cost?&quot;"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the objection exactly as prospects typically phrase it
              </p>
            </div>

            {/* Response Variations Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Response{formData.responses.length > 1 ? 's' : ''}
                </h3>
                <button
                  type="button"
                  onClick={addResponse}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Alternative Response
                </button>
              </div>

              <div className="space-y-4">
                {formData.responses.map((response, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {index === 0 ? (
                          <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            Primary Response
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={response.label}
                            onChange={(e) => updateResponse(index, 'label', e.target.value)}
                            placeholder={`Alternative ${index} label`}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeResponse(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      value={response.content}
                      onChange={(e) => updateResponse(index, 'content', e.target.value)}
                      placeholder={`Enter ${index === 0 ? 'primary' : 'alternative'} response here...`}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Use variables like {'{{'} contact.first_name {'}}'}, {'{{'} contact.title {'}}'}, {'{{'} contact.organization {'}}'}, {'{{'} product.name {'}}'} for dynamic, personalized responses.
                  <br />
                  Multiple response variations give you options during live calls!
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
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
