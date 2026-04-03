-- =====================================================
-- V3BMUSIC.AI — ENHANCED SCHEMA (Postgres / Bolt auth)
-- Notes:
--  - Adds lookup/enumeration tables for stronger constraints
--  - Adds PRS/collecting-society fields (ISWC/ISRC, PRO registration, work_id)
--  - Improves royalty split validation (tolerant to rounding)
--  - Adds audit/event log and soft-delete pattern
--  - Adds idempotency for payments and transaction references
--  - Adds payout schedule and disbursement helper functions
--  - Improves RLS with helper functions (role checks)
-- =====================================================

/* ========== EXTENSIONS ========== */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== LOOKUP / ENUM TABLES ==========
CREATE TABLE IF NOT EXISTS lookup_roles (
  role text PRIMARY KEY CHECK (role IN ('artist','creator','admin','label','platform'))
);

INSERT INTO lookup_roles(role) VALUES ('artist'),('creator'),('admin'),('label'),('platform')
  ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS lookup_profile_type (
  profile_type text PRIMARY KEY CHECK (profile_type IN ('individual','label','production_company'))
);

INSERT INTO lookup_profile_type(profile_type) VALUES ('individual'),('label'),('production_company')
  ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS lookup_recipient_type (
  recipient_type text PRIMARY KEY CHECK (recipient_type IN ('artist','producer','songwriter','label','publisher','other'))
);

INSERT INTO lookup_recipient_type(recipient_type)
VALUES ('artist'),('producer'),('songwriter'),('label'),('publisher'),('other')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS lookup_license_type (
  license_type text PRIMARY KEY CHECK (license_type IN ('standard','extended','exclusive','content_creator'))
);

INSERT INTO lookup_license_type(license_type)
VALUES ('standard'),('extended'),('exclusive'),('content_creator')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS lookup_payment_method (
  payment_method text PRIMARY KEY CHECK (payment_method IN ('stripe','blockchain','crypto','bank_transfer'))
);

INSERT INTO lookup_payment_method(payment_method)
VALUES ('stripe'),('blockchain'),('crypto'),('bank_transfer')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS lookup_currency (
  currency text PRIMARY KEY
);
INSERT INTO lookup_currency(currency) VALUES ('USD'),('GBP'),('EUR') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS lookup_platforms (
  platform text PRIMARY KEY
);
INSERT INTO lookup_platforms(platform) VALUES ('youtube'),('tiktok'),('instagram'),('twitch'),('facebook'),('podcast') ON CONFLICT DO NOTHING;

-- ========== ENHANCE EXISTING TABLES ==========

