/*
  # Fix Security Issues - Part 1: Indexes and Critical RLS

  ## 1. Unindexed Foreign Keys
  Adds missing indexes on foreign key columns to improve query performance

  ## 2. Critical RLS Optimizations
  Optimizes high-traffic RLS policies by wrapping auth.uid() in SELECT

  ## Priority
  - Performance degradation at scale
  - Query optimization
*/

-- =====================================================
-- SECTION 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_audio_snippets_exclusivity_decl 
ON audio_snippets(exclusivity_declaration_id) 
WHERE exclusivity_declaration_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_resolved_by 
ON dccs_dispute_cases(resolved_by) 
WHERE resolved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_released_by 
ON dccs_dispute_escrow(released_by_admin_id) 
WHERE released_by_admin_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_royalty_audit_changed_by 
ON dccs_royalty_payment_audit(changed_by) 
WHERE changed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_changed_by 
ON dccs_split_versions(changed_by) 
WHERE changed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_locked_by 
ON dccs_split_versions(locked_by) 
WHERE locked_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_buyer 
ON dccs_whitelist_evidence(buyer_id) 
WHERE buyer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reported_by 
ON exclusivity_violations(reported_by) 
WHERE reported_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reviewed_by 
ON exclusivity_violations(reviewed_by) 
WHERE reviewed_by IS NOT NULL;

-- =====================================================
-- SECTION 2: FIX STRIPE TABLE RLS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
ON stripe_customers FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
ON stripe_subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stripe_customers
    WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id
    AND stripe_customers.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
ON stripe_orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stripe_customers
    WHERE stripe_customers.customer_id = stripe_orders.customer_id
    AND stripe_customers.user_id = (select auth.uid())
  )
);

-- =====================================================
-- SECTION 3: FIX DCCS CERTIFICATE RLS
-- =====================================================

DROP POLICY IF EXISTS "Creators can create certificates" ON dccs_certificates;
CREATE POLICY "Creators can create certificates"
ON dccs_certificates FOR INSERT
TO authenticated
WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can update their certificates" ON dccs_certificates;
CREATE POLICY "Creators can update their certificates"
ON dccs_certificates FOR UPDATE
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can view their own certificates" ON dccs_certificates;
CREATE POLICY "Creators can view their own certificates"
ON dccs_certificates FOR SELECT
TO authenticated
USING (creator_id = (select auth.uid()));

-- =====================================================
-- SECTION 4: FIX DCCS ROYALTY PAYMENT RLS
-- =====================================================

DROP POLICY IF EXISTS "Artists can view their DCCS royalty payments" ON dccs_royalty_payments;
CREATE POLICY "Artists can view their DCCS royalty payments"
ON dccs_royalty_payments FOR SELECT
TO authenticated
USING (artist_id = (select auth.uid()));

DROP POLICY IF EXISTS "Buyers can view DCCS royalty data for their content" ON dccs_royalty_payments;
CREATE POLICY "Buyers can view DCCS royalty data for their content"
ON dccs_royalty_payments FOR SELECT
TO authenticated
USING (buyer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can insert DCCS royalty payments" ON dccs_royalty_payments;
CREATE POLICY "Admins can insert DCCS royalty payments"
ON dccs_royalty_payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update DCCS royalty payments" ON dccs_royalty_payments;
CREATE POLICY "Admins can update DCCS royalty payments"
ON dccs_royalty_payments FOR UPDATE
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
-- SECTION 5: FIX DCCS DISPUTE RLS
-- =====================================================

DROP POLICY IF EXISTS "Users can create dispute cases" ON dccs_dispute_cases;
CREATE POLICY "Users can create dispute cases"
ON dccs_dispute_cases FOR INSERT
TO authenticated
WITH CHECK (claimant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Dispute parties can view their cases" ON dccs_dispute_cases;
CREATE POLICY "Dispute parties can view their cases"
ON dccs_dispute_cases FOR SELECT
TO authenticated
USING (
  claimant_id = (select auth.uid()) OR 
  respondent_id = (select auth.uid())
);

DROP POLICY IF EXISTS "Dispute parties can update their cases" ON dccs_dispute_cases;
CREATE POLICY "Dispute parties can update their cases"
ON dccs_dispute_cases FOR UPDATE
TO authenticated
USING (
  claimant_id = (select auth.uid()) OR 
  respondent_id = (select auth.uid())
)
WITH CHECK (
  claimant_id = (select auth.uid()) OR 
  respondent_id = (select auth.uid())
);

-- ANALYZE updated tables
ANALYZE audio_snippets;
ANALYZE dccs_dispute_cases;
ANALYZE dccs_dispute_escrow;
ANALYZE dccs_royalty_payment_audit;
ANALYZE dccs_split_versions;
ANALYZE dccs_whitelist_evidence;
ANALYZE exclusivity_violations;
ANALYZE dccs_royalty_payments;
ANALYZE dccs_certificates;
