import { useState } from 'react'

export default function ObjectionHandler({
  product,
  contact,
  objectionLibrary,
  onGenerateResponse,
  generating
}) {
  const [customObjection, setCustomObjection] = useState('')

  const handleQuickObjection = async (objection) => {
    // Use pre-written response (no AI call)
    await onGenerateResponse(objection.response, 'quick')
  }

  const handleCustomObjection = async () => {
    if (!customObjection.trim()) return

    // Generate AI response
    await onGenerateResponse(customObjection, 'custom')
    setCustomObjection('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCustomObjection()
    }
  }

  // Get objections for current product
  const productObjections = objectionLibrary?.[product.toLowerCase()] || []

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3">Objection Handler</h4>

      {/* Quick-select objections */}
      {productObjections.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Quick Responses:</p>
          <div className="flex flex-wrap gap-2">
            {productObjections.map((objection, index) => (
              <button
                key={index}
                onClick={() => handleQuickObjection(objection)}
                disabled={generating}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {objection.buttonLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom objection input */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Custom Objection:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customObjection}
            onChange={(e) => setCustomObjection(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={generating}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Type any objection..."
          />
          <button
            onClick={handleCustomObjection}
            disabled={!customObjection.trim() || generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate ➜'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
