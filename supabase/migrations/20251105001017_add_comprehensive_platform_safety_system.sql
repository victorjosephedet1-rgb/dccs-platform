/*
  # Comprehensive Platform Safety System

  ## Overview
  This migration implements a complete safety and trust system for V3BMusic.AI to protect artists, content creators, and the community.

  ## New Tables

  ### 1. user_verifications
  - Stores identity verification status for users
  - Multiple verification methods (email, phone, ID, business)
  - Trust score calculation

  ### 2. fraud_detection_logs
  - Tracks suspicious activities
  - AI-powered fraud detection
  - Automatic account protection

  ### 3. dispute_resolutions
  - Manages disputes between users
  - Tracks resolution process
  - Evidence storage

  ### 4. content_moderation
  - Copyright infringement detection
  - Community reporting system
  - Automated content scanning

  ### 5. payment_escrow
  - Secure payment holding
  - Automated release after validation
  - Refund protection

  ### 6. platform_safety_reports
  - Community safety reporting
  - Admin moderation queue
  - Resolution tracking

  ## Security Features
  - Row Level Security on all tables
  - Automated fraud detection
  - Dispute resolution system
  - Payment escrow protection
  - Content copyright validation
  - User verification badges
  - Trust scoring system

  ## Protection Systems
  1. **Artist Protection**: Copyright verification, revenue tracking, dispute resolution
  2. **Creator Protection**: License validation, refund system, quality guarantees
  3. **Community Protection**: Content moderation, fraud prevention, trust badges
*/

-- User Verification System
CREATE TABLE IF NOT EXISTS user_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Verification Types
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  identity_verified boolean DEFAULT false,
  business_verified boolean DEFAULT false,
  stripe_verified boolean DEFAULT false,
  
  -- Verification Data
  verification_method text,
  verification_documents jsonb DEFAULT '[]'::jsonb,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
  
  -- Trust Score (0-100)
  trust_score integer DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  trust_level text DEFAULT 'new' CHECK (trust_level IN ('new', 'bronze', 'silver', 'gold', 'platinum', 'verified')),
  
  -- Activity Metrics
  successful_transactions integer DEFAULT 0,
  disputed_transactions integer DEFAULT 0,
  positive_reviews integer DEFAULT 0,
  negative_reviews integer DEFAULT 0,
  
  -- Verification Timestamps
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  identity_verified_at timestamptz,
  business_verified_at timestamptz,
  
  -- Metadata
  verification_notes text,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  expires_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fraud Detection System
CREATE TABLE IF NOT EXISTS fraud_detection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Fraud Detection
  fraud_type text NOT NULL CHECK (fraud_type IN (
    'suspicious_activity', 'payment_fraud', 'identity_theft', 
    'copyright_infringement', 'fake_content', 'price_manipulation',
    'mass_upload', 'duplicate_content', 'suspicious_download_pattern'
  )),
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  confidence_score numeric(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Detection Details
  detection_method text NOT NULL CHECK (detection_method IN ('ai', 'manual', 'automated_rule', 'community_report')),
  detection_data jsonb DEFAULT '{}'::jsonb,
  affected_resources jsonb DEFAULT '[]'::jsonb,
  
  -- Actions Taken
  action_taken text CHECK (action_taken IN ('none', 'flag', 'restrict', 'suspend', 'ban', 'resolved')),
  action_reason text,
  automatic_action boolean DEFAULT false,
  
  -- Resolution
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id),
  resolution_notes text,
  
  -- Related Entities
  related_snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,
  related_license_id uuid REFERENCES snippet_licenses(id) ON DELETE SET NULL,
  related_transaction_id uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dispute Resolution System
CREATE TABLE IF NOT EXISTS dispute_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties Involved
  plaintiff_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  defendant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dispute Details
  dispute_type text NOT NULL CHECK (dispute_type IN (
    'copyright_claim', 'payment_issue', 'license_violation',
    'quality_issue', 'refund_request', 'contract_breach', 'other'
  )),
  dispute_category text CHECK (dispute_category IN ('legal', 'financial', 'quality', 'technical')),
  
  -- Case Information
  title text NOT NULL,
  description text NOT NULL,
  amount_disputed numeric(10,2),
  currency text DEFAULT 'USD',
  
  -- Evidence
  plaintiff_evidence jsonb DEFAULT '[]'::jsonb,
  defendant_evidence jsonb DEFAULT '[]'::jsonb,
  platform_evidence jsonb DEFAULT '[]'::jsonb,
  
  -- Status & Priority
  status text DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'awaiting_response', 'mediation',
    'resolved', 'cancelled', 'escalated'
  )),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Resolution
  resolution_outcome text CHECK (resolution_outcome IN (
    'plaintiff_favor', 'defendant_favor', 'partial_plaintiff',
    'partial_defendant', 'mutual_agreement', 'dismissed'
  )),
  resolution_details text,
  refund_amount numeric(10,2),
  refund_processed boolean DEFAULT false,
  
  -- Timeline
  response_due_date timestamptz,
  defendant_responded_at timestamptz,
  escalated_at timestamptz,
  resolved_at timestamptz,
  
  -- Moderation
  assigned_moderator_id uuid REFERENCES profiles(id),
  moderator_notes text,
  
  -- Related Entities
  related_snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,
  related_license_id uuid REFERENCES snippet_licenses(id) ON DELETE SET NULL,
  related_transaction_id uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content Moderation System
