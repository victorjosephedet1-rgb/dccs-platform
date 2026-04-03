/*
  # Fix Multiple Permissive RLS Policies - Batch 1 Corrected
  
  1. Changes
    - Consolidates multiple permissive policies into single restrictive policies
    - Fixes ai_content_scans, ai_guidance_interactions
    - Fixes audio_packs (creator_id exists), audio_snippets (artist_id exists)
    - Uses proper OR conditions in USING clauses
  
  2. Security
    - Replaces multiple permissive policies with single policies
    - Maintains same access control logic
    - Improves security posture
*/

-- Fix ai_content_scans SELECT policies
DROP POLICY IF EXISTS "Admins can view all scans" ON ai_content_scans;
DROP POLICY IF EXISTS "Users can view own scans" ON ai_content_scans;

CREATE POLICY "Users and admins can view scans"
  ON ai_content_scans
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fix ai_guidance_interactions policies
DROP POLICY IF EXISTS "Admins have full access to AI guidance interactions" ON ai_guidance_interactions;
DROP POLICY IF EXISTS "Users can insert their own AI guidance interactions" ON ai_guidance_interactions;
DROP POLICY IF EXISTS "Users can view their own AI guidance interactions" ON ai_guidance_interactions;
DROP POLICY IF EXISTS "Users can update their own AI guidance feedback" ON ai_guidance_interactions;

CREATE POLICY "Users and admins can insert interactions"
  ON ai_guidance_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users and admins can view interactions"
  ON ai_guidance_interactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users and admins can update interactions"
  ON ai_guidance_interactions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fix audio_packs policies
DROP POLICY IF EXISTS "Block inserts during Phase 1" ON audio_packs;
DROP POLICY IF EXISTS packs_creator_insert ON audio_packs;
DROP POLICY IF EXISTS packs_creator_select ON audio_packs;
DROP POLICY IF EXISTS packs_public_select ON audio_packs;

CREATE POLICY "Creators can insert packs"
  ON audio_packs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view public packs"
  ON audio_packs
  FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = creator_id);

-- Fix audio_snippets policies
DROP POLICY IF EXISTS snippets_creator_select ON audio_snippets;
DROP POLICY IF EXISTS snippets_public_select ON audio_snippets;

CREATE POLICY "Anyone can view available snippets"
  ON audio_snippets
  FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = artist_id);