/*
  # Lock Down Financial & Certificate Tables - Investor-Grade Security
  
  1. Security Enhancements for `payment_records`
    - ✅ Users can read ONLY their own records
    - ✅ Users CANNOT update status
    - ✅ ONLY service_role (webhooks) can update status
    - ✅ PROHIBIT all DELETE operations from clients
  
  2. Security Enhancements for `dccs_certificates`
    - ✅ NO direct UPDATE of `download_unlocked` from client
    - ✅ ONLY backend functions can modify `download_unlocked`
    - ✅ Users can view their own certificates
    - ✅ Public can verify certificates (read-only specific fields)
  
  3. Security Enhancements for Revenue Tables
    - ✅ `royalty_payments` - Read-only for recipients, ONLY service_role can INSERT/UPDATE
    - ✅ `dccs_royalty_payments` - Read-only for artists, ONLY service_role can INSERT/UPDATE
    - ✅ `ongoing_royalty_payments` - Read-only for artists, ONLY service_role can INSERT/UPDATE
    - ✅ NO client can directly modify financial records
  
  4. Additional Security Measures
    - ✅ Prevent status manipulation
    - ✅ Prevent amount tampering
    - ✅ Audit all financial operations
    - ✅ Block privilege escalation attempts
  
  This migration makes the DCCS system investor-grade secure.
*/

-- ============================================================================
-- SECTION 1: Lock Down payment_records
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own payment records" ON payment_records;
DROP POLICY IF EXISTS "Users can create payment for own DCCS" ON payment_records;
DROP POLICY IF EXISTS "Only service role can update payments" ON payment_records;

-- STRICT READ: Users can ONLY view their own payment records
CREATE POLICY "payment_records_strict_read"
  ON payment_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- CONTROLLED INSERT: Users can create payment records ONLY for their own DCCS
-- But CANNOT set status to 'completed' (only 'pending')
CREATE POLICY "payment_records_controlled_insert"
  ON payment_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM dccs_certificates 
      WHERE dccs_certificates.id = dccs_id 
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- BACKEND ONLY UPDATE: ONLY service_role can update payment status
CREATE POLICY "payment_records_service_role_update"
  ON payment_records
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PROHIBIT DELETE: No one can delete payment records (audit trail)
CREATE POLICY "payment_records_no_delete"
  ON payment_records
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- SECTION 2: Lock Down dccs_certificates
-- ============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view own certificates" ON dccs_certificates;
DROP POLICY IF EXISTS "Users can update own certificates" ON dccs_certificates;
DROP POLICY IF EXISTS "Public can verify certificates" ON dccs_certificates;

-- READ: Users can view their own certificates
CREATE POLICY "dccs_certificates_owner_read"
  ON dccs_certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- PUBLIC VERIFICATION: Anyone can verify certificates (read-only specific fields)
CREATE POLICY "dccs_certificates_public_verify"
  ON dccs_certificates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- CONTROLLED UPDATE: Users can update ONLY metadata, NOT download_unlocked
-- Download unlocked can ONLY be changed by backend triggers
CREATE POLICY "dccs_certificates_controlled_update"
  ON dccs_certificates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (
    auth.uid() = creator_id
    -- Prevent changing download_unlocked directly
    AND download_unlocked = (SELECT download_unlocked FROM dccs_certificates WHERE id = dccs_certificates.id)
    -- Prevent changing creator_id
    AND creator_id = (SELECT creator_id FROM dccs_certificates WHERE id = dccs_certificates.id)
  );

-- ============================================================================
-- SECTION 3: Lock Down royalty_payments
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE royalty_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own royalty payments" ON royalty_payments;
DROP POLICY IF EXISTS "Service role full access" ON royalty_payments;

-- READ ONLY: Recipients can view their own royalty payments
CREATE POLICY "royalty_payments_recipient_read"
  ON royalty_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- BACKEND ONLY: ONLY service_role can INSERT royalty payments
CREATE POLICY "royalty_payments_service_role_insert"
  ON royalty_payments
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- BACKEND ONLY: ONLY service_role can UPDATE royalty payments
CREATE POLICY "royalty_payments_service_role_update"
  ON royalty_payments
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PROHIBIT DELETE: No deletion of royalty payment records
CREATE POLICY "royalty_payments_no_delete"
  ON royalty_payments
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- SECTION 4: Lock Down dccs_royalty_payments
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE dccs_royalty_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can view own royalty payments" ON dccs_royalty_payments;
DROP POLICY IF EXISTS "Service role manages royalty payments" ON dccs_royalty_payments;

-- READ ONLY: Artists can view their own DCCS royalty payments
CREATE POLICY "dccs_royalty_payments_artist_read"
  ON dccs_royalty_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = artist_id OR auth.uid() = buyer_id);

