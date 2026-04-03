/*
  # Create audio snippets table

  1. New Tables
    - `snippets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `artist_id` (uuid, foreign key to users)
      - `duration` (integer, in seconds)
      - `price` (decimal)
      - `mood` (text array)
      - `bpm` (integer)
      - `genre` (text)
      - `audio_url` (text)
      - `waveform_data` (numeric array)
      - `is_licensed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `snippets` table
    - Add policies for public read access and artist-only write access
*/

-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  artist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Enable Row Level Security
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read snippets"
  ON snippets
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Artists can insert their own snippets"
  ON snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

CREATE POLICY "Artists can update their own snippets"
  ON snippets
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

CREATE POLICY "Artists can delete their own snippets"
  ON snippets
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'artist'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS snippets_artist_id_idx ON snippets(artist_id);
CREATE INDEX IF NOT EXISTS snippets_genre_idx ON snippets(genre);
CREATE INDEX IF NOT EXISTS snippets_mood_idx ON snippets USING GIN(mood);
CREATE INDEX IF NOT EXISTS snippets_price_idx ON snippets(price);
CREATE INDEX IF NOT EXISTS snippets_bpm_idx ON snippets(bpm);
CREATE INDEX IF NOT EXISTS snippets_created_at_idx ON snippets(created_at DESC);