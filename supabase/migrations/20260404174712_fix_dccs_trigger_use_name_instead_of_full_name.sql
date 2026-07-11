/*
  # Fix DCCS certificate trigger - use correct column name
  
  1. Problem
    - Trigger function references profiles.full_name column
    - Column doesn't exist (should be profiles.name)
    - Causes upload failures with error: column "full_name" does not exist
  
  2. Solution
    - Update trigger function to use profiles.name
    - Use fallback: name -> stage_name -> artist_name -> email
    - Ensures creator name is always captured
*/

-- Drop and recreate the trigger function with correct column names
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
  IF NEW.upload_status = 'completed' AND NEW.dccs_certificate_id IS NULL THEN
    
    SELECT COALESCE(name, stage_name, artist_name, email) INTO v_creator_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    IF v_creator_name IS NULL THEN
      SELECT email INTO v_creator_name
      FROM auth.users
      WHERE id = NEW.user_id;
    END IF;
    
    v_cert_number := 'DCCS-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text), 1, 5));
    
    v_clearance_code := 'V3B-' || 
      upper(substring(md5(random()::text), 1, 4)) || '-' ||
      upper(substring(md5(random()::text), 1, 4)) || '-' ||
      upper(substring(md5(random()::text), 1, 4));
    
    v_fingerprint := encode(sha256((NEW.file_name || NEW.file_size || NEW.created_at)::bytea), 'hex');
    
    v_metadata_hash := encode(sha256((NEW.file_name || NEW.file_type || NEW.user_id)::bytea), 'hex');
    
    v_audio_signature := jsonb_build_object(
      'file_type', NEW.file_type,
      'file_size', NEW.file_size,
      'duration', NEW.duration,
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
    
    NEW.dccs_certificate_id := v_certificate_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Verify the function was updated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'generate_dccs_certificate_on_upload'
  ) THEN
    RAISE EXCEPTION 'Trigger function not found after update!';
  END IF;
  
  RAISE NOTICE 'Trigger function updated successfully';
END $$;