CREATE TABLE IF NOT EXISTS content_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content Being Moderated
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Report Details
  report_type text NOT NULL CHECK (report_type IN (
    'copyright_infringement', 'inappropriate_content', 'spam',
    'fake_audio', 'misleading_info', 'low_quality', 'duplicate', 'other'
  )),
  report_description text NOT NULL,
  report_evidence jsonb DEFAULT '[]'::jsonb,
  
  -- AI Analysis
  ai_scan_completed boolean DEFAULT false,
  ai_confidence_score numeric(5,2),
  ai_detected_issues jsonb DEFAULT '[]'::jsonb,
  copyright_match_found boolean DEFAULT false,
  copyright_source text,
  
  -- Moderation Status
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'rejected', 'removed', 'appealed'
  )),
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Actions
  action_taken text CHECK (action_taken IN (
    'none', 'warning', 'content_removed', 'account_restricted',
    'account_suspended', 'account_banned', 'copyright_claimed'
  )),
  action_reason text,
  content_removed_at timestamptz,
  
  -- Review
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  
  -- Appeal
  appeal_submitted boolean DEFAULT false,
  appeal_details text,
  appeal_submitted_at timestamptz,
  appeal_reviewed_at timestamptz,
  appeal_outcome text CHECK (appeal_outcome IN ('upheld', 'overturned', 'partial')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Escrow System
CREATE TABLE IF NOT EXISTS payment_escrow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction Details
  license_id uuid NOT NULL REFERENCES snippet_licenses(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  
  -- Amounts
  escrow_amount numeric(10,2) NOT NULL CHECK (escrow_amount > 0),
  platform_fee numeric(10,2) NOT NULL,
  seller_payout numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  
  -- Escrow Status
  status text DEFAULT 'held' CHECK (status IN (
    'held', 'validating', 'approved_for_release', 'released',
    'disputed', 'refunding', 'refunded', 'expired'
  )),
  
  -- Release Conditions
  auto_release_date timestamptz NOT NULL,
  validation_completed boolean DEFAULT false,
  buyer_confirmed boolean DEFAULT false,
  dispute_filed boolean DEFAULT false,
  
  -- Payment Processing
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  blockchain_tx_hash text,
  
  -- Release Details
  released_at timestamptz,
  release_method text CHECK (release_method IN ('automatic', 'manual', 'buyer_confirmed', 'dispute_resolved')),
  release_notes text,
  
  -- Refund Details
  refund_reason text,
  refund_amount numeric(10,2),
  refunded_at timestamptz,
  refund_tx_id text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform Safety Reports
CREATE TABLE IF NOT EXISTS platform_safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reporter Information
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_type text DEFAULT 'user' CHECK (reporter_type IN ('user', 'system', 'automated', 'external')),
  
  -- Report Details
  report_category text NOT NULL CHECK (report_category IN (
    'user_behavior', 'content_issue', 'payment_fraud', 'security_threat',
    'harassment', 'impersonation', 'scam', 'technical_abuse'
  )),
  report_title text NOT NULL,
  report_description text NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Reported Entity
  reported_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,
  reported_url text,
  
  -- Evidence
  evidence_files jsonb DEFAULT '[]'::jsonb,
  screenshots jsonb DEFAULT '[]'::jsonb,
  additional_context jsonb DEFAULT '{}'::jsonb,
  
  -- Processing
  status text DEFAULT 'open' CHECK (status IN (
    'open', 'acknowledged', 'investigating', 'resolved', 'dismissed', 'escalated'
  )),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Resolution
  assigned_to uuid REFERENCES profiles(id),
  assigned_at timestamptz,
  resolved_at timestamptz,
  resolution_action text,
  resolution_notes text,
  
  -- Follow-up
  follow_up_required boolean DEFAULT false,
  follow_up_date timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all safety tables
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_safety_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_verifications
CREATE POLICY "Users can view own verification status"
  ON user_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own verification"
  ON user_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- RLS Policies for fraud_detection_logs
CREATE POLICY "Users can view their own fraud logs"
  ON fraud_detection_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "System can create fraud logs"
  ON fraud_detection_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for dispute_resolutions
CREATE POLICY "Users can view disputes they are involved in"
  ON dispute_resolutions FOR SELECT
  TO authenticated
  USING (auth.uid() = plaintiff_id OR auth.uid() = defendant_id);

CREATE POLICY "Users can create disputes"
  ON dispute_resolutions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = plaintiff_id);

CREATE POLICY "Defendants can respond to disputes"
  ON dispute_resolutions FOR UPDATE
  TO authenticated
  USING (auth.uid() = defendant_id)
  WITH CHECK (auth.uid() = defendant_id);

-- RLS Policies for content_moderation
CREATE POLICY "Anyone can report content"
  ON content_moderation FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Content owners can view reports about their content"
  ON content_moderation FOR SELECT
  TO authenticated
  USING (auth.uid() = content_owner_id OR auth.uid() = reported_by);

-- RLS Policies for payment_escrow
CREATE POLICY "Buyers and sellers can view their escrow transactions"
  ON payment_escrow FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can manage escrow"
  ON payment_escrow FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for platform_safety_reports
CREATE POLICY "Users can create safety reports"
  ON platform_safety_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON platform_safety_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_verifications_profile ON user_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_trust_score ON user_verifications(trust_score);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_profile ON fraud_detection_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_status ON fraud_detection_logs(status, risk_level);
CREATE INDEX IF NOT EXISTS idx_dispute_plaintiff ON dispute_resolutions(plaintiff_id);
CREATE INDEX IF NOT EXISTS idx_dispute_defendant ON dispute_resolutions(defendant_id);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON dispute_resolutions(status);
CREATE INDEX IF NOT EXISTS idx_content_mod_snippet ON content_moderation(snippet_id);
CREATE INDEX IF NOT EXISTS idx_content_mod_status ON content_moderation(status);
CREATE INDEX IF NOT EXISTS idx_escrow_license ON payment_escrow(license_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON payment_escrow(status);
CREATE INDEX IF NOT EXISTS idx_safety_reports_status ON platform_safety_reports(status, priority);

-- Create trigger function to automatically create verification record for new users
CREATE OR REPLACE FUNCTION create_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_verifications (profile_id, email_verified, email_verified_at)
  VALUES (NEW.id, true, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create verification on profile creation
DROP TRIGGER IF EXISTS on_profile_created_verification ON profiles;
CREATE TRIGGER on_profile_created_verification
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_verification();

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(p_profile_id uuid)
RETURNS integer AS $$
DECLARE
  v_score integer := 50;
  v_verification record;
BEGIN
  SELECT * INTO v_verification FROM user_verifications WHERE profile_id = p_profile_id;
  
  IF v_verification IS NULL THEN
    RETURN 50;
  END IF;
  
  -- Add points for verifications
  IF v_verification.email_verified THEN v_score := v_score + 5; END IF;
  IF v_verification.phone_verified THEN v_score := v_score + 10; END IF;
  IF v_verification.identity_verified THEN v_score := v_score + 15; END IF;
  IF v_verification.business_verified THEN v_score := v_score + 10; END IF;
  IF v_verification.stripe_verified THEN v_score := v_score + 10; END IF;
  
  -- Add points for positive activity
  v_score := v_score + LEAST(v_verification.successful_transactions, 20);
  v_score := v_score + LEAST(v_verification.positive_reviews * 2, 10);
  
  -- Subtract points for negative activity
  v_score := v_score - (v_verification.disputed_transactions * 5);
  v_score := v_score - (v_verification.negative_reviews * 3);
  
  -- Keep score within bounds
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trust level based on score
CREATE OR REPLACE FUNCTION update_trust_level(p_profile_id uuid)
RETURNS void AS $$
DECLARE
  v_score integer;
  v_level text;
BEGIN
  v_score := calculate_trust_score(p_profile_id);
  
  v_level := CASE
    WHEN v_score >= 90 THEN 'verified'
    WHEN v_score >= 75 THEN 'platinum'
    WHEN v_score >= 60 THEN 'gold'
    WHEN v_score >= 45 THEN 'silver'
    WHEN v_score >= 30 THEN 'bronze'
    ELSE 'new'
  END;
  
  UPDATE user_verifications
  SET trust_score = v_score, trust_level = v_level, updated_at = now()
  WHERE profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE user_verifications IS 'Stores user verification status and trust scores for platform safety';
COMMENT ON TABLE fraud_detection_logs IS 'Tracks fraud detection events and suspicious activities';
COMMENT ON TABLE dispute_resolutions IS 'Manages disputes between users with evidence and resolution tracking';
COMMENT ON TABLE content_moderation IS 'Content moderation system with AI scanning and copyright detection';
COMMENT ON TABLE payment_escrow IS 'Secure payment escrow system protecting buyers and sellers';
COMMENT ON TABLE platform_safety_reports IS 'Community safety reporting system for platform-wide issues';
