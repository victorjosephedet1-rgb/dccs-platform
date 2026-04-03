/*
  # Add Pack Purchases Table

  1. New Tables
    - `pack_purchases`
      - `id` (uuid, primary key)
      - `pack_id` (uuid, foreign key to audio_packs)
      - `user_id` (uuid, foreign key to profiles)
      - `stripe_session_id` (text, unique)
      - `stripe_payment_intent` (text)
      - `amount_paid` (numeric)
      - `currency` (text, default 'gbp')
      - `payment_status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `pack_purchases` table
    - Add policy for users to view their own purchases
    - Add policy for creators to view purchases of their packs
  
  3. Indexes
    - Add index on user_id for fast user purchase lookups
    - Add index on pack_id for creator analytics
    - Add unique index on stripe_session_id
*/

-- Create pack_purchases table
CREATE TABLE IF NOT EXISTS pack_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES audio_packs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  amount_paid numeric(10, 2) NOT NULL,
  currency text DEFAULT 'gbp' NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  license_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS pack_purchases_user_id_idx ON pack_purchases(user_id);
CREATE INDEX IF NOT EXISTS pack_purchases_pack_id_idx ON pack_purchases(pack_id);
CREATE INDEX IF NOT EXISTS pack_purchases_stripe_session_idx ON pack_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS pack_purchases_created_at_idx ON pack_purchases(created_at DESC);

-- Enable RLS
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own purchases
CREATE POLICY "Users can view own pack purchases"
  ON pack_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own purchases
CREATE POLICY "Users can insert own pack purchases"
  ON pack_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Creators can view purchases of their packs
CREATE POLICY "Creators can view purchases of their packs"
  ON pack_purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_purchases.pack_id
      AND audio_packs.creator_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pack_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS pack_purchases_updated_at_trigger ON pack_purchases;
CREATE TRIGGER pack_purchases_updated_at_trigger
  BEFORE UPDATE ON pack_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_pack_purchases_updated_at();
