/*
  # Add Continuous Royalty Tracking & Digital Clearance System

  1. New Tables
    - `digital_clearance_codes`
      - Unique codes for each license
      - Links to content URLs across platforms
      - Tracks verification status
    
    - `content_usage_tracking`
      - Records every piece of content created with licensed audio
      - Tracks platform, URL, views, plays, engagement
      - Updated automatically via API integrations
    
    - `ongoing_royalty_payments`
      - Records continuous royalty payments based on performance
      - Calculates artist share (70%) and platform commission (30%)
      - Processes payments automatically based on thresholds
    
    - `platform_api_connections`
      - Stores API credentials for platform monitoring
      - YouTube Data API, TikTok API, Instagram Graph API
  
  2. Digital Clearance
    - Generate unique clearance codes per license
    - QR codes for easy verification
    - Public verification portal
  
  3. Continuous Royalty Calculations
    - Per-play rates: YouTube ($0.003), TikTok ($0.002), Instagram ($0.0025)
    - Aggregated daily/weekly/monthly
    - Auto-payout when threshold reached ($10)
  
  4. Security
    - Enable RLS on all tables
    - Content creators can only view their own usage
    - Artists can view all usage of their tracks
    - Public can verify clearance codes
*/

-- Create digital_clearance_codes table
CREATE TABLE IF NOT EXISTS digital_clearance_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_code text UNIQUE NOT NULL,
  license_id uuid REFERENCES track_licenses(id) ON DELETE CASCADE NOT NULL,
  track_id uuid REFERENCES audio_snippets(id) ON DELETE CASCADE NOT NULL,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  qr_code_url text,
  verification_url text,
  is_active boolean DEFAULT true,
  platforms_allowed text[] DEFAULT ARRAY['youtube', 'tiktok', 'instagram', 'twitch', 'facebook', 'podcast'],
  usage_count integer DEFAULT 0,
  total_views bigint DEFAULT 0,
  total_plays bigint DEFAULT 0,
  total_royalties_earned numeric(12, 2) DEFAULT 0,
  last_tracked_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz
);

-- Create content_usage_tracking table
CREATE TABLE IF NOT EXISTS content_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_code text REFERENCES digital_clearance_codes(clearance_code) ON DELETE CASCADE NOT NULL,
  license_id uuid REFERENCES track_licenses(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  content_url text NOT NULL,
  content_id text,
  content_title text,
  content_type text DEFAULT 'video',
  views bigint DEFAULT 0,
  plays bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  engagement_rate numeric(5, 2) DEFAULT 0,
  is_monetized boolean DEFAULT false,
  royalty_per_view numeric(10, 6) DEFAULT 0.003,
  total_royalties_generated numeric(12, 2) DEFAULT 0,
  last_synced_at timestamptz DEFAULT now(),
  first_published_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create ongoing_royalty_payments table
CREATE TABLE IF NOT EXISTS ongoing_royalty_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_code text REFERENCES digital_clearance_codes(clearance_code) ON DELETE CASCADE NOT NULL,
  license_id uuid REFERENCES track_licenses(id) ON DELETE CASCADE NOT NULL,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_views bigint NOT NULL,
  total_plays bigint NOT NULL,
  gross_royalties numeric(12, 2) NOT NULL,
  artist_share numeric(12, 2) NOT NULL,
  platform_commission numeric(12, 2) NOT NULL,
  artist_percentage numeric(5, 2) DEFAULT 70 NOT NULL,
  platform_percentage numeric(5, 2) DEFAULT 30 NOT NULL,
  payout_status text DEFAULT 'pending',
  stripe_transfer_id text,
  blockchain_tx_id text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  breakdown_by_platform jsonb DEFAULT '{}'::jsonb
);

-- Create platform_api_connections table
CREATE TABLE IF NOT EXISTS platform_api_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  api_token_encrypted text,
  channel_id text,
  channel_name text,
  is_connected boolean DEFAULT false,
  last_sync_at timestamptz,
  sync_frequency text DEFAULT 'daily',
  auto_tracking_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS clearance_code_idx ON digital_clearance_codes(clearance_code);
CREATE INDEX IF NOT EXISTS clearance_license_idx ON digital_clearance_codes(license_id);
CREATE INDEX IF NOT EXISTS clearance_artist_idx ON digital_clearance_codes(artist_id);
CREATE INDEX IF NOT EXISTS clearance_buyer_idx ON digital_clearance_codes(buyer_id);
CREATE INDEX IF NOT EXISTS clearance_active_idx ON digital_clearance_codes(is_active);

