/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues identified in the database audit:

  ## 1. Missing Indexes on Foreign Keys
  Adds covering indexes for all foreign keys to improve query performance:
  - blockchain_transactions.contract_id
  - payment_transactions.license_id
  - promotional_campaigns.snippet_id
  - royalty_payments.split_id

  ## 2. RLS Policy Optimization
  Optimizes all Row Level Security policies by wrapping auth functions in SELECT subqueries
  to prevent re-evaluation for each row, significantly improving query performance at scale.
  
  Tables affected:
  - profiles (3 policies)
  - audio_snippets (3 policies)
  - snippet_licenses (3 policies)
  - royalty_splits (3 policies)
  - payment_transactions (2 policies)
  - royalty_payments (1 policy)
  - licensing_terms (2 policies)
  - promotional_campaigns (4 policies)
  - blockchain_transactions (1 policy)
  - crypto_wallets (4 policies)
  - profile_galleries (2 policies)
  - profile_videos (2 policies)
  - profile_stats (2 policies)
  - profile_social_links (2 policies)

  ## 3. Function Security
  Fixes search_path security issues in database functions by setting explicit search_path

  ## 4. Multiple Permissive Policies
  Consolidates overlapping RLS policies to prevent ambiguity and improve performance

  ## Notes
  - Unused indexes are left in place as they may be needed as the platform scales
  - All changes are backward compatible
  - Performance improvements will be immediate
*/

-- =====================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- =====================================================

-- Index for blockchain_transactions.contract_id
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_contract_id 
ON public.blockchain_transactions(contract_id);

-- Index for payment_transactions.license_id
CREATE INDEX IF NOT EXISTS idx_payment_transactions_license_id 
ON public.payment_transactions(license_id);

-- Index for promotional_campaigns.snippet_id
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_snippet_id 
ON public.promotional_campaigns(snippet_id);

-- Index for royalty_payments.split_id
CREATE INDEX IF NOT EXISTS idx_royalty_payments_split_id 
ON public.royalty_payments(split_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - AUDIO_SNIPPETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Artists can insert their own snippets" ON public.audio_snippets;
CREATE POLICY "Artists can insert their own snippets"
  ON public.audio_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Artists can update their own snippets" ON public.audio_snippets;
CREATE POLICY "Artists can update their own snippets"
  ON public.audio_snippets
  FOR UPDATE
  TO authenticated
  USING (artist_id = (SELECT auth.uid()))
  WITH CHECK (artist_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Artists can delete their own snippets" ON public.audio_snippets;
CREATE POLICY "Artists can delete their own snippets"
  ON public.audio_snippets
  FOR DELETE
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - SNIPPET_LICENSES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can read their own licenses" ON public.snippet_licenses;
CREATE POLICY "Users can read their own licenses"
  ON public.snippet_licenses
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create licenses" ON public.snippet_licenses;
CREATE POLICY "Users can create licenses"
  ON public.snippet_licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Artists can see licenses for their snippets" ON public.snippet_licenses;
CREATE POLICY "Artists can see licenses for their snippets"
  ON public.snippet_licenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_licenses.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - ROYALTY_SPLITS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Artists can create splits for their tracks" ON public.royalty_splits;
CREATE POLICY "Artists can create splits for their tracks"
  ON public.royalty_splits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = royalty_splits.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Artists can update splits for their tracks" ON public.royalty_splits;
CREATE POLICY "Artists can update splits for their tracks"
  ON public.royalty_splits
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = royalty_splits.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = royalty_splits.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Artists can delete splits for their tracks" ON public.royalty_splits;
CREATE POLICY "Artists can delete splits for their tracks"
  ON public.royalty_splits
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = royalty_splits.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - PAYMENT_TRANSACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = payment_transactions.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create transactions" ON public.payment_transactions;
CREATE POLICY "System can create transactions"
  ON public.payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = (SELECT auth.uid()));

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - ROYALTY_PAYMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Recipients can view their royalty payments" ON public.royalty_payments;
CREATE POLICY "Recipients can view their royalty payments"
  ON public.royalty_payments
  FOR SELECT
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()));

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - LICENSING_TERMS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Artists can create licensing terms for their tracks" ON public.licensing_terms;
CREATE POLICY "Artists can create licensing terms for their tracks"
  ON public.licensing_terms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = licensing_terms.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Artists can update licensing terms for their tracks" ON public.licensing_terms;
