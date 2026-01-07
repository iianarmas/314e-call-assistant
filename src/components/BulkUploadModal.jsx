import { useState } from 'react'
import { parseCSV, validateCSVFile, generateCSVTemplate } from '../utils/csvParser'

export default function BulkUploadModal({ isOpen, onClose, onBulkImport }) {
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [errors, setErrors] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file
    const validationErrors = validateCSVFile(selectedFile)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setFile(selectedFile)
    setErrors([])

    // Parse and preview
    try {
      const text = await selectedFile.text()
      const contacts = parseCSV(text)
      setPreviewData(contacts)
    } catch (err) {
      setErrors([err.message])
      setPreviewData([])
    }
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      setErrors(['No valid contacts to import'])
      return
    }

    setUploading(true)
    const result = await onBulkImport(previewData)
    setUploading(false)

    if (result.success) {
      // Reset and close
      setFile(null)
      setPreviewData([])
      setErrors([])
      alert(`Successfully imported ${result.count} contacts!`)
      onClose()
    } else {
      setErrors([`Import failed: ${result.error}`])
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '314e-contacts-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setErrors([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bulk Import Contacts
          </h2>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">CSV Format</h3>
            <p className="text-sm text-blue-800 mb-2">
              Required columns: <strong>Name, Company, Product</strong>
            </p>
            <p className="text-sm text-blue-800 mb-2">
              Optional columns: Title, Trigger Type, Trigger Details, Notes
            </p>
            <p className="text-sm text-blue-800 mb-3">
              Product must be either "Dexit" or "Muspell"
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Download CSV Template
            </button>
          </div>

          {/* File upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Preview ({previewData.length} contacts)
              </h3>
              <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((contact, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">{contact.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{contact.company}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{contact.title || '-'}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={contact.product === 'Dexit' ? 'text-blue-600' : 'text-green-600'}>
                            {contact.product}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {contact.trigger_type || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={previewData.length === 0 || uploading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Importing...' : `Import ${previewData.length} Contacts`}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
