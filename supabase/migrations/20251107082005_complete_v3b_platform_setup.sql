/*
  # V3BMusic.AI - Complete Platform Setup

  1. Core Tables
    - profiles - User profiles with Stripe Connect integration
    - audio_snippets - Music tracks for licensing
    - audio_packs - Bundled audio collections
    - track_licenses - Individual track license purchases
    - pack_purchases - Pack purchase records
    - instant_payouts - Instant royalty payment tracking

  2. Security
    - Enable RLS on all tables
    - Profiles: Public read, users can update own
    - Audio: Public read active, artists manage own
    - Licenses/Purchases: Users view own only
    - Payouts: Artists view own only

  3. Features
    - Auto-create profile on registration
    - Stripe Connect integration for instant payouts
    - Pack-based licensing system
    - Comprehensive RLS policies
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'creator' CHECK (role IN ('artist', 'creator', 'admin')),
  country text,
  region text,
  bio text,
  avatar_url text,
  is_verified boolean DEFAULT false,
  profile_type text DEFAULT 'individual' CHECK (profile_type IN ('individual', 'label', 'production_company')),
  company_name text,
  total_earnings decimal(15,2) DEFAULT 0,
  stripe_account_id text,
  stripe_connect_status text DEFAULT 'not_connected',
  instant_payout_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audio_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  duration integer NOT NULL CHECK (duration > 0),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  mood text[] DEFAULT '{}',
  bpm integer DEFAULT 120 CHECK (bpm > 0),
  genre text NOT NULL,
  file_url text NOT NULL,
  waveform_data numeric[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audio_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pack_name text NOT NULL,
  pack_description text,
  pack_price decimal(10,2) NOT NULL CHECK (pack_price >= 0),
  asset_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS track_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES audio_snippets(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES profiles(id),
  stripe_session_id text,
  stripe_payment_intent text,
  amount_paid decimal(10,2) NOT NULL,
  currency text DEFAULT 'gbp',
  license_type text NOT NULL DEFAULT 'Content Creator License',
  license_data jsonb,
  download_url text,
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pack_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES audio_packs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_session_id text,
  stripe_payment_intent text,
  amount_paid decimal(10,2) NOT NULL,
  currency text DEFAULT 'gbp',
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instant_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES track_licenses(id),
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'gbp',
  stripe_transfer_id text,
  payout_status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can read active snippets" ON audio_snippets;
CREATE POLICY "Anyone can read active snippets"
  ON audio_snippets FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Artists can manage own snippets" ON audio_snippets;
CREATE POLICY "Artists can manage own snippets"
  ON audio_snippets FOR ALL
  TO authenticated
  USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Anyone can read active packs" ON audio_packs;
CREATE POLICY "Anyone can read active packs"
  ON audio_packs FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Creators can manage own packs" ON audio_packs;
CREATE POLICY "Creators can manage own packs"
  ON audio_packs FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can view own licenses" ON track_licenses;
CREATE POLICY "Users can view own licenses"
  ON track_licenses FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = artist_id);

DROP POLICY IF EXISTS "Users can view own purchases" ON pack_purchases;
CREATE POLICY "Users can view own purchases"
  ON pack_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Artists can view own payouts" ON instant_payouts;
CREATE POLICY "Artists can view own payouts"
  ON instant_payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'creator'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE INDEX IF NOT EXISTS idx_audio_snippets_artist_id ON audio_snippets(artist_id);
CREATE INDEX IF NOT EXISTS idx_audio_snippets_is_active ON audio_snippets(is_active);
CREATE INDEX IF NOT EXISTS idx_audio_packs_creator_id ON audio_packs(creator_id);
CREATE INDEX IF NOT EXISTS idx_audio_packs_is_active ON audio_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_track_licenses_buyer_id ON track_licenses(buyer_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_artist_id ON track_licenses(artist_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_track_id ON track_licenses(track_id);
CREATE INDEX IF NOT EXISTS idx_pack_purchases_user_id ON pack_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_pack_purchases_pack_id ON pack_purchases(pack_id);
CREATE INDEX IF NOT EXISTS idx_instant_payouts_artist_id ON instant_payouts(artist_id);
CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id ON instant_payouts(license_id);