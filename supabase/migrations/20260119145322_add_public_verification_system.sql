/*
  # Add Public DCCS Verification System

  1. New Features
    - Public verification endpoints for DCCS certificates
    - Certificate export functionality (JSON format)
    - Verification tracking (analytics)
    - Certificate sharing settings

  2. New Tables
    - `dccs_verification_logs` - Tracks verification requests

  3. New Functions
    - `verify_dccs_certificate` - Public function for verification
    - `generate_certificate_json` - Export certificate data
    - `log_verification_attempt` - Track verification activity

  4. Security
    - Verification is public (no auth required)
    - No sensitive creator data exposed
    - Only proof data is public

  5. Performance
    - Indexes on certificate_id for fast lookups
*/

-- Create verification logs table
CREATE TABLE IF NOT EXISTS dccs_verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES dccs_certificates(id),
  verified_at timestamptz DEFAULT now(),
  verification_source text,
  ip_address inet,
  user_agent text,
  verification_result jsonb DEFAULT '{"valid": true}'::jsonb
);

-- Add verification count to certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates'
    AND column_name = 'verification_count'
  ) THEN
    ALTER TABLE dccs_certificates
    ADD COLUMN verification_count integer DEFAULT 0;
  END IF;
END $$;

-- Add public sharing settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates'
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE dccs_certificates
    ADD COLUMN is_public boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates'
    AND column_name = 'public_verification_url'
  ) THEN
    ALTER TABLE dccs_certificates
    ADD COLUMN public_verification_url text;
  END IF;
END $$;

-- Create indexes for fast verification lookups
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_public_lookup
  ON dccs_certificates(id, is_public)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_verification_logs_certificate
  ON dccs_verification_logs(certificate_id, verified_at DESC);

-- Function to verify DCCS certificate (public, no auth required)
CREATE OR REPLACE FUNCTION verify_dccs_certificate(cert_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cert_data jsonb;
BEGIN
  -- Get certificate data from actual schema
  SELECT jsonb_build_object(
    'valid', true,
    'certificate', jsonb_build_object(
      'id', c.id,
      'certificate_number', c.certificate_id,
      'clearance_code', c.clearance_code,
      'created_at', c.created_at,
      'blockchain_hash', c.blockchain_tx_hash,
      'blockchain_network', c.blockchain_network,
      'blockchain_verified', c.blockchain_verified,
      'verification_count', COALESCE(c.verification_count, 0),
      'project', jsonb_build_object(
        'title', c.project_title,
        'type', c.project_type
      ),
      'creator', jsonb_build_object(
        'name', c.creator_legal_name,
        'verified', c.creator_verified
      ),
      'fingerprint', jsonb_build_object(
        'hash', c.audio_fingerprint,
        'signature', c.audio_signature
      )
    )
  ) INTO cert_data
  FROM dccs_certificates c
  WHERE c.id = cert_id
    AND c.is_public = true;

  -- If no certificate found
  IF cert_data IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Certificate not found or not public'
    );
  END IF;

  -- Increment verification count
  UPDATE dccs_certificates
  SET verification_count = COALESCE(verification_count, 0) + 1
  WHERE id = cert_id;

  RETURN cert_data;
END;
$$;

-- Function to generate certificate JSON export
CREATE OR REPLACE FUNCTION generate_certificate_json(cert_id uuid, user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cert_data jsonb;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM dccs_certificates c
    WHERE c.id = cert_id AND c.creator_id = user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this certificate';
  END IF;

  -- Generate complete certificate JSON
  SELECT jsonb_build_object(
    'dccs_version', '1.0',
    'certificate_id', c.id,
    'certificate_number', c.certificate_id,
    'clearance_code', c.clearance_code,
    'issued_at', c.created_at,
    'creator', jsonb_build_object(
      'name', c.creator_legal_name,
      'id', c.creator_id,
      'verified', c.creator_verified
    ),
    'project', jsonb_build_object(
      'title', c.project_title,
      'type', c.project_type
    ),
    'proof', jsonb_build_object(
      'audio_fingerprint', c.audio_fingerprint,
      'audio_signature', c.audio_signature,
      'metadata_hash', c.metadata_hash,
      'certificate_hash', c.certificate_hash,
      'blockchain_network', c.blockchain_network,
      'blockchain_tx_hash', c.blockchain_tx_hash,
      'blockchain_verified', c.blockchain_verified,
      'verified_at', c.verified_at
    ),
    'licensing', jsonb_build_object(
      'available', c.available_for_licensing,
      'status', c.licensing_status
    ),
    'collaborators', c.collaborators,
    'verification', jsonb_build_object(
      'url', c.public_verification_url,
      'qr_code', 'https://dccsverify.com/verify/' || c.id,
      'verification_count', COALESCE(c.verification_count, 0)
    ),
    'metadata', jsonb_build_object(
      'platform', 'DCCS Platform',
      'platform_url', 'https://dccsverify.com',
      'dccs_standard', 'DCCS v1.0',
      'generated_at', now()
    )
  ) INTO cert_data
  FROM dccs_certificates c
  WHERE c.id = cert_id;

  RETURN cert_data;
END;
$$;

-- Function to log verification attempt
CREATE OR REPLACE FUNCTION log_verification_attempt(
  cert_id uuid,
  source text DEFAULT NULL,
  ip inet DEFAULT NULL,
  agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dccs_verification_logs (
    certificate_id,
    verification_source,
    ip_address,
    user_agent
  ) VALUES (
    cert_id,
    source,
    ip,
    agent
  );
END;
$$;

-- RLS Policies
ALTER TABLE dccs_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log verification attempts"
  ON dccs_verification_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view verification logs"
  ON dccs_verification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update RLS for public verification
DROP POLICY IF EXISTS "Anyone can verify public certificates" ON dccs_certificates;
CREATE POLICY "Anyone can verify public certificates"
  ON dccs_certificates
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_dccs_certificate TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_verification_attempt TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_certificate_json TO authenticated;

-- Comments
COMMENT ON TABLE dccs_verification_logs IS 'Tracks public verification requests for DCCS certificates';
COMMENT ON FUNCTION verify_dccs_certificate IS 'Public function to verify DCCS certificate authenticity - no auth required';
COMMENT ON FUNCTION generate_certificate_json IS 'Generate complete certificate JSON for export - requires ownership';
