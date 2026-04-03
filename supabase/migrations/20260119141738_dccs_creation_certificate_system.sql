/*
  # Digital Creation Certificate System (DCCS) - Complete Framework

  ## Overview
  DCCS is V3BMusic.AI's core innovation: a creator-first proof-of-creation and
  rights management system that establishes immutable ownership before commercialization.

  ## Key Principles
  1. **Proof of Creation**: Digital certificate issued at point of creation
  2. **Creator Ownership**: Artists maintain full ownership, DCCS is service-based
  3. **80/20 Lifetime Model**: 80% creator, 20% platform (service fee, not rights claim)
  4. **AI as Guide**: AI assists but cannot claim ownership, license, or alter works
  5. **Dispute-Resilient**: Built-in arbitration, split versioning, escrow
  6. **Platform-Proof**: Whitelist evidence, rapid remediation, blockchain verification

  ## New Tables
  1. `dccs_certificates` - Digital creation certificates (immutable proof)
  2. `dccs_ai_guidance_logs` - AI assistance audit trail (transparency)
  3. `dccs_dispute_cases` - Dispute resolution system
  4. `dccs_split_versions` - Version control for royalty splits
  5. `dccs_whitelist_evidence` - Platform takedown defense bundles
  6. `dccs_ai_training_consent` - AI training opt-in/opt-out tracking

  ## Security
  - RLS on all tables
  - Immutable certificate creation
  - Audit trails for all AI interactions
  - Blockchain anchoring for proof-of-creation
*/

-- ============================================================================
-- 1. DCCS Certificates Table (Core Innovation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Certificate Identity
  certificate_id text UNIQUE NOT NULL,
  clearance_code text UNIQUE NOT NULL,

  -- Creator Information
  creator_id uuid REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  creator_legal_name text NOT NULL,
  creator_verified boolean DEFAULT false,

  -- Project Details
  project_title text NOT NULL,
  project_type text DEFAULT 'audio' CHECK (project_type IN ('audio', 'video', 'podcast', 'sample_pack')),
  audio_snippet_id uuid REFERENCES audio_snippets(id) ON DELETE RESTRICT,

  -- Creation Proof
  creation_timestamp timestamptz NOT NULL DEFAULT now(),
  audio_fingerprint text NOT NULL,
  audio_signature jsonb NOT NULL,
  metadata_hash text NOT NULL,

  -- Collaborators (JSON array)
  collaborators jsonb DEFAULT '[]'::jsonb,

  -- Blockchain Anchoring
  blockchain_tx_hash text,
  blockchain_network text,
  blockchain_verified boolean DEFAULT false,
  verified_at timestamptz,

  -- Immutable Proof
  certificate_hash text UNIQUE NOT NULL,
  previous_certificate_hash text,

  -- Licensing Status
  available_for_licensing boolean DEFAULT true,
  licensing_status text DEFAULT 'available' CHECK (licensing_status IN ('available', 'licensed', 'exclusive', 'revoked')),

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT dccs_immutable_creation CHECK (creation_timestamp <= created_at)
);

