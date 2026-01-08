-- Migration: Add Competitor Tracking Fields to Contacts
-- Purpose: Track competitor systems used by contacts for competitor objection handling
-- Date: 2026-01-08

-- Add competitor tracking columns to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS competitor_system VARCHAR(255),
ADD COLUMN IF NOT EXISTS competitor_notes TEXT;

-- Create index for competitor queries
CREATE INDEX IF NOT EXISTS idx_contacts_competitor_system
ON contacts(competitor_system);

-- Add comment explaining the columns
COMMENT ON COLUMN contacts.competitor_system IS 'Current document management system used by contact (OnBase, Epic, Cerner, etc.)';
COMMENT ON COLUMN contacts.competitor_notes IS 'Details about competitor system: version, customizations, integrations, pain points';

-- Example values for competitor_system:
-- - 'OnBase' (OnBase/Hyland)
-- - 'Epic' (Epic Hyperdrive/Gallery)
-- - 'Cerner' (Cerner/Oracle Health WQM)
-- - 'Athena' (athenahealth/athenaOne)
-- - 'eCW' (eClinicalWorks)
-- - 'Nextgen'
-- - 'RightFax' (RightFax/OpenText)
-- - 'Custom' (Custom/Internal System)
-- - 'Multiple' (Multiple Systems)
-- - 'None' (No DMS - Manual Process)
-- - NULL or empty (Unknown / Not Sure)

-- RLS Policy: Allow authenticated users to read and update their own contacts
-- (No new policies needed - existing RLS policies on contacts table apply)

-- Verify migration
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'contacts'
  AND column_name IN ('competitor_system', 'competitor_notes')
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully: competitor_system and competitor_notes columns added to contacts table';
END $$;
