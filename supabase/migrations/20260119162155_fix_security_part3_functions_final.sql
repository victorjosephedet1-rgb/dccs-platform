/*
  # Fix Security Issues - Part 3: Function Search Path Security (Final)

  ## Function Security
  Fixes search_path security for functions to prevent privilege escalation attacks
  
  ## Functions Updated
  - generate_dccs_certificate_id
  - generate_dccs_certificate_hash
  - set_dccs_certificate_data
  - calculate_dccs_royalty_split
  - process_dccs_royalty_payout
  - complete_dccs_royalty_payout
  - fail_dccs_royalty_payout
  - get_artist_royalty_summary
*/

-- Drop functions that need to be recreated
DROP FUNCTION IF EXISTS fail_dccs_royalty_payout(uuid, text);
DROP FUNCTION IF EXISTS process_dccs_royalty_payout(uuid);
DROP FUNCTION IF EXISTS complete_dccs_royalty_payout(uuid, text);
DROP FUNCTION IF EXISTS get_artist_royalty_summary(uuid, timestamptz, timestamptz);

-- =====================================================
-- DCCS CERTIFICATE FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION generate_dccs_certificate_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id text;
  exists boolean;
BEGIN
  LOOP
    new_id := 'DCCS' || LPAD(floor(random() * 1000000)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM dccs_certificates WHERE certificate_id = new_id) INTO exists;
    IF NOT exists THEN
      RETURN new_id;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION generate_dccs_certificate_hash(
  p_certificate_id text,
  p_snippet_id uuid,
  p_creator_id uuid,
  p_audio_fingerprint text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(
    digest(
      p_certificate_id || 
      p_snippet_id::text || 
      p_creator_id::text || 
      p_audio_fingerprint ||
      EXTRACT(EPOCH FROM now())::text,
      'sha256'
    ),
    'hex'
  );
END;
$$;

CREATE OR REPLACE FUNCTION set_dccs_certificate_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.certificate_id IS NULL THEN
    NEW.certificate_id := generate_dccs_certificate_id();
  END IF;
  
  IF NEW.clearance_code IS NULL THEN
    NEW.clearance_code := 'CLR-' || upper(substring(md5(random()::text) from 1 for 12));
  END IF;
  
  IF NEW.blockchain_hash IS NULL AND NEW.audio_fingerprint IS NOT NULL THEN
    NEW.blockchain_hash := generate_dccs_certificate_hash(
      NEW.certificate_id,
      NEW.snippet_id,
      NEW.creator_id,
      NEW.audio_fingerprint
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- DCCS ROYALTY PAYMENT FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_dccs_royalty_split(
  p_gross_amount numeric,
  p_artist_percentage numeric DEFAULT 80.0,
  p_processing_fee_percentage numeric DEFAULT 2.5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_artist_share numeric;
  v_platform_commission numeric;
  v_processing_fee numeric;
  v_net_artist_payout numeric;
BEGIN
  v_artist_share := round(p_gross_amount * (p_artist_percentage / 100.0), 2);
  v_platform_commission := round(p_gross_amount - v_artist_share, 2);
  v_processing_fee := round(v_artist_share * (p_processing_fee_percentage / 100.0), 2);
  v_net_artist_payout := round(v_artist_share - v_processing_fee, 2);
  
  RETURN jsonb_build_object(
    'gross_royalties', p_gross_amount,
    'artist_share', v_artist_share,
    'platform_commission', v_platform_commission,
    'processing_fee', v_processing_fee,
    'net_artist_payout', v_net_artist_payout,
    'artist_percentage', p_artist_percentage,
    'platform_percentage', (100.0 - p_artist_percentage)
  );
END;
$$;

CREATE FUNCTION process_dccs_royalty_payout(p_payment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE dccs_royalty_payments
  SET 
    payout_status = 'processing',
    updated_at = now()
  WHERE id = p_payment_id
  AND payout_status = 'pending';
END;
$$;

CREATE FUNCTION complete_dccs_royalty_payout(
  p_payment_id uuid,
  p_transaction_reference text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE dccs_royalty_payments
  SET 
    payout_status = 'completed',
    paid_at = now(),
    updated_at = now(),
    blockchain_tx_hash = COALESCE(p_transaction_reference, blockchain_tx_hash)
  WHERE id = p_payment_id
  AND payout_status = 'processing';
END;
$$;

CREATE FUNCTION fail_dccs_royalty_payout(
  p_payment_id uuid,
  p_failure_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE dccs_royalty_payments
  SET 
    payout_status = 'failed',
    updated_at = now()
  WHERE id = p_payment_id
  AND payout_status IN ('pending', 'processing');
END;
$$;

CREATE FUNCTION get_artist_royalty_summary(
  p_artist_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  artist_id uuid,
  total_payments bigint,
  total_gross_royalties numeric,
  total_artist_share numeric,
  total_platform_commission numeric,
  amount_paid_out numeric,
  amount_pending numeric,
  amount_processing numeric,
  amount_failed numeric,
  total_net_payout numeric,
  total_processing_fees numeric,
  artist_percentage numeric,
  first_payment_period timestamptz,
  last_payment_period timestamptz,
  query_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_artist_id,
    COUNT(*)::bigint as total_payments,
    COALESCE(SUM(rp.gross_royalties), 0) as total_gross_royalties,
    COALESCE(SUM(rp.artist_share), 0) as total_artist_share,
    COALESCE(SUM(rp.gross_royalties - rp.artist_share), 0) as total_platform_commission,
    COALESCE(SUM(CASE WHEN rp.payout_status = 'completed' THEN rp.net_artist_payout ELSE 0 END), 0) as amount_paid_out,
    COALESCE(SUM(CASE WHEN rp.payout_status = 'pending' THEN rp.net_artist_payout ELSE 0 END), 0) as amount_pending,
    COALESCE(SUM(CASE WHEN rp.payout_status = 'processing' THEN rp.net_artist_payout ELSE 0 END), 0) as amount_processing,
    COALESCE(SUM(CASE WHEN rp.payout_status = 'failed' THEN rp.net_artist_payout ELSE 0 END), 0) as amount_failed,
    COALESCE(SUM(rp.net_artist_payout), 0) as total_net_payout,
    COALESCE(SUM(rp.processing_fee), 0) as total_processing_fees,
    80.0 as artist_percentage,
    MIN(rp.period_start) as first_payment_period,
    MAX(rp.period_end) as last_payment_period,
    now() as query_date
  FROM dccs_royalty_payments rp
  WHERE rp.artist_id = p_artist_id
    AND (p_start_date IS NULL OR rp.period_start >= p_start_date)
    AND (p_end_date IS NULL OR rp.period_end <= p_end_date);
END;
$$;
