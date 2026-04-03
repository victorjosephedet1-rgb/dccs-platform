/*
  # V3BMUSIC.AI Legal & Compliance System

  Complete legal infrastructure for Priority 1 requirements:
  - Artist Upload Agreements
  - Licensing Agreements for Buyers
  - KYC/AML Integration
  - GDPR & Privacy Compliance  
  - Blockchain Audit Logging
  - DMCA System
  - AI Copyright Screening
  - ISRC/ISWC Metadata
*/

-- Legal Agreements Table
CREATE TABLE IF NOT EXISTS legal_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_type text NOT NULL CHECK (agreement_type IN (
    'artist_upload',
    'buyer_licensing',
    'privacy_policy',
    'terms_of_service',
    'cookie_policy',
    'dmca_policy',
    'kyc_consent'
  )),
  version text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  effective_date timestamptz NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true,
  requires_acceptance boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  UNIQUE(agreement_type, version)
);

CREATE INDEX idx_legal_agreements_type ON legal_agreements(agreement_type);
CREATE INDEX idx_legal_agreements_active ON legal_agreements(is_active) WHERE is_active = true;

-- User Agreement Acceptances
CREATE TABLE IF NOT EXISTS user_agreement_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreement_id uuid NOT NULL REFERENCES legal_agreements(id),
  ip_address inet,
  user_agent text,
  accepted_at timestamptz DEFAULT now(),
  signature_hash text,
  UNIQUE(user_id, agreement_id)
);

CREATE INDEX idx_user_agreements_user ON user_agreement_acceptances(user_id);
CREATE INDEX idx_user_agreements_agreement ON user_agreement_acceptances(agreement_id);

-- KYC/AML Verification Records
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'in_review', 'approved', 'rejected', 'requires_documents'
  )),
  verification_provider text,
  provider_verification_id text,
  identity_verified boolean DEFAULT false,
  address_verified boolean DEFAULT false,
  document_type text,
  document_number_hash text,
  date_of_birth date,
  country_code text,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  aml_check_passed boolean,
  sanctions_check_passed boolean,
  verification_notes text,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(verification_status);

-- Licensing Terms (Per Transaction)
CREATE TABLE IF NOT EXISTS licensing_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id text UNIQUE NOT NULL,
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  license_type text NOT NULL CHECK (license_type IN (
    'personal', 'commercial', 'enterprise', 'broadcast'
  )),
  usage_rights jsonb NOT NULL,
  price_paid numeric(10, 2) NOT NULL,
  royalty_split jsonb NOT NULL,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  territorial_rights text[],
  modification_rights boolean DEFAULT false,
  sublicense_rights boolean DEFAULT false,
  attribution_required boolean DEFAULT true,
  license_agreement_id uuid REFERENCES legal_agreements(id),
  blockchain_tx_hash text,
  revoked boolean DEFAULT false,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_licensing_license ON licensing_terms(license_id);
CREATE INDEX idx_licensing_snippet ON licensing_terms(snippet_id);
CREATE INDEX idx_licensing_buyer ON licensing_terms(buyer_id);

-- DMCA Notices
CREATE TABLE IF NOT EXISTS dmca_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_type text NOT NULL CHECK (notice_type IN ('takedown', 'counter_notice')),
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,
  complainant_name text NOT NULL,
  complainant_email text NOT NULL,
  complainant_address text,
  copyright_work_description text NOT NULL,
  infringing_url text,
  sworn_statement text NOT NULL,
  electronic_signature text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'received' CHECK (status IN (
    'received', 'under_review', 'content_removed', 
    'counter_notice_received', 'restored', 'rejected'
  )),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  response_sent_at timestamptz,
  content_removed_at timestamptz,
  counter_notice_text text,
  counter_notice_submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dmca_snippet ON dmca_notices(snippet_id);
CREATE INDEX idx_dmca_status ON dmca_notices(status);

-- Content Moderation Flags
CREATE TABLE IF NOT EXISTS content_moderation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  flag_type text NOT NULL CHECK (flag_type IN (
    'copyright_match', 'prohibited_content', 'quality_issue',
    'metadata_mismatch', 'user_report', 'ai_detection'
  )),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  flag_source text NOT NULL,
  flag_reason text NOT NULL,
  matched_content_id text,
  confidence_score numeric(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'resolved_safe', 'resolved_removed', 'false_positive'
  )),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_moderation_snippet ON content_moderation_flags(snippet_id);