-- Add new columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update role constraint to include new roles
DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('artist','creator','admin','label','platform'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to audio_snippets
ALTER TABLE audio_snippets
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS isrc text,
ADD COLUMN IF NOT EXISTS iswc text,
ADD COLUMN IF NOT EXISTS prs_work_id text,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add unique constraint for ISRC if not exists
DO $$
BEGIN
  ALTER TABLE audio_snippets ADD CONSTRAINT audio_snippets_isrc_unique UNIQUE (isrc);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update numeric precision for better accuracy
ALTER TABLE audio_snippets
ALTER COLUMN price TYPE numeric(12,2),
ALTER COLUMN total_revenue TYPE numeric(14,2),
ALTER COLUMN play_count TYPE bigint,
ALTER COLUMN license_count TYPE bigint;

ALTER TABLE profiles
ALTER COLUMN total_earnings TYPE numeric(14,2);

-- Add public audio URL constraint
DO $$
BEGIN
  ALTER TABLE audio_snippets DROP CONSTRAINT IF EXISTS public_audio_url_present;
  ALTER TABLE audio_snippets
    ADD CONSTRAINT public_audio_url_present 
    CHECK (NOT is_public OR (is_public AND audio_url IS NOT NULL));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Enhance snippet_licenses
ALTER TABLE snippet_licenses
ADD COLUMN IF NOT EXISTS license_reference text,
ADD COLUMN IF NOT EXISTS billing_reference text;

-- Update license_reference for existing records
UPDATE snippet_licenses 
SET license_reference = 'LIC-' || id::text
WHERE license_reference IS NULL;

-- Add unique constraint if not exists
DO $$
BEGIN
  ALTER TABLE snippet_licenses ADD CONSTRAINT snippet_licenses_license_reference_unique UNIQUE (license_reference);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE snippet_licenses
ALTER COLUMN license_reference SET NOT NULL;

-- Add unique constraint on user/snippet/license_type
DROP INDEX IF EXISTS ux_snippet_license_user_snippet_type;
CREATE UNIQUE INDEX IF NOT EXISTS ux_snippet_license_user_snippet_type
  ON snippet_licenses(user_id, snippet_id, license_type);

-- Update royalty_splits precision
ALTER TABLE royalty_splits
ALTER COLUMN percentage TYPE numeric(5,4);

ALTER TABLE royalty_splits
ADD COLUMN IF NOT EXISTS share_type text DEFAULT 'net';

DO $$
BEGIN
  ALTER TABLE royalty_splits DROP CONSTRAINT IF EXISTS royalty_splits_share_type_check;
  ALTER TABLE royalty_splits ADD CONSTRAINT royalty_splits_share_type_check CHECK (share_type IN ('net','gross'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Enhance payment_transactions
ALTER TABLE payment_transactions
ALTER COLUMN amount TYPE numeric(12,2);

ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS transaction_reference text;

-- Update transaction_reference for existing records
UPDATE payment_transactions 
SET transaction_reference = 'TXN-' || id::text
WHERE transaction_reference IS NULL;

-- Add unique constraint if not exists
DO $$
BEGIN
  ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_transaction_reference_unique UNIQUE (transaction_reference);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE payment_transactions
ALTER COLUMN transaction_reference SET NOT NULL;

-- Update status check constraint
DO $$
BEGIN
  ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_status_check;
  ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_status_check
    CHECK (status IN ('pending','processing','completed','failed','refunded','cancelled'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Enhance royalty_payments
ALTER TABLE royalty_payments
ALTER COLUMN amount TYPE numeric(12,2);

-- Enhance track_analytics
ALTER TABLE track_analytics
ALTER COLUMN revenue TYPE numeric(12,2);

DO $$
BEGIN
  ALTER TABLE track_analytics ADD CONSTRAINT track_analytics_plays_check CHECK (plays_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE track_analytics ADD CONSTRAINT track_analytics_license_check CHECK (license_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE track_analytics ADD CONSTRAINT track_analytics_revenue_check CHECK (revenue >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE track_analytics ADD CONSTRAINT track_analytics_visitors_check CHECK (unique_visitors >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== NEW TABLES ==========

-- Payouts schedule / batch
CREATE TABLE IF NOT EXISTS payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_reference text UNIQUE NOT NULL,
  total_amount numeric(14,2) NOT NULL CHECK (total_amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','processing','completed','failed')),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS payout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  recipient_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  payment_method text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  reference text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Audit / event log
CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  actor_profile_id uuid REFERENCES profiles(id),
  event_type text NOT NULL,
  resource_type text,
  resource_id uuid,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- ========== HELPER FUNCTIONS ==========

-- Check user's role
CREATE OR REPLACE FUNCTION current_user_role() RETURNS text AS $$
DECLARE
  r text;
BEGIN
  SELECT role INTO r FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(r, '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_user() RETURNS boolean AS $$
BEGIN
  RETURN current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Improved royalty split validation with rounding tolerance
CREATE OR REPLACE FUNCTION validate_royalty_splits()
RETURNS trigger AS $$
DECLARE
  total numeric(10,6);
BEGIN
  SELECT COALESCE(SUM(percentage), 0) INTO total
  FROM royalty_splits
  WHERE snippet_id = NEW.snippet_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (total + NEW.percentage) > 100.0001 THEN
    RAISE EXCEPTION 'Total royalty split percentage cannot exceed 100. Current sum: % , new: %', total, NEW.percentage;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create royalty payments when transaction completes
CREATE OR REPLACE FUNCTION fn_create_royalty_payments_after_tx()
RETURNS trigger AS $$
DECLARE
  r record;
  payment_amount numeric(12,2);
  tx_id uuid := NEW.id;
BEGIN
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM royalty_payments WHERE transaction_id = tx_id) THEN
    RETURN NEW;
  END IF;

  FOR r IN SELECT * FROM royalty_splits WHERE snippet_id = NEW.snippet_id ORDER BY created_at LOOP
    payment_amount := round((NEW.amount * (r.percentage/100.0))::numeric, 2);
    INSERT INTO royalty_payments (transaction_id, split_id, recipient_id, amount, status, created_at)
      VALUES (tx_id, r.id, r.recipient_profile_id, payment_amount, 'pending', now());
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tx_after_update ON payment_transactions;
CREATE TRIGGER trg_tx_after_update
  AFTER UPDATE ON payment_transactions FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION fn_create_royalty_payments_after_tx();

-- Audit logging
CREATE OR REPLACE FUNCTION fn_audit_log() RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_events(actor_profile_id, event_type, resource_type, resource_id, payload, created_at)
  VALUES (auth.uid(), TG_OP || '_' || TG_TABLE_NAME, TG_TABLE_NAME, COALESCE(NEW.id::uuid, OLD.id::uuid), row_to_json(COALESCE(NEW, OLD)), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach audit triggers
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','audio_snippets','snippet_licenses','royalty_splits',
    'payment_transactions','royalty_payments','licensing_terms','promotional_campaigns'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%1$s ON %1$I;', t);
    EXECUTE format('CREATE TRIGGER trg_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON %1$I FOR EACH ROW EXECUTE FUNCTION fn_audit_log();', t);
  END LOOP;
END;
$$;

-- ========== UTILITY FUNCTIONS ==========

-- Recalculate snippet totals
CREATE OR REPLACE FUNCTION fn_recalculate_snippet_totals(target_snippet uuid) RETURNS void AS $$
DECLARE
  plays bigint;
  licenses_count bigint;
  revenue numeric(14,2);
BEGIN
  SELECT COALESCE(SUM(plays_count),0) INTO plays FROM track_analytics WHERE snippet_id = target_snippet;
  SELECT COUNT(*) INTO licenses_count FROM snippet_licenses WHERE snippet_id = target_snippet;
  SELECT COALESCE(SUM(amount),0) INTO revenue FROM payment_transactions WHERE snippet_id = target_snippet AND status = 'completed';

  UPDATE audio_snippets
  SET play_count = plays,
      license_count = licenses_count,
      total_revenue = revenue,
      updated_at = now()
  WHERE id = target_snippet;
END;
$$ LANGUAGE plpgsql;

-- Create payout batch
CREATE OR REPLACE FUNCTION fn_prepare_payout_batch(batch_ref text, currency_in text DEFAULT 'USD') RETURNS uuid AS $$
DECLARE
  batch_id uuid;
  rec record;
BEGIN
  INSERT INTO payout_batches(batch_reference, total_amount, currency, status, created_at)
  VALUES (batch_ref, 0, currency_in, 'prepared', now()) RETURNING id INTO batch_id;

  FOR rec IN
    SELECT rp.recipient_id, SUM(rp.amount)::numeric(14,2) AS amt
    FROM royalty_payments rp
    WHERE rp.status = 'pending'
    GROUP BY rp.recipient_id
  LOOP
    INSERT INTO payout_items(batch_id, recipient_profile_id, amount, status, created_at)
    VALUES (batch_id, rec.recipient_id, rec.amt, 'pending', now());
    
    UPDATE royalty_payments SET status = 'processing' WHERE recipient_id = rec.recipient_id AND status = 'pending';
  END LOOP;

  UPDATE payout_batches
  SET total_amount = (SELECT COALESCE(SUM(amount),0) FROM payout_items WHERE batch_id = batch_id)
  WHERE id = batch_id;

  RETURN batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== ADDITIONAL INDEXES ==========

CREATE INDEX IF NOT EXISTS idx_audio_snippets_is_public ON audio_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_audio_snippets_isrc ON audio_snippets(isrc) WHERE isrc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audio_snippets_iswc ON audio_snippets(iswc) WHERE iswc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payout_batches_status ON payout_batches(status);
CREATE INDEX IF NOT EXISTS idx_payout_items_batch_id ON payout_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_payout_items_recipient ON payout_items(recipient_profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at DESC);

-- ========== UPDATE RLS POLICIES ==========

-- Drop all existing policies and recreate
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'audio_snippets', 'snippet_licenses', 'royalty_splits', 
                        'payment_transactions', 'royalty_payments', 'track_analytics', 
                        'licensing_terms', 'promotional_campaigns')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Profiles policies
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated USING (auth.uid() = id OR is_admin_user());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_insert_user ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Audio snippets policies
CREATE POLICY audio_snippets_read_public ON audio_snippets FOR SELECT TO authenticated, anon USING (is_public = true OR auth.uid() = artist_id OR is_admin_user());
CREATE POLICY audio_snippets_insert_artist ON audio_snippets FOR INSERT TO authenticated WITH CHECK (artist_id = auth.uid() OR is_admin_user());
CREATE POLICY audio_snippets_update_artist ON audio_snippets FOR UPDATE TO authenticated USING (auth.uid() = artist_id OR is_admin_user());
CREATE POLICY audio_snippets_delete_artist ON audio_snippets FOR DELETE TO authenticated USING (auth.uid() = artist_id OR is_admin_user());

-- Snippet licenses policies
CREATE POLICY snippet_licenses_select_buyer ON snippet_licenses FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM audio_snippets WHERE id = snippet_licenses.snippet_id AND artist_id = auth.uid()) OR 
  is_admin_user()
);
CREATE POLICY snippet_licenses_insert ON snippet_licenses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY snippet_licenses_update ON snippet_licenses FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY snippet_licenses_delete ON snippet_licenses FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_admin_user());

-- Royalty splits policies
CREATE POLICY royalty_splits_select_public ON royalty_splits FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY royalty_splits_insert_artist ON royalty_splits FOR INSERT TO authenticated WITH CHECK (
  EXISTS(SELECT 1 FROM audio_snippets WHERE audio_snippets.id = royalty_splits.snippet_id AND audio_snippets.artist_id = auth.uid()) OR 
  is_admin_user()
);
CREATE POLICY royalty_splits_update_artist ON royalty_splits FOR UPDATE TO authenticated USING (
  EXISTS(SELECT 1 FROM audio_snippets WHERE audio_snippets.id = royalty_splits.snippet_id AND audio_snippets.artist_id = auth.uid()) OR 
  is_admin_user()
);
CREATE POLICY royalty_splits_delete_artist ON royalty_splits FOR DELETE TO authenticated USING (
  EXISTS(SELECT 1 FROM audio_snippets WHERE audio_snippets.id = royalty_splits.snippet_id AND audio_snippets.artist_id = auth.uid()) OR 
  is_admin_user()
);

-- Payment transactions policies
CREATE POLICY payment_transactions_select_owner ON payment_transactions FOR SELECT TO authenticated USING (
  buyer_id = auth.uid() OR
  EXISTS(SELECT 1 FROM audio_snippets WHERE audio_snippets.id = payment_transactions.snippet_id AND audio_snippets.artist_id = auth.uid()) OR
  is_admin_user()
);
CREATE POLICY payment_transactions_insert ON payment_transactions FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid() OR is_admin_user());

-- Royalty payments policies
CREATE POLICY royalty_payments_select_recipient ON royalty_payments FOR SELECT TO authenticated USING (recipient_id = auth.uid() OR is_admin_user());

-- Track analytics policies
CREATE POLICY track_analytics_select ON track_analytics FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY track_analytics_insert_server ON track_analytics FOR INSERT TO authenticated WITH CHECK (is_admin_user());

-- Licensing terms policies
CREATE POLICY licensing_terms_select_public ON licensing_terms FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY licensing_terms_insert_artist ON licensing_terms FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM audio_snippets WHERE audio_snippets.id = licensing_terms.snippet_id AND audio_snippets.artist_id = auth.uid()) OR 
  is_admin_user()
);
CREATE POLICY licensing_terms_update_artist ON licensing_terms FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM audio_snippets WHERE audio_snippets.id = licensing_terms.snippet_id AND audio_snippets.artist_id = auth.uid()) OR 
  is_admin_user()
);

-- Promotional campaigns policies
CREATE POLICY promotional_campaigns_select_artist ON promotional_campaigns FOR SELECT TO authenticated USING (artist_id = auth.uid() OR is_admin_user());
CREATE POLICY promotional_campaigns_insert_artist ON promotional_campaigns FOR INSERT TO authenticated WITH CHECK (artist_id = auth.uid());
CREATE POLICY promotional_campaigns_update_artist ON promotional_campaigns FOR UPDATE TO authenticated USING (artist_id = auth.uid());
CREATE POLICY promotional_campaigns_delete_artist ON promotional_campaigns FOR DELETE TO authenticated USING (artist_id = auth.uid());

-- Enable RLS on new tables
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Payout policies (admin only)
CREATE POLICY payout_batches_admin ON payout_batches FOR ALL TO authenticated USING (is_admin_user());
CREATE POLICY payout_items_admin ON payout_items FOR ALL TO authenticated USING (is_admin_user());
CREATE POLICY audit_events_admin ON audit_events FOR SELECT TO authenticated USING (is_admin_user() OR actor_profile_id = auth.uid());
