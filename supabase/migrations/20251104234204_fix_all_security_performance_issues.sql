/*
  # Fix All Security and Performance Issues

  1. Add Missing Foreign Key Indexes
    - Improves query performance for foreign key lookups
    - Prevents table scans on joins
  
  2. Optimize RLS Policies
    - Replace auth.uid() with (select auth.uid())
    - Prevents re-evaluation for each row
    - Massive performance improvement at scale
  
  3. Fix Function Search Paths
    - Set secure search_path for all functions
    - Prevents schema hijacking attacks
  
  4. Remove Unused Indexes
    - Reduces storage and write overhead
*/

-- ============================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ============================================

-- content_usage_tracking
CREATE INDEX IF NOT EXISTS content_usage_tracking_license_id_idx 
  ON content_usage_tracking(license_id);

-- digital_clearance_codes
CREATE INDEX IF NOT EXISTS digital_clearance_codes_track_id_idx 
  ON digital_clearance_codes(track_id);

-- hybrid_payouts
CREATE INDEX IF NOT EXISTS hybrid_payouts_license_id_idx_new 
  ON hybrid_payouts(license_id);

CREATE INDEX IF NOT EXISTS hybrid_payouts_royalty_calculation_id_idx 
  ON hybrid_payouts(royalty_calculation_id);

-- ongoing_royalty_payments
CREATE INDEX IF NOT EXISTS ongoing_royalty_payments_clearance_code_idx 
  ON ongoing_royalty_payments(clearance_code);

CREATE INDEX IF NOT EXISTS ongoing_royalty_payments_license_id_idx 
  ON ongoing_royalty_payments(license_id);

-- ============================================
-- PART 2: OPTIMIZE RLS POLICIES (Performance)
-- ============================================

-- Drop and recreate policies with optimized auth checks

-- audio_packs policies
DROP POLICY IF EXISTS "Creators can delete own packs" ON audio_packs;
CREATE POLICY "Creators can delete own packs"
  ON audio_packs FOR DELETE TO authenticated
  USING ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can view own packs" ON audio_packs;
CREATE POLICY "Creators can view own packs"
  ON audio_packs FOR SELECT TO authenticated
  USING ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can create packs" ON audio_packs;
CREATE POLICY "Creators can create packs"
  ON audio_packs FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can update own packs" ON audio_packs;
CREATE POLICY "Creators can update own packs"
  ON audio_packs FOR UPDATE TO authenticated
  USING ((select auth.uid()) = creator_id)
  WITH CHECK ((select auth.uid()) = creator_id);

-- pack_assets policies
DROP POLICY IF EXISTS "Creators can insert pack assets" ON pack_assets;
CREATE POLICY "Creators can insert pack assets"
  ON pack_assets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators can update pack assets" ON pack_assets;
CREATE POLICY "Creators can update pack assets"
  ON pack_assets FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators can delete pack assets" ON pack_assets;
CREATE POLICY "Creators can delete pack assets"
  ON pack_assets FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = (select auth.uid())
    )
  );

-- pack_purchases policies
DROP POLICY IF EXISTS "Users can view own pack purchases" ON pack_purchases;
CREATE POLICY "Users can view own pack purchases"
  ON pack_purchases FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own pack purchases" ON pack_purchases;
CREATE POLICY "Users can insert own pack purchases"
  ON pack_purchases FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Creators can view purchases of their packs" ON pack_purchases;
CREATE POLICY "Creators can view purchases of their packs"
  ON pack_purchases FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_purchases.pack_id
      AND audio_packs.creator_id = (select auth.uid())
    )
  );

-- track_licenses policies
DROP POLICY IF EXISTS "Buyers can view their own licenses" ON track_licenses;
CREATE POLICY "Buyers can view their own licenses"
  ON track_licenses FOR SELECT TO authenticated
  USING ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Artists can view licenses for their tracks" ON track_licenses;
CREATE POLICY "Artists can view licenses for their tracks"
  ON track_licenses FOR SELECT TO authenticated
  USING ((select auth.uid()) = artist_id);

DROP POLICY IF EXISTS "Buyers can update download count" ON track_licenses;
CREATE POLICY "Buyers can update download count"
  ON track_licenses FOR UPDATE TO authenticated
  USING ((select auth.uid()) = buyer_id)
  WITH CHECK ((select auth.uid()) = buyer_id);

-- instant_payouts policies
DROP POLICY IF EXISTS "Artists can view their own payouts" ON instant_payouts;
CREATE POLICY "Artists can view their own payouts"
  ON instant_payouts FOR SELECT TO authenticated
  USING ((select auth.uid()) = artist_id);

-- digital_clearance_codes policies
DROP POLICY IF EXISTS "Buyers can view their clearance codes" ON digital_clearance_codes;
CREATE POLICY "Buyers can view their clearance codes"
  ON digital_clearance_codes FOR SELECT TO authenticated
  USING ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Artists can view codes for their tracks" ON digital_clearance_codes;
CREATE POLICY "Artists can view codes for their tracks"
  ON digital_clearance_codes FOR SELECT TO authenticated
  USING ((select auth.uid()) = artist_id);

-- content_usage_tracking policies
DROP POLICY IF EXISTS "Buyers can view their content usage" ON content_usage_tracking;
CREATE POLICY "Buyers can view their content usage"
  ON content_usage_tracking FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM digital_clearance_codes
      WHERE digital_clearance_codes.clearance_code = content_usage_tracking.clearance_code
      AND digital_clearance_codes.buyer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Artists can view usage of their tracks" ON content_usage_tracking;
