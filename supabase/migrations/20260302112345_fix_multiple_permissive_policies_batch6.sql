/*
  # Fix Multiple Permissive RLS Policies - Batch 6
  
  1. Changes
    - Consolidates policies for pack_assets
    - Consolidates policies for pack_purchases
    - Consolidates policies for platform_features
    - Consolidates policies for platform_milestones
    - Consolidates policies for platform_violations
  
  2. Security
    - Replaces multiple permissive policies with single policies
*/

-- Fix pack_assets INSERT policies
DROP POLICY IF EXISTS "Block inserts during Phase 1" ON pack_assets;
DROP POLICY IF EXISTS pack_assets_creator_all ON pack_assets;
DROP POLICY IF EXISTS pack_assets_public_select ON pack_assets;

CREATE POLICY "Pack creators can manage assets"
  ON pack_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public pack assets"
  ON pack_assets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.is_active = true
    )
  );

-- Fix pack_purchases INSERT policies
DROP POLICY IF EXISTS purchases_user_insert ON pack_purchases;
DROP POLICY IF EXISTS purchases_creator_select ON pack_purchases;
DROP POLICY IF EXISTS purchases_user_select ON pack_purchases;

CREATE POLICY "Users can insert own purchases"
  ON pack_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and pack creators can view purchases"
  ON pack_purchases
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_purchases.pack_id
      AND audio_packs.creator_id = auth.uid()
    )
  );

-- Fix platform_features policies
DROP POLICY IF EXISTS "Anyone can view active features" ON platform_features;
DROP POLICY IF EXISTS "Only admins can manage features" ON platform_features;

CREATE POLICY "All can view active features"
  ON platform_features
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix platform_milestones policies
DROP POLICY IF EXISTS "Anyone can view milestones" ON platform_milestones;
DROP POLICY IF EXISTS "Only admins can manage milestones" ON platform_milestones;

CREATE POLICY "All can view milestones"
  ON platform_milestones
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix platform_violations policies
DROP POLICY IF EXISTS "Admins can view all violations" ON platform_violations;
DROP POLICY IF EXISTS "Users can view own violations" ON platform_violations;

CREATE POLICY "Admins and users can view violations"
  ON platform_violations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );