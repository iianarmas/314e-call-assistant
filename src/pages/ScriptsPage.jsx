import { useState } from 'react'
import { useScripts } from '../hooks/useScripts'
import ScriptTable from '../components/ScriptTable'
import AddScriptModal from '../components/AddScriptModal'
import EditScriptModal from '../components/EditScriptModal'

export default function ScriptsPage() {
  const {
    scripts,
    loading,
    error,
    addScript,
    updateScript,
    deleteScript,
    toggleActive,
    createVersion
  } = useScripts()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingScript, setEditingScript] = useState(null)

  const handleEdit = (script) => {
    setEditingScript(script)
    setShowEditModal(true)
  }

  const handleDelete = async (scriptId) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      const result = await deleteScript(scriptId)
      if (!result.success) {
        alert(`Error deleting script: ${result.error}`)
      }
    }
  }

  const handleToggleActive = async (scriptId, currentStatus) => {
    const result = await toggleActive(scriptId, currentStatus)
    if (!result.success) {
      alert(`Error toggling script status: ${result.error}`)
    }
  }

  const handleCreateVersion = async (scriptId) => {
    const script = scripts.find(s => s.id === scriptId)
    if (!script) return

    const newContent = prompt('Enter new script content:', script.content)
    if (!newContent || newContent === script.content) return

    const result = await createVersion(scriptId, newContent)
    if (result.success) {
      alert(`Version ${result.data.version} created successfully!`)
    } else {
      alert(`Error creating version: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scripts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error loading scripts</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-none px-4 py-4 bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Script Library</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your opening, objection, and closing scripts
            </p>
          </div>

          {/* Action buttons - Right aligned */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Script
            </button>
          </div>
        </div>
      </div>

      {/* Script table - takes remaining space */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <ScriptTable
          scripts={scripts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onCreateVersion={handleCreateVersion}
        />
      </div>

      {/* Modals */}
      <AddScriptModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addScript}
      />

      <EditScriptModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingScript(null)
        }}
        onUpdate={updateScript}
        script={editingScript}
      />
    </div>
  )
}
