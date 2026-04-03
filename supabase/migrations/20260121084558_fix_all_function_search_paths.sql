/*
  # Fix All Function Search Paths

  ## Summary
  Fixes search_path for all overloaded versions of DCCS functions.
  Multiple function signatures exist for each function name, and all must have
  secure search_path settings.
  
  ## Impact
  - Eliminates all search_path injection vulnerabilities
  - All function overloads now secure
*/

-- =====================================================
-- FIX: calculate_dccs_royalty_split (trigger version)
-- =====================================================
DROP FUNCTION IF EXISTS calculate_dccs_royalty_split() CASCADE;
CREATE FUNCTION calculate_dccs_royalty_split()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Enforce immutable 80/20 split
  NEW.artist_percentage := 80.00;
  NEW.platform_percentage := 20.00;
  
  -- Calculate exact splits
  NEW.artist_share := ROUND((NEW.gross_royalties * 0.80)::numeric, 2);
  NEW.platform_commission := ROUND((NEW.gross_royalties * 0.20)::numeric, 2);
  
  -- Calculate net payout after processing fees
  NEW.net_artist_payout := NEW.artist_share - COALESCE(NEW.processing_fee, 0);
  
  -- Validate amounts are positive
  IF NEW.gross_royalties < 0 OR NEW.artist_share < 0 OR NEW.platform_commission < 0 THEN
    RAISE EXCEPTION 'Royalty amounts cannot be negative';
  END IF;
  
  -- Validate split adds up correctly (within 0.01 tolerance)
  IF ABS((NEW.artist_share + NEW.platform_commission) - NEW.gross_royalties) > 0.01 THEN
    RAISE EXCEPTION 'Split calculation error: artist_share + platform_commission must equal gross_royalties';
  END IF;
  
  -- Set updated timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- FIX: calculate_dccs_royalty_split (jsonb version)
-- =====================================================
DROP FUNCTION IF EXISTS calculate_dccs_royalty_split(numeric, numeric, numeric);
CREATE FUNCTION calculate_dccs_royalty_split(
  p_gross_amount numeric,
  p_artist_percentage numeric DEFAULT 80.0,
  p_processing_fee_percentage numeric DEFAULT 2.5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- =====================================================
-- FIX: complete_dccs_royalty_payout (jsonb version)
-- =====================================================
DROP FUNCTION IF EXISTS complete_dccs_royalty_payout(uuid, text, text);
CREATE FUNCTION complete_dccs_royalty_payout(
  p_payment_id uuid,
  p_transfer_id text DEFAULT NULL,
  p_tx_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_status text;
BEGIN
  SELECT payout_status INTO v_old_status FROM dccs_royalty_payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;
  
  UPDATE dccs_royalty_payments
  SET
    payout_status = 'completed',
    stripe_transfer_id = COALESCE(p_transfer_id, stripe_transfer_id),
    blockchain_tx_hash = COALESCE(p_tx_hash, blockchain_tx_hash),
    paid_at = now(),
    updated_at = now()
  WHERE id = p_payment_id;
  
  INSERT INTO dccs_royalty_payment_audit (
    payment_id,
    changed_by,
    change_type,
    old_status,
    new_status,
    notes
  ) VALUES (
    p_payment_id,
    auth.uid(),
    'payout_completed',
    v_old_status,
    'completed',
    'Payout successfully completed'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'status', 'completed'
  );
END;
$$;

-- =====================================================
-- FIX: generate_dccs_certificate_hash (4-param version)
-- =====================================================
DROP FUNCTION IF EXISTS generate_dccs_certificate_hash(text, uuid, uuid, text);
CREATE FUNCTION generate_dccs_certificate_hash(
  p_certificate_id text,
  p_snippet_id uuid,
  p_creator_id uuid,
  p_audio_fingerprint text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- =====================================================
-- FIX: generate_dccs_certificate_hash (6-param version)
-- =====================================================
DROP FUNCTION IF EXISTS generate_dccs_certificate_hash(text, uuid, text, timestamp with time zone, text, text);
CREATE FUNCTION generate_dccs_certificate_hash(
  p_certificate_id text,
  p_creator_id uuid,
  p_project_title text,
  p_creation_timestamp timestamp with time zone,
  p_audio_fingerprint text,
  p_previous_hash text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN encode(
    digest(
      p_certificate_id ||
      p_creator_id::text ||
      p_project_title ||
      p_creation_timestamp::text ||
      p_audio_fingerprint ||
      COALESCE(p_previous_hash, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- =====================================================
-- FIX: process_dccs_royalty_payout (void version)
-- =====================================================
DROP FUNCTION IF EXISTS process_dccs_royalty_payout(uuid);
CREATE FUNCTION process_dccs_royalty_payout(p_payment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- =====================================================
-- FIX: process_dccs_royalty_payout (jsonb version)
-- =====================================================
DROP FUNCTION IF EXISTS process_dccs_royalty_payout(uuid, text, text, text);
CREATE FUNCTION process_dccs_royalty_payout(
  p_payment_id uuid,
  p_payment_method text,
  p_transfer_id text DEFAULT NULL,
  p_tx_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment dccs_royalty_payments%ROWTYPE;
BEGIN
  SELECT * INTO v_payment FROM dccs_royalty_payments WHERE id = p_payment_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;
  
  IF v_payment.payout_status NOT IN ('pending', 'failed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment already processed');
  END IF;
  
  UPDATE dccs_royalty_payments
  SET
    payout_status = 'processing',
    payment_method = p_payment_method,
    stripe_transfer_id = COALESCE(p_transfer_id, stripe_transfer_id),
    blockchain_tx_hash = COALESCE(p_tx_hash, blockchain_tx_hash),
    updated_at = now()
  WHERE id = p_payment_id;
  
  INSERT INTO dccs_royalty_payment_audit (
    payment_id,
    changed_by,
    change_type,
    old_status,
    new_status,
    notes
  ) VALUES (
    p_payment_id,
    auth.uid(),
    'status_changed',
    v_payment.payout_status,
    'processing',
    'Payment processing initiated via ' || p_payment_method
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'artist_payout', v_payment.net_artist_payout,
    'payment_method', p_payment_method
  );
END;
$$;