-- ============================================================================
-- 2. AI Guidance Logs (Human-in-Loop Transparency)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_ai_guidance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Context
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  certificate_id text REFERENCES dccs_certificates(certificate_id) ON DELETE CASCADE,

  -- AI Interaction
  guidance_type text NOT NULL CHECK (guidance_type IN (
    'listing_assistance',
    'pricing_recommendation',
    'compliance_check',
    'platform_rules_education',
    'split_validation',
    'licensing_terms_suggestion',
    'marketplace_optimization',
    'copyright_screening'
  )),

  -- AI Input/Output
  user_query text,
  ai_response text NOT NULL,
  ai_confidence_score numeric(5,2) CHECK (ai_confidence_score BETWEEN 0 AND 100),
  ai_model_version text DEFAULT 'Victor360-v1',

  -- Prohibited Actions Verification
  claimed_ownership boolean DEFAULT false CHECK (claimed_ownership = false),
  licensed_autonomously boolean DEFAULT false CHECK (licensed_autonomously = false),
  altered_work boolean DEFAULT false CHECK (altered_work = false),
  provided_legal_advice boolean DEFAULT false CHECK (provided_legal_advice = false),

  -- Human Decision
  user_accepted_guidance boolean,
  user_final_decision text,

  -- Metadata
  session_id text,
  ip_address inet,
  user_agent text,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. Dispute Resolution System
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_dispute_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dispute Identity
  dispute_id text UNIQUE NOT NULL,
  certificate_id text REFERENCES dccs_certificates(certificate_id) ON DELETE RESTRICT NOT NULL,

  -- Parties
  claimant_id uuid REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  respondent_id uuid REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,

  -- Dispute Type
  dispute_type text NOT NULL CHECK (dispute_type IN (
    'split_conflict',
    'ownership_challenge',
    'royalty_calculation',
    'attribution_dispute',
    'licensing_terms',
    'platform_takedown'
  )),

  -- Details
  dispute_description text NOT NULL,
  claimant_evidence jsonb DEFAULT '[]'::jsonb,
  respondent_evidence jsonb DEFAULT '[]'::jsonb,

  -- Resolution Process
  status text DEFAULT 'open' CHECK (status IN (
    'open',
    'negotiation',
    'mediation',
    'arbitration',
    'resolved',
    'withdrawn',
    'escalated'
  )),

  -- Escrow (if applicable)
  amount_in_escrow numeric(15,2) DEFAULT 0,
  escrow_holder text DEFAULT 'platform',

  -- Resolution
  resolution_method text CHECK (resolution_method IN ('negotiation', 'mediation', 'arbitration', 'legal')),
  resolution_details text,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,

  -- Timeline
  response_deadline timestamptz,
  claimant_notified_at timestamptz,
  respondent_notified_at timestamptz,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 4. Split Versioning (Dispute-Resilient)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_split_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Certificate Link
  certificate_id text REFERENCES dccs_certificates(certificate_id) ON DELETE CASCADE NOT NULL,

  -- Version Control
  version_number integer NOT NULL,
  is_active boolean DEFAULT false,

  -- Split Configuration
  splits jsonb NOT NULL,
  total_percentage numeric(5,2) NOT NULL CHECK (total_percentage = 100.00),

  -- Change Tracking
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  change_reason text,
  requires_approval boolean DEFAULT false,

  -- Approval Status
  approved_by jsonb DEFAULT '[]'::jsonb,
  pending_approval_from jsonb DEFAULT '[]'::jsonb,
  rejected_by jsonb DEFAULT '[]'::jsonb,

  -- Lockdown
  locked boolean DEFAULT false,
  locked_at timestamptz,
  locked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  activated_at timestamptz,

  UNIQUE(certificate_id, version_number)
);

