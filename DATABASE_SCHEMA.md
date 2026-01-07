# Database Schema Updates for Phase 3

## Initial Schema (Run First)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  script_type TEXT NOT NULL, -- 'opening', 'objection', 'closing' (deprecated, use section_type)
  section_type TEXT, -- 'opening', 'discovery', 'transition', 'objections', 'closing'
  product TEXT NOT NULL, -- 'Dexit', 'Muspell'
  approach TEXT, -- 'IT', 'HIM', 'Provider' for Dexit opening scripts
  trigger_type TEXT, -- 'Migration', 'Merger', etc. for Muspell
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  parent_script_id UUID REFERENCES scripts(id), -- For versioning
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Custom objections table
CREATE TABLE IF NOT EXISTS custom_objections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product TEXT NOT NULL,
  objection_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update call_logs to track scripts used
ALTER TABLE call_logs
ADD COLUMN IF NOT EXISTS opening_script_id UUID REFERENCES scripts(id),
ADD COLUMN IF NOT EXISTS objection_responses JSONB,
ADD COLUMN IF NOT EXISTS closing_script_id UUID REFERENCES scripts(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scripts_product ON scripts(product);
CREATE INDEX IF NOT EXISTS idx_scripts_type ON scripts(script_type);
CREATE INDEX IF NOT EXISTS idx_scripts_section_type ON scripts(section_type);
CREATE INDEX IF NOT EXISTS idx_scripts_active ON scripts(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_objections_product ON custom_objections(product);
CREATE INDEX IF NOT EXISTS idx_call_logs_script_ids ON call_logs(opening_script_id, closing_script_id);
```

## Token Tracking Update (Run After Phase 3 Optimization)

Add token usage tracking to call_logs table:

```sql
-- Add token tracking columns to call_logs
ALTER TABLE call_logs
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS call_notes TEXT,
ADD COLUMN IF NOT EXISTS structured_notes JSONB,
ADD COLUMN IF NOT EXISTS ai_pitch_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_tokens_used INTEGER DEFAULT 0;

-- Add notes column to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Split name into first_name and last_name, rename company to organization
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Migrate existing data (run this AFTER adding columns)
UPDATE contacts
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE
      WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1
      THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
      ELSE ''
    END,
    organization = company
WHERE first_name IS NULL;

-- Optional: Remove old columns after migration (DO THIS LAST, AFTER VERIFYING)
-- ALTER TABLE contacts DROP COLUMN IF EXISTS name;
-- ALTER TABLE contacts DROP COLUMN IF EXISTS company;

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_call_logs_ai_usage ON call_logs(ai_generated, regeneration_count);
```
