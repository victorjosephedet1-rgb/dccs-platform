/*
  # Add Phase 1 Columns to Profiles Table

  ## Summary
  Adds Phase 1-specific columns to the profiles table to classify users and disable monetization
  features during the registration-only phase.

  ## Changes Made
  
  ### New Columns Added:
  - `account_type` (TEXT): User classification (default: 'creator')
  - `phase_1_creator` (BOOLEAN): Marks users created during Phase 1 (default: TRUE)
  - `monetization_enabled` (BOOLEAN): Controls revenue features (default: FALSE for Phase 1)
  
  ### Existing Columns Updated:
  - `instant_payout_enabled`: Set to FALSE for all Phase 1 users
  - `total_earnings`: Preserved but not actively used in Phase 1
  - `stripe_account_id`: Preserved but not required in Phase 1
  
  ## Important Notes
  - All existing users are marked as Phase 1 creators
  - Monetization features are disabled but data columns are preserved
  - This is a non-destructive migration (additive + update only)
  - User profile data remains intact
  
  ## Rollback Strategy
  If needed, these columns can be dropped and monetization can be re-enabled without data loss.
*/

-- Add Phase 1 user classification columns
DO $$
BEGIN
  -- Add account_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN account_type TEXT DEFAULT 'creator';
  END IF;

  -- Add phase_1_creator column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phase_1_creator'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN phase_1_creator BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add monetization_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'monetization_enabled'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN monetization_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update all existing profiles to Phase 1 mode
UPDATE profiles 
SET 
  account_type = 'creator',
  phase_1_creator = TRUE,
  monetization_enabled = FALSE,
  instant_payout_enabled = FALSE
WHERE phase_1_creator IS NULL OR monetization_enabled IS NULL;

-- Create indexes for Phase 1 filtering
CREATE INDEX IF NOT EXISTS idx_profiles_phase1_creators 
ON profiles(phase_1_creator) 
WHERE phase_1_creator = TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_account_type 
ON profiles(account_type);

CREATE INDEX IF NOT EXISTS idx_profiles_monetization 
ON profiles(monetization_enabled) 
WHERE monetization_enabled = FALSE;

-- Add check constraint to ensure Phase 1 users cannot have monetization enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_phase1_monetization_restriction'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT check_phase1_monetization_restriction 
    CHECK (
      (phase_1_creator = TRUE AND monetization_enabled = FALSE)
      OR phase_1_creator = FALSE
    );
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.account_type IS 'User account classification: creator (default), enterprise, admin';
COMMENT ON COLUMN profiles.phase_1_creator IS 'Whether user was created during Phase 1 (registration-only)';
COMMENT ON COLUMN profiles.monetization_enabled IS 'Whether revenue/payout features are enabled (FALSE for Phase 1)';
COMMENT ON COLUMN profiles.instant_payout_enabled IS 'Whether instant payouts are available (disabled in Phase 1)';
