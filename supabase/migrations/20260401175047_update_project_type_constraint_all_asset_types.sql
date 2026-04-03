/*
  # Update Project Type Constraint - All Asset Types

  1. Overview
    - Expands project_type constraint to include all creative asset types
    - Adds: art, artwork, painting, illustration, nft, photo, image, 3dmodel, code

  2. Changes
    - Drops old constraint
    - Adds new constraint with full type list
    - Maintains backward compatibility
*/

-- ============================================================================
-- Update Project Type Constraint
-- ============================================================================

-- Drop old constraint if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'dccs_certificates'
    AND constraint_name LIKE '%project_type%'
  ) THEN
    ALTER TABLE dccs_certificates
    DROP CONSTRAINT IF EXISTS dccs_certificates_project_type_check;
  END IF;
END $$;

-- Add new constraint with all creative asset types
ALTER TABLE dccs_certificates
ADD CONSTRAINT dccs_certificates_project_type_check
CHECK (project_type IN (
  'audio',
  'video',
  'podcast',
  'sample_pack',
  'image',
  'photo',
  'art',
  'artwork',
  'painting',
  'illustration',
  'nft',
  'document',
  '3dmodel',
  'code',
  'other'
));

-- Update default to remain 'audio' for backward compatibility
ALTER TABLE dccs_certificates
ALTER COLUMN project_type SET DEFAULT 'audio';

-- Add comment
COMMENT ON COLUMN dccs_certificates.project_type IS
'Type of creative asset. Supported types: audio, video, podcast, sample_pack, image, photo, art, artwork, painting, illustration, nft, document, 3dmodel, code, other.
Maps to DCCS type codes: AUD, VID, IMG, ART, NFT, DOC, MOD, COD, OTH';
