/*
  # Fix Security Issues - Part 2: Remaining RLS Policies (Corrected)

  ## RLS Performance Optimization
  Optimizes remaining RLS policies by wrapping auth.uid() in SELECT
  Uses correct column names for each table
  
  ## Tables Updated
  - dccs_ai_guidance_logs (user_id)
  - dccs_split_versions  
  - dccs_whitelist_evidence
  - dccs_ai_training_consent
  - exclusivity_declarations (user_id)
  - exclusivity_violations
  - dccs_verification_logs
  - ai_content_scans (uploaded_by)
  - platform_violations (user_id)
  - dccs_disputes
  - dccs_dispute_activity_logs
  - dccs_dispute_escrow
  - dccs_royalty_payment_audit
*/

-- =====================================================
-- DCCS AI GUIDANCE LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users can create AI guidance logs" ON dccs_ai_guidance_logs;
CREATE POLICY "Users can create AI guidance logs"
ON dccs_ai_guidance_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their AI guidance logs" ON dccs_ai_guidance_logs;
CREATE POLICY "Users can view their AI guidance logs"
ON dccs_ai_guidance_logs FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- DCCS SPLIT VERSIONS
-- =====================================================

DROP POLICY IF EXISTS "Certificate owners can create split versions" ON dccs_split_versions;
CREATE POLICY "Certificate owners can create split versions"
ON dccs_split_versions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE certificate_id = dccs_split_versions.certificate_id
    AND creator_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Certificate owners can update split versions" ON dccs_split_versions;
CREATE POLICY "Certificate owners can update split versions"
ON dccs_split_versions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE certificate_id = dccs_split_versions.certificate_id
    AND creator_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE certificate_id = dccs_split_versions.certificate_id
    AND creator_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Certificate owners can view split versions" ON dccs_split_versions;
CREATE POLICY "Certificate owners can view split versions"
ON dccs_split_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE certificate_id = dccs_split_versions.certificate_id
    AND creator_id = (select auth.uid())
  )
);

-- =====================================================
-- DCCS WHITELIST EVIDENCE
-- =====================================================

DROP POLICY IF EXISTS "Buyers can create evidence" ON dccs_whitelist_evidence;
CREATE POLICY "Buyers can create evidence"
ON dccs_whitelist_evidence FOR INSERT
TO authenticated
WITH CHECK (buyer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Buyers and creators can view evidence" ON dccs_whitelist_evidence;
CREATE POLICY "Buyers and creators can view evidence"
ON dccs_whitelist_evidence FOR SELECT
TO authenticated
USING (
  buyer_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE clearance_code = dccs_whitelist_evidence.clearance_code
    AND creator_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Buyers and creators can update evidence" ON dccs_whitelist_evidence;
CREATE POLICY "Buyers and creators can update evidence"
ON dccs_whitelist_evidence FOR UPDATE
TO authenticated
USING (
  buyer_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE clearance_code = dccs_whitelist_evidence.clearance_code
    AND creator_id = (select auth.uid())
  )
)
WITH CHECK (
  buyer_id = (select auth.uid()) OR
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE clearance_code = dccs_whitelist_evidence.clearance_code
    AND creator_id = (select auth.uid())
  )
);

-- =====================================================
-- DCCS AI TRAINING CONSENT
-- =====================================================

DROP POLICY IF EXISTS "Creators can manage their consent" ON dccs_ai_training_consent;
CREATE POLICY "Creators can manage their consent"
ON dccs_ai_training_consent FOR ALL
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can view their consent" ON dccs_ai_training_consent;
CREATE POLICY "Creators can view their consent"
ON dccs_ai_training_consent FOR SELECT
TO authenticated
USING (creator_id = (select auth.uid()));

