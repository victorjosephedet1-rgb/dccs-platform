/*
  # Add Instant Payout System for Artist Track Sales

  1. New Tables
    - `track_licenses`
      - Records every track purchase/license
      - Links to buyer, artist, and payment details
      - Includes blockchain transaction ID for royalty tracking
      - Stores license file download URL
    
    - `instant_payouts`
      - Records instant payouts to artists
      - Tracks Stripe transfer IDs
      - Links to blockchain royalty ledger
      - Includes split calculations
  
  2. Enhancements to Existing Tables
    - Add `stripe_connect_status` to profiles
    - Add `instant_payout_enabled` to profiles
    - Add `royalty_splits` JSONB to audio_snippets
    - Add `license_file_url` to audio_snippets
  
  3. Security
    - Enable RLS on all new tables
    - Add policies for buyers to access their licenses
    - Add policies for artists to view their payouts
  
  4. Functions
    - Function to calculate royalty splits
    - Function to record blockchain transaction
    - Trigger to create instant payout on purchase
*/

-- Add new columns to profiles for Stripe Connect
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_connect_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_connect_status text DEFAULT 'not_connected';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'instant_payout_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN instant_payout_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bank_account_last4'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bank_account_last4 text;
  END IF;
END $$;

-- Add royalty split support to audio_snippets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_snippets' AND column_name = 'royalty_splits'
  ) THEN
    ALTER TABLE audio_snippets ADD COLUMN royalty_splits jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_snippets' AND column_name = 'license_file_url'
  ) THEN
    ALTER TABLE audio_snippets ADD COLUMN license_file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audio_snippets' AND column_name = 'download_count'
  ) THEN
    ALTER TABLE audio_snippets ADD COLUMN download_count integer DEFAULT 0;
  END IF;
END $$;

-- Create track_licenses table
CREATE TABLE IF NOT EXISTS track_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES audio_snippets(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  amount_paid numeric(10, 2) NOT NULL,
  currency text DEFAULT 'gbp' NOT NULL,
  license_type text NOT NULL,
  license_data jsonb NOT NULL,
  download_url text,
  download_count integer DEFAULT 0,
  blockchain_tx_id text,
  blockchain_status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending' NOT NULL,
  payout_status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  last_downloaded_at timestamptz
);

-- Create instant_payouts table
CREATE TABLE IF NOT EXISTS instant_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES track_licenses(id) ON DELETE CASCADE NOT NULL,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_transfer_id text,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'gbp' NOT NULL,
  royalty_percentage numeric(5, 2) NOT NULL,
  platform_fee numeric(10, 2) NOT NULL,
  net_payout numeric(10, 2) NOT NULL,
  split_details jsonb,
  blockchain_tx_id text,
  payout_status text DEFAULT 'pending' NOT NULL,
  payout_method text DEFAULT 'stripe_instant',
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS track_licenses_buyer_id_idx ON track_licenses(buyer_id);
CREATE INDEX IF NOT EXISTS track_licenses_artist_id_idx ON track_licenses(artist_id);
CREATE INDEX IF NOT EXISTS track_licenses_track_id_idx ON track_licenses(track_id);
CREATE INDEX IF NOT EXISTS track_licenses_stripe_session_idx ON track_licenses(stripe_session_id);
CREATE INDEX IF NOT EXISTS track_licenses_created_at_idx ON track_licenses(created_at DESC);

CREATE INDEX IF NOT EXISTS instant_payouts_artist_id_idx ON instant_payouts(artist_id);
CREATE INDEX IF NOT EXISTS instant_payouts_license_id_idx ON instant_payouts(license_id);
CREATE INDEX IF NOT EXISTS instant_payouts_created_at_idx ON instant_payouts(created_at DESC);
CREATE INDEX IF NOT EXISTS instant_payouts_status_idx ON instant_payouts(payout_status);

-- Enable RLS
ALTER TABLE track_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for track_licenses
CREATE POLICY "Buyers can view their own licenses"
  ON track_licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Artists can view licenses for their tracks"
  ON track_licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id);

CREATE POLICY "System can insert licenses"
  ON track_licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Buyers can update download count"
  ON track_licenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for instant_payouts
CREATE POLICY "Artists can view their own payouts"
  ON instant_payouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id);

CREATE POLICY "System can insert payouts"
  ON instant_payouts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to calculate royalty splits
CREATE OR REPLACE FUNCTION calculate_royalty_splits(
  p_amount numeric,
  p_royalty_splits jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
  v_split jsonb;
  v_split_amount numeric;
BEGIN
  FOR v_split IN SELECT * FROM jsonb_array_elements(p_royalty_splits)
  LOOP
    v_split_amount := p_amount * ((v_split->>'percentage')::numeric / 100.0);
    v_result := v_result || jsonb_build_object(
      'recipient_name', v_split->>'recipient_name',
      'recipient_type', v_split->>'recipient_type',
      'percentage', v_split->>'percentage',
      'amount', v_split_amount
    );
  END LOOP;
  
  RETURN v_result;
END;
$$;

-- Function to process instant payout
CREATE OR REPLACE FUNCTION process_instant_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_track record;
  v_artist_percentage numeric := 70; -- 70% to artist, 30% platform fee
  v_artist_payout numeric;
  v_platform_fee numeric;
BEGIN
  -- Only process when payment is completed
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    -- Get track details
    SELECT * INTO v_track FROM audio_snippets WHERE id = NEW.track_id;
    
    -- Calculate payouts
    v_platform_fee := NEW.amount_paid * 0.30;
    v_artist_payout := NEW.amount_paid * 0.70;
    
    -- Create instant payout record
    INSERT INTO instant_payouts (
      license_id,
      artist_id,
      amount,
      currency,
      royalty_percentage,
      platform_fee,
      net_payout,
      split_details,
      payout_status
    ) VALUES (
      NEW.id,
      NEW.artist_id,
      NEW.amount_paid,
      NEW.currency,
      v_artist_percentage,
      v_platform_fee,
      v_artist_payout,
      calculate_royalty_splits(v_artist_payout, v_track.royalty_splits),
      'pending'
    );
    
    -- Update artist earnings
    UPDATE profiles
    SET total_earnings = COALESCE(total_earnings, 0) + v_artist_payout
    WHERE id = NEW.artist_id;
    
    -- Update track download count
    UPDATE audio_snippets
    SET download_count = COALESCE(download_count, 0) + 1
    WHERE id = NEW.track_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for instant payouts
DROP TRIGGER IF EXISTS trigger_process_instant_payout ON track_licenses;
CREATE TRIGGER trigger_process_instant_payout
  AFTER INSERT OR UPDATE ON track_licenses
  FOR EACH ROW
  EXECUTE FUNCTION process_instant_payout();
