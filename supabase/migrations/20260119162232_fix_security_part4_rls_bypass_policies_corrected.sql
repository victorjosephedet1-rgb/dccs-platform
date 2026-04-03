/*
  # Fix Security Issues - Part 4: RLS Policies That Bypass Security (Corrected)

  ## RLS Policy Security Fixes
  Removes or restricts "always true" policies that effectively bypass row-level security
  
  ## Tables Updated
  - audit_logs - restrict to service_role only
  - blockchain_transactions - restrict to service_role only  
  - dccs_verification_logs - require valid data
  - notifications - restrict to service_role only
  - platform_usage_tracking - restrict to service_role only
  
  ## Security Impact
  - Prevents unauthorized data insertion
  - Enforces data validation requirements
  - Restricts system tables to service role only
*/

-- =====================================================
-- AUDIT LOGS - Service Role Only
-- =====================================================

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- =====================================================
-- BLOCKCHAIN TRANSACTIONS - Service Role Only
-- =====================================================

DROP POLICY IF EXISTS "System can insert blockchain transactions" ON blockchain_transactions;
CREATE POLICY "System can insert blockchain transactions"
ON blockchain_transactions FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can update blockchain transactions" ON blockchain_transactions;
CREATE POLICY "System can update blockchain transactions"
ON blockchain_transactions FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- DCCS VERIFICATION LOGS - Require Valid Data
-- =====================================================

DROP POLICY IF EXISTS "Anyone can log verification attempts" ON dccs_verification_logs;
CREATE POLICY "Public can log verification attempts"
ON dccs_verification_logs FOR INSERT
TO anon, authenticated
WITH CHECK (
  certificate_id IS NOT NULL 
  AND verification_result IS NOT NULL
);

-- =====================================================
-- NOTIFICATIONS - Service Role Only
-- =====================================================

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- =====================================================
-- PLATFORM USAGE TRACKING - Service Role Only
-- =====================================================

DROP POLICY IF EXISTS "System can insert usage tracking" ON platform_usage_tracking;
CREATE POLICY "System can insert usage tracking"
ON platform_usage_tracking FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "System can update usage tracking" ON platform_usage_tracking;
CREATE POLICY "System can update usage tracking"
ON platform_usage_tracking FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- ANALYZE AFFECTED TABLES
-- =====================================================

ANALYZE audit_logs;
ANALYZE blockchain_transactions;
ANALYZE dccs_verification_logs;
ANALYZE notifications;
ANALYZE platform_usage_tracking;
