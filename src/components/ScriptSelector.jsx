import { useMemo } from 'react'

export default function ScriptSelector({
  contact,
  scripts,
  scriptType,
  selectedScriptId,
  onSelectScript,
  autoSelectedScriptId
}) {
  // Filter scripts by product and type
  const availableScripts = useMemo(() => {
    if (!scripts || scripts.length === 0) return []

    return scripts.filter(s =>
      s.product === contact.product &&
      s.script_type === scriptType &&
      s.is_active === true
    )
  }, [scripts, contact.product, scriptType])

  if (availableScripts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          No {scriptType} scripts available for {contact.product}. Using fallback script.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select {scriptType.charAt(0).toUpperCase() + scriptType.slice(1)} Script
      </label>

      <select
        value={selectedScriptId || ''}
        onChange={(e) => onSelectScript(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableScripts.map(script => {
          const isAutoSelected = script.id === autoSelectedScriptId
          const label = `${script.name} ${script.approach ? `(${script.approach})` : ''} ${script.trigger_type ? `(${script.trigger_type})` : ''} - v${script.version}`

          return (
            <option key={script.id} value={script.id}>
              {isAutoSelected ? '⭐ ' : ''}{label}
            </option>
          )
        })}
      </select>

      {autoSelectedScriptId && (
        <p className="text-xs text-gray-500 mt-1">
          ⭐ = Auto-selected based on contact details
        </p>
      )}

      {selectedScriptId && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
          <p className="text-xs text-gray-600 line-clamp-3">
            {availableScripts.find(s => s.id === selectedScriptId)?.content}
          </p>
        </div>
      )}
    </div>
  )
}
