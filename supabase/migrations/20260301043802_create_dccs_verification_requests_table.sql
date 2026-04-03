/*
  # Create DCCS Verification Requests Table

  ## Summary
  Creates the table for logging all public verification attempts through the DCCS
  verification portal. This provides transparency and tracking for certificate authenticity checks.

  ## New Table: dccs_verification_requests
  
  ### Purpose
  Track all public verification requests made through the verification portal.
  Provides audit trail and analytics for certificate verification activity.

  ### Columns Created
  - `id`: Primary key (UUID)
  - `dccs_code`: DCCS tracking code being verified
  - `certificate_id`: Reference to dccs_certificates table (if found)
  - `requested_by_ip`: IP address of requester (for analytics)
  - `requested_by_user_id`: User ID if requester is authenticated
  - `request_purpose`: Purpose of verification (optional text)
  - `verification_status`: pending, valid, invalid, revoked
  - `verified_at`: Timestamp when verification completed
  - `public_view_count`: Number of times verification result was viewed
  - `last_viewed_at`: Last time verification result was viewed
  - `created_at`: When verification request was made

  ## Security
  - Row Level Security (RLS) policies ensure privacy
  - Certificate creators can see verification requests for their content
  - Public can create verification requests (read-only portal access)
  - IP addresses stored for anti-abuse measures

  ## Important Notes
  - This table powers the public verification portal
  - Provides transparency for certificate authenticity
  - Analytics for certificate usage patterns
  - Anti-fraud tracking through IP logging
*/

-- Create the dccs_verification_requests table
CREATE TABLE IF NOT EXISTS dccs_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dccs_code TEXT NOT NULL,
  certificate_id UUID REFERENCES dccs_certificates(id) ON DELETE SET NULL,

  -- Request metadata
  requested_by_ip TEXT,
  requested_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  request_purpose TEXT,

  -- Verification result
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'valid', 'invalid', 'revoked')),
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Access tracking
  public_view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_dccs_verification_dccs_code 
ON dccs_verification_requests(dccs_code);

CREATE INDEX IF NOT EXISTS idx_dccs_verification_certificate_id 
ON dccs_verification_requests(certificate_id) 
WHERE certificate_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_verification_status 
ON dccs_verification_requests(verification_status);

CREATE INDEX IF NOT EXISTS idx_dccs_verification_ip 
ON dccs_verification_requests(requested_by_ip) 
WHERE requested_by_ip IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_verification_user 
ON dccs_verification_requests(requested_by_user_id) 
WHERE requested_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_verification_created_at 
ON dccs_verification_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE dccs_verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone (including anonymous) can create verification requests
CREATE POLICY "Anyone can create verification requests"
  ON dccs_verification_requests FOR INSERT
  TO public
  WITH CHECK (TRUE);

-- RLS Policy: Certificate creators can view verification requests for their certificates
CREATE POLICY "Creators can view verification requests for their certificates"
  ON dccs_verification_requests FOR SELECT
  TO authenticated
  USING (
    certificate_id IN (
      SELECT id FROM dccs_certificates WHERE creator_id = auth.uid()
    )
  );

-- RLS Policy: Admin users can view all verification requests
CREATE POLICY "Admins can view all verification requests"
  ON dccs_verification_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: System can update verification requests (for status updates)
CREATE POLICY "System can update verification requests"
  ON dccs_verification_requests FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_verification_view_count(verification_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE dccs_verification_requests
  SET 
    public_view_count = public_view_count + 1,
    last_viewed_at = NOW()
  WHERE id = verification_id;
END;
$$;

-- Create function to get verification statistics for a certificate
CREATE OR REPLACE FUNCTION get_certificate_verification_stats(cert_id UUID)
RETURNS TABLE(
  total_verifications BIGINT,
  unique_ips BIGINT,
  last_verification_date TIMESTAMP WITH TIME ZONE,
  verification_rate_last_30_days BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_verifications,
    COUNT(DISTINCT requested_by_ip)::BIGINT as unique_ips,
    MAX(created_at) as last_verification_date,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::BIGINT as verification_rate_last_30_days
  FROM dccs_verification_requests
  WHERE certificate_id = cert_id;
END;
$$;

-- Add table and column comments for documentation
COMMENT ON TABLE dccs_verification_requests IS 'Logs all public verification attempts through the DCCS verification portal';
COMMENT ON COLUMN dccs_verification_requests.dccs_code IS 'DCCS tracking code being verified (format: DCCS-XXXXXXXX)';
COMMENT ON COLUMN dccs_verification_requests.certificate_id IS 'Reference to certificate if verification was successful';
COMMENT ON COLUMN dccs_verification_requests.requested_by_ip IS 'IP address of requester for anti-abuse tracking';
COMMENT ON COLUMN dccs_verification_requests.verification_status IS 'Result of verification: pending, valid, invalid, revoked';
COMMENT ON COLUMN dccs_verification_requests.public_view_count IS 'Number of times verification result was viewed publicly';
