/*
  # DCCS Global Platform Monitoring & Tracking System

  1. New Tables
    - `dccs_platform_detections`
      - Tracks when DCCS content is detected on external platforms
      - Records platform, URL, views, revenue estimates

    - `dccs_copyright_claims`
      - Logs all copyright claims filed by the AI system
      - Tracks claim status, response, and resolution

    - `dccs_royalty_collections`
      - Records all royalty payments collected from platforms
      - Links to smart contracts and payment splits

    - `dccs_platform_licenses`
      - Manages licensing agreements with platforms (YouTube, TikTok, etc.)
      - Tracks licensing terms, fees, and status

    - `dccs_ai_monitoring_log`
      - Audit trail of all AI monitoring actions
      - Performance metrics and detection accuracy

  2. Security
    - Enable RLS on all tables
    - Creators can view their own content tracking
    - Admin can view all tracking data
    - AI system uses service role for writes

  3. Indexes
    - Optimized for platform queries
    - Fast lookups by DCCS code
    - Time-series queries for analytics
*/

-- Platform Detection Tracking
CREATE TABLE IF NOT EXISTS dccs_platform_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dccs_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  detected_url text NOT NULL,
  detection_method text DEFAULT 'fingerprint',
  confidence_score numeric(3,2) DEFAULT 0.99,
  views_count bigint DEFAULT 0,
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  estimated_revenue numeric(10,2) DEFAULT 0,
  content_type text,
  detected_at timestamptz DEFAULT now(),
  last_checked_at timestamptz DEFAULT now(),
  status text DEFAULT 'detected' CHECK (status IN ('detected', 'claimed', 'licensed', 'removed', 'monitoring')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copyright Claims Management
CREATE TABLE IF NOT EXISTS dccs_copyright_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid REFERENCES dccs_platform_detections(id) ON DELETE CASCADE,
  dccs_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  claim_type text DEFAULT 'copyright' CHECK (claim_type IN ('copyright', 'dmca', 'licensing')),
  claim_reference text,
  claim_url text,
  filed_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'disputed', 'resolved', 'rejected')),
  platform_response text,
  response_date timestamptz,
  resolution text,
  revenue_claimed numeric(10,2) DEFAULT 0,
  revenue_collected numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Royalty Collections from Platforms
CREATE TABLE IF NOT EXISTS dccs_royalty_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid REFERENCES dccs_copyright_claims(id) ON DELETE SET NULL,
  dccs_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE,
  platform_name text NOT NULL,
  collection_amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'GBP',
  creator_share numeric(10,2) NOT NULL,
  platform_share numeric(10,2) NOT NULL,
  collection_date timestamptz DEFAULT now(),
  payment_method text DEFAULT 'crypto' CHECK (payment_method IN ('crypto', 'fiat', 'platform_credit')),
  transaction_hash text,
  smart_contract_address text,
  payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  creator_payout_tx text,
  platform_payout_tx text,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform Licensing Agreements
