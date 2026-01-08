import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * ContactNotes Component
 * Displays and manages persistent notes for a contact
 * Notes have timestamps and can be added, edited, or deleted
 */
export default function ContactNotes({ contactId, contactName }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)

  // Load notes from database
  useEffect(() => {
    if (contactId) {
      loadNotes()
    }
  }, [contactId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error('Error loading notes:', err)
      alert('Error loading notes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert('Please enter a note')
      return
    }

    try {
      setSaving(true)
      const { data, error } = await supabase
        .from('contact_notes')
        .insert({
          contact_id: contactId,
          note_text: newNote.trim()
        })
        .select()
        .single()

      if (error) throw error

      // Add to state
      setNotes(prev => [data, ...prev])
      setNewNote('')
    } catch (err) {
      console.error('Error adding note:', err)
      alert('Error adding note: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStartEdit = (note) => {
    setEditingId(note.id)
    setEditText(note.note_text)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleSaveEdit = async (noteId) => {
    if (!editText.trim()) {
      alert('Note cannot be empty')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase
        .from('contact_notes')
        .update({
          note_text: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)

      if (error) throw error

      // Update state
      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, note_text: editText.trim(), updated_at: new Date().toISOString() }
          : n
      ))
      setEditingId(null)
      setEditText('')
    } catch (err) {
      console.error('Error updating note:', err)
      alert('Error updating note: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return

    try {
      const { error } = await supabase
        .from('contact_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      // Remove from state
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      console.error('Error deleting note:', err)
      alert('Error deleting note: ' + err.message)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          📝 Notes for {contactName}
        </h3>
        <span className="text-xs text-gray-500">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      {/* Add New Note */}
      <div className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this contact..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleAddNote()
            }
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Tip: Press Ctrl+Enter to save
          </span>
          <button
            onClick={handleAddNote}
            disabled={saving || !newNote.trim()}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-4 text-sm text-gray-500">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          No notes yet. Add your first note above!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              {editingId === note.id ? (
                // Edit Mode
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
                      {note.note_text}
                    </p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="text-blue-600 hover:text-blue-700 text-xs px-2 py-1"
                        title="Edit note"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      {formatTimestamp(note.created_at)}
                    </span>
                    {note.updated_at && note.updated_at !== note.created_at && (
                      <span className="text-gray-400">
                        (edited {formatTimestamp(note.updated_at)})
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