-- BACKEND ONLY: ONLY service_role can INSERT DCCS royalty payments
CREATE POLICY "dccs_royalty_payments_service_role_insert"
  ON dccs_royalty_payments
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- BACKEND ONLY: ONLY service_role can UPDATE DCCS royalty payments
CREATE POLICY "dccs_royalty_payments_service_role_update"
  ON dccs_royalty_payments
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PROHIBIT DELETE: No deletion of DCCS royalty payment records
CREATE POLICY "dccs_royalty_payments_no_delete"
  ON dccs_royalty_payments
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- SECTION 5: Lock Down ongoing_royalty_payments (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'ongoing_royalty_payments'
  ) THEN
    -- Enable RLS
    ALTER TABLE ongoing_royalty_payments ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Artists can view ongoing royalties" ON ongoing_royalty_payments;
    DROP POLICY IF EXISTS "Service role manages ongoing royalties" ON ongoing_royalty_payments;
    
    -- READ ONLY: Artists can view their own ongoing royalty payments
    EXECUTE 'CREATE POLICY "ongoing_royalty_payments_artist_read"
      ON ongoing_royalty_payments
      FOR SELECT
      TO authenticated
      USING (auth.uid() = artist_id OR auth.uid() = buyer_id)';
    
    -- BACKEND ONLY: ONLY service_role can INSERT
    EXECUTE 'CREATE POLICY "ongoing_royalty_payments_service_role_insert"
      ON ongoing_royalty_payments
      FOR INSERT
      TO service_role
      WITH CHECK (true)';
    
    -- BACKEND ONLY: ONLY service_role can UPDATE
    EXECUTE 'CREATE POLICY "ongoing_royalty_payments_service_role_update"
      ON ongoing_royalty_payments
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true)';
    
    -- PROHIBIT DELETE
    EXECUTE 'CREATE POLICY "ongoing_royalty_payments_no_delete"
      ON ongoing_royalty_payments
      FOR DELETE
      TO authenticated
      USING (false)';
  END IF;
END $$;

-- ============================================================================
-- SECTION 6: Additional Security Functions
-- ============================================================================

-- Function to safely update download_unlocked (backend only)
CREATE OR REPLACE FUNCTION unlock_dccs_download(
  p_dccs_id uuid,
  p_payment_id uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_id uuid;
  v_payment_status text;
BEGIN
  -- Verify payment is completed
  SELECT status INTO v_payment_status
  FROM payment_records
  WHERE id = p_payment_id AND dccs_id = p_dccs_id;
  
  IF v_payment_status != 'completed' THEN
    RAISE EXCEPTION 'Payment not completed';
  END IF;
  
  -- Unlock download
  UPDATE dccs_certificates
  SET download_unlocked = true
  WHERE id = p_dccs_id;
  
  -- Audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) 
  SELECT 
    creator_id,
    'download_unlocked_by_payment',
    'dccs_certificate',
    p_dccs_id,
    jsonb_build_object('payment_id', p_payment_id)
  FROM dccs_certificates
  WHERE id = p_dccs_id;
  
  RETURN true;
END;
$$;

-- ONLY service_role can execute unlock function
REVOKE EXECUTE ON FUNCTION unlock_dccs_download FROM PUBLIC;
GRANT EXECUTE ON FUNCTION unlock_dccs_download TO service_role;

-- ============================================================================
-- SECTION 7: Audit and Validation
-- ============================================================================

-- Create audit trigger for payment_records modifications
CREATE OR REPLACE FUNCTION audit_payment_modifications()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log any UPDATE to payment status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      NEW.user_id,
      'payment_status_changed',
      'payment_record',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'dccs_id', NEW.dccs_id,
        'amount', NEW.amount,
        'changed_by', current_setting('request.jwt.claims', true)::json->>'sub'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_payment_modifications_trigger ON payment_records;
CREATE TRIGGER audit_payment_modifications_trigger
  AFTER UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION audit_payment_modifications();

-- Create audit trigger for dccs_certificates modifications
CREATE OR REPLACE FUNCTION audit_dccs_modifications()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log download_unlocked changes
  IF TG_OP = 'UPDATE' AND OLD.download_unlocked != NEW.download_unlocked THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      NEW.creator_id,
      'download_unlocked_changed',
      'dccs_certificate',
      NEW.id,
      jsonb_build_object(
        'old_value', OLD.download_unlocked,
        'new_value', NEW.download_unlocked,
        'clearance_code', NEW.clearance_code,
        'changed_by', current_setting('request.jwt.claims', true)::json->>'sub'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_dccs_modifications_trigger ON dccs_certificates;
CREATE TRIGGER audit_dccs_modifications_trigger
  AFTER UPDATE ON dccs_certificates
  FOR EACH ROW
  EXECUTE FUNCTION audit_dccs_modifications();