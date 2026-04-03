/*
  # V3B Music Database Schema - Complete Setup

  1. New Tables
    - `profiles` - User profiles with artist/creator roles
    - `audio_snippets` - Music snippets for licensing  
    - `snippet_licenses` - License transactions

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Create triggers for automatic profile creation

  3. Functions
    - User registration handler
    - Updated timestamp triggers
*/

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS snippet_licenses CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS audio_snippets CASCADE;
DROP TABLE IF EXISTS snippets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('artist', 'creator')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audio_snippets table
CREATE TABLE audio_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE snippet_licenses (
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
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Audio snippets policies
CREATE POLICY "Anyone can read snippets"
  ON audio_snippets
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artists can insert their own snippets"
  ON audio_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

CREATE POLICY "Artists can update their own snippets"
  ON audio_snippets
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

CREATE POLICY "Artists can delete their own snippets"
  ON audio_snippets
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

-- License policies
CREATE POLICY "Users can read their own licenses"
  ON snippet_licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create licenses"
  ON snippet_licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Artists can see licenses for their snippets"
  ON snippet_licenses
  FOR SELECT
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
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'creator')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_snippets_updated_at
  BEFORE UPDATE ON audio_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX audio_snippets_artist_id_idx ON audio_snippets(artist_id);
CREATE INDEX audio_snippets_genre_idx ON audio_snippets(genre);
CREATE INDEX audio_snippets_mood_idx ON audio_snippets USING GIN(mood);
CREATE INDEX audio_snippets_price_idx ON audio_snippets(price);
CREATE INDEX audio_snippets_bpm_idx ON audio_snippets(bpm);
CREATE INDEX audio_snippets_created_at_idx ON audio_snippets(created_at DESC);

CREATE INDEX snippet_licenses_user_id_idx ON snippet_licenses(user_id);
CREATE INDEX snippet_licenses_snippet_id_idx ON snippet_licenses(snippet_id);
CREATE INDEX snippet_licenses_created_at_idx ON snippet_licenses(created_at DESC);

-- Create unique constraint to prevent duplicate licenses
CREATE UNIQUE INDEX snippet_licenses_user_snippet_unique 
ON snippet_licenses(user_id, snippet_id);