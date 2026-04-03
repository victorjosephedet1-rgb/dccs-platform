/*
  # Fix Multiple Permissive RLS Policies - Batch 7
  
  1. Changes
    - Consolidates policies for podcast_content (all operations)
    - Consolidates policies for royalty_payments
    - Consolidates policies for snippet_licenses
  
  2. Security
    - Replaces multiple permissive policies with single policies
*/

-- Fix podcast_content DELETE policies
DROP POLICY IF EXISTS "Admins have full access to podcast content" ON podcast_content;
DROP POLICY IF EXISTS "Creators can delete their own podcast content" ON podcast_content;
DROP POLICY IF EXISTS "Creators can insert their own podcast content" ON podcast_content;
DROP POLICY IF EXISTS "Anyone can view active podcast content" ON podcast_content;
DROP POLICY IF EXISTS "Creators can update their own podcast content" ON podcast_content;

CREATE POLICY "Admins and creators can manage podcast content"
  ON podcast_content
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Anyone can view active podcasts"
  ON podcast_content
  FOR SELECT
  TO authenticated
  USING (
    is_active = true OR
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fix royalty_payments policies
DROP POLICY IF EXISTS "Recipients can view their payments" ON royalty_payments;
DROP POLICY IF EXISTS royalty_payments_recipient_read ON royalty_payments;

CREATE POLICY "Recipients can view payments"
  ON royalty_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Fix snippet_licenses policies
DROP POLICY IF EXISTS licenses_creator_select ON snippet_licenses;
DROP POLICY IF EXISTS licenses_user_select ON snippet_licenses;

CREATE POLICY "Users and creators can view licenses"
  ON snippet_licenses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_licenses.snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );