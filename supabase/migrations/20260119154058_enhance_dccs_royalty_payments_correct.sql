/*
  # Enhanced DCCS Royalty Payment System with Database-Level Enforcement

  ## Overview
  Enhances the existing dccs_royalty_payments table with:
  - Stricter database-level 80/20 split enforcement
  - Automatic calculation triggers
  - Payment processing automation
  - Enhanced audit trail
  - Improved RLS policies
  - Helper functions for payment operations

  ## New Tables
  1. `dccs_royalty_payment_audit` - Complete audit trail of all payment changes

  ## New Columns on dccs_royalty_payments
  - payment_method, currency, exchange_rate
  - processing_fee, net_artist_payout
  - payout_batch_id, notes, failed_reason
  - retry_count, last_retry_at, updated_at

  ## New Functions
  - calculate_dccs_royalty_split() - Auto-calculates 80/20 split (trigger)
  - process_dccs_royalty_payout() - Initiates payment processing
  - complete_dccs_royalty_payout() - Marks payment as completed
  - fail_dccs_royalty_payout() - Handles failed payments
  - get_artist_royalty_summary() - Returns earnings summary

  ## New View
  - artist_royalty_dashboard - Artist-friendly payment view

  ## Security
  - Database-level 80/20 split enforcement
  - Automatic calculation prevents tampering
  - Complete audit trail
  - Restrictive RLS policies
*/

-- Add payment method and additional tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_royalty_payments' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE dccs_royalty_payments
      ADD COLUMN payment_method text CHECK (payment_method IN ('stripe', 'crypto', 'paypal', 'bank_transfer', 'mobile_money')),
      ADD COLUMN currency text DEFAULT 'USD' NOT NULL,
      ADD COLUMN exchange_rate numeric(15,6) DEFAULT 1.0,
      ADD COLUMN original_amount numeric(15,2),
      ADD COLUMN processing_fee numeric(15,2) DEFAULT 0,
      ADD COLUMN net_artist_payout numeric(15,2),
      ADD COLUMN payout_batch_id uuid,
      ADD COLUMN notes text,
      ADD COLUMN failed_reason text,
      ADD COLUMN retry_count integer DEFAULT 0,
      ADD COLUMN last_retry_at timestamptz,
      ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create audit log table for payment changes
CREATE TABLE IF NOT EXISTS dccs_royalty_payment_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES dccs_royalty_payments(id) ON DELETE CASCADE NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  change_type text NOT NULL CHECK (change_type IN ('created', 'status_changed', 'amount_adjusted', 'payout_completed', 'payout_failed')),
  old_status text,
  new_status text,
  old_values jsonb,
  new_values jsonb,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_royalty_audit_payment ON dccs_royalty_payment_audit(payment_id);
CREATE INDEX IF NOT EXISTS idx_royalty_audit_created ON dccs_royalty_payment_audit(created_at DESC);

-- Enable RLS on audit table
ALTER TABLE dccs_royalty_payment_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON dccs_royalty_payment_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Artists can view their payment audit logs"
  ON dccs_royalty_payment_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_royalty_payments
      WHERE dccs_royalty_payments.id = payment_id
      AND dccs_royalty_payments.artist_id = auth.uid()
    )
  );

-- Function to automatically calculate and enforce 80/20 split
CREATE OR REPLACE FUNCTION calculate_dccs_royalty_split()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic split calculation
DROP TRIGGER IF EXISTS trigger_calculate_royalty_split ON dccs_royalty_payments;
CREATE TRIGGER trigger_calculate_royalty_split
  BEFORE INSERT OR UPDATE ON dccs_royalty_payments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_dccs_royalty_split();

