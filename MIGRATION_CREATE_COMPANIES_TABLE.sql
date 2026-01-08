-- Migration: Create Companies Table
-- Purpose: Company-first architecture - track organizations for call context
-- Date: 2026-01-08

-- Create companies table (no contacts table - contacts entered on-the-fly)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50), -- Small, Medium, Large, Enterprise

  -- Systems (for both Dexit and Muspell)
  ehr_system VARCHAR(100), -- Epic, Cerner, Athena, eCW, Nextgen, etc.
  dms_system VARCHAR(100), -- OnBase, Epic Gallery, Cerner WQM, RightFax, Custom, etc.

  -- Context
  company_notes TEXT, -- Organizational situation, pain points, ongoing projects

  -- Muspell Triggers
  trigger_type VARCHAR(50), -- Merger, Acquisition, Migration, Upgrade, Other, None
  trigger_details TEXT, -- Timeline, systems involved, project scope
  trigger_timeline VARCHAR(100), -- Q1 2024, Next 6 months, etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_dms_system ON companies(dms_system);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_trigger_type ON companies(trigger_type);

-- Add comments explaining the columns
COMMENT ON TABLE companies IS 'Organizations tracked for call management - central entity for company context';
COMMENT ON COLUMN companies.name IS 'Company/Organization name';
COMMENT ON COLUMN companies.industry IS 'Industry (Healthcare, Financial, etc.)';
COMMENT ON COLUMN companies.size IS 'Organization size (Small, Medium, Large, Enterprise)';
COMMENT ON COLUMN companies.ehr_system IS 'EHR system used (Epic, Cerner, Athena, etc.) - for Dexit positioning';
COMMENT ON COLUMN companies.dms_system IS 'Document management system (OnBase, Epic Gallery, etc.) - for competitor positioning';
COMMENT ON COLUMN companies.company_notes IS 'Organizational context, pain points, situation, informal contact references';
COMMENT ON COLUMN companies.trigger_type IS 'Muspell trigger (Merger, Acquisition, Migration, Upgrade, Other, None)';
COMMENT ON COLUMN companies.trigger_details IS 'Details about trigger - timeline, systems involved, project scope';
COMMENT ON COLUMN companies.trigger_timeline IS 'When trigger is happening (Q1 2024, Next 6 months, etc.)';

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own companies
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Example values for reference:
--
-- EHR Systems: Epic, Cerner, Athena (athenahealth), eCW (eClinicalWorks),
--              Nextgen, Meditech, Allscripts, Other
--
-- DMS Systems: OnBase (Hyland), Epic Gallery (Hyperdrive), Cerner WQM,
--              RightFax (OpenText), athenahealth, eClinicalWorks,
--              Nextgen, Custom/Internal, None, Other
--
-- Trigger Types: None, Merger, Acquisition, Migration, Upgrade,
--                System Change, Other
--
-- Industry: Healthcare, Financial Services, Insurance, Government,
--           Education, Manufacturing, Other
--
-- Size: Small (<100 employees), Medium (100-500),
--       Large (500-2000), Enterprise (2000+)

-- Sample data insert (for testing):
-- INSERT INTO companies (name, industry, size, ehr_system, dms_system, company_notes, trigger_type, trigger_details, trigger_timeline, user_id)
-- VALUES (
--   'Memorial Hospital',
--   'Healthcare',
--   'Large (500+ beds)',
--   'Epic',
--   'OnBase',
--   'Struggling with fax volume in HIM dept. Currently using OnBase but want to reduce manual indexing. Open to complementary tools. Key contacts: John (HIM Dir), Sarah (Rev Cycle).',
--   'Merger',
--   'Acquiring smaller facility, integrating their Epic instance with ours. Complex data migration project.',
--   'Q2 2024',
--   auth.uid()
-- );

-- Verify migration
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully: companies table created with RLS policies';
  RAISE NOTICE 'NOTE: No contacts table - contact name/title entered on-the-fly during calls (session only)';
END $$;
