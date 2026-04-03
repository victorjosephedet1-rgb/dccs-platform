/*
  # Create licenses table

  1. New Tables
    - `licenses`
      - `id` (uuid, primary key)
      - `snippet_id` (uuid, foreign key to snippets)
      - `user_id` (uuid, foreign key to users)
      - `price_paid` (decimal)
      - `license_type` (text)
      - `created_at` (timestamp)
      - `valid_until` (timestamp)

  2. Security
    - Enable RLS on `licenses` table
    - Add policies for users to read their own licenses
*/

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_paid decimal(10,2) NOT NULL CHECK (price_paid >= 0),
  license_type text NOT NULL DEFAULT 'Content Creator License',
  created_at timestamptz DEFAULT now(),
  valid_until timestamptz DEFAULT (now() + interval '1 year')
);

-- Enable Row Level Security
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own licenses"
  ON licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create licenses"
  ON licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Artists can see licenses for their snippets
CREATE POLICY "Artists can see licenses for their snippets"
  ON licenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM snippets 
      WHERE snippets.id = licenses.snippet_id 
      AND snippets.artist_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS licenses_user_id_idx ON licenses(user_id);
CREATE INDEX IF NOT EXISTS licenses_snippet_id_idx ON licenses(snippet_id);
CREATE INDEX IF NOT EXISTS licenses_created_at_idx ON licenses(created_at DESC);

-- Create unique constraint to prevent duplicate licenses
CREATE UNIQUE INDEX IF NOT EXISTS licenses_user_snippet_unique 
ON licenses(user_id, snippet_id);