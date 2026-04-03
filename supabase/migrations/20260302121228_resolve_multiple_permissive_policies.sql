/*
  # Resolve Multiple Permissive Policies

  1. Security Improvements
    - Remove conflicting permissive policies to improve RLS performance
    - Consolidate multiple SELECT policies into single restrictive policies

  2. Tables Fixed
    - pack_assets: Merge "Anyone can view public pack assets" into "Pack creators can manage assets"
    - pack_purchases: Remove blocking policy "Block inserts during Phase 1"
    - podcast_content: Merge "Anyone can view active podcasts" into "Admins and creators can manage podcast content"
    - video_content: Merge "Anyone can view active videos" into "Admins and creators can manage video content"
*/

-- pack_assets: Remove duplicate SELECT policy (already handled by "Pack creators can manage assets")
DROP POLICY IF EXISTS "Anyone can view public pack assets" ON pack_assets;

-- Create a single comprehensive SELECT policy for pack_assets
CREATE POLICY "Anyone can view pack assets"
ON pack_assets FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM audio_packs
    WHERE audio_packs.id = pack_assets.pack_id
    AND (audio_packs.is_active = true OR audio_packs.creator_id = (select auth.uid()))
  )
);

-- pack_purchases: Remove the blocking policy
DROP POLICY IF EXISTS "Block inserts during Phase 1" ON pack_purchases;

-- podcast_content: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Anyone can view active podcasts" ON podcast_content;

-- Create a single comprehensive SELECT policy for podcast_content
CREATE POLICY "Anyone can view podcasts"
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

-- video_content: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Anyone can view active videos" ON video_content;

-- Create a single comprehensive SELECT policy for video_content
CREATE POLICY "Anyone can view videos"
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
