-- Migration: Add section_type column to scripts table
-- Run this in your Supabase SQL Editor

-- Add section_type column
ALTER TABLE scripts
ADD COLUMN IF NOT EXISTS section_type TEXT;

-- Update existing records to have section_type match script_type
UPDATE scripts
SET section_type = script_type
WHERE section_type IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_scripts_section_type ON scripts(section_type);

-- Verify the migration
SELECT id, name, script_type, section_type, product
FROM scripts
LIMIT 5;
