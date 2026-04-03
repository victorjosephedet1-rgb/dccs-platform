/*
  # DCCS Ongoing Royalty System - 80/20 Lifetime Split

  ## Overview
  Implements lifetime ongoing royalties tracked exclusively through DCCS (Digital Content Clearance System).
  Artists receive 80% of all performance-based royalties, platform receives 20%.

  ## New Tables
  1. `dccs_royalty_payments`
     - Tracks ongoing royalty payments from DCCS-verified content
     - 80% artist / 20% platform split (lifetime contract)
     - Links to clearance codes and platform usage
  
  ## Functions
  1. `process_dccs_ongoing_royalties()` - Calculates and distributes ongoing royalties via DCCS
  2. `sync_platform_usage_dccs()` - Syncs content performance from platforms
  
  ## Security
  - RLS enabled on all tables
  - Only DCCS-verified content generates ongoing royalties
  - Immutable 80/20 split enforced at database level
  
  ## Royalty Rates by Platform
  - YouTube: $0.003 per view
  - TikTok: $0.002 per play
  - Instagram: $0.0025 per view
  - Twitch: $0.004 per view
  - Facebook: $0.002 per view
  - Podcast: $0.002 per download
*/

-- Create DCCS ongoing royalty payments table
CREATE TABLE IF NOT EXISTS dccs_royalty_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_code text NOT NULL,
  license_id uuid REFERENCES track_licenses(id) ON DELETE CASCADE NOT NULL,
  artist_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_views bigint DEFAULT 0 NOT NULL,
  total_plays bigint DEFAULT 0 NOT NULL,
  gross_royalties numeric(15,2) NOT NULL,
  artist_share numeric(15,2) NOT NULL,
  platform_commission numeric(15,2) NOT NULL,
  artist_percentage numeric(5,2) DEFAULT 80.00 NOT NULL,
  platform_percentage numeric(5,2) DEFAULT 20.00 NOT NULL,
  payout_status text DEFAULT 'pending' NOT NULL CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id text,
  blockchain_tx_hash text,
  paid_at timestamptz,
  breakdown_by_platform jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT dccs_80_20_split CHECK (
    artist_percentage = 80.00 AND 
    platform_percentage = 20.00 AND
    ABS(artist_share - ROUND((gross_royalties * 0.80)::numeric, 2)) < 0.01 AND
    ABS(platform_commission - ROUND((gross_royalties * 0.20)::numeric, 2)) < 0.01
  )
);

-- Create indexes for DCCS royalty payments
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_clearance ON dccs_royalty_payments(clearance_code);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_license ON dccs_royalty_payments(license_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_artist ON dccs_royalty_payments(artist_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_buyer ON dccs_royalty_payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_status ON dccs_royalty_payments(payout_status);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_period ON dccs_royalty_payments(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_created ON dccs_royalty_payments(created_at DESC);

-- Enable RLS
ALTER TABLE dccs_royalty_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Artists can view their DCCS royalty payments"
  ON dccs_royalty_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id);

CREATE POLICY "Buyers can view DCCS royalty data for their content"
  ON dccs_royalty_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "System can insert DCCS royalty payments"
  ON dccs_royalty_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    artist_percentage = 80.00 AND 
    platform_percentage = 20.00
  );

CREATE POLICY "System can update DCCS royalty payments"
  ON dccs_royalty_payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    artist_percentage = 80.00 AND 
    platform_percentage = 20.00
  );

