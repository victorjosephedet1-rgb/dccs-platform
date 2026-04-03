/*
  # Fix Multiple Permissive Policies (Final Fix)

  1. Security Improvements
    - Consolidate multiple permissive SELECT policies
    - Uses correct column names: creator_id

  2. Changes
    - Replace multiple permissive policies with single combined policy
*/

-- pack_assets: consolidate two SELECT policies
DROP POLICY IF EXISTS "Anyone can view pack assets" ON public.pack_assets;
DROP POLICY IF EXISTS "Pack creators can manage assets" ON public.pack_assets;
DROP POLICY IF EXISTS "Users can view pack assets" ON public.pack_assets;
DROP POLICY IF EXISTS "Pack creators can manage their assets" ON public.pack_assets;

CREATE POLICY "Users can view pack assets"
  ON public.pack_assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pack creators can manage their assets"
  ON public.pack_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = (select auth.uid())
    )
  );

-- podcast_content: consolidate two SELECT policies
DROP POLICY IF EXISTS "Anyone can view podcasts" ON public.podcast_content;
DROP POLICY IF EXISTS "Admins and creators can manage podcast content" ON public.podcast_content;
DROP POLICY IF EXISTS "Users can view podcast content" ON public.podcast_content;
DROP POLICY IF EXISTS "Creators and admins can manage podcasts" ON public.podcast_content;

CREATE POLICY "Users can view podcast content"
  ON public.podcast_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators and admins can manage podcasts"
  ON public.podcast_content
  FOR ALL
  TO authenticated
  USING (
    creator_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    creator_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- video_content: consolidate two SELECT policies
DROP POLICY IF EXISTS "Anyone can view videos" ON public.video_content;
DROP POLICY IF EXISTS "Admins and creators can manage video content" ON public.video_content;
DROP POLICY IF EXISTS "Users can view video content" ON public.video_content;
DROP POLICY IF EXISTS "Creators and admins can manage videos" ON public.video_content;

CREATE POLICY "Users can view video content"
  ON public.video_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators and admins can manage videos"
  ON public.video_content
  FOR ALL
  TO authenticated
  USING (
    creator_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    creator_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );