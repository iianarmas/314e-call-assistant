import { useState } from 'react'
import { useContacts } from '../hooks/useContacts'
import ContactList from '../components/ContactList'
import AddContactModal from '../components/AddContactModal'
import EditContactModal from '../components/EditContactModal'
import BulkUploadModal from '../components/BulkUploadModal'

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
  const [editingContact, setEditingContact] = useState(null)

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-2 text-gray-600">
            Manage your Dexit and Muspell prospect contacts
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* Contact list */}
        <ContactList
          contacts={contacts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
      </div>
    </div>
  )
}