-- Function to sync platform usage via DCCS
CREATE OR REPLACE FUNCTION sync_platform_usage_dccs(
  p_clearance_code text,
  p_platform text,
  p_content_url text,
  p_views bigint DEFAULT 0,
  p_plays bigint DEFAULT 0,
  p_engagement_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_license_id uuid;
  v_royalty_rate numeric;
  v_new_royalties numeric;
BEGIN
  -- Verify clearance code exists and get license
  SELECT id INTO v_license_id
  FROM track_licenses
  WHERE clearance_code = p_clearance_code
  AND payment_status = 'completed';
  
  IF v_license_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or unpaid clearance code: %', p_clearance_code;
  END IF;
  
  -- Set platform-specific royalty rates
  v_royalty_rate := CASE p_platform
    WHEN 'youtube' THEN 0.003
    WHEN 'tiktok' THEN 0.002
    WHEN 'instagram' THEN 0.0025
    WHEN 'twitch' THEN 0.004
    WHEN 'facebook' THEN 0.0020
    WHEN 'podcast' THEN 0.002
    ELSE 0.002
  END;
  
  -- Calculate royalties from views
  v_new_royalties := (p_views * v_royalty_rate)::numeric(15,2);
  
  -- Insert or update platform usage tracking
  INSERT INTO platform_usage_tracking (
    license_id,
    clearance_code,
    platform,
    content_url,
    view_count,
    engagement_metrics,
    royalty_amount,
    verified,
    last_tracked_at
  ) VALUES (
    v_license_id,
    p_clearance_code,
    p_platform,
    p_content_url,
    p_views,
    p_engagement_data,
    v_new_royalties,
    true,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
    
  -- Update license totals
  UPDATE track_licenses
  SET 
    total_views = COALESCE(total_views, 0) + p_views,
    usage_count = COALESCE(usage_count, 0) + 1,
    total_royalties_earned = COALESCE(total_royalties_earned, 0) + v_new_royalties
  WHERE id = v_license_id;
END;
$$;

-- Function to process DCCS ongoing royalties (80/20 split)
CREATE OR REPLACE FUNCTION process_dccs_ongoing_royalties()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_license record;
  v_gross_royalties numeric;
  v_artist_share numeric;
  v_platform_commission numeric;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_processed_count integer := 0;
  v_total_amount numeric := 0;
  v_result jsonb;
BEGIN
  v_period_end := now();
  v_period_start := v_period_end - interval '1 day';
  
  -- Process each license with DCCS-tracked usage in the period
  FOR v_license IN 
    SELECT 
      tl.clearance_code,
      tl.id as license_id,
      tl.artist_id,
      tl.buyer_id,
      SUM(put.view_count) as total_views,
      COUNT(put.id) as total_plays,
      SUM(put.royalty_amount) as gross_royalties,
      jsonb_object_agg(
        put.platform, 
        jsonb_build_object(
          'views', put.view_count,
          'royalties', put.royalty_amount
        )
      ) as platform_breakdown
    FROM track_licenses tl
    INNER JOIN platform_usage_tracking put ON put.license_id = tl.id
    WHERE put.last_tracked_at >= v_period_start
    AND put.last_tracked_at < v_period_end
    AND put.verified = true
    AND tl.clearance_code IS NOT NULL
    AND tl.payment_status = 'completed'
    GROUP BY tl.clearance_code, tl.id, tl.artist_id, tl.buyer_id
    HAVING SUM(put.royalty_amount) > 0
  LOOP
    v_gross_royalties := v_license.gross_royalties;
    
    -- Calculate 80/20 lifetime split
    v_artist_share := ROUND((v_gross_royalties * 0.80)::numeric, 2);
    v_platform_commission := ROUND((v_gross_royalties * 0.20)::numeric, 2);
    
    -- Insert DCCS ongoing royalty payment record
    INSERT INTO dccs_royalty_payments (
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
      artist_percentage,
      platform_percentage,
      payout_status,
      breakdown_by_platform
    ) VALUES (
      v_license.clearance_code,
      v_license.license_id,
      v_license.artist_id,
      v_license.buyer_id,
      v_period_start,
      v_period_end,
      v_license.total_views,
      v_license.total_plays,
      v_gross_royalties,
      v_artist_share,
      v_platform_commission,
      80.00,
      20.00,
      'pending',
      v_license.platform_breakdown
    );
    
    -- Update artist lifetime earnings
    UPDATE profiles
    SET total_earnings = COALESCE(total_earnings, 0) + v_artist_share
    WHERE id = v_license.artist_id;
    
    v_processed_count := v_processed_count + 1;
    v_total_amount := v_total_amount + v_gross_royalties;
  END LOOP;
  
  v_result := jsonb_build_object(
    'success', true,
    'period_start', v_period_start,
    'period_end', v_period_end,
    'licenses_processed', v_processed_count,
    'total_royalties', v_total_amount,
    'artist_total', ROUND((v_total_amount * 0.80)::numeric, 2),
    'platform_total', ROUND((v_total_amount * 0.20)::numeric, 2),
    'split_ratio', '80/20',
    'processed_at', now()
  );
  
  RETURN v_result;
END;
$$;

-- Add comments
COMMENT ON TABLE dccs_royalty_payments IS 
'DCCS ongoing royalty payments with immutable 80/20 lifetime split. Artists receive 80% of all performance-based royalties tracked via Digital Content Clearance System.';

COMMENT ON FUNCTION process_dccs_ongoing_royalties() IS 
'Processes ongoing royalties from DCCS-verified content. Enforces 80% artist / 20% platform split for lifetime of content.';

COMMENT ON FUNCTION sync_platform_usage_dccs(text, text, text, bigint, bigint, jsonb) IS 
'Syncs platform usage data for DCCS-tracked content. Only verified clearance codes can generate ongoing royalties.';
