/*
  # Fix DCCS Certificate Hash Function — Missing pgcrypto Search Path

  ## Root Cause
  `generate_dccs_certificate_hash()` calls `digest()` from pgcrypto, but the
  function's search_path does not include the `extensions` schema where pgcrypto
  lives. This causes every INSERT into `dccs_certificates` to fail with:
    "function digest(text, unknown) does not exist"

  Because `set_dccs_certificate_data` (a BEFORE INSERT trigger on
  `dccs_certificates`) calls this broken function, EVERY insert into the table
  fails. This means the upload completion trigger also fails, and every upload
  stays permanently stuck at `upload_status = 'uploading'`.

  ## Fix
  Replace all overloaded variants of `generate_dccs_certificate_hash` with a
  single correct version that uses the built-in `sha256()` (available natively
  in PostgreSQL 11+ without pgcrypto) instead of `digest()`. This eliminates
  the extension dependency entirely.

  Also replace `set_dccs_certificate_data` to use `sha256()` directly and
  remove the function call indirection.
*/

-- Fix the certificate hash helper — replace digest() with sha256()
-- Drop all overloaded versions first
DROP FUNCTION IF EXISTS generate_dccs_certificate_hash(text, uuid, text, timestamp with time zone, text, text);
DROP FUNCTION IF EXISTS generate_dccs_certificate_hash(text, uuid, text, text);
DROP FUNCTION IF EXISTS generate_dccs_certificate_hash(uuid, uuid, text, text);

CREATE OR REPLACE FUNCTION generate_dccs_certificate_hash(
  p_certificate_id       text,
  p_creator_id           uuid,
  p_project_title        text,
  p_creation_timestamp   timestamptz,
  p_audio_fingerprint    text,
  p_previous_hash        text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(
    sha256((
      COALESCE(p_certificate_id, '') ||
      COALESCE(p_creator_id::text, '') ||
      COALESCE(p_project_title, '') ||
      COALESCE(p_creation_timestamp::text, '') ||
      COALESCE(p_audio_fingerprint, '') ||
      COALESCE(p_previous_hash, '')
    )::bytea),
    'hex'
  );
END;
$$;

-- Fix the BEFORE INSERT trigger function on dccs_certificates
CREATE OR REPLACE FUNCTION set_dccs_certificate_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type_code text;
  v_year      text;
  v_unique_id text;
BEGIN
  -- Generate certificate_id if not provided
  IF NEW.certificate_id IS NULL OR NEW.certificate_id = '' THEN
    NEW.certificate_id := 'DCCS-' || to_char(now(), 'YYYYMMDD') || '-' ||
                          upper(substring(md5(random()::text), 1, 5));
  END IF;

  -- Generate standardized clearance code if not provided
  IF NEW.clearance_code IS NULL OR NEW.clearance_code = '' THEN
    v_type_code := CASE NEW.project_type
      WHEN 'audio'       THEN 'AUD'
      WHEN 'video'       THEN 'VID'
      WHEN 'podcast'     THEN 'AUD'
      WHEN 'sample_pack' THEN 'AUD'
      WHEN 'image'       THEN 'IMG'
      WHEN 'photo'       THEN 'IMG'
      WHEN 'art'         THEN 'ART'
      WHEN 'artwork'     THEN 'ART'
      WHEN 'painting'    THEN 'ART'
      WHEN 'illustration' THEN 'ART'
      WHEN 'nft'         THEN 'NFT'
      WHEN 'document'    THEN 'DOC'
      WHEN '3dmodel'     THEN 'MOD'
      WHEN 'code'        THEN 'COD'
      ELSE 'OTH'
    END;

    v_year := to_char(now(), 'YYYY');

    v_unique_id := upper(
      translate(
        substr(md5(random()::text || NEW.creator_id::text || now()::text), 1, 6),
        'iol',
        'ABC'
      )
    );

    NEW.clearance_code := 'DCCS-' || v_type_code || '-' || v_year || '-' || v_unique_id;
  END IF;

  -- Generate certificate_hash using sha256 (no pgcrypto dependency)
  NEW.certificate_hash := encode(
    sha256((
      COALESCE(NEW.certificate_id, '') ||
      COALESCE(NEW.creator_id::text, '') ||
      COALESCE(NEW.project_title, '') ||
      COALESCE(NEW.creation_timestamp::text, now()::text) ||
      COALESCE(NEW.audio_fingerprint, '') ||
      COALESCE(NEW.previous_certificate_hash, '')
    )::bytea),
    'hex'
  );

  NEW.updated_at := now();

  RETURN NEW;
END;
$$;
