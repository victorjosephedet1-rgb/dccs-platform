/*
  # Expand DCCS Asset Types - Art and NFT Support

  1. Overview
    - Extends DCCS to support all creative asset types
    - Adds ART (artwork) and NFT (blockchain assets) types
    - Maintains backward compatibility

  2. New Asset Types
    - ART: Digital art, paintings, illustrations
    - NFT: Blockchain assets, minted tokens
    - Enhanced support for all creative works

  3. NFT Metadata
    - Optional blockchain information
    - Wallet addresses
    - Token IDs and contract addresses
    - DCCS remains primary ownership layer

  4. Changes
    - Updates type mapping in trigger function
    - Adds NFT metadata columns
    - Maintains existing functionality
*/

-- ============================================================================
-- Add NFT Metadata Columns to DCCS Certificates
-- ============================================================================

-- Add NFT-specific metadata columns (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'nft_blockchain'
  ) THEN
    ALTER TABLE dccs_certificates
    ADD COLUMN nft_blockchain text,
    ADD COLUMN nft_wallet_address text,
    ADD COLUMN nft_token_id text,
    ADD COLUMN nft_contract_address text;
  END IF;
END $$;

-- Add comments for NFT fields
COMMENT ON COLUMN dccs_certificates.nft_blockchain IS 'Blockchain network for NFT assets (e.g., Ethereum, Polygon, Solana)';
COMMENT ON COLUMN dccs_certificates.nft_wallet_address IS 'Creator wallet address for NFT assets';
COMMENT ON COLUMN dccs_certificates.nft_token_id IS 'Token ID if NFT is already minted';
COMMENT ON COLUMN dccs_certificates.nft_contract_address IS 'Smart contract address for minted NFTs';

-- ============================================================================
-- Update Certificate Trigger Function - Expanded Type Support
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
    -- Now includes ART and NFT support
    v_type_code := CASE NEW.project_type
      WHEN 'audio' THEN 'AUD'
      WHEN 'video' THEN 'VID'
      WHEN 'podcast' THEN 'AUD'
      WHEN 'sample_pack' THEN 'AUD'
      WHEN 'image' THEN 'IMG'
      WHEN 'photo' THEN 'IMG'
      WHEN 'art' THEN 'ART'
      WHEN 'artwork' THEN 'ART'
      WHEN 'painting' THEN 'ART'
      WHEN 'illustration' THEN 'ART'
      WHEN 'nft' THEN 'NFT'
      WHEN 'document' THEN 'DOC'
      WHEN '3dmodel' THEN 'MOD'
      WHEN 'code' THEN 'COD'
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
-- Update Helper Function - Expanded Type Mapping
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dccs_type_code(p_project_type text)
RETURNS text AS $$
BEGIN
  RETURN CASE p_project_type
    WHEN 'audio' THEN 'AUD'
    WHEN 'video' THEN 'VID'
    WHEN 'podcast' THEN 'AUD'
    WHEN 'sample_pack' THEN 'AUD'
    WHEN 'image' THEN 'IMG'
    WHEN 'photo' THEN 'IMG'
    WHEN 'art' THEN 'ART'
    WHEN 'artwork' THEN 'ART'
    WHEN 'painting' THEN 'ART'
    WHEN 'illustration' THEN 'ART'
    WHEN 'nft' THEN 'NFT'
    WHEN 'document' THEN 'DOC'
    WHEN '3dmodel' THEN 'MOD'
    WHEN 'code' THEN 'COD'
    ELSE 'OTH'
  END;
END;
$$ LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- Add Indexes for NFT Fields
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_nft_blockchain
ON dccs_certificates(nft_blockchain)
WHERE nft_blockchain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_nft_wallet
ON dccs_certificates(nft_wallet_address)
WHERE nft_wallet_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_nft_token_id
ON dccs_certificates(nft_token_id)
WHERE nft_token_id IS NOT NULL;

-- ============================================================================
-- Update Documentation
-- ============================================================================

COMMENT ON FUNCTION set_dccs_certificate_data() IS
'Trigger function that auto-generates DCCS certificate data including standardized clearance codes.
Format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
Supported types: AUD, VID, IMG, ART, NFT, DOC, MOD, COD, OTH
Examples: DCCS-ART-2026-9F3K2L, DCCS-NFT-2026-X82LMN';

COMMENT ON FUNCTION get_dccs_type_code(text) IS
'Maps project types to standardized DCCS type codes.
Includes support for artwork (ART) and NFT assets (NFT).
DCCS remains the primary ownership layer regardless of blockchain status.';