-- Function to process royalty payout
CREATE OR REPLACE FUNCTION process_dccs_royalty_payout(
  p_payment_id uuid,
  p_payment_method text,
  p_transfer_id text DEFAULT NULL,
  p_tx_hash text DEFAULT NULL
)
RETURNS jsonb AS $$
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
  SET payout_status = 'processing', payment_method = p_payment_method,
      stripe_transfer_id = COALESCE(p_transfer_id, stripe_transfer_id),
      blockchain_tx_hash = COALESCE(p_tx_hash, blockchain_tx_hash), updated_at = now()
  WHERE id = p_payment_id;

  INSERT INTO dccs_royalty_payment_audit (payment_id, changed_by, change_type, old_status, new_status, notes)
  VALUES (p_payment_id, auth.uid(), 'status_changed', v_payment.payout_status, 'processing',
          'Payment processing initiated via ' || p_payment_method);

  RETURN jsonb_build_object('success', true, 'payment_id', p_payment_id,
                            'artist_payout', v_payment.net_artist_payout, 'payment_method', p_payment_method);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark payout as completed
CREATE OR REPLACE FUNCTION complete_dccs_royalty_payout(
  p_payment_id uuid, p_transfer_id text DEFAULT NULL, p_tx_hash text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE v_old_status text;
BEGIN
  SELECT payout_status INTO v_old_status FROM dccs_royalty_payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  UPDATE dccs_royalty_payments
  SET payout_status = 'completed', stripe_transfer_id = COALESCE(p_transfer_id, stripe_transfer_id),
      blockchain_tx_hash = COALESCE(p_tx_hash, blockchain_tx_hash), paid_at = now(), updated_at = now()
  WHERE id = p_payment_id;

  INSERT INTO dccs_royalty_payment_audit (payment_id, changed_by, change_type, old_status, new_status, notes)
  VALUES (p_payment_id, auth.uid(), 'payout_completed', v_old_status, 'completed', 'Payout successfully completed');

  RETURN jsonb_build_object('success', true, 'payment_id', p_payment_id, 'status', 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark payout as failed
CREATE OR REPLACE FUNCTION fail_dccs_royalty_payout(p_payment_id uuid, p_reason text)
RETURNS jsonb AS $$
DECLARE v_old_status text; v_retry_count integer;
BEGIN
  SELECT payout_status, retry_count INTO v_old_status, v_retry_count FROM dccs_royalty_payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  UPDATE dccs_royalty_payments
  SET payout_status = 'failed', failed_reason = p_reason, retry_count = retry_count + 1,
      last_retry_at = now(), updated_at = now()
  WHERE id = p_payment_id;

  INSERT INTO dccs_royalty_payment_audit (payment_id, changed_by, change_type, old_status, new_status, notes)
  VALUES (p_payment_id, auth.uid(), 'payout_failed', v_old_status, 'failed', 'Payout failed: ' || p_reason);

  RETURN jsonb_build_object('success', true, 'payment_id', p_payment_id, 'status', 'failed', 'retry_count', v_retry_count + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get artist royalty summary
CREATE OR REPLACE FUNCTION get_artist_royalty_summary(
  p_artist_id uuid, p_start_date timestamptz DEFAULT NULL, p_end_date timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE v_summary jsonb;
BEGIN
  WITH stats AS (
    SELECT COUNT(*) as total_payments, SUM(gross_royalties) as total_gross,
           SUM(artist_share) as total_artist_share, SUM(platform_commission) as total_platform_commission,
           SUM(CASE WHEN payout_status = 'completed' THEN artist_share ELSE 0 END) as paid_out,
           SUM(CASE WHEN payout_status = 'pending' THEN artist_share ELSE 0 END) as pending,
           SUM(CASE WHEN payout_status = 'processing' THEN artist_share ELSE 0 END) as processing,
           SUM(CASE WHEN payout_status = 'failed' THEN artist_share ELSE 0 END) as failed,
           SUM(net_artist_payout) as total_net_payout, SUM(processing_fee) as total_fees,
           AVG(artist_percentage) as avg_artist_percentage,
           MIN(period_start) as first_payment_period, MAX(period_end) as last_payment_period
    FROM dccs_royalty_payments
    WHERE artist_id = p_artist_id
      AND (p_start_date IS NULL OR period_start >= p_start_date)
      AND (p_end_date IS NULL OR period_end <= p_end_date)
  )
  SELECT jsonb_build_object(
    'artist_id', p_artist_id, 'total_payments', COALESCE(total_payments, 0),
    'total_gross_royalties', COALESCE(total_gross, 0), 'total_artist_share', COALESCE(total_artist_share, 0),
    'total_platform_commission', COALESCE(total_platform_commission, 0),
    'amount_paid_out', COALESCE(paid_out, 0), 'amount_pending', COALESCE(pending, 0),
    'amount_processing', COALESCE(processing, 0), 'amount_failed', COALESCE(failed, 0),
    'total_net_payout', COALESCE(total_net_payout, 0), 'total_processing_fees', COALESCE(total_fees, 0),
    'artist_percentage', COALESCE(avg_artist_percentage, 80.00),
    'first_payment_period', first_payment_period, 'last_payment_period', last_payment_period,
    'query_date', now()
  ) INTO v_summary FROM stats;
  RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS Policies
DROP POLICY IF EXISTS "System can update DCCS royalty payments" ON dccs_royalty_payments;
DROP POLICY IF EXISTS "System can insert DCCS royalty payments" ON dccs_royalty_payments;

CREATE POLICY "Admins can insert DCCS royalty payments"
  ON dccs_royalty_payments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    AND artist_percentage = 80.00 AND platform_percentage = 20.00
  );

CREATE POLICY "Admins can update DCCS royalty payments"
  ON dccs_royalty_payments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (artist_percentage = 80.00 AND platform_percentage = 20.00);

-- Create view for artist dashboard
CREATE OR REPLACE VIEW artist_royalty_dashboard AS
SELECT rp.id, rp.clearance_code, rp.artist_id, p.name as artist_name, p.email as artist_email,
       rp.period_start, rp.period_end, rp.total_views, rp.total_plays,
       rp.gross_royalties, rp.artist_share, rp.net_artist_payout, rp.processing_fee,
       rp.payout_status, rp.payment_method, rp.currency, rp.paid_at, rp.blockchain_tx_hash,
       rp.created_at, rp.updated_at, rp.breakdown_by_platform,
       EXTRACT(DAY FROM (now() - rp.period_end)) as days_since_period_end,
       CASE WHEN rp.payout_status = 'pending' AND rp.period_end < (now() - INTERVAL '7 days')
            THEN true ELSE false END as is_overdue
FROM dccs_royalty_payments rp JOIN profiles p ON p.id = rp.artist_id;

GRANT SELECT ON artist_royalty_dashboard TO authenticated;
ALTER VIEW artist_royalty_dashboard SET (security_invoker = true);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_royalty_payment_method ON dccs_royalty_payments(payment_method) WHERE payment_method IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_royalty_batch ON dccs_royalty_payments(payout_batch_id) WHERE payout_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_royalty_updated ON dccs_royalty_payments(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_royalty_paid ON dccs_royalty_payments(paid_at DESC) WHERE paid_at IS NOT NULL;

-- Add documentation comments
COMMENT ON TABLE dccs_royalty_payments IS 'Tracks ongoing royalty payments with database-enforced 80/20 split between artists (80%) and platform (20%)';
COMMENT ON COLUMN dccs_royalty_payments.artist_percentage IS 'Artist revenue share - fixed at 80.00% by database constraint and trigger';
COMMENT ON COLUMN dccs_royalty_payments.platform_percentage IS 'Platform commission - fixed at 20.00% by database constraint and trigger';
COMMENT ON COLUMN dccs_royalty_payments.artist_share IS 'Calculated as gross_royalties * 0.80 - automatically enforced by trigger';
COMMENT ON COLUMN dccs_royalty_payments.platform_commission IS 'Calculated as gross_royalties * 0.20 - automatically enforced by trigger';
COMMENT ON COLUMN dccs_royalty_payments.net_artist_payout IS 'Final amount paid to artist after deducting processing fees';
COMMENT ON FUNCTION calculate_dccs_royalty_split IS 'Automatically calculates and enforces 80/20 split on payment insert/update';
COMMENT ON FUNCTION process_dccs_royalty_payout IS 'Helper function to initiate royalty payment processing';
COMMENT ON FUNCTION complete_dccs_royalty_payout IS 'Helper function to mark payment as successfully completed';
COMMENT ON FUNCTION fail_dccs_royalty_payout IS 'Helper function to mark payment as failed with reason';
COMMENT ON FUNCTION get_artist_royalty_summary IS 'Returns comprehensive royalty earnings summary for an artist';
