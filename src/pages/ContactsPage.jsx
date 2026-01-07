import { useState } from 'react'
import { useContacts } from '../hooks/useContacts'
import ContactTable from '../components/ContactTable'
import AddContactModal from '../components/AddContactModal'
import EditContactModal from '../components/EditContactModal'
import BulkUploadModal from '../components/BulkUploadModal'
import CallHistoryModal from '../components/CallHistoryModal'

export default function ContactsPage() {
  const {
    contacts,
    loading,
    error,
    addContact,
    bulkImportContacts,
    updateContact,
    deleteContact
  } = useContacts()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowEditModal(true)
  }

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const result = await deleteContact(contactId)
      if (!result.success) {
        alert(`Error deleting contact: ${result.error}`)
      }
    }
  }

  const handleViewHistory = (contact) => {
    setSelectedContact(contact)
    setShowHistoryModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error loading contacts</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your Dexit and Muspell prospect contacts
            </p>
          </div>

          {/* Action buttons - Right aligned */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Contact
            </button>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Import CSV
            </button>
          </div>
        </div>
      </div>

      {/* Contact table - takes remaining space */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <ContactTable
          contacts={contacts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
        />
      </div>

      {/* Modals */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addContact}
      />

      <EditContactModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingContact(null)
        }}
        onUpdate={updateContact}
        contact={editingContact}
      />

      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onBulkImport={bulkImportContacts}
      />

      <CallHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false)
          setSelectedContact(null)
        }}
        contact={selectedContact}
      />
    </div>
  )
}
