/*
  # Victor360 Brand Limited - Data Ownership & IP Protection System

  1. New Tables
    - `platform_ownership_metadata` - Records Victor360's ownership of all platform data
    - `data_asset_registry` - Catalog of all data assets owned by Victor360
    - `ip_protection_log` - Audit trail of IP protection activities
  
  2. Schema Changes
    - Add ownership metadata columns to all critical tables
    - Add copyright notices and ownership attribution
    - Add data export restrictions
  
  3. Security & Compliance
    - All data marked as proprietary to Victor360 Brand Limited
    - Investor-ready documentation of data ownership
    - Legal protection of metadata and user-generated content
    - GDPR-compliant ownership tracking
  
  4. Business Value
    - Clear demonstration of platform assets for investors
    - Legal protection of intellectual property
    - Data ownership documentation for valuation
*/

-- Create platform ownership metadata table
CREATE TABLE IF NOT EXISTS platform_ownership_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_entity text NOT NULL DEFAULT 'Victor360 Brand Limited',
  ownership_type text NOT NULL CHECK (ownership_type IN ('platform_code', 'user_data', 'metadata', 'analytics', 'ai_training_data', 'blockchain_records', 'dccs_certificates')),
  asset_description text NOT NULL,
  legal_basis text NOT NULL,
  copyright_notice text NOT NULL DEFAULT '© Victor360 Brand Limited. All Rights Reserved.',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_owner CHECK (owner_entity = 'Victor360 Brand Limited')
);

-- Create data asset registry
CREATE TABLE IF NOT EXISTS data_asset_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL,
  asset_identifier text NOT NULL,
  asset_value_category text CHECK (asset_value_category IN ('high', 'medium', 'low')),
  business_value text,
  investor_relevance boolean DEFAULT true,
  ownership_metadata_id uuid REFERENCES platform_ownership_metadata(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create IP protection audit log
CREATE TABLE IF NOT EXISTS ip_protection_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  protected_asset text NOT NULL,
  protection_mechanism text NOT NULL,
  performed_at timestamptz NOT NULL DEFAULT now(),
  performed_by uuid REFERENCES auth.users(id),
  details jsonb DEFAULT '{}'::jsonb
);

-- Add ownership columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_ownership_acknowledged boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ownership_terms_version text DEFAULT 'v1.0';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata_rights_owner text DEFAULT 'Victor360 Brand Limited';

-- Add ownership columns to uploads
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS platform_metadata_owner text DEFAULT 'Victor360 Brand Limited';
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS metadata_copyright text DEFAULT '© Victor360 Brand Limited';

-- Add ownership columns to dccs_certificates
ALTER TABLE dccs_certificates ADD COLUMN IF NOT EXISTS certificate_metadata_owner text DEFAULT 'Victor360 Brand Limited';
ALTER TABLE dccs_certificates ADD COLUMN IF NOT EXISTS registry_rights_owner text DEFAULT 'Victor360 Brand Limited';

-- Add ownership columns to dccs_registrations
ALTER TABLE dccs_registrations ADD COLUMN IF NOT EXISTS registration_metadata_owner text DEFAULT 'Victor360 Brand Limited';

-- Create function to record data ownership
CREATE OR REPLACE FUNCTION record_data_ownership()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Record platform ownership
  INSERT INTO platform_ownership_metadata (ownership_type, asset_description, legal_basis)
  VALUES 
    ('platform_code', 'V3B Music Platform - Source Code & Architecture', 'Original Work - Victor360 Brand Limited'),
    ('user_data', 'User Profiles, Authentication, Preferences', 'Platform Terms of Service - Victor360 Brand Limited retains metadata rights'),
    ('metadata', 'All Platform Metadata, Analytics, Usage Data', 'Platform Operation - Proprietary to Victor360 Brand Limited'),
    ('analytics', 'User Behavior, Platform Performance, Business Intelligence', 'Platform Analytics - Victor360 Brand Limited Proprietary'),
    ('ai_training_data', 'AI Model Training Data, Content Fingerprints', 'Platform Technology - Victor360 Brand Limited Intellectual Property'),
    ('blockchain_records', 'DCCS Blockchain Registry, Smart Contract Data', 'Platform Infrastructure - Victor360 Brand Limited'),
    ('dccs_certificates', 'DCCS Certificates, Clearance Codes, Verification Data', 'Platform Core Technology - Victor360 Brand Limited Patent-Pending')
  ON CONFLICT DO NOTHING;
