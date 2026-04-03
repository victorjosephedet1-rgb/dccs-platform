/*
  # Fix Critical Security Issues - Final

  ## Summary
  Fixes critical security and performance issues:
  1. Add missing foreign key index
  2. Optimize RLS policies to use (select auth.uid())
  3. Fix function search paths
  4. Remove duplicate index
  
  ## Security Impact
  - Improved RLS policy performance at scale
  - Eliminated search_path vulnerabilities in functions
  - Better query performance with proper foreign key indexes
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEX
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_creator_verification_verified_by 
ON creator_verification(verified_by);

-- =====================================================
-- PART 2: FIX RLS POLICIES - VIDEO CONTENT
-- =====================================================

DROP POLICY IF EXISTS "Admins have full access to video content" ON video_content;
CREATE POLICY "Admins have full access to video content"
ON video_content
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Creators can delete their own video content" ON video_content;
CREATE POLICY "Creators can delete their own video content"
ON video_content
FOR DELETE
TO authenticated
USING (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can insert their own video content" ON video_content;
CREATE POLICY "Creators can insert their own video content"
ON video_content
FOR INSERT
TO authenticated
WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can update their own video content" ON video_content;
CREATE POLICY "Creators can update their own video content"
ON video_content
FOR UPDATE
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));

-- =====================================================
-- PART 3: FIX RLS POLICIES - AI GUIDANCE INTERACTIONS
-- =====================================================

DROP POLICY IF EXISTS "Admins have full access to AI guidance interactions" ON ai_guidance_interactions;
CREATE POLICY "Admins have full access to AI guidance interactions"
ON ai_guidance_interactions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can insert their own AI guidance interactions" ON ai_guidance_interactions;
CREATE POLICY "Users can insert their own AI guidance interactions"
ON ai_guidance_interactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own AI guidance feedback" ON ai_guidance_interactions;
CREATE POLICY "Users can update their own AI guidance feedback"
ON ai_guidance_interactions
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own AI guidance interactions" ON ai_guidance_interactions;
CREATE POLICY "Users can view their own AI guidance interactions"
ON ai_guidance_interactions
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 4: FIX RLS POLICIES - CREATOR VERIFICATION
-- =====================================================

DROP POLICY IF EXISTS "Admins have full access to verification" ON creator_verification;
CREATE POLICY "Admins have full access to verification"
ON creator_verification
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can request verification" ON creator_verification;
CREATE POLICY "Users can request verification"
ON creator_verification
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their verification details" ON creator_verification;
CREATE POLICY "Users can update their verification details"
ON creator_verification
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own verification status" ON creator_verification;
CREATE POLICY "Users can view their own verification status"
ON creator_verification
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- PART 5: FIX RLS POLICIES - PODCAST CONTENT
-- =====================================================

DROP POLICY IF EXISTS "Admins have full access to podcast content" ON podcast_content;
CREATE POLICY "Admins have full access to podcast content"
ON podcast_content
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Creators can delete their own podcast content" ON podcast_content;
CREATE POLICY "Creators can delete their own podcast content"
ON podcast_content
FOR DELETE
TO authenticated
USING (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can insert their own podcast content" ON podcast_content;
CREATE POLICY "Creators can insert their own podcast content"
ON podcast_content
FOR INSERT
TO authenticated
WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can update their own podcast content" ON podcast_content;
CREATE POLICY "Creators can update their own podcast content"
ON podcast_content
FOR UPDATE
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));

-- =====================================================
-- PART 6: FIX RLS POLICIES - UNIFIED CONTENT FINGERPRINTS
-- =====================================================

DROP POLICY IF EXISTS "Admins have full access to fingerprints" ON unified_content_fingerprints;
CREATE POLICY "Admins have full access to fingerprints"
ON unified_content_fingerprints
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert fingerprints" ON unified_content_fingerprints;
CREATE POLICY "System can insert fingerprints"
ON unified_content_fingerprints
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role IN ('admin', 'system')
  )
);

DROP POLICY IF EXISTS "Users can update fingerprints for their own content" ON unified_content_fingerprints;
CREATE POLICY "Users can update fingerprints for their own content"
ON unified_content_fingerprints
FOR UPDATE
TO authenticated
USING (
  (content_type = 'audio' AND EXISTS (
    SELECT 1 FROM audio_snippets
    WHERE id = unified_content_fingerprints.content_id
    AND artist_id = (select auth.uid())
  ))
  OR
  (content_type = 'video' AND EXISTS (
    SELECT 1 FROM video_content
    WHERE id = unified_content_fingerprints.content_id
    AND creator_id = (select auth.uid())
  ))
  OR
  (content_type = 'podcast' AND EXISTS (
    SELECT 1 FROM podcast_content
    WHERE id = unified_content_fingerprints.content_id
    AND creator_id = (select auth.uid())
  ))
)
WITH CHECK (
  (content_type = 'audio' AND EXISTS (
    SELECT 1 FROM audio_snippets
    WHERE id = unified_content_fingerprints.content_id
    AND artist_id = (select auth.uid())
  ))
  OR
  (content_type = 'video' AND EXISTS (
    SELECT 1 FROM video_content
    WHERE id = unified_content_fingerprints.content_id
    AND creator_id = (select auth.uid())
  ))
  OR
  (content_type = 'podcast' AND EXISTS (
    SELECT 1 FROM podcast_content
    WHERE id = unified_content_fingerprints.content_id
    AND creator_id = (select auth.uid())
  ))
);

DROP POLICY IF EXISTS "Users can view fingerprints for their own content" ON unified_content_fingerprints;
CREATE POLICY "Users can view fingerprints for their own content"
ON unified_content_fingerprints
FOR SELECT
TO authenticated
USING (
  (content_type = 'audio' AND EXISTS (
    SELECT 1 FROM audio_snippets
    WHERE id = unified_content_fingerprints.content_id
    AND artist_id = (select auth.uid())
  ))
  OR
  (content_type = 'video' AND EXISTS (
    SELECT 1 FROM video_content
    WHERE id = unified_content_fingerprints.content_id
    AND creator_id = (select auth.uid())
  ))
  OR
  (content_type = 'podcast' AND EXISTS (
    SELECT 1 FROM podcast_content
    WHERE id = unified_content_fingerprints.content_id
    AND creator_id = (select auth.uid())
  ))
);

-- =====================================================
-- PART 7: DROP DUPLICATE INDEX
-- =====================================================

DROP INDEX IF EXISTS idx_dccs_certificates_audio_fingerprint;

-- =====================================================
-- PART 8: FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix generate_dccs_certificate_hash
DROP FUNCTION IF EXISTS generate_dccs_certificate_hash(uuid, uuid, text);
CREATE FUNCTION generate_dccs_certificate_hash(
  p_snippet_id uuid,
  p_creator_id uuid,
  p_fingerprint_hash text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_combined_string text;
  v_hash text;
BEGIN
  v_combined_string := p_snippet_id::text || p_creator_id::text || p_fingerprint_hash || now()::text;
  v_hash := encode(digest(v_combined_string, 'sha256'), 'hex');
  RETURN v_hash;
END;
$$;

-- Fix update_unified_fingerprints_updated_at (needs trigger drop/recreate)
DROP TRIGGER IF EXISTS trigger_update_unified_fingerprints_updated_at ON unified_content_fingerprints;
DROP FUNCTION IF EXISTS update_unified_fingerprints_updated_at();
CREATE FUNCTION update_unified_fingerprints_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_unified_fingerprints_updated_at
  BEFORE UPDATE ON unified_content_fingerprints
  FOR EACH ROW
  EXECUTE FUNCTION update_unified_fingerprints_updated_at();

-- Fix calculate_dccs_royalty_split
DROP FUNCTION IF EXISTS calculate_dccs_royalty_split(uuid, numeric);
CREATE FUNCTION calculate_dccs_royalty_split(
  p_certificate_id uuid,
  p_gross_revenue numeric
)
RETURNS TABLE(
  contributor_id uuid,
  contributor_name text,
  split_percentage numeric,
  payout_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.contributor_id,
    p.name as contributor_name,
    sv.split_percentage,
    (p_gross_revenue * sv.split_percentage / 100.0) as payout_amount
  FROM dccs_split_versions sv
  JOIN profiles p ON p.id = sv.contributor_id
  WHERE sv.certificate_id = p_certificate_id
    AND sv.is_active = true
  ORDER BY sv.split_percentage DESC;
END;
$$;

-- Fix process_dccs_royalty_payout
DROP FUNCTION IF EXISTS process_dccs_royalty_payout(text, uuid, numeric, uuid);
CREATE FUNCTION process_dccs_royalty_payout(
  p_clearance_code text,
  p_license_id uuid,
  p_gross_amount numeric,
  p_buyer_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_certificate_id uuid;
  v_artist_id uuid;
  v_platform_fee numeric;
  v_artist_amount numeric;
  v_payout_id uuid;
BEGIN
  SELECT certificate_id, artist_id INTO v_certificate_id, v_artist_id
  FROM dccs_certificates
  WHERE clearance_code = p_clearance_code;
  
  IF v_certificate_id IS NULL THEN
    RAISE EXCEPTION 'Certificate not found for clearance code: %', p_clearance_code;
  END IF;
  
  v_platform_fee := p_gross_amount * 0.20;
  v_artist_amount := p_gross_amount * 0.80;
  
  INSERT INTO dccs_royalty_payments (
    certificate_id,
    clearance_code,
    license_id,
    artist_id,
    buyer_id,
    gross_amount,
    platform_fee,
    artist_amount,
    payment_status,
    period_start,
    period_end
  ) VALUES (
    v_certificate_id,
    p_clearance_code,
    p_license_id,
    v_artist_id,
    p_buyer_id,
    p_gross_amount,
    v_platform_fee,
    v_artist_amount,
    'pending',
    date_trunc('month', CURRENT_DATE),
    date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'
  )
  RETURNING id INTO v_payout_id;
  
  RETURN v_payout_id;
END;
$$;

-- Fix complete_dccs_royalty_payout
DROP FUNCTION IF EXISTS complete_dccs_royalty_payout(uuid, text);
CREATE FUNCTION complete_dccs_royalty_payout(
  p_payout_id uuid,
  p_transaction_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE dccs_royalty_payments
  SET
    payment_status = 'completed',
    blockchain_tx_hash = p_transaction_hash,
    paid_at = now(),
    updated_at = now()
  WHERE id = p_payout_id
    AND payment_status = 'pending';
  
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;
