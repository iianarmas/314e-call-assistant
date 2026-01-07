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

  const currentScript = availableScripts.find(s => s.id === selectedScriptId)
  const isAutoSelected = selectedScriptId === autoSelectedScriptId

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Selected Script Display - Always visible */}
      {currentScript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {currentScript.name}
              {currentScript.approach && ` (${currentScript.approach})`}
              {currentScript.trigger_type && ` (${currentScript.trigger_type})`}
              {' '}v{currentScript.version}
            </span>
            {isAutoSelected && (
              <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                ⭐ Auto-selected
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dropdown to change script */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {currentScript ? 'Change Script' : `Select ${scriptType.charAt(0).toUpperCase() + scriptType.slice(1)} Script`}
      </label>

      <select
        value={selectedScriptId || ''}
        onChange={(e) => onSelectScript(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableScripts.map(script => {
          const label = `${script.name} ${script.approach ? `(${script.approach})` : ''} ${script.trigger_type ? `(${script.trigger_type})` : ''} - v${script.version}`

          return (
            <option key={script.id} value={script.id}>
              {label}
            </option>
          )
        })}
      </select>

      {isAutoSelected && (
        <p className="text-xs text-gray-500 mt-2">
          💡 This script was automatically selected based on {contact.title}
        </p>
      )}
    </div>
  )
}