CREATE TABLE IF NOT EXISTS dccs_platform_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL UNIQUE,
  license_type text DEFAULT 'revenue_share' CHECK (license_type IN ('revenue_share', 'flat_fee', 'per_use', 'unlimited')),
  license_status text DEFAULT 'negotiating' CHECK (license_status IN ('negotiating', 'active', 'suspended', 'terminated')),
  start_date timestamptz,
  end_date timestamptz,
  revenue_share_percentage numeric(5,2),
  flat_fee_amount numeric(10,2),
  per_use_fee numeric(10,2),
  payment_frequency text DEFAULT 'monthly' CHECK (payment_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  auto_claim_enabled boolean DEFAULT true,
  api_key text,
  webhook_url text,
  contact_email text,
  contract_document_url text,
  notes text,
  total_revenue_generated numeric(12,2) DEFAULT 0,
  total_content_licensed bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Monitoring Activity Log
CREATE TABLE IF NOT EXISTS dccs_ai_monitoring_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL CHECK (action_type IN ('scan', 'detection', 'claim', 'collection', 'error', 'alert')),
  platform_name text,
  dccs_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE SET NULL,
  detection_id uuid REFERENCES dccs_platform_detections(id) ON DELETE SET NULL,
  action_details jsonb DEFAULT '{}'::jsonb,
  success boolean DEFAULT true,
  error_message text,
  processing_time_ms integer,
  confidence_score numeric(3,2),
  performed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_platform_detections_certificate ON dccs_platform_detections(dccs_certificate_id);
CREATE INDEX IF NOT EXISTS idx_platform_detections_platform ON dccs_platform_detections(platform_name, status);
CREATE INDEX IF NOT EXISTS idx_platform_detections_detected_at ON dccs_platform_detections(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_detections_url ON dccs_platform_detections(detected_url);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_detection ON dccs_copyright_claims(detection_id);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_certificate ON dccs_copyright_claims(dccs_certificate_id);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_platform_status ON dccs_copyright_claims(platform_name, status);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_filed_at ON dccs_copyright_claims(filed_at DESC);

CREATE INDEX IF NOT EXISTS idx_royalty_collections_claim ON dccs_royalty_collections(claim_id);
CREATE INDEX IF NOT EXISTS idx_royalty_collections_certificate ON dccs_royalty_collections(dccs_certificate_id);
CREATE INDEX IF NOT EXISTS idx_royalty_collections_platform ON dccs_royalty_collections(platform_name);
CREATE INDEX IF NOT EXISTS idx_royalty_collections_date ON dccs_royalty_collections(collection_date DESC);
CREATE INDEX IF NOT EXISTS idx_royalty_collections_status ON dccs_royalty_collections(payout_status);

CREATE INDEX IF NOT EXISTS idx_platform_licenses_name ON dccs_platform_licenses(platform_name);
CREATE INDEX IF NOT EXISTS idx_platform_licenses_status ON dccs_platform_licenses(license_status);

CREATE INDEX IF NOT EXISTS idx_ai_monitoring_log_performed_at ON dccs_ai_monitoring_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_monitoring_log_action_type ON dccs_ai_monitoring_log(action_type);
CREATE INDEX IF NOT EXISTS idx_ai_monitoring_log_certificate ON dccs_ai_monitoring_log(dccs_certificate_id);

-- Enable Row Level Security
ALTER TABLE dccs_platform_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_copyright_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_royalty_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_platform_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_ai_monitoring_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Platform Detections
CREATE POLICY "Creators can view detections of their content"
  ON dccs_platform_detections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_platform_detections.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all detections"
  ON dccs_platform_detections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for Copyright Claims
CREATE POLICY "Creators can view claims for their content"
  ON dccs_copyright_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_copyright_claims.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all claims"
  ON dccs_copyright_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for Royalty Collections
CREATE POLICY "Creators can view their royalty collections"
  ON dccs_royalty_collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_royalty_collections.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all royalty collections"
  ON dccs_royalty_collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for Platform Licenses
CREATE POLICY "Admins can view platform licenses"
  ON dccs_platform_licenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for AI Monitoring Log
CREATE POLICY "Creators can view monitoring logs for their content"
  ON dccs_ai_monitoring_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_ai_monitoring_log.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all monitoring logs"
  ON dccs_ai_monitoring_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Functions for Statistics
CREATE OR REPLACE FUNCTION get_platform_monitoring_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_detections', COUNT(DISTINCT pd.id),
    'total_claims', COUNT(DISTINCT cc.id),
    'total_revenue_collected', COALESCE(SUM(rc.collection_amount), 0),
    'active_platforms', COUNT(DISTINCT pl.platform_name),
    'by_platform', (
      SELECT jsonb_object_agg(
        platform_name,
        jsonb_build_object(
          'detections', detection_count,
          'claims', claim_count,
          'revenue', revenue_total
        )
      )
      FROM (
        SELECT
          pd.platform_name,
          COUNT(DISTINCT pd.id) as detection_count,
          COUNT(DISTINCT cc.id) as claim_count,
          COALESCE(SUM(rc.collection_amount), 0) as revenue_total
        FROM dccs_platform_detections pd
        LEFT JOIN dccs_copyright_claims cc ON cc.detection_id = pd.id
        LEFT JOIN dccs_royalty_collections rc ON rc.claim_id = cc.id
        GROUP BY pd.platform_name
      ) platform_stats
    )
  ) INTO result
  FROM dccs_platform_detections pd
  LEFT JOIN dccs_copyright_claims cc ON cc.detection_id = pd.id
  LEFT JOIN dccs_royalty_collections rc ON rc.claim_id = cc.id
  LEFT JOIN dccs_platform_licenses pl ON pl.license_status = 'active';

  RETURN result;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_dccs_tracking_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_platform_detections_updated_at
  BEFORE UPDATE ON dccs_platform_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_tracking_updated_at();

CREATE TRIGGER update_copyright_claims_updated_at
  BEFORE UPDATE ON dccs_copyright_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_tracking_updated_at();

CREATE TRIGGER update_royalty_collections_updated_at
  BEFORE UPDATE ON dccs_royalty_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_tracking_updated_at();

CREATE TRIGGER update_platform_licenses_updated_at
  BEFORE UPDATE ON dccs_platform_licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_tracking_updated_at();