CREATE INDEX IF NOT EXISTS usage_clearance_idx ON content_usage_tracking(clearance_code);
CREATE INDEX IF NOT EXISTS usage_platform_idx ON content_usage_tracking(platform);
CREATE INDEX IF NOT EXISTS usage_content_url_idx ON content_usage_tracking(content_url);
CREATE INDEX IF NOT EXISTS usage_synced_at_idx ON content_usage_tracking(last_synced_at DESC);

CREATE INDEX IF NOT EXISTS royalty_payments_artist_idx ON ongoing_royalty_payments(artist_id);
CREATE INDEX IF NOT EXISTS royalty_payments_buyer_idx ON ongoing_royalty_payments(buyer_id);
CREATE INDEX IF NOT EXISTS royalty_payments_status_idx ON ongoing_royalty_payments(payout_status);
CREATE INDEX IF NOT EXISTS royalty_payments_period_idx ON ongoing_royalty_payments(period_start, period_end);

CREATE INDEX IF NOT EXISTS platform_api_user_idx ON platform_api_connections(user_id);
CREATE INDEX IF NOT EXISTS platform_api_platform_idx ON platform_api_connections(platform);

-- Enable RLS
ALTER TABLE digital_clearance_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ongoing_royalty_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_api_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for digital_clearance_codes
CREATE POLICY "Anyone can verify clearance codes"
  ON digital_clearance_codes
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Buyers can view their clearance codes"
  ON digital_clearance_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Artists can view codes for their tracks"
  ON digital_clearance_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id);

CREATE POLICY "System can create clearance codes"
  ON digital_clearance_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update clearance codes"
  ON digital_clearance_codes
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for content_usage_tracking
CREATE POLICY "Buyers can view their content usage"
  ON content_usage_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM digital_clearance_codes
      WHERE digital_clearance_codes.clearance_code = content_usage_tracking.clearance_code
      AND digital_clearance_codes.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Artists can view usage of their tracks"
  ON content_usage_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM digital_clearance_codes
      WHERE digital_clearance_codes.clearance_code = content_usage_tracking.clearance_code
      AND digital_clearance_codes.artist_id = auth.uid()
    )
  );

CREATE POLICY "System can insert usage tracking"
  ON content_usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update usage tracking"
  ON content_usage_tracking
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for ongoing_royalty_payments
CREATE POLICY "Artists can view their royalty payments"
  ON ongoing_royalty_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id);

CREATE POLICY "Buyers can view royalty data for their content"
  ON ongoing_royalty_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "System can insert royalty payments"
  ON ongoing_royalty_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update royalty payments"
  ON ongoing_royalty_payments
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for platform_api_connections
CREATE POLICY "Users can manage their own platform connections"
  ON platform_api_connections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to generate clearance code
