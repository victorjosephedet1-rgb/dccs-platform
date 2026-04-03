/*
  # Fix RLS Auth Performance Issues - Batch 4 (Corrected)

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - Fixes policies for DCCS certificates and content
    - Uses correct column name is_active instead of status

  2. Policies Updated
    - dccs_certificates: "Creators can update own certificates"
    - snippet_licenses: "Users and creators can view licenses"
    - audio_snippets: "Anyone can view available snippets"
    - video_content: "Admins and creators can manage video content", "Anyone can view active videos"
    - ai_guidance_interactions: "Users and admins can insert/update/view interactions"
*/

-- dccs_certificates: Creators can update own certificates
DROP POLICY IF EXISTS "Creators can update own certificates" ON dccs_certificates;
CREATE POLICY "Creators can update own certificates"
ON dccs_certificates FOR UPDATE
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));

-- snippet_licenses: Users and creators can view licenses
DROP POLICY IF EXISTS "Users and creators can view licenses" ON snippet_licenses;
CREATE POLICY "Users and creators can view licenses"
ON snippet_licenses FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM audio_snippets
    WHERE audio_snippets.id = snippet_licenses.snippet_id
    AND audio_snippets.artist_id = (select auth.uid())
  )
);

-- audio_snippets: Anyone can view available snippets
DROP POLICY IF EXISTS "Anyone can view available snippets" ON audio_snippets;
CREATE POLICY "Anyone can view available snippets"
ON audio_snippets FOR SELECT
TO authenticated
USING (
  is_active = true
  OR artist_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- video_content: Admins and creators can manage video content
DROP POLICY IF EXISTS "Admins and creators can manage video content" ON video_content;
CREATE POLICY "Admins and creators can manage video content"
ON video_content FOR ALL
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

-- video_content: Anyone can view active videos
DROP POLICY IF EXISTS "Anyone can view active videos" ON video_content;
CREATE POLICY "Anyone can view active videos"
ON video_content FOR SELECT
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

-- ai_guidance_interactions: Users and admins can insert interactions
DROP POLICY IF EXISTS "Users and admins can insert interactions" ON ai_guidance_interactions;
CREATE POLICY "Users and admins can insert interactions"
ON ai_guidance_interactions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- ai_guidance_interactions: Users and admins can update interactions
DROP POLICY IF EXISTS "Users and admins can update interactions" ON ai_guidance_interactions;
CREATE POLICY "Users and admins can update interactions"
ON ai_guidance_interactions FOR UPDATE
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- ai_guidance_interactions: Users and admins can view interactions
DROP POLICY IF EXISTS "Users and admins can view interactions" ON ai_guidance_interactions;
CREATE POLICY "Users and admins can view interactions"
ON ai_guidance_interactions FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);
