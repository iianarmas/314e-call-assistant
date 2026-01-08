# Contact Notes System Guide

## Overview
A new persistent notes system has been added to store permanent notes about contacts. This is separate from the temporary "Call Session Notes" used for AI pitch generation.

---

## Two Types of Notes

### 1. Contact Notes (NEW - Persistent)
**Location**: Center panel, below the script content
**Purpose**: Permanent notes about the contact
**Persistence**: Saved to database, visible across all calls
**Features**:
- ✅ Add, edit, delete notes
- ✅ Timestamps (created & edited)
- ✅ Survives call sessions
- ✅ Accessible from any call with this contact

**Use Cases**:
- Past conversation highlights
- Prospect's pain points
- Decision-maker info
- Budget/timeline notes
- Follow-up reminders

### 2. Call Session Notes (Existing - Temporary)
**Location**: Right panel
**Purpose**: Quick notes for current call only
**Persistence**: Saved to call log when call ends
**Features**:
- ✅ AI pitch generation input
- ✅ Auto-save every 5 seconds
- ✅ Context extraction (EHR, DMS, volume)

**Use Cases**:
- Current call observations
- Technical details for AI
- Quick scratch notes

---

## Contact Notes Features

### Adding a Note
1. Navigate to any call flow section
2. Scroll down below the pro tips
3. Type in the "Add a note" textarea
4. Click **Add Note** or press **Ctrl+Enter**
5. Note appears with timestamp

### Editing a Note
1. Click the **✏️** (edit) icon on any note
2. Modify the text
3. Click **Save** to update
4. Click **Cancel** to discard changes

### Deleting a Note
1. Click the **🗑️** (delete) icon
2. Confirm deletion
3. Note is permanently removed

### Timestamps
- **Created**: Shows when note was first added
- **Edited**: Shows "(edited X ago)" if note was modified
- Smart time formatting:
  - "Just now" (< 1 minute)
  - "5m ago" (< 1 hour)
  - "2h ago" (< 24 hours)
  - "3d ago" (< 7 days)
  - "Jan 5" (older dates)

---

## Database Schema

### contact_notes Table
```sql
CREATE TABLE contact_notes (
  id UUID PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id),
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

### Migration Required
Run this SQL in Supabase:

```sql
-- See MIGRATION_ADD_CONTACT_NOTES.sql for full migration
```

---

## User Interface

### Contact Notes Section
```
┌─────────────────────────────────────────┐
│ 📝 Notes for John Smith      2 notes   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Add a note about this contact...    │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│   Tip: Press Ctrl+Enter to save         │
│                          [Add Note]      │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Mentioned they use Epic EHR and     │ │
│ │ process 500 charts/day manually     │ │
│ │ 2h ago                    ✏️ 🗑️     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Decision maker for HIM dept.        │ │
│ │ Budget approved for Q1              │ │
│ │ Jan 5 (edited Jan 6)      ✏️ 🗑️     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Call Session Notes (Right Panel)
```
┌─────────────────────────────────────────┐
│ 📝 Call Session Notes                   │
│ For AI pitch generation (not saved)     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Type quick notes here...            │ │
│ │                                     │ │
│ │ Examples:                           │ │
│ │ • ehr=cerner, no dms, 500 docs/day  │ │
│ │ • happy with current system         │ │
│ └─────────────────────────────────────┘ │
│   Auto-save: 5s • Auto-generate: ON     │
├─────────────────────────────────────────┤
│        🤖 Generate AI Pitch             │
└─────────────────────────────────────────┘
```

---

## Workflow Examples

### Example 1: First Call
**During Call**:
1. Use **Call Session Notes** (right panel) for live observations
   - "ehr=epic, volume=500/day, no current automation"
2. Generate AI pitch from these notes
3. After call, add **Contact Note** (center panel) for important details
   - "Primary pain point: Manual chart processing takes 4 FTEs"

**Result**:
- Call session notes → saved to call log
- Contact note → permanently attached to contact

### Example 2: Follow-up Call
**Next Call**:
1. Open call page
2. Scroll to Contact Notes section
3. Review previous notes:
   - "Primary pain point: Manual chart processing takes 4 FTEs"
   - "Budget approved for Q1"
4. Add new note after this call:
   - "Sent proposal. Waiting for IT Director approval"

**Result**:
- Complete history of all interactions
- No need to remember past conversations

### Example 3: Team Collaboration
**Sales Rep 1** adds note:
- "Interested but needs to see ROI calculator"

**Sales Rep 2** (weeks later) sees note:
- Knows to bring ROI data to next call
- Doesn't duplicate questions

---

## Benefits

### 1. Persistent Memory
- Notes survive across calls
- Build complete contact history
- Never lose important details

### 2. Clear Separation
- **Contact Notes**: What you need to remember about the person
- **Call Session Notes**: What AI needs to generate pitch

### 3. Easy Management
- Add/edit/delete anytime
- Timestamps track when info was added
- No limit on number of notes

### 4. Better Context
- Review past conversations before calls
- Track decision-making process
- Document objections and responses

### 5. Team Visibility
- Share notes across team (future feature)
- Consistent handoffs
- Institutional knowledge retention

---

## Best Practices

### What to Put in Contact Notes
✅ Decision-maker information
✅ Budget/timeline details
✅ Technical environment (EHR, DMS)
✅ Pain points mentioned
✅ Objections raised
✅ Next steps agreed upon
✅ Relationship notes

### What to Put in Call Session Notes
✅ Live call observations
✅ Technical specs for AI
✅ Quick calculations
✅ Scratch notes
✅ Context for AI pitch

### Don't Put in Notes
❌ Sensitive personal information
❌ Discriminatory observations
❌ Complaints about prospects
❌ Information that violates privacy

---

## Technical Details

### Files Created
- `src/components/ContactNotes.jsx` - Contact notes component
- `MIGRATION_ADD_CONTACT_NOTES.sql` - Database migration

### Files Modified
- `src/components/CallFlowContentPanel.jsx` - Added ContactNotes component
- `src/components/SmartNotesPanel.jsx` - Renamed to "Call Session Notes"

### API Operations
```javascript
// Load notes
supabase.from('contact_notes')
  .select('*')
  .eq('contact_id', contactId)
  .order('created_at', { ascending: false })

// Add note
supabase.from('contact_notes')
  .insert({ contact_id, note_text })

// Update note
supabase.from('contact_notes')
  .update({ note_text, updated_at })
  .eq('id', noteId)

// Delete note
supabase.from('contact_notes')
  .delete()
  .eq('id', noteId)
```

---

## Troubleshooting

### Notes Not Showing
1. Run database migration: `MIGRATION_ADD_CONTACT_NOTES.sql`
2. Check Supabase table exists
3. Check browser console for errors
4. Verify contact ID is valid

### Can't Add Notes
1. Check `contact_notes` table has RLS policy
2. Verify Supabase connection
3. Check required fields (contact_id, note_text)

### Notes Not Saving
1. Check network tab for API errors
2. Verify Supabase credentials
3. Check database constraints
4. Review browser console

---

## Future Enhancements

### Planned Features
1. **Search Notes**: Search across all contact notes
2. **Tags**: Categorize notes (budget, technical, decision-maker)
3. **Rich Text**: Formatting, lists, links
4. **Attachments**: Upload files, screenshots
5. **Mentions**: @mention team members
6. **Reminders**: Set follow-up reminders
7. **Export**: Export notes to PDF/CSV
8. **Templates**: Note templates for common scenarios

---

## Status: ✅ Complete

Contact notes system is fully functional! Run the migration and start adding persistent notes to your contacts.
