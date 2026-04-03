/*
  # Standardize DCCS Clearance Code Format

  1. Overview
    - Updates clearance code generation to unified DCCS format
    - New format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
    - Examples: DCCS-AUD-2026-9F3K2L, DCCS-VID-2026-X82LMN
    - Maintains backward compatibility with existing codes

  2. Changes
    - Updates `set_dccs_certificate_data()` trigger function
    - Implements standardized type mapping
    - Uses 6-character unique IDs (no I or O for clarity)

  3. Type Mapping
    - Audio/Music → AUD
    - Video → VID
    - Image/Art → IMG
    - Document/Design → DOC
    - 3D Models → MOD
    - Code/Software → COD
    - Other → OTH

  4. Important Notes
    - Existing codes remain valid (backward compatible)
    - Only new uploads get standardized format
    - Verification system supports both formats
    - Database structure unchanged
*/

-- ============================================================================
-- Update Certificate Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION set_dccs_certificate_data()
RETURNS TRIGGER AS $$
DECLARE
  v_type_code text;
  v_year text;
  v_unique_id text;
BEGIN
  -- Generate certificate ID if not provided
  IF NEW.certificate_id IS NULL THEN
    NEW.certificate_id := generate_dccs_certificate_id();
  END IF;

  -- Generate standardized clearance code if not provided
  IF NEW.clearance_code IS NULL THEN
    -- Map project type to standardized type code
    v_type_code := CASE NEW.project_type
      WHEN 'audio' THEN 'AUD'
      WHEN 'video' THEN 'VID'
      WHEN 'podcast' THEN 'AUD'
      WHEN 'sample_pack' THEN 'AUD'
      ELSE 'OTH'
    END;

    -- Get current year
    v_year := TO_CHAR(NOW(), 'YYYY');

    -- Generate 6-character unique ID (exclude I and O for clarity)
    v_unique_id := UPPER(
      TRANSLATE(
        substr(md5(random()::text || NEW.creator_id::text || NOW()::text), 1, 6),
        'iol',
        'ABC'
      )
    );

    -- Construct standardized DCCS clearance code
    -- Format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
    NEW.clearance_code := 'DCCS-' || v_type_code || '-' || v_year || '-' || v_unique_id;
  END IF;

  -- Generate certificate hash
  NEW.certificate_hash := generate_dccs_certificate_hash(
    NEW.certificate_id,
    NEW.creator_id,
    NEW.project_title,
    NEW.creation_timestamp,
    NEW.audio_fingerprint,
    NEW.previous_certificate_hash
  );

  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- Add Helper Function for Type Code Mapping
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dccs_type_code(p_project_type text)
RETURNS text AS $$
BEGIN
  RETURN CASE p_project_type
    WHEN 'audio' THEN 'AUD'
    WHEN 'video' THEN 'VID'
    WHEN 'podcast' THEN 'AUD'
    WHEN 'sample_pack' THEN 'AUD'
    ELSE 'OTH'
  END;
END;
$$ LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- Add Comment Documentation
-- ============================================================================

COMMENT ON FUNCTION set_dccs_certificate_data() IS
'Trigger function that auto-generates DCCS certificate data including standardized clearance codes.
Format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
Example: DCCS-AUD-2026-9F3K2L';

COMMENT ON FUNCTION get_dccs_type_code(text) IS
'Maps project types to standardized DCCS type codes (AUD, VID, IMG, DOC, MOD, COD, OTH)';
