import { useState } from 'react'

export default function AddScriptModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    section_type: 'opening', // opening, discovery, transition, objections, competitor_objection, closing
    product: 'Dexit',
    approach: 'HIM', // Default approach - REQUIRED
    trigger_type: '',
    competitor: '', // For competitor objections
    variations: [{ label: 'Version 1', content: '' }]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a script name')
      return
    }

    // Check if at least one variation has content
    const hasContent = formData.variations.some(v => v.content.trim())
    if (!hasContent) {
      alert('Please add at least one variation with content')
      return
    }

    // Prepare data based on section type
    const scriptData = {
      name: formData.name.trim(),
      script_type: formData.section_type, // Keep for backward compatibility
      section_type: formData.section_type,
      product: formData.product,
      is_active: true,
      version: 1
    }

    // ALWAYS add approach for Dexit (required for call flow matching)
    if (formData.product === 'Dexit' && formData.approach) {
      scriptData.approach = formData.approach
    }

    // Add trigger_type for Muspell scripts
    if (formData.product === 'Muspell' && formData.trigger_type) {
      scriptData.trigger_type = formData.trigger_type
    }

    // Add competitor for competitor objections
    if (formData.section_type === 'competitor_objection' && formData.competitor) {
      scriptData.competitor = formData.competitor
    }

    // Store variations in content as JSON (or we could create multiple scripts)
    const validVariations = formData.variations.filter(v => v.content.trim())

    // For now, create one script with all variations in structured format
    scriptData.content = formatVariations(validVariations, formData.section_type)

    const result = await onAdd(scriptData)

    if (result.success) {
      // Reset form
      setFormData({
        name: '',
        section_type: 'opening',
        product: 'Dexit',
        approach: 'HIM',
        trigger_type: '',
        competitor: '',
        variations: [{ label: 'Version 1', content: '' }]
      })
      onClose()
    } else {
      alert(`Error adding script: ${result.error}`)
    }
  }

  const formatVariations = (variations, sectionType) => {
    if (sectionType === 'opening' || sectionType === 'closing') {
      // Format as markdown with versions
      return variations.map((v, i) => {
        return `## Version ${i + 1}: ${v.label}\n${v.content}`
      }).join('\n\n---\n\n')
    } else if (sectionType === 'objections' || sectionType === 'competitor_objection') {
      // Format as objection with response and alternatives
      const [primary, ...alternatives] = variations
      let formatted = `## ${formData.name}\n**Response:**\n${primary.content}`

      if (alternatives.length > 0) {
        alternatives.forEach((alt, i) => {
          formatted += `\n\n**Alternative ${i + 1}:**\n${alt.content}`
        })
      }
      return formatted
    } else {
      // For discovery and transition, just use first variation
      return variations[0].content
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          label: `Version ${prev.variations.length + 1}`,
          content: ''
        }
      ]
    }))
  }

  const removeVariation = (index) => {
    if (formData.variations.length === 1) {
      alert('You must have at least one variation')
      return
    }
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }))
  }

  const updateVariation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  if (!isOpen) return null

  const showVariations = ['opening', 'transition_to_discovery', 'discovery', 'transition_to_pitch', 'objections', 'competitor_objection', 'closing'].includes(formData.section_type)
  const variationLabel = (formData.section_type === 'objections' || formData.section_type === 'competitor_objection') ? 'Response' : 'Variation'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Script</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Script Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Dexit IT Opening, Cost Objection, Discovery Questions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use {'{{'} contact.first_name {'}}'} for dynamic names (see format guide)
                </p>
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

              {/* Section Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type *
                </label>
                <select
                  value={formData.section_type}
                  onChange={(e) => handleChange('section_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="opening">Opening</option>
                  <option value="transition_to_discovery">Transition to Discovery</option>
                  <option value="discovery">Discovery Questions</option>
                  <option value="transition_to_pitch">Transition to Pitch</option>
                  <option value="objections">Objection Handling</option>
                  <option value="competitor_objection">Competitor Objection</option>
                  <option value="closing">Closing</option>
                </select>
              </div>

              {/* Competitor Selector (for competitor objections) */}
              {formData.section_type === 'competitor_objection' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competitor *
                  </label>
                  <select
                    value={formData.competitor}
                    onChange={(e) => handleChange('competitor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select competitor...</option>
                    <option value="OnBase">OnBase (Hyland)</option>
                    <option value="Epic">Epic (Hyperdrive/Gallery)</option>
                    <option value="Cerner">Cerner/Oracle Health (WQM)</option>
                    <option value="Athena">athenahealth/athenaOne</option>
                    <option value="eCW">eClinicalWorks</option>
                    <option value="Nextgen">Nextgen</option>
                    <option value="RightFax">RightFax (OpenText)</option>
                    <option value="Custom">Custom/Internal System</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This objection will appear under the selected competitor
                  </p>
                </div>
              )}

              {/* Call Flow / Approach (REQUIRED for Dexit) */}
              {formData.product === 'Dexit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Flow / Approach *
                  </label>
                  <select
                    value={formData.approach}
                    onChange={(e) => handleChange('approach', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="HIM">HIM</option>
                    <option value="IT">IT</option>
                    <option value="Ambulatory">Ambulatory</option>
                    <option value="Revenue Cycle">Revenue Cycle</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This determines which call flow this script will appear in
                  </p>
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
            </div>

            {/* Variations Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  {showVariations ? `${variationLabel}s` : 'Content'}
                </h3>
                {showVariations && (
                  <button
                    type="button"
                    onClick={addVariation}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add {variationLabel}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {formData.variations.map((variation, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      {showVariations ? (
                        <input
                          type="text"
                          value={variation.label}
                          onChange={(e) => updateVariation(index, 'label', e.target.value)}
                          placeholder={`${variationLabel} ${index + 1} label`}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700">Content</span>
                      )}
                      {showVariations && formData.variations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      value={variation.content}
                      onChange={(e) => updateVariation(index, 'content', e.target.value)}
                      placeholder={`Enter ${showVariations ? variationLabel.toLowerCase() : 'content'} here...`}
                      rows={formData.section_type === 'objections' ? 6 : 8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Use variables like {'{{'} contact.first_name {'}}'}, {'{{'} contact.organization {'}}'}, {'{{'} rep.name {'}}'}, {'{{'} product.name {'}}'} for dynamic content.
                  <br />
                  See the <a href="/CALLFLOW_FORMAT_GUIDE.md" target="_blank" className="underline">Format Guide</a> for all available variables.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Add Script
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
