import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepSettings, saveRepSettings } from '../utils/scriptVariables'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    company: ''
  })
  const [saved, setSaved] = useState(false)
  const [previewScript, setPreviewScript] = useState('')

  // Load existing settings on mount
  useEffect(() => {
    const settings = getRepSettings()
    setFormData({
      name: settings.name || '',
      first_name: settings.first_name || '',
      company: settings.company || ''
    })
  }, [])

  // Update preview when form data changes
  useEffect(() => {
    const preview = `Hi {{contact.first_name}}, this is ${formData.name || '[Your Name]'} from ${formData.company || '[Your Company]'}. I'm reaching out to {{contact.title}}s at {{contact.organization}} about {{product.name}}.`
    setPreviewScript(preview)
  }, [formData])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // Validate
    if (!formData.name.trim()) {
      alert('Please enter your full name')
      return
    }

    if (!formData.company.trim()) {
      alert('Please enter your company name')
      return
    }

    // Extract first name if not provided
    let firstName = formData.first_name.trim()
    if (!firstName && formData.name.trim()) {
      firstName = formData.name.trim().split(' ')[0]
    }

    const settings = {
      name: formData.name.trim(),
      first_name: firstName,
      company: formData.company.trim()
    }

    // Save to localStorage
    const result = saveRepSettings(settings)

    if (result.success) {
      // Also save individual keys for backward compatibility
      localStorage.setItem('rep_name', settings.name)
      localStorage.setItem('rep_first_name', settings.first_name)
      localStorage.setItem('rep_company', settings.company)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Error saving settings: ' + result.error)
    }
  }

  const handleClearCache = () => {
    if (confirm('This will clear all cached data and reload the page. Continue?')) {
      // Clear all rep settings
      localStorage.removeItem('rep_settings')
      localStorage.removeItem('rep_name')
      localStorage.removeItem('rep_first_name')
      localStorage.removeItem('rep_company')

      // Reload page
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/contacts')}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2 text-sm"
            >
              ← Back to Contacts
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure your personal information for script variables
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Rep Information
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            This information will be used to replace <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{rep.name}}'}</code> and <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{rep.company}}'}</code> variables in your scripts.
          </p>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Chris Johnson"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for {'{{rep.name}}'} - Your full name as it appears in scripts
              </p>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name (Optional)
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="e.g., Chris"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for {'{{rep.first_name}}'} - If empty, will use first word of Full Name
              </p>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="e.g., Dexit Solutions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for {'{{rep.company}}'} - Your company name
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            {saved && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                ✓ Saved successfully!
              </span>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preview
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            See how your information will appear in scripts:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-mono leading-relaxed">
              {previewScript}
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Variables like {'{{contact.first_name}}'}, {'{{contact.title}}'}, {'{{contact.organization}}'}, and {'{{product.name}}'} will be replaced with actual contact data during calls.
            </p>
          </div>
        </div>

        {/* Available Variables */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Variables
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Sales Rep (You)</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{rep.name}}'}</code> → {formData.name || 'Your Name'}</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{rep.first_name}}'}</code> → {formData.first_name || formData.name.split(' ')[0] || 'Your First Name'}</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{rep.company}}'}</code> → {formData.company || 'Your Company'}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Info</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{contact.first_name}}'}</code> → Contact's first name</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{contact.last_name}}'}</code> → Contact's last name</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{contact.title}}'}</code> → Contact's title</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{contact.organization}}'}</code> → Contact's organization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Product Info</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{product.name}}'}</code> → Product name (Dexit/Muspell)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Context (from notes)</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{context.ehr}}'}</code> → EHR system</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{context.dms}}'}</code> → DMS system</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{context.volume}}'}</code> → Document volume</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Advanced Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Advanced
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Clear Cache</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you're experiencing issues with outdated data (like contact names not updating), clear the cache to force a fresh load.
              </p>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
