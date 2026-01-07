import { useState, useEffect, useRef } from 'react'

/**
 * SmartNotesPanel - Right panel for notes and AI pitch generation
 * Features:
 * - Free-form textarea for quick notes
 * - Auto-save every 5 seconds
 * - AI pitch generation with Haiku model
 * - Separate display area for AI response
 * - Copy to center button
 */
export default function SmartNotesPanel({
  notes,
  onNotesChange,
  onGeneratePitch,
  aiResponse,
  generating,
  tokenCost,
  onCopyToCenter,
  contact,
  autoGenerate = true,
  selectedModel = 'haiku'
}) {
  const [localNotes, setLocalNotes] = useState(notes || '')
  const [lastSaved, setLastSaved] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showProTips, setShowProTips] = useState(true)
  const textareaRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const autoGenerateTimerRef = useRef(null)

  // Sync with parent notes
  useEffect(() => {
    setLocalNotes(notes || '')
  }, [notes])

  // Auto-save logic (5 seconds after typing stops)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    if (localNotes !== notes) {
      setHasUnsavedChanges(true)

      autoSaveTimerRef.current = setTimeout(() => {
        onNotesChange(localNotes)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      }, 5000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [localNotes, notes, onNotesChange])

  // Auto-generate AI pitch (2 seconds after typing stops)
  useEffect(() => {
    if (!autoGenerate) return

    if (autoGenerateTimerRef.current) {
      clearTimeout(autoGenerateTimerRef.current)
    }

    // Only auto-generate if notes are substantial and no AI response yet
    if (localNotes.length > 50 && !aiResponse && !generating) {
      autoGenerateTimerRef.current = setTimeout(() => {
        onGeneratePitch()
      }, 2000)
    }

    return () => {
      if (autoGenerateTimerRef.current) {
        clearTimeout(autoGenerateTimerRef.current)
      }
    }
  }, [localNotes, autoGenerate, aiResponse, generating, onGeneratePitch])

  const handleNotesChange = (e) => {
    setLocalNotes(e.target.value)
  }

  const handleFocus = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleClearNotes = () => {
    if (window.confirm('Clear all notes?')) {
      setLocalNotes('')
      onNotesChange('')
    }
  }

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved'
    const now = new Date()
    const diff = Math.floor((now - lastSaved) / 1000)
    if (diff < 10) return 'Just now'
    if (diff < 60) return `${diff}s ago`
    return `${Math.floor(diff / 60)}m ago`
  }

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">📝 Quick Notes</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${hasUnsavedChanges ? 'text-orange-600' : 'text-gray-500'}`}>
              {hasUnsavedChanges ? '● Unsaved' : formatLastSaved()}
            </span>
            <button
              onClick={handleClearNotes}
              className="text-xs text-gray-500 hover:text-red-600"
              title="Clear notes"
            >
              Clear
            </button>
          </div>
        </div>
        {contact && (
          <p className="text-xs text-gray-600">
            {contact.first_name} {contact.last_name} • {contact.title}
          </p>
        )}
      </div>

      {/* Notes Textarea */}
      <div className="flex-none p-4 border-b border-gray-200">
        <textarea
          ref={textareaRef}
          value={localNotes}
          onChange={handleNotesChange}
          placeholder="Type quick notes here...&#10;&#10;Examples:&#10;• ehr=cerner, no dms, has automation&#10;• happy with current, 500 docs/day&#10;• not decision maker, need IT director"
          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm font-mono"
          spellCheck="false"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{localNotes.length} characters</span>
          <span>Auto-save: 5s • Auto-generate: {autoGenerate ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      {/* AI Generation Controls */}
      <div className="flex-none px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onGeneratePitch}
          disabled={generating || localNotes.length < 10}
          className={`
            w-full px-4 py-2.5 rounded-md font-medium text-sm transition-all
            ${generating || localNotes.length < 10
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md'
            }
          `}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating pitch...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🤖 Generate AI Pitch
              {tokenCost && <span className="text-xs opacity-75">(~{tokenCost} tokens)</span>}
            </span>
          )}
        </button>

        {localNotes.length < 10 && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            Type at least 10 characters to enable AI generation
          </p>
        )}
      </div>

      {/* AI Response Display */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {aiResponse ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">🎯 AI-Generated Pitch</h4>
              <button
                onClick={onCopyToCenter}
                className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Copy to Center →
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> Generated with {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}
              </span>
              <span>•</span>
              <span>~{tokenCost || 300} tokens used</span>
            </div>

            <button
              onClick={onGeneratePitch}
              disabled={generating}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              🔄 Regenerate
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-3xl mb-3">🤖</div>
            <p className="text-sm">No AI pitch generated yet</p>
            <p className="text-xs mt-2">
              {autoGenerate
                ? 'Will auto-generate 2s after you stop typing'
                : 'Click the button above to generate'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer Tips - Collapsible */}
      {showProTips && (
        <div className="flex-none px-4 py-3 border-t border-gray-200 bg-yellow-50 relative">
          <button
            onClick={() => setShowProTips(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            title="Hide pro tips"
          >
            ✕
          </button>
          <div className="text-xs text-gray-700">
            <strong>💡 Pro Tips:</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Use shorthand: "ehr=cerner, no dms, 500/day"</li>
              <li>Note multiple objections for custom pitch</li>
              <li>Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd> to clear AI response</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
