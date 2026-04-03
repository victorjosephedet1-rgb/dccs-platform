/*
  # Fix Security and Performance Issues

  1. Add Missing Foreign Key Indexes
    - Add indexes for all unindexed foreign keys to improve query performance
    
  2. Optimize RLS Policies
    - Replace auth.uid() with (SELECT auth.uid()) for better performance
    - This prevents re-evaluation for each row
    
  3. Add Missing RLS Policies
    - Add policies for content_moderation_flags
    - Add policies for dmca_notices
    
  4. Fix Multiple Permissive Policies
    - Combine duplicate policies into single policies
    
  5. Fix Function Search Path
    - Set search_path for create_audit_log function
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_reviewed_by 
  ON content_moderation_flags(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_claimant_id 
  ON copyright_claims(claimant_id);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_resolved_by 
  ON copyright_claims(resolved_by);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_respondent_id 
  ON copyright_claims(respondent_id);

CREATE INDEX IF NOT EXISTS idx_dmca_notices_reviewed_by 
  ON dmca_notices(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_processed_by 
  ON gdpr_requests(processed_by);

CREATE INDEX IF NOT EXISTS idx_legal_agreements_created_by 
  ON legal_agreements(created_by);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_license_agreement_id 
  ON licensing_terms(license_agreement_id);

CREATE INDEX IF NOT EXISTS idx_royalty_splits_booking_id 
  ON royalty_splits(booking_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (SELECT auth.uid())
-- ============================================================================

-- user_agreement_acceptances policies
DROP POLICY IF EXISTS "Users can view own agreement acceptances" ON user_agreement_acceptances;
CREATE POLICY "Users can view own agreement acceptances"
  ON user_agreement_acceptances FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can accept agreements" ON user_agreement_acceptances;
CREATE POLICY "Users can accept agreements"
  ON user_agreement_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- kyc_verifications policies
DROP POLICY IF EXISTS "Users can view own KYC status" ON kyc_verifications;
CREATE POLICY "Users can view own KYC status"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- licensing_terms policies
DROP POLICY IF EXISTS "Users can view their licenses" ON licensing_terms;
CREATE POLICY "Users can view their licenses"
  ON licensing_terms FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = licensing_terms.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- isrc_metadata policies
DROP POLICY IF EXISTS "Artists can manage own ISRC metadata" ON isrc_metadata;
CREATE POLICY "Artists can manage own ISRC metadata"
  ON isrc_metadata FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = isrc_metadata.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- copyright_claims policies
DROP POLICY IF EXISTS "Users can view their copyright claims" ON copyright_claims;
CREATE POLICY "Users can view their copyright claims"
  ON copyright_claims FOR SELECT
  TO authenticated
  USING (
    claimant_id = (SELECT auth.uid())
    OR respondent_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can create copyright claims" ON copyright_claims;
CREATE POLICY "Users can create copyright claims"
  ON copyright_claims FOR INSERT
  TO authenticated
  WITH CHECK (claimant_id = (SELECT auth.uid()));

-- gdpr_requests policies
DROP POLICY IF EXISTS "Users can manage own GDPR requests" ON gdpr_requests;
CREATE POLICY "Users can manage own GDPR requests"
  ON gdpr_requests FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- profile_galleries policies
DROP POLICY IF EXISTS "Users can view their own gallery images" ON profile_galleries;
CREATE POLICY "Users can view their own gallery images"
  ON profile_galleries FOR SELECT
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_galleries.profile_id
      AND profiles.is_profile_public = true
    )
  );

DROP POLICY IF EXISTS "Users can insert their own gallery images" ON profile_galleries;
CREATE POLICY "Users can insert their own gallery images"
  ON profile_galleries FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own gallery images" ON profile_galleries;
CREATE POLICY "Users can update their own gallery images"
  ON profile_galleries FOR UPDATE
  TO authenticated
  USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own gallery images" ON profile_galleries;
CREATE POLICY "Users can delete their own gallery images"
  ON profile_galleries FOR DELETE
  TO authenticated
  USING (profile_id = (SELECT auth.uid()));

-- profile_videos policies
DROP POLICY IF EXISTS "Users can view their own videos" ON profile_videos;
CREATE POLICY "Users can view their own videos"
  ON profile_videos FOR SELECT
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_videos.profile_id
      AND profiles.is_profile_public = true
    )
  );

DROP POLICY IF EXISTS "Users can insert their own videos" ON profile_videos;
CREATE POLICY "Users can insert their own videos"
  ON profile_videos FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own videos" ON profile_videos;
CREATE POLICY "Users can update their own videos"
  ON profile_videos FOR UPDATE
  TO authenticated
  USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own videos" ON profile_videos;
CREATE POLICY "Users can delete their own videos"
  ON profile_videos FOR DELETE
  TO authenticated
  USING (profile_id = (SELECT auth.uid()));

-- ============================================================================
-- 3. FIX MULTIPLE PERMISSIVE POLICIES - Combine into single policies
-- ============================================================================

-- artist_tips - combine two SELECT policies
DROP POLICY IF EXISTS "Artists can view tips received" ON artist_tips;
DROP POLICY IF EXISTS "Users can view tips they sent" ON artist_tips;
CREATE POLICY "Users can view related tips"
  ON artist_tips FOR SELECT
  TO authenticated
  USING (
    to_artist_id = (SELECT auth.uid())
    OR from_user_id = (SELECT auth.uid())
  );

-- bookings - combine two SELECT policies
DROP POLICY IF EXISTS "Artists can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can view own bookings" ON bookings;
CREATE POLICY "Users can view related bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    artist_id = (SELECT auth.uid())
    OR client_id = (SELECT auth.uid())
  );

-- event_tickets - combine two SELECT policies
DROP POLICY IF EXISTS "Artists can view event tickets" ON event_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON event_tickets;
CREATE POLICY "Users can view related tickets"
  ON event_tickets FOR SELECT
  TO authenticated
  USING (
    artist_id = (SELECT auth.uid())
    OR buyer_id = (SELECT auth.uid())
  );

-- premium_subscriptions - combine two SELECT policies
DROP POLICY IF EXISTS "Artists can view their subscriber list" ON premium_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can view related subscriptions"
  ON premium_subscriptions FOR SELECT
  TO authenticated
  USING (
    artist_id = (SELECT auth.uid())
    OR subscriber_id = (SELECT auth.uid())
  );

-- profile_galleries - already fixed above (combined with public view)
DROP POLICY IF EXISTS "Users can view gallery images from public profiles" ON profile_galleries;

-- profile_videos - already fixed above (combined with public view)
DROP POLICY IF EXISTS "Users can view videos from public profiles" ON profile_videos;

-- ============================================================================
-- 4. ADD MISSING RLS POLICIES
-- ============================================================================

-- content_moderation_flags policies
CREATE POLICY "Artists can view flags on their content"
  ON content_moderation_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = content_moderation_flags.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can manage all moderation flags"
  ON content_moderation_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- dmca_notices policies
CREATE POLICY "Only admins can manage DMCA notices"
  ON dmca_notices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 5. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Recreate create_audit_log function with search_path set
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
SET search_path = public
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