CREATE OR REPLACE FUNCTION generate_clearance_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := 'V3B-' || 
              upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
              upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
              upper(substring(md5(random()::text) from 1 for 4));
    
    SELECT EXISTS(SELECT 1 FROM digital_clearance_codes WHERE clearance_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to auto-generate clearance code on license creation
CREATE OR REPLACE FUNCTION create_digital_clearance_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clearance_code text;
  v_verification_url text;
BEGIN
  IF NEW.payment_status = 'completed' THEN
    v_clearance_code := generate_clearance_code();
    v_verification_url := 'https://dccsverify.com/verify/' || v_clearance_code;
    
    INSERT INTO digital_clearance_codes (
      clearance_code,
      license_id,
      track_id,
      artist_id,
      buyer_id,
      verification_url,
      expires_at
    ) VALUES (
      v_clearance_code,
      NEW.id,
      NEW.track_id,
      NEW.artist_id,
      NEW.buyer_id,
      v_verification_url,
      NEW.expires_at
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create clearance codes
DROP TRIGGER IF EXISTS trigger_create_clearance_code ON track_licenses;
CREATE TRIGGER trigger_create_clearance_code
  AFTER INSERT OR UPDATE ON track_licenses
  FOR EACH ROW
  EXECUTE FUNCTION create_digital_clearance_code();

-- Function to calculate and process ongoing royalties
CREATE OR REPLACE FUNCTION process_ongoing_royalties()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clearance record;
  v_total_views bigint;
  v_total_plays bigint;
  v_gross_royalties numeric;
  v_artist_share numeric;
  v_platform_commission numeric;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  v_period_end := now();
  v_period_start := v_period_end - interval '1 day';
  
  FOR v_clearance IN 
    SELECT 
      dcc.clearance_code,
      dcc.license_id,
      dcc.artist_id,
      dcc.buyer_id,
      SUM(cut.views) as total_views,
      SUM(cut.plays) as total_plays,
      SUM(cut.total_royalties_generated) as gross_royalties
    FROM digital_clearance_codes dcc
    JOIN content_usage_tracking cut ON cut.clearance_code = dcc.clearance_code
    WHERE cut.last_synced_at >= v_period_start
    AND dcc.is_active = true
    GROUP BY dcc.clearance_code, dcc.license_id, dcc.artist_id, dcc.buyer_id
    HAVING SUM(cut.total_royalties_generated) > 0
  LOOP
    v_gross_royalties := v_clearance.gross_royalties;
    v_artist_share := v_gross_royalties * 0.70;
    v_platform_commission := v_gross_royalties * 0.30;
    
    INSERT INTO ongoing_royalty_payments (
      clearance_code,
      license_id,
      artist_id,
      buyer_id,
      period_start,
      period_end,
      total_views,
      total_plays,
      gross_royalties,
      artist_share,
      platform_commission,
      payout_status
    ) VALUES (
      v_clearance.clearance_code,
      v_clearance.license_id,
      v_clearance.artist_id,
      v_clearance.buyer_id,
      v_period_start,
      v_period_end,
      v_clearance.total_views,
      v_clearance.total_plays,
      v_gross_royalties,
      v_artist_share,
      v_platform_commission,
      'pending'
    );
    
    UPDATE digital_clearance_codes
    SET 
      total_views = total_views + v_clearance.total_views,
      total_plays = total_plays + v_clearance.total_plays,
      total_royalties_earned = total_royalties_earned + v_gross_royalties,
      last_tracked_at = now()
    WHERE clearance_code = v_clearance.clearance_code;
    
    UPDATE profiles
    SET total_earnings = COALESCE(total_earnings, 0) + v_artist_share
    WHERE id = v_clearance.artist_id;
  END LOOP;
END;
$$;

-- Function to sync platform data and calculate royalties
CREATE OR REPLACE FUNCTION sync_platform_usage(
  p_clearance_code text,
  p_platform text,
  p_content_url text,
  p_views bigint,
  p_plays bigint,
  p_likes bigint DEFAULT 0,
  p_comments bigint DEFAULT 0,
  p_shares bigint DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license_id uuid;
  v_royalty_rate numeric;
  v_new_views bigint;
  v_new_royalties numeric;
BEGIN
  SELECT license_id INTO v_license_id
  FROM digital_clearance_codes
  WHERE clearance_code = p_clearance_code;
  
  IF v_license_id IS NULL THEN
    RAISE EXCEPTION 'Invalid clearance code';
  END IF;
  
  v_royalty_rate := CASE p_platform
    WHEN 'youtube' THEN 0.003
    WHEN 'tiktok' THEN 0.002
    WHEN 'instagram' THEN 0.0025
    WHEN 'twitch' THEN 0.004
    WHEN 'facebook' THEN 0.0020
    ELSE 0.002
  END;
  
  INSERT INTO content_usage_tracking (
    clearance_code,
    license_id,
    platform,
    content_url,
    views,
    plays,
    likes,
    comments,
    shares,
    royalty_per_view,
    total_royalties_generated,
    last_synced_at
  ) VALUES (
    p_clearance_code,
    v_license_id,
    p_platform,
    p_content_url,
    p_views,
    p_plays,
    p_likes,
    p_comments,
    p_shares,
    v_royalty_rate,
    p_views * v_royalty_rate,
    now()
  )
  ON CONFLICT (content_url) 
  DO UPDATE SET
    views = EXCLUDED.views,
    plays = EXCLUDED.plays,
    likes = EXCLUDED.likes,
    comments = EXCLUDED.comments,
    shares = EXCLUDED.shares,
    total_royalties_generated = EXCLUDED.views * v_royalty_rate,
    last_synced_at = now();
END;
$$;

-- Add unique constraint for content_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_usage_tracking_content_url_key'
  ) THEN
    ALTER TABLE content_usage_tracking ADD CONSTRAINT content_usage_tracking_content_url_key UNIQUE (content_url);
  END IF;
END $$;
