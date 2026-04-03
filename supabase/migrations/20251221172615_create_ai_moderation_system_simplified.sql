/*
  # AI-Powered Content Moderation for V3BMusic.AI
  
  ## Platform is Powered By: AI, BLOCKCHAIN, CRYPTO
  
  ## What AI Knows: Platform Content Rules
  
  ### ✅ PERMITTED Content (What Sound Engineers CAN Upload)
  - Original beats and instrumentals they created
  - Royalty-free samples with proper rights
  - Content they own 100% of the rights to
  - Legally licensed content with clearance
  - Any music genre (hip-hop, pop, EDM, etc.)
  - Professional quality audio files
  - Clean or explicit content (labeled properly)
  
  ### ❌ NEVER PERMITTED Content (Instant Ban + Legal Action)
  1. Copyrighted Material - No unauthorized samples
  2. Stolen Content - Content they don't own
  3. Illegal Content - Child exploitation, terrorism
  4. Hate Speech - Racist, sexist, discriminatory
  5. Violence Promotion - Real-world violence/harm
  6. Scams/Fraud - Fake content, deceptive practices
  7. Malware - Corrupted or infected audio
  8. AI-Generated Vocals - Without disclosure
  9. Plagiarism - Copies of other producers
  10. Unlicensed Samples - Commercial samples without clearance
  
  ## New AI Moderation Tables
*/

-- AI Platform Rules (What AI Enforces)
CREATE TABLE IF NOT EXISTS ai_platform_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('permitted', 'prohibited', 'requires_review')),
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'instant_ban')),
  ai_auto_enforce boolean DEFAULT true,
  auto_action text CHECK (auto_action IN ('allow', 'flag', 'reject', 'ban_user', 'legal_review')),
  examples text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_platform_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform rules"
  ON ai_platform_rules FOR SELECT
  TO authenticated
  USING (true);

-- AI Content Scans (Automated Before Upload)
CREATE TABLE IF NOT EXISTS ai_content_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI Analysis
  scan_status text NOT NULL CHECK (scan_status IN ('scanning', 'approved', 'flagged', 'rejected')) DEFAULT 'scanning',
  ai_confidence decimal(5,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  
  -- Detection
  copyright_detected boolean DEFAULT false,
  prohibited_content boolean DEFAULT false,
  quality_score decimal(5,2),
  
  -- Blockchain Verification
  blockchain_verified boolean DEFAULT false,
  dccs_clearance_code text,
  
  -- Decision
  final_decision text CHECK (final_decision IN ('approved', 'rejected', 'needs_review')),
  decision_reason text,
  
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE ai_content_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON ai_content_scans FOR SELECT
  TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can view all scans"
  ON ai_content_scans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Platform Violations (AI Detected)
CREATE TABLE IF NOT EXISTS platform_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid,
  
  violation_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  description text NOT NULL,
  
  -- AI Detection
  detected_by_ai boolean DEFAULT true,
  ai_confidence decimal(5,2),
  
  -- Action
  action_taken text NOT NULL CHECK (action_taken IN ('warning', 'content_removed', 'suspended', 'banned', 'legal_action')),
  banned_permanently boolean DEFAULT false,
  
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE platform_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own violations"
  ON platform_violations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all violations"
  ON platform_violations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ai_scans_user ON ai_content_scans(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_ai_scans_status ON ai_content_scans(scan_status);
CREATE INDEX IF NOT EXISTS idx_violations_user ON platform_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON platform_violations(severity);

-- Insert AI Platform Rules
INSERT INTO ai_platform_rules (rule_name, rule_type, description, severity, auto_action, examples) VALUES
  ('Original Content', 'permitted', 'Sound Engineers must own 100% rights', 'info', 'allow', ARRAY['Own beats', 'Own instrumentals', 'Licensed samples']),
  ('Copyright Theft', 'prohibited', 'Using copyrighted music without authorization', 'instant_ban', 'ban_user', ARRAY['Billboard samples', 'Famous vocals', 'Unauthorized loops']),
  ('Stolen Beats', 'prohibited', 'Content stolen from other creators', 'instant_ban', 'ban_user', ARRAY['Copied instrumentals', 'Plagiarized beats']),
  ('Child Exploitation', 'prohibited', 'Any content exploiting children', 'instant_ban', 'legal_review', ARRAY['CSAM', 'Child endangerment']),
  ('Terrorism', 'prohibited', 'Content promoting terrorism', 'instant_ban', 'legal_review', ARRAY['Recruitment', 'Attack planning']),
  ('Hate Speech', 'prohibited', 'Racist, sexist, or discriminatory content', 'instant_ban', 'ban_user', ARRAY['Racial slurs', 'Discriminatory lyrics']),
  ('Violence', 'prohibited', 'Promoting real-world violence', 'instant_ban', 'ban_user', ARRAY['Attack instructions', 'Violence glorification']),
  ('Fraud', 'prohibited', 'Deceptive or fraudulent content', 'instant_ban', 'ban_user', ARRAY['Fake rights', 'Misleading licenses']),
  ('Malware', 'prohibited', 'Infected or corrupted files', 'instant_ban', 'ban_user', ARRAY['Virus files', 'Exploits']),
  ('Unlicensed Samples', 'prohibited', 'Commercial samples without clearance', 'critical', 'reject', ARRAY['Splice unauthorized use', 'Sample pack violations']),
  ('AI Content', 'requires_review', 'AI-generated vocals need disclosure', 'warning', 'flag', ARRAY['Synthetic vocals', 'AI-generated lyrics'])
ON CONFLICT DO NOTHING;

COMMENT ON TABLE ai_platform_rules IS 'AI-enforced platform rules. Defines permitted and prohibited content. Platform powered by AI, BLOCKCHAIN, and CRYPTO.';
COMMENT ON TABLE ai_content_scans IS 'AI scans all content before it goes live. Includes copyright detection, blockchain verification via DCCS, and quality checks.';
COMMENT ON TABLE platform_violations IS 'AI-detected violations with automatic enforcement. Zero tolerance for prohibited content.';
