/*
  # Fix DCCS Trigger — Match All Check Constraints

  ## Problems Found
  After fixing the sha256 issue, three more constraints block every INSERT:

  1. `valid_clearance_code_format`: requires format
     `DCCS-{2digits}-{TYPE}-{4alnum}-{8digits}-{6hex}-{1alnum}`
     but trigger was generating `DCCS-AUD-2026-XXXXXX`.

  2. `dccs_certificates_content_type_check`: only allows
     ('audio','video','podcast') — trigger was passing 'image','document',etc.

  3. `dccs_immutable_creation`: requires creation_timestamp <= created_at,
     so creation_timestamp must be set explicitly to now() (which equals
     created_at at insert time).

  ## Fix
  Rewrite `set_dccs_certificate_data` to generate a clearance code that
  exactly matches the regex, map content_type to the allowed enum, and
  set creation_timestamp correctly.

  Clearance code regex: ^DCCS-\d{2}-(AUD|MUS|VID|IMG|ART|DOC|DES|3DM|AIG|OTH)-[A-Z0-9]{4}-\d{8}-[A-F0-9]{6}-[A-Z0-9]$
  Example:            DCCS-01-AUD-A1B2-20260421-4F8A2C-X
*/

CREATE OR REPLACE FUNCTION set_dccs_certificate_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_code text;
  v_type_code    text;
  v_seq          text;
  v_date_str     text;
  v_hex_seg      text;
  v_check_char   text;
  v_now          timestamptz;
BEGIN
  v_now := now();

  -- Generate certificate_id if not provided
  IF NEW.certificate_id IS NULL OR NEW.certificate_id = '' THEN
    NEW.certificate_id := 'DCCS-' || to_char(v_now, 'YYYYMMDD') || '-' ||
                          upper(substring(md5(random()::text), 1, 8));
  END IF;

  -- Map project_type to allowed type codes in the clearance code
  v_type_code := CASE COALESCE(NEW.project_type, 'other')
    WHEN 'audio'        THEN 'AUD'
    WHEN 'podcast'      THEN 'AUD'
    WHEN 'sample_pack'  THEN 'AUD'
    WHEN 'video'        THEN 'VID'
    WHEN 'image'        THEN 'IMG'
    WHEN 'photo'        THEN 'IMG'
    WHEN 'art'          THEN 'ART'
    WHEN 'artwork'      THEN 'ART'
    WHEN 'painting'     THEN 'ART'
    WHEN 'illustration' THEN 'ART'
    WHEN 'nft'          THEN 'ART'
    WHEN 'document'     THEN 'DOC'
    WHEN '3dmodel'      THEN '3DM'
    WHEN 'code'         THEN 'DOC'
    ELSE 'OTH'
  END;

  -- Map content_type to allowed enum: ('audio','video','podcast')
  -- Everything that is not video or podcast is treated as audio
  IF NEW.content_type NOT IN ('audio', 'video', 'podcast') THEN
    NEW.content_type := CASE
      WHEN NEW.project_type = 'video'   THEN 'video'
      WHEN NEW.project_type = 'podcast' THEN 'podcast'
      ELSE 'audio'
    END;
  END IF;

  -- Generate clearance code matching regex:
  -- ^DCCS-\d{2}-(TYPE)-[A-Z0-9]{4}-\d{8}-[A-F0-9]{6}-[A-Z0-9]$
  -- Example: DCCS-01-AUD-A1B2-20260421-4F8A2C-X
  IF NEW.clearance_code IS NULL OR NEW.clearance_code = '' OR
     NEW.clearance_code !~ '^DCCS-\d{2}-(AUD|MUS|VID|IMG|ART|DOC|DES|3DM|AIG|OTH)-[A-Z0-9]{4}-\d{8}-[A-F0-9]{6}-[A-Z0-9]$'
  THEN
    -- Version segment: 2-digit sequential (01-99)
    v_version_code := '01';

    -- 4-char alphanumeric segment (uppercase)
    v_seq := upper(substring(
      translate(md5(random()::text || NEW.creator_id::text), 'ghijklmnopqrstuvwxyz', 'GHIJKLMNOPQRSTUV'),
      1, 4
    ));

    -- 8-digit date segment
    v_date_str := to_char(v_now, 'YYYYMMDD');

    -- 6-char hex segment (uppercase A-F 0-9)
    v_hex_seg := upper(substring(
      encode(sha256((random()::text || NEW.creator_id::text || v_now::text)::bytea), 'hex'),
      1, 6
    ));

    -- 1-char check character (A-Z0-9)
    v_check_char := upper(substring(
      translate(md5(v_hex_seg || v_date_str)::text, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      1, 1
    ));

    NEW.clearance_code := 'DCCS-' || v_version_code || '-' || v_type_code || '-' ||
                          v_seq || '-' || v_date_str || '-' || v_hex_seg || '-' || v_check_char;
  END IF;

  -- Set creation_timestamp to now() so it satisfies creation_timestamp <= created_at
  IF NEW.creation_timestamp IS NULL THEN
    NEW.creation_timestamp := v_now;
  END IF;

  -- Generate certificate_hash using sha256 (no pgcrypto dependency)
  NEW.certificate_hash := encode(
    sha256((
      COALESCE(NEW.certificate_id, '') ||
      COALESCE(NEW.creator_id::text, '') ||
      COALESCE(NEW.project_title, '') ||
      COALESCE(NEW.creation_timestamp::text, v_now::text) ||
      COALESCE(NEW.audio_fingerprint, '') ||
      COALESCE(NEW.previous_certificate_hash, '')
    )::bytea),
    'hex'
  );

  NEW.updated_at := v_now;

  RETURN NEW;
END;
$$;
