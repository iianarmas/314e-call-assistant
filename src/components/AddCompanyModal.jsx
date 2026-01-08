import { useState, useEffect } from 'react'

/**
 * AddCompanyModal - Modal for adding or editing company information
 * Includes all fields: name, industry, size, EHR, DMS, triggers, notes
 */
export default function AddCompanyModal({ isOpen, onClose, onSave, company = null }) {
  const isEditMode = !!company

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    ehr_system: '',
    dms_system: '',
    company_notes: '',
    trigger_type: 'None',
    trigger_details: '',
    trigger_timeline: ''
  })

  const [submitting, setSubmitting] = useState(false)

  // Load company data when editing
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        size: company.size || '',
        ehr_system: company.ehr_system || '',
        dms_system: company.dms_system || '',
        company_notes: company.company_notes || '',
        trigger_type: company.trigger_type || 'None',
        trigger_details: company.trigger_details || '',
        trigger_timeline: company.trigger_timeline || ''
      })
    } else {
      // Reset for new company
      setFormData({
        name: '',
        industry: '',
        size: '',
        ehr_system: '',
        dms_system: '',
        company_notes: '',
        trigger_type: 'None',
        trigger_details: '',
        trigger_timeline: ''
      })
    }
  }, [company, isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const result = await onSave(formData)

    setSubmitting(false)

    if (result.success) {
      onClose()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  if (!isOpen) return null

  const hasTrigger = formData.trigger_type && formData.trigger_type !== 'None'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Edit Company' : 'Add Company'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Memorial Hospital"
                />
              </div>

              {/* Industry and Size - Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Government">Government</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Small (<100 employees)">Small (&lt;100 employees)</option>
                    <option value="Medium (100-500)">Medium (100-500)</option>
                    <option value="Large (500-2000)">Large (500-2000)</option>
                    <option value="Enterprise (2000+)">Enterprise (2000+)</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Systems
                </h3>
              </div>

              {/* EHR and DMS - Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* EHR System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EHR System
                  </label>
                  <select
                    value={formData.ehr_system}
                    onChange={(e) => handleChange('ehr_system', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="Epic">Epic</option>
                    <option value="Cerner">Cerner</option>
                    <option value="Athena">athenahealth</option>
                    <option value="eCW">eClinicalWorks</option>
                    <option value="Nextgen">Nextgen</option>
                    <option value="Meditech">Meditech</option>
                    <option value="Allscripts">Allscripts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* DMS System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Management System
                  </label>
                  <select
                    value={formData.dms_system}
                    onChange={(e) => handleChange('dms_system', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="OnBase">OnBase (Hyland)</option>
                    <option value="Epic Gallery">Epic Gallery (Hyperdrive)</option>
                    <option value="Cerner WQM">Cerner WQM</option>
                    <option value="RightFax">RightFax (OpenText)</option>
                    <option value="athenahealth">athenahealth</option>
                    <option value="eClinicalWorks">eClinicalWorks</option>
                    <option value="Nextgen">Nextgen</option>
                    <option value="Custom">Custom/Internal System</option>
                    <option value="None">No DMS (Manual Process)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Muspell Triggers
                </h3>
              </div>

              {/* Trigger Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Type
                </label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => handleChange('trigger_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="None">None</option>
                  <option value="Merger">Merger</option>
                  <option value="Acquisition">Acquisition</option>
                  <option value="Migration">Migration</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="System Change">System Change</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Trigger Details and Timeline - Show only if trigger selected */}
              {hasTrigger && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger Details
                    </label>
                    <textarea
                      value={formData.trigger_details}
                      onChange={(e) => handleChange('trigger_details', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acquiring smaller facility, integrating their Epic instance with ours. Complex data migration project."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeline
                    </label>
                    <input
                      type="text"
                      value={formData.trigger_timeline}
                      onChange={(e) => handleChange('trigger_timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Q2 2024, Next 6 months, etc."
                    />
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Company Notes
                </h3>
              </div>

              {/* Company Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.company_notes}
                  onChange={(e) => handleChange('company_notes', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Organizational situation, pain points, key contacts (e.g., John - HIM Dir, Sarah - CFO), ongoing projects..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include organizational context, pain points, informal contact references, and any relevant notes.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Company')}
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
