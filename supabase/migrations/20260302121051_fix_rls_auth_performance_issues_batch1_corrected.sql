/*
  # Fix RLS Auth Performance Issues - Batch 1 (Corrected)

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - Fixes suboptimal query performance by preventing re-evaluation for each row
    - Uses correct column name is_active instead of is_public

  2. Policies Updated
    - audio_packs: "Anyone can view public packs", "Creators can insert packs"
    - pack_assets: "Pack creators can manage assets"
    - pack_purchases: "Users and pack creators can view purchases", "Users can insert own purchases"
    - royalty_payments: "Recipients can view payments"
    - dccs_ai_training_consent: "Creators can view and manage consent"
*/

-- audio_packs: Anyone can view public packs
DROP POLICY IF EXISTS "Anyone can view public packs" ON audio_packs;
CREATE POLICY "Anyone can view public packs"
ON audio_packs FOR SELECT
TO authenticated
USING (
  is_active = true
  OR creator_id = (select auth.uid())
);

-- audio_packs: Creators can insert packs
DROP POLICY IF EXISTS "Creators can insert packs" ON audio_packs;
CREATE POLICY "Creators can insert packs"
ON audio_packs FOR INSERT
TO authenticated
WITH CHECK (creator_id = (select auth.uid()));

-- pack_assets: Pack creators can manage assets
DROP POLICY IF EXISTS "Pack creators can manage assets" ON pack_assets;
CREATE POLICY "Pack creators can manage assets"
ON pack_assets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM audio_packs
    WHERE audio_packs.id = pack_assets.pack_id
    AND audio_packs.creator_id = (select auth.uid())
  )
);

-- pack_purchases: Users and pack creators can view purchases
DROP POLICY IF EXISTS "Users and pack creators can view purchases" ON pack_purchases;
CREATE POLICY "Users and pack creators can view purchases"
ON pack_purchases FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM audio_packs
    WHERE audio_packs.id = pack_purchases.pack_id
    AND audio_packs.creator_id = (select auth.uid())
  )
);

-- pack_purchases: Users can insert own purchases
DROP POLICY IF EXISTS "Users can insert own purchases" ON pack_purchases;
CREATE POLICY "Users can insert own purchases"
ON pack_purchases FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

-- royalty_payments: Recipients can view payments
DROP POLICY IF EXISTS "Recipients can view payments" ON royalty_payments;
CREATE POLICY "Recipients can view payments"
ON royalty_payments FOR SELECT
TO authenticated
USING (recipient_id = (select auth.uid()));

-- dccs_ai_training_consent: Creators can view and manage consent
DROP POLICY IF EXISTS "Creators can view and manage consent" ON dccs_ai_training_consent;
CREATE POLICY "Creators can view and manage consent"
ON dccs_ai_training_consent FOR ALL
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));
