/*
  # V3BMusic.AI - Enhanced Platform Features (Phase 1)

  ## Overview
  This migration adds critical features for the V3BMusic.AI vision:
  - Verified profiles for music companies and labels
  - Royalty split management system
  - Advanced licensing terms and rights management
  - Payment transaction tracking
  - Track analytics and performance metrics
  - Promotional campaigns system

  ## New Tables

  ### 1. `royalty_splits`
  Tracks royalty distribution for each track
  - `id` (uuid, primary key)
  - `snippet_id` (uuid, references audio_snippets)
  - `recipient_profile_id` (uuid, references profiles) - Who receives payment
  - `recipient_name` (text) - Name of recipient
  - `recipient_type` (text) - artist, producer, songwriter, label, etc.
  - `percentage` (decimal) - Percentage of royalties (0-100)
  - `created_at` (timestamptz)

  ### 2. `payment_transactions`
  Records all payment events
  - `id` (uuid, primary key)
  - `license_id` (uuid, references snippet_licenses)
  - `snippet_id` (uuid, references audio_snippets)
  - `buyer_id` (uuid, references profiles)
  - `amount` (decimal) - Total transaction amount
  - `currency` (text) - USD, EUR, etc.
  - `payment_method` (text) - stripe, blockchain, etc.
  - `status` (text) - pending, completed, failed
  - `transaction_hash` (text) - Blockchain hash if applicable
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 3. `royalty_payments`
  Individual royalty distributions from transactions
  - `id` (uuid, primary key)
  - `transaction_id` (uuid, references payment_transactions)
  - `split_id` (uuid, references royalty_splits)
  - `recipient_id` (uuid, references profiles)
  - `amount` (decimal) - Amount paid to this recipient
  - `status` (text) - pending, completed, failed
  - `payment_hash` (text) - Blockchain transaction hash
  - `created_at` (timestamptz)
  - `paid_at` (timestamptz)

  ### 4. `track_analytics`
  Performance metrics for tracks
  - `id` (uuid, primary key)
  - `snippet_id` (uuid, references audio_snippets)
  - `date` (date)
  - `plays_count` (integer) - Preview plays
  - `license_count` (integer) - Licenses sold
  - `revenue` (decimal) - Total revenue for the day
  - `unique_visitors` (integer)
  - `created_at` (timestamptz)

  ### 5. `licensing_terms`
  Detailed licensing terms per track
  - `id` (uuid, primary key)
  - `snippet_id` (uuid, references audio_snippets, unique)
  - `license_type` (text) - standard, extended, exclusive
  - `allowed_platforms` (text[]) - youtube, tiktok, instagram, etc.
  - `allowed_uses` (text[]) - commercial, non-commercial, etc.
  - `attribution_required` (boolean)
  - `duration_months` (integer) - License validity duration
  - `territory` (text) - worldwide, specific countries
  - `max_views` (integer) - Maximum views allowed (null = unlimited)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `promotional_campaigns`
  Artist promotional tools
  - `id` (uuid, primary key)
  - `artist_id` (uuid, references profiles)
  - `snippet_id` (uuid, references audio_snippets, nullable)
  - `title` (text)
  - `description` (text)
  - `budget` (decimal)
  - `spent` (decimal)
  - `status` (text) - draft, active, paused, completed
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `created_at` (timestamptz)

  ## Enhanced Existing Tables

  ### `profiles` additions
  - `is_verified` (boolean) - Verified badge
  - `profile_type` (text) - individual, label, production_company
  - `company_name` (text) - For labels/companies
  - `bio` (text)
  - `avatar_url` (text)
  - `country` (text)
  - `total_earnings` (decimal)
  - `stripe_account_id` (text)
  - `blockchain_wallet` (text)

  ### `audio_snippets` additions
  - `cover_image_url` (text)
  - `description` (text)
  - `tags` (text[])
  - `play_count` (integer)
  - `license_count` (integer)
  - `total_revenue` (decimal)
  - `is_featured` (boolean)
  - `is_exclusive` (boolean)

  ## Security
  - All tables have RLS enabled
  - Policies ensure data privacy and proper access control
  - Artists can only manage their own royalty splits
  - Payment data is protected and auditable

  ## Indexes
  - Performance indexes on frequently queried columns
  - Composite indexes for complex queries
*/

-- =====================================================
-- ENHANCE EXISTING TABLES
-- =====================================================

