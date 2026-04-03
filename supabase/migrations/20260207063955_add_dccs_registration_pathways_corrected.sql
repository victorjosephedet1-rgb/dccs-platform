/*
  # DCCS Registration Pathways - Dual Upload System
  
  1. New Features
    - Add registration_type to uploads table (register_only vs register_and_sell)
    - Add downloaded_at timestamp for tracking downloads
    - Add dccs_embedded boolean flag for metadata embedding status
    - Add original_filename for download purposes
    - Add marketplace fields (price, description, status)
    
  2. Registration Types
    - 'register_only': Upload for DCCS verification only, download back with DCCS imprinted
    - 'register_and_sell': Upload for DCCS verification + marketplace listing
    
  3. Tracking
    - Both types tracked by Agentic AI for lifetime royalty monitoring
    - Both types get DCCS unique codes
    - Only 'register_and_sell' appears in marketplace
    
  4. Security
    - Users can only download their own registered works
    - RLS policies enforce ownership
    - Audit trail for downloads
*/

-- Add registration pathway columns to uploads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'registration_type'
  ) THEN
    ALTER TABLE uploads ADD COLUMN registration_type text DEFAULT 'register_and_sell'
      CHECK (registration_type IN ('register_only', 'register_and_sell'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'downloaded_at'
  ) THEN
    ALTER TABLE uploads ADD COLUMN downloaded_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'download_count'
  ) THEN
    ALTER TABLE uploads ADD COLUMN download_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'dccs_embedded'
  ) THEN
    ALTER TABLE uploads ADD COLUMN dccs_embedded boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'original_filename'
  ) THEN
    ALTER TABLE uploads ADD COLUMN original_filename text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'can_convert_to_sale'
  ) THEN
    ALTER TABLE uploads ADD COLUMN can_convert_to_sale boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'marketplace_status'
  ) THEN
    ALTER TABLE uploads ADD COLUMN marketplace_status text DEFAULT 'draft'
      CHECK (marketplace_status IN ('draft', 'active', 'inactive', 'sold'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'price'
  ) THEN
    ALTER TABLE uploads ADD COLUMN price decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploads' AND column_name = 'description'
  ) THEN
    ALTER TABLE uploads ADD COLUMN description text;
  END IF;
END $$;

-- Create indexes for registration type queries
CREATE INDEX IF NOT EXISTS idx_uploads_registration_type 
  ON uploads(registration_type);

CREATE INDEX IF NOT EXISTS idx_uploads_marketplace 
  ON uploads(registration_type, marketplace_status) 
  WHERE registration_type = 'register_and_sell';

CREATE INDEX IF NOT EXISTS idx_uploads_downloadable 
  ON uploads(user_id, registration_type, dccs_embedded) 
  WHERE registration_type = 'register_only';

-- Add comments explaining the system
COMMENT ON COLUMN uploads.registration_type IS 'Type of DCCS registration: register_only (download with DCCS) or register_and_sell (marketplace listing)';
COMMENT ON COLUMN uploads.dccs_embedded IS 'Whether DCCS metadata has been embedded in the downloadable file';
COMMENT ON COLUMN uploads.original_filename IS 'Original filename for download purposes';
COMMENT ON COLUMN uploads.can_convert_to_sale IS 'Whether this register_only upload can be converted to register_and_sell';
COMMENT ON COLUMN uploads.marketplace_status IS 'Status for marketplace listings: draft, active, inactive, sold';

-- Create download tracking table
CREATE TABLE IF NOT EXISTS dccs_download_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  file_size bigint,
  download_duration_ms integer,
  
  CONSTRAINT fk_download_upload FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
  CONSTRAINT fk_download_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE dccs_download_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for download history
CREATE POLICY "Users can view own download history"
  ON dccs_download_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert download history"
  ON dccs_download_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for download history
CREATE INDEX IF NOT EXISTS idx_download_history_user 
  ON dccs_download_history(user_id, downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_download_history_upload 
  ON dccs_download_history(upload_id, downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_download_history_upload_id 
  ON dccs_download_history(upload_id);

CREATE INDEX IF NOT EXISTS idx_download_history_user_id 
  ON dccs_download_history(user_id);

-- Function to record download
CREATE OR REPLACE FUNCTION record_dccs_download(
  p_upload_id uuid,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_owner_id uuid;
  v_download_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO v_owner_id
  FROM uploads
  WHERE id = p_upload_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Upload not found';
  END IF;

  IF v_owner_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized to download this file';
  END IF;

  INSERT INTO dccs_download_history (
    upload_id,
    user_id,
    ip_address,
    user_agent,
    file_size
  ) VALUES (
    p_upload_id,
    v_user_id,
    p_ip_address,
    p_user_agent,
    p_file_size
  ) RETURNING id INTO v_download_id;

  UPDATE uploads
  SET 
    downloaded_at = now(),
    download_count = COALESCE(download_count, 0) + 1
  WHERE id = p_upload_id;

  RETURN json_build_object(
    'success', true,
    'download_id', v_download_id,
    'message', 'Download recorded successfully'
  );
END;
$$;

-- Function to convert register_only to register_and_sell
CREATE OR REPLACE FUNCTION convert_to_marketplace_listing(
  p_upload_id uuid,
  p_price decimal(10,2),
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_owner_id uuid;
  v_can_convert boolean;
  v_reg_type text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id, can_convert_to_sale, registration_type
  INTO v_owner_id, v_can_convert, v_reg_type
  FROM uploads
  WHERE id = p_upload_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Upload not found';
  END IF;

  IF v_owner_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized to modify this upload';
  END IF;

  IF v_reg_type != 'register_only' THEN
    RAISE EXCEPTION 'Upload is already set for marketplace';
  END IF;

  IF NOT v_can_convert THEN
    RAISE EXCEPTION 'This upload cannot be converted to marketplace listing';
  END IF;

  UPDATE uploads
  SET 
    registration_type = 'register_and_sell',
    marketplace_status = 'active',
    price = p_price,
    description = COALESCE(p_description, description),
    updated_at = now()
  WHERE id = p_upload_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Upload converted to marketplace listing',
    'upload_id', p_upload_id
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION record_dccs_download TO authenticated;
GRANT EXECUTE ON FUNCTION convert_to_marketplace_listing TO authenticated;
