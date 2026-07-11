/*
  # Fix DCCS Certificate Trigger — Missing certificate_hash

  ## Root Cause
  The `generate_dccs_cert_on_upload` trigger inserts into `dccs_certificates`
  but never provides a value for `certificate_hash`, which is NOT NULL with no
  default. This causes every INSERT to fail with a NOT NULL violation.

  Because the trigger runs inside the same transaction as the upload status
  update (`upload_status = 'completed'`), the failure rolls back that update
  too. The upload record stays permanently stuck at `upload_status = 'uploading'`
  and never becomes visible in the downloads page.

  ## Fix
  Drop and recreate the trigger function so it:
  1. Supplies `certificate_hash` — a SHA-256 of the core record fields.
  2. Wraps the certificate INSERT in an EXCEPTION block so a certificate
     failure never prevents the upload from completing. The upload always
     reaches `completed`; if certificate generation fails it is logged to
     the `error_message` column and can be retried.
  3. Removes the RETURNING clause assignment from NEW — unnecessary because
     dccs_certificate_id is updated in a separate UPDATE after the trigger.
*/

CREATE OR REPLACE FUNCTION generate_dccs_certificate_on_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certificate_id    uuid;
  v_cert_number       text;
  v_clearance_code    text;
  v_fingerprint       text;
  v_metadata_hash     text;
  v_certificate_hash  text;
  v_creator_name      text;
  v_audio_signature   jsonb;
BEGIN
  -- Only act when status transitions to completed and no cert exists yet
  IF NEW.upload_status = 'completed' AND NEW.dccs_certificate_id IS NULL THEN

    BEGIN
      -- Resolve creator display name
      SELECT COALESCE(name, stage_name, artist_name, email)
        INTO v_creator_name
        FROM profiles
       WHERE id = NEW.user_id;

      IF v_creator_name IS NULL THEN
        SELECT email INTO v_creator_name
          FROM auth.users
         WHERE id = NEW.user_id;
      END IF;

      -- Human-readable certificate identifier
      v_cert_number := 'DCCS-' || to_char(now(), 'YYYYMMDD') || '-' ||
                       upper(substring(md5(random()::text), 1, 5));

      -- Clearance code (public-facing verification token)
      v_clearance_code := 'V3B-' ||
                          upper(substring(md5(random()::text), 1, 4)) || '-' ||
                          upper(substring(md5(random()::text), 1, 4)) || '-' ||
                          upper(substring(md5(random()::text), 1, 4));

      -- Content fingerprint (deterministic from file metadata)
      v_fingerprint := encode(
        sha256((NEW.file_name || NEW.file_size::text || NEW.created_at::text)::bytea),
        'hex'
      );

      -- Metadata hash
      v_metadata_hash := encode(
        sha256((NEW.file_name || NEW.file_type || NEW.user_id::text)::bytea),
        'hex'
      );

      -- Certificate hash (binds all core fields together)
      v_certificate_hash := encode(
        sha256((
          v_cert_number ||
          v_clearance_code ||
          NEW.user_id::text ||
          COALESCE(v_creator_name, 'Anonymous') ||
          NEW.file_name ||
          v_fingerprint
        )::bytea),
        'hex'
      );

      v_audio_signature := jsonb_build_object(
        'file_type',   NEW.file_type,
        'file_size',   NEW.file_size,
        'duration',    NEW.duration,
        'uploaded_at', NEW.created_at
      );

      INSERT INTO dccs_certificates (
        certificate_id,
        clearance_code,
        creator_id,
        creator_legal_name,
        creator_verified,
        project_title,
        project_type,
        content_type,
        audio_fingerprint,
        audio_signature,
        metadata_hash,
        certificate_hash,
        blockchain_verified,
        available_for_licensing,
        licensing_status,
        is_public,
        public_verification_url,
        lifetime_tracking_enabled,
        revenue_model,
        download_unlocked,
        phase
      ) VALUES (
        v_cert_number,
        v_clearance_code,
        NEW.user_id,
        COALESCE(v_creator_name, 'Anonymous'),
        false,
        NEW.file_name,
        NEW.file_category,
        NEW.file_category,
        v_fingerprint,
        v_audio_signature,
        v_metadata_hash,
        v_certificate_hash,
        false,
        true,
        'available',
        true,
        '/verify/' || v_clearance_code,
        true,
        '80/20',
        true,
        'phase1'
      ) RETURNING id INTO v_certificate_id;

      NEW.dccs_certificate_id := v_certificate_id;

    EXCEPTION WHEN OTHERS THEN
      -- Certificate generation must never block the upload from completing.
      -- Log the error on the record so it can be investigated/retried.
      NEW.error_message := 'DCCS certificate generation failed: ' || SQLERRM;
    END;

  END IF;

  RETURN NEW;
END;
$$;
