/*
  # Fix Final Security and Performance Issues

  ## Overview
  Final fixes for security and performance:
  - Missing foreign key indexes (5 tables)
  - RLS policy optimization with profiles table
  - Multiple permissive policy consolidation
  - Function search path security

  ## Changes

  ### 1. Missing Foreign Key Indexes
  - blockchain_transactions.snippet_id
  - content_fingerprints.license_id, track_id
  - platform_usage_tracking.license_id
  - royalty_audit_log.snippet_id

  ### 2. RLS Policies Optimized
  All policies now use (SELECT auth.uid()) and profiles table

  ### 3. Multiple Permissive Policies Fixed
  Separated admin and user policies properly
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_snippet_id 
  ON public.blockchain_transactions(snippet_id);

CREATE INDEX IF NOT EXISTS idx_content_fingerprints_license_id 
  ON public.content_fingerprints(license_id);

CREATE INDEX IF NOT EXISTS idx_content_fingerprints_track_id 
  ON public.content_fingerprints(track_id);

CREATE INDEX IF NOT EXISTS idx_platform_usage_tracking_license_id 
  ON public.platform_usage_tracking(license_id);

CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_snippet_id 
  ON public.royalty_audit_log(snippet_id);

-- =====================================================
-- PART 2: OPTIMIZE RLS POLICIES
-- =====================================================

-- upload_verification
DROP POLICY IF EXISTS "Admins manage verification" ON public.upload_verification;
DROP POLICY IF EXISTS "View upload verification" ON public.upload_verification;
DROP POLICY IF EXISTS "Admins can manage verification" ON public.upload_verification;
DROP POLICY IF EXISTS "Artists can view their verification" ON public.upload_verification;

CREATE POLICY "Admins can manage verification"
  ON public.upload_verification
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view their verification"
  ON public.upload_verification
  FOR SELECT
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

-- platform_usage_detection
DROP POLICY IF EXISTS "Admins manage platform usage" ON public.platform_usage_detection;
DROP POLICY IF EXISTS "View platform usage" ON public.platform_usage_detection;
DROP POLICY IF EXISTS "Admins can manage platform usage" ON public.platform_usage_detection;
DROP POLICY IF EXISTS "Artists can view their platform usage" ON public.platform_usage_detection;

CREATE POLICY "Admins can manage platform usage"
  ON public.platform_usage_detection
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view their platform usage"
  ON public.platform_usage_detection
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.audio_snippets
      WHERE audio_snippets.id = platform_usage_detection.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- audio_fingerprints
DROP POLICY IF EXISTS "Admins manage fingerprints" ON public.audio_fingerprints;
DROP POLICY IF EXISTS "View audio fingerprints" ON public.audio_fingerprints;
DROP POLICY IF EXISTS "Admins can manage fingerprints" ON public.audio_fingerprints;
DROP POLICY IF EXISTS "Artists can view their fingerprints" ON public.audio_fingerprints;

CREATE POLICY "Admins can manage fingerprints"
  ON public.audio_fingerprints
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view their fingerprints"
  ON public.audio_fingerprints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.audio_snippets
      WHERE audio_snippets.id = audio_fingerprints.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- royalty_agreements
DROP POLICY IF EXISTS "Admins manage agreements" ON public.royalty_agreements;
DROP POLICY IF EXISTS "View royalty agreements" ON public.royalty_agreements;
DROP POLICY IF EXISTS "Admins can manage agreements" ON public.royalty_agreements;
DROP POLICY IF EXISTS "Artists can view their agreements" ON public.royalty_agreements;

CREATE POLICY "Admins can manage agreements"
  ON public.royalty_agreements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view their agreements"
  ON public.royalty_agreements
  FOR SELECT
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

-- platform_lifetime_earnings (admin only)
DROP POLICY IF EXISTS "Admins view all lifetime earnings" ON public.platform_lifetime_earnings;
DROP POLICY IF EXISTS "Admins can view lifetime earnings" ON public.platform_lifetime_earnings;

CREATE POLICY "Admins can view lifetime earnings"
  ON public.platform_lifetime_earnings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- royalty_audit_log
DROP POLICY IF EXISTS "Admins manage audit logs" ON public.royalty_audit_log;
DROP POLICY IF EXISTS "View audit logs" ON public.royalty_audit_log;
DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.royalty_audit_log;
DROP POLICY IF EXISTS "Artists can view their audit logs" ON public.royalty_audit_log;

CREATE POLICY "Admins can manage audit logs"
  ON public.royalty_audit_log
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view their audit logs"
  ON public.royalty_audit_log
  FOR SELECT
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

-- platform_revenue
DROP POLICY IF EXISTS "Platform revenue viewable by admins" ON public.platform_revenue;
DROP POLICY IF EXISTS "View platform revenue" ON public.platform_revenue;

CREATE POLICY "View platform revenue"
  ON public.platform_revenue
  FOR SELECT
  TO authenticated
  USING (
    artist_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- content_moderation_flags (no reporter_id column)
DROP POLICY IF EXISTS "Admins manage moderation flags" ON public.content_moderation_flags;
DROP POLICY IF EXISTS "View moderation flags" ON public.content_moderation_flags;
DROP POLICY IF EXISTS "Admins can manage moderation flags" ON public.content_moderation_flags;
DROP POLICY IF EXISTS "Users can view relevant moderation flags" ON public.content_moderation_flags;

CREATE POLICY "Admins can manage moderation flags"
  ON public.content_moderation_flags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Artists can view flags on their content"
  ON public.content_moderation_flags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.audio_snippets
      WHERE audio_snippets.id = content_moderation_flags.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 3: FIX FUNCTION SEARCH PATH
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_content_fingerprint(audio_data BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  fingerprint_hash TEXT;
BEGIN
  fingerprint_hash := encode(digest(audio_data, 'sha256'), 'hex');
  RETURN fingerprint_hash;
END;
$$;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON INDEX public.idx_blockchain_transactions_snippet_id IS 
  'Foreign key index for performance optimization';
COMMENT ON INDEX public.idx_content_fingerprints_license_id IS 
  'Foreign key index for performance optimization';
COMMENT ON INDEX public.idx_content_fingerprints_track_id IS 
  'Foreign key index for performance optimization';
COMMENT ON INDEX public.idx_platform_usage_tracking_license_id IS 
  'Foreign key index for performance optimization';
COMMENT ON INDEX public.idx_royalty_audit_log_snippet_id IS 
  'Foreign key index for performance optimization';