CREATE INDEX idx_moderation_status ON content_moderation_flags(status);

-- Immutable Audit Logs (Blockchain-style)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_category text NOT NULL CHECK (event_category IN (
    'licensing', 'payment', 'legal', 'content', 'user', 'admin'
  )),
  user_id uuid REFERENCES profiles(id),
  related_entity_type text,
  related_entity_id uuid,
  event_data jsonb NOT NULL,
  ip_address inet,
  user_agent text,
  blockchain_hash text,
  previous_log_hash text,
  timestamp timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ISRC/ISWC Metadata for PRO Reporting
CREATE TABLE IF NOT EXISTS isrc_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  isrc_code text,
  iswc_code text,
  composers jsonb,
  producers jsonb,
  publishers jsonb,
  recording_date date,
  release_date date,
  record_label text,
  publishing_company text,
  composer_pro text,
  publisher_pro text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(snippet_id)
);

CREATE INDEX idx_isrc_snippet ON isrc_metadata(snippet_id);

-- Copyright Claims & Disputes
CREATE TABLE IF NOT EXISTS copyright_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_type text NOT NULL CHECK (claim_type IN (
    'ownership_dispute', 'unauthorized_use', 'royalty_dispute', 'attribution_missing'
  )),
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE CASCADE,
  claimant_id uuid REFERENCES profiles(id),
  respondent_id uuid REFERENCES profiles(id),
  claim_description text NOT NULL,
  evidence_urls text[],
  supporting_documents jsonb,
  status text DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'mediation', 'resolved', 'closed_invalid'
  )),
  resolution_method text,
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_claims_snippet ON copyright_claims(snippet_id);

-- GDPR Data Requests
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN (
    'data_access', 'data_deletion', 'data_portability', 'rectification', 'restriction'
  )),
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'rejected'
  )),
  request_details text,
  processed_by uuid REFERENCES profiles(id),
  processed_at timestamptz,
  completion_notes text,
  data_package_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gdpr_user ON gdpr_requests(user_id);

-- Enable RLS
ALTER TABLE legal_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agreement_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE licensing_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE isrc_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active legal agreements"
  ON legal_agreements FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Users can view own agreement acceptances"
  ON user_agreement_acceptances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can accept agreements"
  ON user_agreement_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own KYC status"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their licenses"
  ON licensing_terms FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = licensing_terms.snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Artists can manage own ISRC metadata"
  ON isrc_metadata FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = isrc_metadata.snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their copyright claims"
  ON copyright_claims FOR SELECT
  TO authenticated
  USING (claimant_id = auth.uid() OR respondent_id = auth.uid());

CREATE POLICY "Users can create copyright claims"
  ON copyright_claims FOR INSERT
  TO authenticated
  WITH CHECK (claimant_id = auth.uid());

CREATE POLICY "Users can manage own GDPR requests"
  ON gdpr_requests FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Audit log function
CREATE OR REPLACE FUNCTION create_audit_log(
  p_event_type text,
  p_event_category text,
  p_event_data jsonb,
  p_related_entity_type text DEFAULT NULL,
  p_related_entity_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
  v_previous_hash text;
  v_new_hash text;
BEGIN
  SELECT blockchain_hash INTO v_previous_hash
  FROM audit_logs
  ORDER BY timestamp DESC
  LIMIT 1;

  v_new_hash := encode(
    digest(
      concat(
        p_event_type,
        p_event_data::text,
        now()::text,
        COALESCE(v_previous_hash, 'genesis')
      ),
      'sha256'
    ),
    'hex'
  );

  INSERT INTO audit_logs (
    event_type,
    event_category,
    user_id,
    related_entity_type,
    related_entity_id,
    event_data,
    blockchain_hash,
    previous_log_hash
  ) VALUES (
    p_event_type,
    p_event_category,
    auth.uid(),
    p_related_entity_type,
    p_related_entity_id,
    p_event_data,
    v_new_hash,
    v_previous_hash
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;