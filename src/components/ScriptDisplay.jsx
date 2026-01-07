export default function ScriptDisplay({ contact, script, loading, onRegenerate, selectedScript, tokenUsage }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      {/* Contact header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{contact?.name}</h2>
            <p className="text-sm text-gray-600">{contact?.title}</p>
            <p className="text-sm text-gray-500">{contact?.company}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                contact?.product === 'Dexit' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {contact?.product}
              </span>
              {contact?.trigger_type && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {contact.trigger_type}
                </span>
              )}
            </div>
          </div>

          {/* Script Info & Status */}
          <div className="text-right">
            {selectedScript && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">
                  📄 {selectedScript.name} (v{selectedScript.version})
                </span>
                {tokenUsage?.aiGenerated ? (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ AI Personalized ({tokenUsage.regenerationCount}x)
                  </span>
                ) : (
                  <span className="text-xs text-blue-600 font-medium">
                    📋 Template Script
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Script content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating script...</span>
          </div>
        ) : script ? (
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
              {script}
            </div>
            {onRegenerate && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={onRegenerate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  🔄 Regenerate with AI
                </button>
                <span className="text-xs text-gray-500">
                  (uses tokens)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No script available</p>
            <p className="text-sm mt-2">Loading script...</p>
          </div>
        )}
      </div>
    </div>
  )
}