-- Enhance profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'individual' CHECK (profile_type IN ('individual', 'label', 'production_company')),
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS total_earnings decimal(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS blockchain_wallet text;

-- Enhance audio_snippets table
ALTER TABLE audio_snippets
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS play_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS license_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue decimal(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_exclusive boolean DEFAULT false;

-- =====================================================
-- CREATE NEW TABLES
-- =====================================================

-- Royalty Splits Table
CREATE TABLE IF NOT EXISTS royalty_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  recipient_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_name text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('artist', 'producer', 'songwriter', 'label', 'publisher', 'other')),
  percentage decimal(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz DEFAULT now()
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL REFERENCES snippet_licenses(id) ON DELETE CASCADE,
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'USD',
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'blockchain', 'crypto', 'bank_transfer')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_hash text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Royalty Payments Table
CREATE TABLE IF NOT EXISTS royalty_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  split_id uuid NOT NULL REFERENCES royalty_splits(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_hash text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Track Analytics Table
CREATE TABLE IF NOT EXISTS track_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  plays_count integer DEFAULT 0,
  license_count integer DEFAULT 0,
  revenue decimal(10,2) DEFAULT 0.00,
  unique_visitors integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(snippet_id, date)
);

-- Licensing Terms Table
CREATE TABLE IF NOT EXISTS licensing_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE UNIQUE,
  license_type text NOT NULL DEFAULT 'standard' CHECK (license_type IN ('standard', 'extended', 'exclusive')),
  allowed_platforms text[] DEFAULT ARRAY['youtube', 'tiktok', 'instagram', 'twitch', 'facebook', 'podcast'],
  allowed_uses text[] DEFAULT ARRAY['commercial', 'non-commercial'],
  attribution_required boolean DEFAULT true,
  duration_months integer DEFAULT 12 CHECK (duration_months > 0),
  territory text DEFAULT 'worldwide',
  max_views integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promotional Campaigns Table
CREATE TABLE IF NOT EXISTS promotional_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  budget decimal(10,2) DEFAULT 0.00 CHECK (budget >= 0),
  spent decimal(10,2) DEFAULT 0.00 CHECK (spent >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE royalty_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE licensing_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_campaigns ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Royalty Splits Policies
CREATE POLICY "Anyone can view royalty splits"
  ON royalty_splits FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artists can create splits for their tracks"
  ON royalty_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

CREATE POLICY "Artists can update splits for their tracks"
  ON royalty_splits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

CREATE POLICY "Artists can delete splits for their tracks"
  ON royalty_splits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

-- Payment Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

CREATE POLICY "System can create transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Royalty Payments Policies
CREATE POLICY "Recipients can view their royalty payments"
  ON royalty_payments FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Track Analytics Policies
CREATE POLICY "Anyone can view track analytics"
  ON track_analytics FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can create analytics"
  ON track_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Licensing Terms Policies
CREATE POLICY "Anyone can view licensing terms"
  ON licensing_terms FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artists can create licensing terms for their tracks"
  ON licensing_terms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

CREATE POLICY "Artists can update licensing terms for their tracks"
  ON licensing_terms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
  );

-- Promotional Campaigns Policies
CREATE POLICY "Artists can view their own campaigns"
  ON promotional_campaigns FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can create their own campaigns"
  ON promotional_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Artists can update their own campaigns"
  ON promotional_campaigns FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can delete their own campaigns"
  ON promotional_campaigns FOR DELETE
  TO authenticated
  USING (artist_id = auth.uid());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS royalty_splits_snippet_id_idx ON royalty_splits(snippet_id);
CREATE INDEX IF NOT EXISTS royalty_splits_recipient_id_idx ON royalty_splits(recipient_profile_id);

CREATE INDEX IF NOT EXISTS payment_transactions_buyer_id_idx ON payment_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS payment_transactions_snippet_id_idx ON payment_transactions(snippet_id);
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS payment_transactions_created_at_idx ON payment_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS royalty_payments_transaction_id_idx ON royalty_payments(transaction_id);
CREATE INDEX IF NOT EXISTS royalty_payments_recipient_id_idx ON royalty_payments(recipient_id);
CREATE INDEX IF NOT EXISTS royalty_payments_status_idx ON royalty_payments(status);

CREATE INDEX IF NOT EXISTS track_analytics_snippet_id_idx ON track_analytics(snippet_id);
CREATE INDEX IF NOT EXISTS track_analytics_date_idx ON track_analytics(date DESC);

CREATE INDEX IF NOT EXISTS licensing_terms_snippet_id_idx ON licensing_terms(snippet_id);

CREATE INDEX IF NOT EXISTS promotional_campaigns_artist_id_idx ON promotional_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS promotional_campaigns_status_idx ON promotional_campaigns(status);

CREATE INDEX IF NOT EXISTS profiles_is_verified_idx ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS profiles_profile_type_idx ON profiles(profile_type);

CREATE INDEX IF NOT EXISTS audio_snippets_is_featured_idx ON audio_snippets(is_featured);
CREATE INDEX IF NOT EXISTS audio_snippets_tags_idx ON audio_snippets USING GIN(tags);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update licensing_terms updated_at
CREATE TRIGGER update_licensing_terms_updated_at
  BEFORE UPDATE ON licensing_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate royalty split percentages
CREATE OR REPLACE FUNCTION validate_royalty_splits()
RETURNS trigger AS $$
DECLARE
  total_percentage decimal(5,2);
BEGIN
  SELECT COALESCE(SUM(percentage), 0) INTO total_percentage
  FROM royalty_splits
  WHERE snippet_id = NEW.snippet_id
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (total_percentage + NEW.percentage) > 100 THEN
    RAISE EXCEPTION 'Total royalty split percentage cannot exceed 100%%';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate splits before insert/update
CREATE TRIGGER validate_royalty_splits_trigger
  BEFORE INSERT OR UPDATE ON royalty_splits
  FOR EACH ROW
  EXECUTE FUNCTION validate_royalty_splits();
