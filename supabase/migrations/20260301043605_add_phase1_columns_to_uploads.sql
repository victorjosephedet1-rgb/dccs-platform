/*
  # Add Phase 1 Columns to Uploads Table

  ## Summary
  Adds Phase 1-specific columns to the uploads table to clarify upload purpose and disable
  marketplace eligibility during the registration-only phase.

  ## Changes Made
  
  ### New Columns Added:
  - `upload_purpose` (TEXT): Clarifies why content was uploaded (default: 'dccs_registration')
  - `is_marketplace_eligible` (BOOLEAN): Controls marketplace eligibility (default: FALSE for Phase 1)
  
  ### Existing Columns Updated:
  - `can_convert_to_sale`: Set to FALSE for all Phase 1 uploads
  - `marketplace_status`: Set to 'not_applicable_phase_1' for Phase 1
  - `price`: Set to NULL for all Phase 1 uploads
  
  ## Important Notes
  - All existing uploads are marked as DCCS registration purpose
  - Marketplace features are disabled but data columns are preserved
  - This is a non-destructive migration (additive + update only)
  - No content files or metadata are deleted
  
  ## Rollback Strategy
  If needed, these columns can be dropped and marketplace fields can be re-enabled without data loss.
*/

-- Add Phase 1 purpose tracking columns
DO $$
BEGIN
  -- Add upload_purpose column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'upload_purpose'
  ) THEN
    ALTER TABLE uploads 
    ADD COLUMN upload_purpose TEXT DEFAULT 'dccs_registration';
  END IF;

  -- Add is_marketplace_eligible column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'is_marketplace_eligible'
  ) THEN
    ALTER TABLE uploads 
    ADD COLUMN is_marketplace_eligible BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update all existing uploads to Phase 1 mode
UPDATE uploads 
SET 
  upload_purpose = 'dccs_registration',
  is_marketplace_eligible = FALSE,
  can_convert_to_sale = FALSE,
  marketplace_status = 'not_applicable_phase_1',
  price = NULL
WHERE upload_purpose IS NULL OR is_marketplace_eligible IS NULL;

-- Create indexes for Phase 1 filtering
CREATE INDEX IF NOT EXISTS idx_uploads_purpose_lookup 
ON uploads(upload_purpose) 
WHERE upload_purpose = 'dccs_registration';

CREATE INDEX IF NOT EXISTS idx_uploads_marketplace_eligible 
ON uploads(is_marketplace_eligible) 
WHERE is_marketplace_eligible = FALSE;

-- Add check constraint to ensure Phase 1 uploads cannot be marketplace-eligible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_phase1_marketplace_restriction'
  ) THEN
    ALTER TABLE uploads 
    ADD CONSTRAINT check_phase1_marketplace_restriction 
    CHECK (
      (upload_purpose = 'dccs_registration' AND is_marketplace_eligible = FALSE)
      OR upload_purpose != 'dccs_registration'
    );
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN uploads.upload_purpose IS 'Purpose of upload: dccs_registration (Phase 1), marketplace_listing (Phase 2+), etc.';
COMMENT ON COLUMN uploads.is_marketplace_eligible IS 'Whether this upload can be listed in the marketplace (FALSE for Phase 1)';
COMMENT ON COLUMN uploads.marketplace_status IS 'Marketplace listing status (not_applicable_phase_1 for Phase 1 uploads)';