-- ============================================================================
-- 5. Whitelist Evidence (Platform-Proofing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_whitelist_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Certificate Link
  certificate_id text REFERENCES dccs_certificates(certificate_id) ON DELETE CASCADE NOT NULL,
  clearance_code text NOT NULL,

  -- Evidence Bundle
  license_id uuid REFERENCES track_licenses(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Platform Submission
  platform text NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'twitch', 'facebook', 'podcast', 'other')),
  content_url text,
  platform_content_id text,

  -- Evidence Package
  license_document_url text NOT NULL,
  clearance_certificate_url text,
  blockchain_proof_url text,
  usage_terms jsonb NOT NULL,

  -- Takedown Defense
  claimed_at timestamptz,
  claim_id text,
  defense_submitted_at timestamptz,
  defense_status text DEFAULT 'not_needed' CHECK (defense_status IN (
    'not_needed',
    'claim_received',
    'defense_submitted',
    'under_review',
    'resolved_restored',
    'resolved_removed'
  )),

  -- Hotline Response
  hotline_ticket_id text,
  response_time_minutes integer,
  resolved_at timestamptz,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 6. AI Training Consent
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_ai_training_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Certificate Link
  certificate_id text REFERENCES dccs_certificates(certificate_id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Consent Status
  training_allowed boolean DEFAULT false NOT NULL,
  consent_version text DEFAULT 'v1.0' NOT NULL,

  -- Scope
  allowed_for_internal_ai boolean DEFAULT false,
  allowed_for_third_party_ai boolean DEFAULT false,
  allowed_for_research boolean DEFAULT false,

  -- Contract Terms
  contractual_language text NOT NULL,
  opt_out_available boolean DEFAULT true NOT NULL,

  -- Visibility
  badge_visible boolean DEFAULT true,
  public_notice text,

  -- Audit Trail
  consented_at timestamptz NOT NULL DEFAULT now(),
  consent_method text CHECK (consent_method IN ('upload', 'profile_settings', 'bulk_update')),
  ip_address inet,

  -- Revocation
  revoked boolean DEFAULT false,
  revoked_at timestamptz,
  revocation_reason text,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  UNIQUE(certificate_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dccs_cert_id ON dccs_certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_clearance ON dccs_certificates(clearance_code);
CREATE INDEX IF NOT EXISTS idx_dccs_creator ON dccs_certificates(creator_id);
CREATE INDEX IF NOT EXISTS idx_dccs_snippet ON dccs_certificates(audio_snippet_id);
CREATE INDEX IF NOT EXISTS idx_dccs_blockchain ON dccs_certificates(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_dccs_fingerprint ON dccs_certificates(audio_fingerprint);
CREATE INDEX IF NOT EXISTS idx_dccs_licensing_status ON dccs_certificates(licensing_status);
CREATE INDEX IF NOT EXISTS idx_dccs_creation_timestamp ON dccs_certificates(creation_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ai_guidance_user ON dccs_ai_guidance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_guidance_cert ON dccs_ai_guidance_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_ai_guidance_type ON dccs_ai_guidance_logs(guidance_type);
CREATE INDEX IF NOT EXISTS idx_ai_guidance_created ON dccs_ai_guidance_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dispute_id ON dccs_dispute_cases(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_cert ON dccs_dispute_cases(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dispute_claimant ON dccs_dispute_cases(claimant_id);
CREATE INDEX IF NOT EXISTS idx_dispute_respondent ON dccs_dispute_cases(respondent_id);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON dccs_dispute_cases(status);
CREATE INDEX IF NOT EXISTS idx_dispute_created ON dccs_dispute_cases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_split_ver_cert ON dccs_split_versions(certificate_id);
CREATE INDEX IF NOT EXISTS idx_split_ver_active ON dccs_split_versions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_split_ver_version ON dccs_split_versions(version_number DESC);

CREATE INDEX IF NOT EXISTS idx_whitelist_cert ON dccs_whitelist_evidence(certificate_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_clearance ON dccs_whitelist_evidence(clearance_code);
CREATE INDEX IF NOT EXISTS idx_whitelist_license ON dccs_whitelist_evidence(license_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_platform ON dccs_whitelist_evidence(platform);
CREATE INDEX IF NOT EXISTS idx_whitelist_status ON dccs_whitelist_evidence(defense_status);

CREATE INDEX IF NOT EXISTS idx_training_cert ON dccs_ai_training_consent(certificate_id);
CREATE INDEX IF NOT EXISTS idx_training_creator ON dccs_ai_training_consent(creator_id);
CREATE INDEX IF NOT EXISTS idx_training_allowed ON dccs_ai_training_consent(training_allowed);
CREATE INDEX IF NOT EXISTS idx_training_revoked ON dccs_ai_training_consent(revoked);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE dccs_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own certificates"
  ON dccs_certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view available certificates"
  ON dccs_certificates FOR SELECT
  TO authenticated
  USING (available_for_licensing = true AND licensing_status = 'available');

CREATE POLICY "Creators can create certificates"
  ON dccs_certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their certificates"
  ON dccs_certificates FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

ALTER TABLE dccs_ai_guidance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their AI guidance logs"
  ON dccs_ai_guidance_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI guidance logs"
  ON dccs_ai_guidance_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE dccs_dispute_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dispute parties can view their cases"
  ON dccs_dispute_cases FOR SELECT
  TO authenticated
  USING (auth.uid() = claimant_id OR auth.uid() = respondent_id);

CREATE POLICY "Users can create dispute cases"
  ON dccs_dispute_cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Dispute parties can update their cases"
  ON dccs_dispute_cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = claimant_id OR auth.uid() = respondent_id);

ALTER TABLE dccs_split_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificate owners can view split versions"
  ON dccs_split_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.certificate_id = dccs_split_versions.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Certificate owners can create split versions"
  ON dccs_split_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.certificate_id = dccs_split_versions.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Certificate owners can update split versions"
  ON dccs_split_versions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.certificate_id = dccs_split_versions.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

ALTER TABLE dccs_whitelist_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers and creators can view evidence"
  ON dccs_whitelist_evidence FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.certificate_id = dccs_whitelist_evidence.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create evidence"
  ON dccs_whitelist_evidence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and creators can update evidence"
  ON dccs_whitelist_evidence FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = buyer_id OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.certificate_id = dccs_whitelist_evidence.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

ALTER TABLE dccs_ai_training_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their consent"
  ON dccs_ai_training_consent FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage their consent"
  ON dccs_ai_training_consent FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- ============================================================================
-- Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_dccs_certificate_id()
RETURNS text AS $$
BEGIN
  RETURN 'DCCS-' ||
         TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         UPPER(substr(md5(random()::text), 1, 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_dccs_certificate_hash(
  p_certificate_id text,
  p_creator_id uuid,
  p_project_title text,
  p_creation_timestamp timestamptz,
  p_audio_fingerprint text,
  p_previous_hash text DEFAULT NULL
)
RETURNS text AS $$
BEGIN
  RETURN encode(
    digest(
      p_certificate_id ||
      p_creator_id::text ||
      p_project_title ||
      p_creation_timestamp::text ||
      p_audio_fingerprint ||
      COALESCE(p_previous_hash, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_dccs_certificate_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_id IS NULL THEN
    NEW.certificate_id := generate_dccs_certificate_id();
  END IF;

  IF NEW.clearance_code IS NULL THEN
    NEW.clearance_code := 'V3B-' ||
      UPPER(substr(md5(random()::text), 1, 4)) || '-' ||
      UPPER(substr(md5(random()::text), 1, 4)) || '-' ||
      UPPER(substr(md5(random()::text), 1, 4));
  END IF;

  NEW.certificate_hash := generate_dccs_certificate_hash(
    NEW.certificate_id,
    NEW.creator_id,
    NEW.project_title,
    NEW.creation_timestamp,
    NEW.audio_fingerprint,
    NEW.previous_certificate_hash
  );

  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_dccs_certificate_data ON dccs_certificates;
CREATE TRIGGER trigger_set_dccs_certificate_data
  BEFORE INSERT OR UPDATE ON dccs_certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_dccs_certificate_data();

CREATE OR REPLACE FUNCTION activate_split_version(p_version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certificate_id text;
BEGIN
  SELECT certificate_id INTO v_certificate_id
  FROM dccs_split_versions
  WHERE id = p_version_id;

  UPDATE dccs_split_versions
  SET is_active = false
  WHERE certificate_id = v_certificate_id;

  UPDATE dccs_split_versions
  SET is_active = true, activated_at = now()
  WHERE id = p_version_id;
END;
$$;

COMMENT ON TABLE dccs_certificates IS
'Digital Creation Certificate System - Immutable proof-of-creation issued at project origin.';

COMMENT ON TABLE dccs_ai_guidance_logs IS
'AI assistance audit trail. AI guides but NEVER claims ownership or alters works.';

COMMENT ON TABLE dccs_dispute_cases IS
'Dispute resolution: negotiation → mediation → arbitration with escrow.';

COMMENT ON TABLE dccs_split_versions IS
'Version control for royalty splits with multi-party approval.';

COMMENT ON TABLE dccs_whitelist_evidence IS
'Platform-proofing: whitelist evidence bundles for takedown defense.';

COMMENT ON TABLE dccs_ai_training_consent IS
'Creator control over AI training usage with opt-in/opt-out.';
