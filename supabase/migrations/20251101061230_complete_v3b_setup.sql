/*
  # V3BMusic.AI - Complete Database Setup

  1. New Tables
    - `profiles` - User profiles (extends auth.users)
    - `audio_snippets` - Music tracks for licensing
    - `snippet_licenses` - License purchases

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read/update own data
    - Audio Snippets: Public read, artists can create/update/delete own
    - Licenses: Users can read own licenses, artists can see licenses for their snippets

  3. Functions & Triggers
    - Auto-create profile on user registration
    - Auto-update timestamps on record changes

  4. Performance
    - Indexes on frequently queried columns
*/

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'creator' CHECK (role IN ('artist', 'creator', 'admin')),
  country text,
  region text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audio_snippets table
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
  audio_url text NOT NULL,
  waveform_data numeric[] DEFAULT '{}',
  is_licensed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create snippet_licenses table
CREATE TABLE IF NOT EXISTS snippet_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price_paid decimal(10,2) NOT NULL CHECK (price_paid >= 0),
  license_type text NOT NULL DEFAULT 'Content Creator License',
  created_at timestamptz DEFAULT now(),
  valid_until timestamptz DEFAULT (now() + interval '1 year')
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_licenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Audio snippets policies
CREATE POLICY "Anyone can read snippets"
  ON audio_snippets FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artists can insert their own snippets"
  ON audio_snippets FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

CREATE POLICY "Artists can update their own snippets"
  ON audio_snippets FOR UPDATE
  TO authenticated
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own snippets"
  ON audio_snippets FOR DELETE
  TO authenticated
  USING (auth.uid() = artist_id);

-- License policies
CREATE POLICY "Users can read their own licenses"
  ON snippet_licenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create licenses"
  ON snippet_licenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Artists can see licenses for their snippets"
  ON snippet_licenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets 
      WHERE audio_snippets.id = snippet_licenses.snippet_id 
      AND audio_snippets.artist_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'creator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audio_snippets_updated_at ON audio_snippets;
CREATE TRIGGER update_audio_snippets_updated_at
  BEFORE UPDATE ON audio_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS audio_snippets_artist_id_idx ON audio_snippets(artist_id);
CREATE INDEX IF NOT EXISTS audio_snippets_genre_idx ON audio_snippets(genre);
CREATE INDEX IF NOT EXISTS audio_snippets_mood_idx ON audio_snippets USING GIN(mood);
CREATE INDEX IF NOT EXISTS audio_snippets_price_idx ON audio_snippets(price);
CREATE INDEX IF NOT EXISTS audio_snippets_bpm_idx ON audio_snippets(bpm);
CREATE INDEX IF NOT EXISTS audio_snippets_created_at_idx ON audio_snippets(created_at DESC);

CREATE INDEX IF NOT EXISTS snippet_licenses_user_id_idx ON snippet_licenses(user_id);
CREATE INDEX IF NOT EXISTS snippet_licenses_snippet_id_idx ON snippet_licenses(snippet_id);
CREATE INDEX IF NOT EXISTS snippet_licenses_created_at_idx ON snippet_licenses(created_at DESC);

-- Create unique constraint to prevent duplicate licenses
CREATE UNIQUE INDEX IF NOT EXISTS snippet_licenses_user_snippet_unique 
ON snippet_licenses(user_id, snippet_id);