import { useState, useEffect } from 'react'

export default function EditScriptModal({ isOpen, onClose, onUpdate, script }) {
  const [formData, setFormData] = useState({
    name: '',
    script_type: 'opening',
    product: 'Dexit',
    approach: '',
    trigger_type: '',
    content: ''
  })

  useEffect(() => {
    if (script) {
      setFormData({
        name: script.name || '',
        script_type: script.script_type || 'opening',
        product: script.product || 'Dexit',
        approach: script.approach || '',
        trigger_type: script.trigger_type || '',
        content: script.content || ''
      })
    }
  }, [script])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const updates = {
      name: formData.name.trim(),
      script_type: formData.script_type,
      product: formData.product,
      content: formData.content.trim(),
      updated_at: new Date().toISOString()
    }

    // Add approach for Dexit opening scripts
    if (formData.product === 'Dexit' && formData.script_type === 'opening') {
      updates.approach = formData.approach || null
    } else {
      updates.approach = null
    }

    // Add trigger_type for Muspell scripts
    if (formData.product === 'Muspell') {
      updates.trigger_type = formData.trigger_type || null
    } else {
      updates.trigger_type = null
    }

    const result = await onUpdate(script.id, updates)

    if (result.success) {
      onClose()
    } else {
      alert(`Error updating script: ${result.error}`)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen || !script) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Script</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Script Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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

            {/* Script Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Script Type *
              </label>
              <select
                value={formData.script_type}
                onChange={(e) => handleChange('script_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="opening">Opening</option>
                <option value="objection">Objection</option>
                <option value="closing">Closing</option>
              </select>
            </div>

            {/* Approach (for Dexit opening scripts) */}
            {formData.product === 'Dexit' && formData.script_type === 'opening' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approach
                </label>
                <select
                  value={formData.approach}
                  onChange={(e) => handleChange('approach', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None / General</option>
                  <option value="IT">IT</option>
                  <option value="HIM">HIM</option>
                  <option value="Provider">Provider</option>
                </select>
              </div>
            )}

            {/* Trigger Type (for Muspell) */}
            {formData.product === 'Muspell' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Type
                </label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => handleChange('trigger_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None / General</option>
                  <option value="Migration">Migration</option>
                  <option value="Merger">Merger</option>
                  <option value="Acquisition">Acquisition</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Script Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use placeholders like {'{contact.name}'}, {'{contact.company}'}, etc.
              </p>
            </div>

            {/* Version info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Version:</span> {script.version} |{' '}
                <span className="font-medium">Created:</span> {new Date(script.created_at).toLocaleDateString()} |{' '}
                <span className="font-medium">Usage:</span> {script.usage_count || 0} times
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
