/*
  # Enhanced DCCS Code Structure - Patent-Ready Implementation

  ## Overview
  Upgrades the Digital Clearance Code System to patent-ready format:
  DCCS-{VERSION}-{ASSETTYPE}-{CREATOR}-{DATE}-{HASH}-{CHECKSUM}

  ## Changes
  1. Add version field to track DCCS protocol version
  2. Add checksum field for anti-tampering validation
  3. Expand asset_type to support new categories
  4. Add validation constraints for new code format
  5. Create indexes for optimized verification queries
  6. Add helper functions for code generation and validation

  ## New Code Format
  Example: DCCS-01-AUD-V360-20260320-8F21A4-C
  - DCCS: System identifier
  - 01: Version number
  - AUD: Asset type code
  - V360: Creator identifier (4 chars)
  - 20260320: Registration date (YYYYMMDD)
  - 8F21A4: Hash fragment (6 hex chars)
  - C: Checksum character

  ## Security
  - Maintains existing RLS policies
  - Adds checksum validation to prevent tampering
  - Version field enables future protocol upgrades
*/

-- ============================================================================
-- 1. Add New Columns to dccs_certificates
-- ============================================================================

DO $$
BEGIN
  -- Add version column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'dccs_version'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN dccs_version text NOT NULL DEFAULT '01';
  END IF;

  -- Add checksum column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'code_checksum'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN code_checksum char(1);
  END IF;

  -- Add hash fragment column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'hash_fragment'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN hash_fragment text;
  END IF;

  -- Add creator code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'creator_code'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN creator_code text;
  END IF;
END $$;

-- ============================================================================
-- 2. Expand Asset Type Support
-- ============================================================================

-- Drop old constraint if exists
ALTER TABLE dccs_certificates DROP CONSTRAINT IF EXISTS dccs_certificates_project_type_check;

-- Add new constraint with expanded asset types
ALTER TABLE dccs_certificates
  ADD CONSTRAINT dccs_certificates_project_type_check
  CHECK (project_type IN (
    'audio',
    'music',
    'video',
    'image',
    'art',
    'document',
    'design',
    '3dmodel',
    'ai-generated',
    'podcast',
    'sample_pack',
    'other'
  ));

-- ============================================================================
-- 3. Enhanced Clearance Code Validation
-- ============================================================================

-- Drop old constraint if exists
ALTER TABLE dccs_certificates DROP CONSTRAINT IF EXISTS valid_clearance_code_format;

-- Add new constraint for enhanced format
ALTER TABLE dccs_certificates
  ADD CONSTRAINT valid_clearance_code_format
  CHECK (clearance_code ~ '^DCCS-\d{2}-(AUD|MUS|VID|IMG|ART|DOC|DES|3DM|AIG|OTH)-[A-Z0-9]{4}-\d{8}-[A-F0-9]{6}-[A-Z0-9]$');

-- ============================================================================
-- 4. Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_version
  ON dccs_certificates(dccs_version);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_hash_fragment
  ON dccs_certificates(hash_fragment);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_creator_code
  ON dccs_certificates(creator_code);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_creator_date
  ON dccs_certificates(creator_id, creation_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_asset_type
  ON dccs_certificates(project_type);

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_dccs_checksum(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_without_checksum text;
  provided_checksum char(1);
  calculated_checksum char(1);
  char_sum integer := 0;
  i integer;
BEGIN
  code_without_checksum := substring(code from 1 for length(code) - 2);
  provided_checksum := substring(code from length(code));

  FOR i IN 1..length(code_without_checksum) LOOP
    char_sum := char_sum + ascii(substring(code_without_checksum from i for 1));
  END LOOP;

  calculated_checksum := upper(to_hex(char_sum % 36));

  RETURN provided_checksum = calculated_checksum;
END;
$$;

CREATE OR REPLACE FUNCTION parse_dccs_code(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parts text[];
  result jsonb;
BEGIN
  IF NOT (code ~ '^DCCS-\d{2}-(AUD|MUS|VID|IMG|ART|DOC|DES|3DM|AIG|OTH)-[A-Z0-9]{4}-\d{8}-[A-F0-9]{6}-[A-Z0-9]$') THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid code format');
  END IF;

  parts := string_to_array(code, '-');

  result := jsonb_build_object(
    'valid', true,
    'system', parts[1],
    'version', parts[2],
    'asset_type', parts[3],
    'creator_code', parts[4],
    'date_code', parts[5],
    'hash_fragment', parts[6],
    'checksum', parts[7],
    'registration_date', to_date(parts[5], 'YYYYMMDD')
  );

  IF NOT validate_dccs_checksum(code) THEN
    result := result || jsonb_build_object('checksum_valid', false);
  ELSE
    result := result || jsonb_build_object('checksum_valid', true);
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_asset_type_code(project_type text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE project_type
    WHEN 'audio' THEN 'AUD'
    WHEN 'music' THEN 'MUS'
    WHEN 'video' THEN 'VID'
    WHEN 'image' THEN 'IMG'
    WHEN 'art' THEN 'ART'
    WHEN 'document' THEN 'DOC'
    WHEN 'design' THEN 'DES'
    WHEN '3dmodel' THEN '3DM'
    WHEN 'ai-generated' THEN 'AIG'
    WHEN 'podcast' THEN 'AUD'
    WHEN 'sample_pack' THEN 'AUD'
    ELSE 'OTH'
  END;
END;
$$;

COMMENT ON COLUMN dccs_certificates.dccs_version IS 'DCCS protocol version (e.g., 01, 02, 03)';
COMMENT ON COLUMN dccs_certificates.code_checksum IS 'Base-36 checksum for anti-tampering validation';
COMMENT ON COLUMN dccs_certificates.hash_fragment IS '6-character hash fragment from SHA-256 fingerprint';
COMMENT ON COLUMN dccs_certificates.creator_code IS '4-character creator identifier code';

COMMENT ON FUNCTION validate_dccs_checksum(text) IS 'Validates DCCS code checksum to prevent tampering';
COMMENT ON FUNCTION parse_dccs_code(text) IS 'Parses DCCS code into component parts and validates structure';
COMMENT ON FUNCTION get_asset_type_code(text) IS 'Maps project type to 3-character asset type code';
