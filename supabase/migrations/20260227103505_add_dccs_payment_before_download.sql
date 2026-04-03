/*
  # DCCS Payment-Before-Download System

  1. New Tables
    - `payment_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `dccs_id` (uuid, references dccs_certificates)
      - `amount` (decimal)
      - `currency` (text, default 'GBP')
      - `status` (text: pending, completed, failed)
      - `transaction_reference` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - `dccs_certificates`
      - Add `download_unlocked` (boolean, default false)

  3. Security
    - Enable RLS on `payment_records`
    - Only owner can view their payment records
    - Only authenticated users can create payment records for their own DCCS
    - Only backend (service_role) can update payment status
    - Download URLs only available when download_unlocked = true

  4. Audit Logging
    - Track DCCS creation
    - Track payment initiation
    - Track payment completion
    - Track download unlock
    - Track file downloads
*/

-- Add download_unlocked to dccs_certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dccs_certificates' AND column_name = 'download_unlocked'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN download_unlocked boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dccs_id uuid NOT NULL REFERENCES dccs_certificates(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'GBP' NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_reference text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_dccs_id ON payment_records(dccs_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_download_unlocked ON dccs_certificates(download_unlocked);

-- Enable RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_records

-- Users can view their own payment records
CREATE POLICY "Users can view own payment records"
  ON payment_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create payment records only for their own DCCS
CREATE POLICY "Users can create payment for own DCCS"
  ON payment_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM dccs_certificates 
      WHERE dccs_certificates.id = dccs_id 
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Only service role can update payment status (backend only)
CREATE POLICY "Only service role can update payments"
  ON payment_records
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update payment timestamp
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for payment_records updated_at
DROP TRIGGER IF EXISTS payment_records_updated_at ON payment_records;
CREATE TRIGGER payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_timestamp();

-- Function to unlock download after payment completion
CREATE OR REPLACE FUNCTION unlock_download_after_payment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only unlock if payment status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Unlock the download
    UPDATE dccs_certificates
    SET download_unlocked = true
    WHERE id = NEW.dccs_id;
    
    -- Log the unlock event
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      NEW.user_id,
      'download_unlocked',
      'dccs_certificate',
      NEW.dccs_id,
      jsonb_build_object(
        'payment_id', NEW.id,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'transaction_reference', NEW.transaction_reference
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to unlock download when payment completes
DROP TRIGGER IF EXISTS unlock_download_on_payment ON payment_records;
CREATE TRIGGER unlock_download_on_payment
  AFTER INSERT OR UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION unlock_download_after_payment();

-- Function to log DCCS creation
CREATE OR REPLACE FUNCTION log_dccs_creation()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    NEW.creator_id,
    'dccs_created',
    'dccs_certificate',
    NEW.id,
    jsonb_build_object(
      'clearance_code', NEW.clearance_code,
      'certificate_id', NEW.certificate_id,
      'download_unlocked', NEW.download_unlocked
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to log DCCS creation
DROP TRIGGER IF EXISTS log_dccs_creation_trigger ON dccs_certificates;
CREATE TRIGGER log_dccs_creation_trigger
  AFTER INSERT ON dccs_certificates
  FOR EACH ROW
  EXECUTE FUNCTION log_dccs_creation();

-- Function to log payment initiation and completion
CREATE OR REPLACE FUNCTION log_payment_events()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      NEW.user_id,
      'payment_initiated',
      'payment_record',
      NEW.id,
      jsonb_build_object(
        'dccs_id', NEW.dccs_id,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'status', NEW.status
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      NEW.user_id,
      'payment_completed',
      'payment_record',
      NEW.id,
      jsonb_build_object(
        'dccs_id', NEW.dccs_id,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'transaction_reference', NEW.transaction_reference
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to log payment events
DROP TRIGGER IF EXISTS log_payment_events_trigger ON payment_records;
CREATE TRIGGER log_payment_events_trigger
  AFTER INSERT OR UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_events();

-- Function to log download events
CREATE OR REPLACE FUNCTION log_download_event()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    NEW.user_id,
    'file_downloaded',
    'dccs_certificate',
    NEW.dccs_certificate_id,
    jsonb_build_object(
      'download_id', NEW.id,
      'file_path', NEW.file_path,
      'download_timestamp', NEW.downloaded_at
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to log downloads (if dccs_download_history exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'dccs_download_history'
  ) THEN
    DROP TRIGGER IF EXISTS log_download_event_trigger ON dccs_download_history;
    CREATE TRIGGER log_download_event_trigger
      AFTER INSERT ON dccs_download_history
      FOR EACH ROW
      EXECUTE FUNCTION log_download_event();
  END IF;
END $$;

-- Function to verify download access (called before generating signed URL)
CREATE OR REPLACE FUNCTION verify_download_access(
  p_dccs_id uuid,
  p_user_id uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_unlocked boolean;
  v_creator_id uuid;
BEGIN
  -- Get DCCS certificate details
  SELECT download_unlocked, creator_id
  INTO v_unlocked, v_creator_id
  FROM dccs_certificates
  WHERE id = p_dccs_id;
  
  -- Check if user is creator/owner
  IF v_creator_id != p_user_id THEN
    RETURN false;
  END IF;
  
  -- Check if download is unlocked
  IF NOT v_unlocked THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_download_access TO authenticated;
GRANT EXECUTE ON FUNCTION verify_download_access TO service_role;