/*
  # Add Phase 1 Columns to DCCS Certificates Table

  ## Summary
  Adds Phase 1-specific columns to the dccs_certificates table to support registration-only functionality
  and clarify the platform's current scope.

  ## Changes Made
  
  ### New Columns Added:
  - `phase` (TEXT): Tracks which platform phase this certificate belongs to (default: 'phase_1')
  - `registration_purpose` (TEXT): Clarifies the purpose of registration (default: 'ownership_proof')
  - `redownload_enabled` (BOOLEAN): Controls whether secure re-download is available (default: TRUE)
  - `public_verification_enabled` (BOOLEAN): Controls public verification portal access (default: TRUE)
  
  ## Important Notes
  - All existing certificates are automatically marked as Phase 1
  - Marketplace-related fields (available_for_licensing, licensing_status, revenue_model) are NOT removed
  - This is a non-destructive migration (additive only)
  - Existing data remains intact
  
  ## Rollback Strategy
  If needed, these columns can be dropped without data loss to existing core fields.
*/

-- Add Phase 1 tracking columns
DO $$
BEGIN
  -- Add phase column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'phase'
  ) THEN
    ALTER TABLE dccs_certificates 
    ADD COLUMN phase TEXT DEFAULT 'phase_1';
  END IF;

  -- Add registration_purpose column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'registration_purpose'
  ) THEN
    ALTER TABLE dccs_certificates 
    ADD COLUMN registration_purpose TEXT DEFAULT 'ownership_proof';
  END IF;

  -- Add redownload_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'redownload_enabled'
  ) THEN
    ALTER TABLE dccs_certificates 
    ADD COLUMN redownload_enabled BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add public_verification_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'public_verification_enabled'
  ) THEN
    ALTER TABLE dccs_certificates 
    ADD COLUMN public_verification_enabled BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Update existing certificates to Phase 1 mode
UPDATE dccs_certificates 
SET 
  phase = 'phase_1',
  registration_purpose = 'ownership_proof',
  redownload_enabled = TRUE,
  public_verification_enabled = TRUE
WHERE phase IS NULL;

-- Set marketplace fields to Phase 1 appropriate values
UPDATE dccs_certificates 
SET 
  available_for_licensing = FALSE,
  licensing_status = 'phase_1_registration_only'
WHERE phase = 'phase_1' AND available_for_licensing IS NOT FALSE;

-- Create index for phase filtering
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_phase_lookup 
ON dccs_certificates(phase) 
WHERE phase = 'phase_1';

-- Add comment to table for documentation
COMMENT ON COLUMN dccs_certificates.phase IS 'Platform phase when certificate was issued (phase_1, phase_2, etc.)';
COMMENT ON COLUMN dccs_certificates.registration_purpose IS 'Purpose of registration: ownership_proof, marketplace_listing, etc.';
COMMENT ON COLUMN dccs_certificates.redownload_enabled IS 'Whether secure re-download is enabled for this certificate';
COMMENT ON COLUMN dccs_certificates.public_verification_enabled IS 'Whether public verification portal can access this certificate';
