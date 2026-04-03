/*
  # Make Platform Completely FREE - Phase 1 Momentum Building

  1. Changes
    - Set all existing DCCS certificates to download_unlocked = TRUE
    - Change default for new DCCS certificates to download_unlocked = TRUE
    - Disable payment requirement completely during momentum building phase

  2. Important Notes
    - Platform is 100% FREE during Phase 1
    - Building user base and proving platform value
    - No charges for uploads, downloads, or DCCS registration
    - Payment infrastructure remains in database for future phases
*/

-- Unlock ALL existing DCCS certificates for free download
UPDATE dccs_certificates 
SET download_unlocked = true 
WHERE download_unlocked = false;

-- Change the default to TRUE for all new DCCS certificates
ALTER TABLE dccs_certificates 
ALTER COLUMN download_unlocked SET DEFAULT true;

-- Create trigger to auto-unlock all new DCCS certificates (belt and suspenders)
CREATE OR REPLACE FUNCTION auto_unlock_dccs_downloads()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Always unlock downloads during Phase 1 (free momentum building)
  NEW.download_unlocked = true;
  RETURN NEW;
END;
$$;

-- Apply trigger to ensure all new DCCS are unlocked
DROP TRIGGER IF EXISTS ensure_free_downloads_phase1 ON dccs_certificates;
CREATE TRIGGER ensure_free_downloads_phase1
  BEFORE INSERT ON dccs_certificates
  FOR EACH ROW
  EXECUTE FUNCTION auto_unlock_dccs_downloads();

-- Update verify_download_access function to always allow downloads in Phase 1
CREATE OR REPLACE FUNCTION verify_download_access(
  p_dccs_id uuid,
  p_user_id uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_id uuid;
BEGIN
  -- Get DCCS certificate creator
  SELECT creator_id
  INTO v_creator_id
  FROM dccs_certificates
  WHERE id = p_dccs_id;
  
  -- Check if user is creator/owner
  IF v_creator_id != p_user_id THEN
    RETURN false;
  END IF;
  
  -- PHASE 1: Always allow downloads (no payment required)
  -- Downloads are completely FREE during momentum building
  RETURN true;
END;
$$;

-- Comment on the table to document Phase 1 free policy
COMMENT ON COLUMN dccs_certificates.download_unlocked IS 
'Phase 1: Always TRUE - all downloads are FREE during momentum building. Payment will be enabled in future phases.';