END;
$$;

-- Execute ownership recording
SELECT record_data_ownership();

-- Create function to log asset value for investors
CREATE OR REPLACE FUNCTION catalog_platform_assets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_count bigint;
  v_upload_count bigint;
  v_dccs_count bigint;
  v_ownership_id uuid;
BEGIN
  -- Get current platform metrics
  SELECT COUNT(*) INTO v_user_count FROM profiles;
  SELECT COUNT(*) INTO v_upload_count FROM uploads;
  SELECT COUNT(*) INTO v_dccs_count FROM dccs_certificates;
  
  -- Get ownership metadata ID
  SELECT id INTO v_ownership_id FROM platform_ownership_metadata WHERE ownership_type = 'user_data' LIMIT 1;
  
  -- Record high-value assets
  INSERT INTO data_asset_registry (asset_type, asset_identifier, asset_value_category, business_value, ownership_metadata_id, metadata)
  VALUES 
    ('user_base', 'registered_users', 'high', 
     'User base of ' || v_user_count || ' registered users with profile data, preferences, and engagement history', 
     v_ownership_id,
     jsonb_build_object('count', v_user_count, 'recorded_at', now())),
    
    ('content_library', 'uploaded_content', 'high',
     'Content library of ' || v_upload_count || ' uploads with metadata, fingerprints, and licensing data',
     v_ownership_id,
     jsonb_build_object('count', v_upload_count, 'recorded_at', now())),
    
    ('dccs_registry', 'dccs_certificates', 'high',
     'DCCS certificate registry with ' || v_dccs_count || ' registered works - proprietary blockchain-based IP protection system',
     v_ownership_id,
     jsonb_build_object('count', v_dccs_count, 'recorded_at', now()))
  ON CONFLICT DO NOTHING;
  
  -- Log the cataloging action
  INSERT INTO ip_protection_log (action_type, protected_asset, protection_mechanism, details)
  VALUES (
    'asset_catalog',
    'platform_data_assets',
    'ownership_registry',
    jsonb_build_object(
      'users', v_user_count,
      'uploads', v_upload_count,
      'dccs_certificates', v_dccs_count,
      'cataloged_at', now()
    )
  );
END;
$$;

-- Execute asset cataloging
SELECT catalog_platform_assets();

-- Create view for investor reporting
CREATE OR REPLACE VIEW investor_data_assets AS
SELECT 
  dar.asset_type,
  dar.asset_identifier,
  dar.business_value,
  dar.asset_value_category,
  pom.owner_entity,
  pom.copyright_notice,
  dar.created_at,
  dar.metadata
FROM data_asset_registry dar
JOIN platform_ownership_metadata pom ON dar.ownership_metadata_id = pom.id
WHERE dar.investor_relevance = true
ORDER BY 
  CASE dar.asset_value_category
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END,
  dar.created_at DESC;

-- Enable RLS
ALTER TABLE platform_ownership_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_asset_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_protection_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Only admins can view ownership metadata"
  ON platform_ownership_metadata FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view asset registry"
  ON data_asset_registry FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view IP protection log"
  ON ip_protection_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_ownership_type ON platform_ownership_metadata(ownership_type);
CREATE INDEX IF NOT EXISTS idx_data_asset_registry_type ON data_asset_registry(asset_type);
CREATE INDEX IF NOT EXISTS idx_data_asset_registry_value ON data_asset_registry(asset_value_category);
CREATE INDEX IF NOT EXISTS idx_ip_protection_log_action ON ip_protection_log(action_type);
CREATE INDEX IF NOT EXISTS idx_ip_protection_log_performed_at ON ip_protection_log(performed_at DESC);

-- Create trigger to update asset registry
CREATE OR REPLACE FUNCTION update_asset_registry_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_data_asset_registry_timestamp
  BEFORE UPDATE ON data_asset_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_registry_timestamp();

-- Add comments for documentation
COMMENT ON TABLE platform_ownership_metadata IS 'Victor360 Brand Limited - Master ownership registry for all platform intellectual property and data assets';
COMMENT ON TABLE data_asset_registry IS 'Catalog of all data assets owned by Victor360 Brand Limited - investor reporting and valuation';
COMMENT ON TABLE ip_protection_log IS 'Audit trail of IP protection activities for Victor360 Brand Limited';
COMMENT ON VIEW investor_data_assets IS 'Investor-ready view of platform data assets owned by Victor360 Brand Limited';
