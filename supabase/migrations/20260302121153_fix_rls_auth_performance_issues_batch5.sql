/*
  # Fix RLS Auth Performance Issues - Batch 5

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - Fixes policies for creator verification and podcast content

  2. Policies Updated
    - creator_verification: "Users and admins can insert/update/view verification"
    - podcast_content: "Admins and creators can manage podcast content", "Anyone can view active podcasts"
    - unified_content_fingerprints: "Admins and owners can update/view fingerprints", "Admins and system can insert fingerprints"
*/

-- creator_verification: Users and admins can insert verification
DROP POLICY IF EXISTS "Users and admins can insert verification" ON creator_verification;
CREATE POLICY "Users and admins can insert verification"
ON creator_verification FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- creator_verification: Users and admins can update verification
DROP POLICY IF EXISTS "Users and admins can update verification" ON creator_verification;
CREATE POLICY "Users and admins can update verification"
ON creator_verification FOR UPDATE
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- creator_verification: Users and admins can view verification
DROP POLICY IF EXISTS "Users and admins can view verification" ON creator_verification;
CREATE POLICY "Users and admins can view verification"
ON creator_verification FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- podcast_content: Admins and creators can manage podcast content
DROP POLICY IF EXISTS "Admins and creators can manage podcast content" ON podcast_content;
CREATE POLICY "Admins and creators can manage podcast content"
ON podcast_content FOR ALL
TO authenticated
USING (
  creator_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  creator_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- podcast_content: Anyone can view active podcasts
DROP POLICY IF EXISTS "Anyone can view active podcasts" ON podcast_content;
CREATE POLICY "Anyone can view active podcasts"
ON podcast_content FOR SELECT
TO authenticated
USING (
  is_active = true
  OR creator_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- unified_content_fingerprints: Admins and owners can update fingerprints
DROP POLICY IF EXISTS "Admins and owners can update fingerprints" ON unified_content_fingerprints;
CREATE POLICY "Admins and owners can update fingerprints"
ON unified_content_fingerprints FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = unified_content_fingerprints.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- unified_content_fingerprints: Admins and owners can view fingerprints
DROP POLICY IF EXISTS "Admins and owners can view fingerprints" ON unified_content_fingerprints;
CREATE POLICY "Admins and owners can view fingerprints"
ON unified_content_fingerprints FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = unified_content_fingerprints.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- unified_content_fingerprints: Admins and system can insert fingerprints
DROP POLICY IF EXISTS "Admins and system can insert fingerprints" ON unified_content_fingerprints;
CREATE POLICY "Admins and system can insert fingerprints"
ON unified_content_fingerprints FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);