CREATE POLICY "Artists can view usage of their tracks"
  ON content_usage_tracking FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM digital_clearance_codes
      WHERE digital_clearance_codes.clearance_code = content_usage_tracking.clearance_code
      AND digital_clearance_codes.artist_id = (select auth.uid())
    )
  );

-- ongoing_royalty_payments policies
DROP POLICY IF EXISTS "Artists can view their royalty payments" ON ongoing_royalty_payments;
CREATE POLICY "Artists can view their royalty payments"
  ON ongoing_royalty_payments FOR SELECT TO authenticated
  USING ((select auth.uid()) = artist_id);

DROP POLICY IF EXISTS "Buyers can view royalty data for their content" ON ongoing_royalty_payments;
CREATE POLICY "Buyers can view royalty data for their content"
  ON ongoing_royalty_payments FOR SELECT TO authenticated
  USING ((select auth.uid()) = buyer_id);

-- platform_api_connections policies
DROP POLICY IF EXISTS "Users can manage their own platform connections" ON platform_api_connections;
CREATE POLICY "Users can manage their own platform connections"
  ON platform_api_connections FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- instant_royalty_calculations policies
DROP POLICY IF EXISTS "Artists can view their royalty calculations" ON instant_royalty_calculations;
CREATE POLICY "Artists can view their royalty calculations"
  ON instant_royalty_calculations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM track_licenses
      WHERE track_licenses.id = instant_royalty_calculations.license_id
      AND (track_licenses.artist_id = (select auth.uid()) OR track_licenses.buyer_id = (select auth.uid()))
    )
  );

-- hybrid_payouts policies
DROP POLICY IF EXISTS "Artists can view their hybrid payouts" ON hybrid_payouts;
CREATE POLICY "Artists can view their hybrid payouts"
  ON hybrid_payouts FOR SELECT TO authenticated
  USING ((select auth.uid()) = artist_id);

-- crypto_transactions policies
DROP POLICY IF EXISTS "Artists can view their crypto transactions" ON crypto_transactions;
CREATE POLICY "Artists can view their crypto transactions"
  ON crypto_transactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = artist_id);

-- ============================================
-- PART 3: FIX FUNCTION SEARCH PATHS (Security)
-- ============================================

-- Set secure search_path for all functions
ALTER FUNCTION update_pack_purchases_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION calculate_royalty_splits(numeric, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION process_instant_payout() SET search_path = public, pg_temp;
ALTER FUNCTION generate_clearance_code() SET search_path = public, pg_temp;
ALTER FUNCTION create_digital_clearance_code() SET search_path = public, pg_temp;
ALTER FUNCTION process_ongoing_royalties() SET search_path = public, pg_temp;
ALTER FUNCTION sync_platform_usage(text, text, text, bigint, bigint, bigint, bigint, bigint) SET search_path = public, pg_temp;
ALTER FUNCTION calculate_instant_royalty_split(uuid, numeric, text) SET search_path = public, pg_temp;
ALTER FUNCTION execute_hybrid_instant_payout(uuid, numeric, uuid, uuid) SET search_path = public, pg_temp;

-- ============================================
-- PART 4: REMOVE UNUSED INDEXES (Storage optimization)
-- ============================================

-- Note: We'll keep indexes that may be used in future queries
-- Only drop truly unused ones from legacy tables

DROP INDEX IF EXISTS audio_snippets_artist_id_idx;
DROP INDEX IF EXISTS audio_snippets_genre_idx;
DROP INDEX IF EXISTS audio_snippets_mood_idx;
DROP INDEX IF EXISTS audio_snippets_price_idx;
DROP INDEX IF EXISTS audio_snippets_bpm_idx;
DROP INDEX IF EXISTS snippet_licenses_user_id_idx;
DROP INDEX IF EXISTS snippet_licenses_snippet_id_idx;
DROP INDEX IF EXISTS snippet_licenses_created_at_idx;
DROP INDEX IF EXISTS royalty_splits_snippet_id_idx;
DROP INDEX IF EXISTS royalty_splits_recipient_id_idx;
DROP INDEX IF EXISTS payment_transactions_buyer_id_idx;
DROP INDEX IF EXISTS payment_transactions_snippet_id_idx;
DROP INDEX IF EXISTS payment_transactions_status_idx;
DROP INDEX IF EXISTS payment_transactions_created_at_idx;
DROP INDEX IF EXISTS royalty_payments_transaction_id_idx;
DROP INDEX IF EXISTS royalty_payments_recipient_id_idx;
DROP INDEX IF EXISTS royalty_payments_status_idx;
DROP INDEX IF EXISTS track_analytics_snippet_id_idx;
DROP INDEX IF EXISTS track_analytics_date_idx;
DROP INDEX IF EXISTS licensing_terms_snippet_id_idx;
DROP INDEX IF EXISTS promotional_campaigns_artist_id_idx;
DROP INDEX IF EXISTS promotional_campaigns_status_idx;
DROP INDEX IF EXISTS profiles_is_verified_idx;
DROP INDEX IF EXISTS profiles_profile_type_idx;
DROP INDEX IF EXISTS audio_snippets_is_featured_idx;
DROP INDEX IF EXISTS audio_snippets_tags_idx;

-- Keep these for potential future use:
-- - All clearance and tracking indexes (active feature)
-- - All payout and transaction indexes (active feature)
-- - All profile hub indexes (active feature)
