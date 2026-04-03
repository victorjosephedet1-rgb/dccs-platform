/*
  # Fix DCCS Certificate Generation on Upload

  ## Overview
  Fixes the trigger function to correctly generate DCCS certificates with proper column mapping
  when users upload audio, video, or podcast files.

  ## Changes
  1. Updates generate_dccs_certificate_on_upload() function to use correct schema
  2. Generates proper certificate_id and clearance_code
  3. Creates audio_fingerprint and metadata_hash
  4. Sets up proper tracking for all content types

  ## Notes
  - Each upload gets a unique DCCS tracking code (clearance_code)
  - Certificate ID format: DCCS-YYYYMMDD-XXXXX
  - Clearance Code format: V3B-XXXX-XXXX-XXXX
  - Supports audio, video, and podcast content types
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS generate_dccs_cert_on_upload ON uploads;

-- Recreate the function with correct schema
CREATE OR REPLACE FUNCTION generate_dccs_certificate_on_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_certificate_id uuid;
  v_cert_number text;
  v_clearance_code text;
  v_fingerprint text;
  v_metadata_hash text;
  v_creator_name text;
  v_audio_signature jsonb;
BEGIN
  -- Only generate certificate when upload is completed and no certificate exists
  IF NEW.upload_status = 'completed' AND NEW.dccs_certificate_id IS NULL THEN
    
    -- Get creator name from profiles
    SELECT COALESCE(full_name, email) INTO v_creator_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- If no profile, use email from auth.users
    IF v_creator_name IS NULL THEN
      SELECT email INTO v_creator_name
      FROM auth.users
      WHERE id = NEW.user_id;
    END IF;
    
    -- Generate unique certificate number: DCCS-YYYYMMDD-XXXXX
    v_cert_number := 'DCCS-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text), 1, 5));
    
    -- Generate clearance code: V3B-XXXX-XXXX-XXXX (easy to read and type)
    v_clearance_code := 'V3B-' || 
                        upper(substring(md5(random()::text), 1, 4)) || '-' ||
                        upper(substring(md5(random()::text), 1, 4)) || '-' ||
                        upper(substring(md5(random()::text), 1, 4));
    
    -- Generate audio fingerprint (cryptographic hash of file metadata)
    v_fingerprint := encode(sha256((NEW.file_name || NEW.file_size || NEW.created_at)::bytea), 'hex');
    
    -- Generate metadata hash
    v_metadata_hash := encode(sha256((NEW.file_name || NEW.file_type || NEW.user_id)::bytea), 'hex');
    
    -- Create audio signature JSON
    v_audio_signature := jsonb_build_object(
      'file_type', NEW.file_type,
      'file_size', NEW.file_size,
      'duration', NEW.duration,
      'uploaded_at', NEW.created_at
    );
    
    -- Create DCCS certificate with correct schema
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
      blockchain_verified,
      available_for_licensing,
      licensing_status,
      is_public,
      public_verification_url,
      lifetime_tracking_enabled,
      revenue_model
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
      false,
      true,
      'available',
      true,
      '/verify/' || v_clearance_code,
      true,
      '80/20'
    ) RETURNING id INTO v_certificate_id;
    
    -- Update upload with certificate ID
    NEW.dccs_certificate_id := v_certificate_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER generate_dccs_cert_on_upload
  BEFORE UPDATE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION generate_dccs_certificate_on_upload();