-- =====================================================
-- EXCLUSIVITY DECLARATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can create own declarations" ON exclusivity_declarations;
CREATE POLICY "Users can create own declarations"
ON exclusivity_declarations FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own declarations" ON exclusivity_declarations;
CREATE POLICY "Users can view own declarations"
ON exclusivity_declarations FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all declarations" ON exclusivity_declarations;
CREATE POLICY "Admins can view all declarations"
ON exclusivity_declarations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- EXCLUSIVITY VIOLATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can report violations" ON exclusivity_violations;
CREATE POLICY "Users can report violations"
ON exclusivity_violations FOR INSERT
TO authenticated
WITH CHECK (reported_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own reports" ON exclusivity_violations;
CREATE POLICY "Users can view own reports"
ON exclusivity_violations FOR SELECT
TO authenticated
USING (reported_by = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all violations" ON exclusivity_violations;
CREATE POLICY "Admins can manage all violations"
ON exclusivity_violations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- DCCS VERIFICATION LOGS
-- =====================================================

DROP POLICY IF EXISTS "Admins can view verification logs" ON dccs_verification_logs;
CREATE POLICY "Admins can view verification logs"
ON dccs_verification_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- AI CONTENT SCANS (uses uploaded_by not user_id)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own scans" ON ai_content_scans;
CREATE POLICY "Users can view own scans"
ON ai_content_scans FOR SELECT
TO authenticated
USING (uploaded_by = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all scans" ON ai_content_scans;
CREATE POLICY "Admins can view all scans"
ON ai_content_scans FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- PLATFORM VIOLATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own violations" ON platform_violations;
CREATE POLICY "Users can view own violations"
ON platform_violations FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all violations" ON platform_violations;
CREATE POLICY "Admins can view all violations"
ON platform_violations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- DCCS DISPUTES
-- =====================================================

DROP POLICY IF EXISTS "Plaintiffs can file disputes" ON dccs_disputes;
CREATE POLICY "Plaintiffs can file disputes"
ON dccs_disputes FOR INSERT
TO authenticated
WITH CHECK (plaintiff_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view disputes where they are involved" ON dccs_disputes;
CREATE POLICY "Users can view disputes where they are involved"
ON dccs_disputes FOR SELECT
TO authenticated
USING (plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Parties can update their statements" ON dccs_disputes;
CREATE POLICY "Parties can update their statements"
ON dccs_disputes FOR UPDATE
TO authenticated
USING (plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid()))
WITH CHECK (plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins have full access to disputes" ON dccs_disputes;
CREATE POLICY "Admins have full access to disputes"
ON dccs_disputes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- DCCS DISPUTE ACTIVITY LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users and admins can create activity logs" ON dccs_dispute_activity_logs;
CREATE POLICY "Users and admins can create activity logs"
ON dccs_dispute_activity_logs FOR INSERT
TO authenticated
WITH CHECK (actor_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view activity for their disputes" ON dccs_dispute_activity_logs;
CREATE POLICY "Users can view activity for their disputes"
ON dccs_dispute_activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_disputes
    WHERE dccs_disputes.id = dccs_dispute_activity_logs.dispute_id
    AND (plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid()))
  )
);

-- =====================================================
-- DCCS DISPUTE ESCROW
-- =====================================================

DROP POLICY IF EXISTS "Users can view escrow for their disputes" ON dccs_dispute_escrow;
CREATE POLICY "Users can view escrow for their disputes"
ON dccs_dispute_escrow FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_disputes
    WHERE dccs_disputes.id = dccs_dispute_escrow.dispute_id
    AND (plaintiff_id = (select auth.uid()) OR defendant_id = (select auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins can manage escrow" ON dccs_dispute_escrow;
CREATE POLICY "Admins can manage escrow"
ON dccs_dispute_escrow FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- DCCS ROYALTY PAYMENT AUDIT
-- =====================================================

DROP POLICY IF EXISTS "Artists can view their payment audit logs" ON dccs_royalty_payment_audit;
CREATE POLICY "Artists can view their payment audit logs"
ON dccs_royalty_payment_audit FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_royalty_payments
    WHERE dccs_royalty_payments.id = dccs_royalty_payment_audit.payment_id
    AND artist_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON dccs_royalty_payment_audit;
CREATE POLICY "Admins can view all audit logs"
ON dccs_royalty_payment_audit FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);
