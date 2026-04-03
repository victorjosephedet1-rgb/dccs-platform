/*
  # Fix Remaining Function Search Path Issue

  ## Changes Made
  
  ### Function Security Fix
  Fixed all versions of generate_content_fingerprint function to have immutable search_path:
  - No-parameter version
  - Bytea parameter version (if exists)
  
  ## Security Notes
  - Functions now have SET search_path = public for security
  - Prevents search_path hijacking attacks
*/

-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS generate_content_fingerprint();
DROP FUNCTION IF EXISTS generate_content_fingerprint(bytea);

-- Recreate the no-parameter version with proper security settings
CREATE OR REPLACE FUNCTION generate_content_fingerprint()
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN 'FP-' || encode(gen_random_bytes(16), 'hex');
END;
$$;

-- Create the bytea version if needed for backwards compatibility
CREATE OR REPLACE FUNCTION generate_content_fingerprint(audio_data bytea)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  fingerprint text;
BEGIN
  -- Generate a simple hash-based fingerprint
  fingerprint := encode(digest(audio_data, 'sha256'), 'hex');
  RETURN fingerprint;
END;
$$;