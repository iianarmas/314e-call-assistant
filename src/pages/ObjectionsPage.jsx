import { useState } from 'react'
import { useCustomObjections } from '../hooks/useCustomObjections'
import ObjectionTable from '../components/ObjectionTable'
import AddObjectionModal from '../components/AddObjectionModal'
import EditObjectionModal from '../components/EditObjectionModal'

export default function ObjectionsPage() {
  const {
    objections,
    loading,
    error,
    addObjection,
    updateObjection,
    deleteObjection,
    toggleActive
  } = useCustomObjections()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingObjection, setEditingObjection] = useState(null)

  const handleEdit = (objection) => {
    setEditingObjection(objection)
    setShowEditModal(true)
  }

  const handleDelete = async (objectionId) => {
    if (window.confirm('Are you sure you want to delete this objection?')) {
      const result = await deleteObjection(objectionId)
      if (!result.success) {
        alert(`Error deleting objection: ${result.error}`)
      }
    }
  }

  const handleToggleActive = async (objectionId, currentStatus) => {
    const result = await toggleActive(objectionId, currentStatus)
    if (!result.success) {
      alert(`Error toggling objection status: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading objections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error loading objections</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Custom Objections</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage custom objection responses for Dexit and Muspell
            </p>
          </div>

          {/* Action buttons - Right aligned */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Objection
            </button>
          </div>
        </div>
      </div>

      {/* Objection table - takes remaining space */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <ObjectionTable
          objections={objections}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </div>

      {/* Modals */}
      <AddObjectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addObjection}
      />

      <EditObjectionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingObjection(null)
        }}
        onUpdate={updateObjection}
        objection={editingObjection}
      />
    </div>
  )
}