CREATE POLICY "Artists can update licensing terms for their tracks"
  ON public.licensing_terms
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = licensing_terms.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = licensing_terms.snippet_id
      AND audio_snippets.artist_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES - PROMOTIONAL_CAMPAIGNS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Artists can view their own campaigns" ON public.promotional_campaigns;
CREATE POLICY "Artists can view their own campaigns"
  ON public.promotional_campaigns
  FOR SELECT
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Artists can create their own campaigns" ON public.promotional_campaigns;
CREATE POLICY "Artists can create their own campaigns"
  ON public.promotional_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Artists can update their own campaigns" ON public.promotional_campaigns;
CREATE POLICY "Artists can update their own campaigns"
  ON public.promotional_campaigns
  FOR UPDATE
  TO authenticated
  USING (artist_id = (SELECT auth.uid()))
  WITH CHECK (artist_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Artists can delete their own campaigns" ON public.promotional_campaigns;
CREATE POLICY "Artists can delete their own campaigns"
  ON public.promotional_campaigns
  FOR DELETE
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES - BLOCKCHAIN_TRANSACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their blockchain transactions" ON public.blockchain_transactions;
CREATE POLICY "Users can view their blockchain transactions"
  ON public.blockchain_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM crypto_wallets
      WHERE crypto_wallets.profile_id = (SELECT auth.uid())
      AND (
        crypto_wallets.wallet_address = blockchain_transactions.from_address
        OR crypto_wallets.wallet_address = blockchain_transactions.to_address
      )
    )
  );

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES - CRYPTO_WALLETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own wallets" ON public.crypto_wallets;
CREATE POLICY "Users can view own wallets"
  ON public.crypto_wallets
  FOR SELECT
  TO authenticated
  USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own wallets" ON public.crypto_wallets;
CREATE POLICY "Users can create own wallets"
  ON public.crypto_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own wallets" ON public.crypto_wallets;
CREATE POLICY "Users can update own wallets"
  ON public.crypto_wallets
  FOR UPDATE
  TO authenticated
  USING (profile_id = (SELECT auth.uid()))
  WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own wallets" ON public.crypto_wallets;
CREATE POLICY "Users can delete own wallets"
  ON public.crypto_wallets
  FOR DELETE
  TO authenticated
  USING (profile_id = (SELECT auth.uid()));

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES - PROFILE_GALLERIES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own gallery" ON public.profile_galleries;
DROP POLICY IF EXISTS "Admins can manage all galleries" ON public.profile_galleries;

CREATE POLICY "Users and admins can manage galleries"
  ON public.profile_galleries
  FOR ALL
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 13. OPTIMIZE RLS POLICIES - PROFILE_VIDEOS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own videos" ON public.profile_videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON public.profile_videos;

CREATE POLICY "Users and admins can manage videos"
  ON public.profile_videos
  FOR ALL
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 14. OPTIMIZE RLS POLICIES - PROFILE_STATS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view and update own stats" ON public.profile_stats;
DROP POLICY IF EXISTS "Admins can manage all stats" ON public.profile_stats;

CREATE POLICY "Users and admins can manage stats"
  ON public.profile_stats
  FOR ALL
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 15. OPTIMIZE RLS POLICIES - PROFILE_SOCIAL_LINKS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own social links" ON public.profile_social_links;
DROP POLICY IF EXISTS "Admins can manage all social links" ON public.profile_social_links;

CREATE POLICY "Users and admins can manage social links"
  ON public.profile_social_links
  FOR ALL
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    profile_id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 16. FIX FUNCTION SECURITY - SET EXPLICIT SEARCH PATH
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_profile_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profile_stats (profile_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_gallery_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profile_stats
    SET gallery_count = gallery_count + 1
    WHERE profile_id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profile_stats
    SET gallery_count = GREATEST(0, gallery_count - 1)
    WHERE profile_id = OLD.profile_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_video_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profile_stats
    SET video_count = video_count + 1
    WHERE profile_id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profile_stats
    SET video_count = GREATEST(0, video_count - 1)
    WHERE profile_id = OLD.profile_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_profile_slug()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;

  base_slug := lower(regexp_replace(
    coalesce(NEW.display_name, NEW.username, split_part(NEW.email, '@', 1)),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  ));
  
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;