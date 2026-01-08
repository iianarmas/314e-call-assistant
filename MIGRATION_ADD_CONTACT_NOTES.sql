-- Migration: Add contact_notes table
-- Run this in your Supabase SQL Editor

-- Create contact_notes table
CREATE TABLE IF NOT EXISTS contact_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_notes_contact_id ON contact_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_notes_created_at ON contact_notes(created_at DESC);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Enable all operations for contact_notes" ON contact_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contact_notes'
ORDER BY ordinal_position;
