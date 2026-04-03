/*
  # Phase 1 Stabilization: Backup and Recovery Safeguards
  
  1. Backup Monitoring Layer
    - `backup_logs` table to track all backup operations
    - Records database and storage backup status
    - Provides audit trail for data protection operations
  
  2. Integrity Verification Function
    - `verify_dccs_integrity()` checks for data inconsistencies
    - Detects orphaned payment records
    - Identifies unlocked certificates without payment
    - Finds missing media references
    - Returns comprehensive integrity report
  
  3. Financial Consistency Check
    - Automated verification of payment-unlock consistency
    - Logs all financial inconsistencies to audit_logs
    - Ensures payment completion always triggers unlock
  
  4. Read-Only Financial Snapshot View
    - `financial_snapshot_view` for reporting and auditing
    - Aggregates DCCS revenue and payout data
    - Read-only for users, maintenance access for service_role
  
  5. Data Durability Focus
    - NO feature expansion
    - NO UI changes
    - NO payment logic modification
    - ONLY data protection and recovery mechanisms
  
  This migration hardens Phase 1 for investor-grade durability.
*/

-- ============================================================================
-- SECTION 1: Backup Monitoring Layer
-- ============================================================================

-- Create backup_logs table
CREATE TABLE IF NOT EXISTS backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('database', 'storage', 'certificates', 'payments')),
  status text NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
  backup_location text,
  size_bytes bigint,
  records_count integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on backup_logs
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role can INSERT backup logs
CREATE POLICY "backup_logs_service_role_insert"
  ON backup_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service_role can UPDATE backup logs
CREATE POLICY "backup_logs_service_role_update"
  ON backup_logs
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view backup logs (read-only)
CREATE POLICY "backup_logs_admin_read"
  ON backup_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for backup log queries
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status_failed ON backup_logs(status) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON backup_logs(backup_type);

-- ============================================================================
-- SECTION 2: Integrity Verification Function
-- ============================================================================

-- Function to verify DCCS system integrity
CREATE OR REPLACE FUNCTION verify_dccs_integrity()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_orphaned_payments integer;
  v_unlocked_without_payment integer;
  v_missing_media integer;
  v_incomplete_payouts integer;
  v_inconsistent_records jsonb;
  v_report jsonb;
BEGIN
  -- Check 1: Orphaned payment records (payment exists but DCCS deleted)
  SELECT COUNT(*) INTO v_orphaned_payments
  FROM payment_records pr
  WHERE NOT EXISTS (
    SELECT 1 FROM dccs_certificates dc
    WHERE dc.id = pr.dccs_id
  );
  
  -- Check 2: Unlocked certificates without completed payment
  SELECT COUNT(*) INTO v_unlocked_without_payment
  FROM dccs_certificates dc
  WHERE dc.download_unlocked = true
  AND NOT EXISTS (
    SELECT 1 FROM payment_records pr
    WHERE pr.dccs_id = dc.id
    AND pr.status = 'completed'
  );
  
  -- Check 3: Missing media references (DCCS without audio file)
  SELECT COUNT(*) INTO v_missing_media
  FROM dccs_certificates dc
  WHERE dc.audio_file_url IS NULL
  OR dc.audio_file_url = '';
  
  -- Check 4: Incomplete payout records (old pending royalty payments)
  SELECT COUNT(*) INTO v_incomplete_payouts
  FROM royalty_payments rp
  WHERE rp.payment_status = 'pending'
  AND rp.created_at < now() - interval '7 days';
  
  -- Collect detailed inconsistencies
  v_inconsistent_records := jsonb_build_object(
    'orphaned_payment_ids', (
      SELECT jsonb_agg(pr.id)
      FROM payment_records pr
      WHERE NOT EXISTS (
        SELECT 1 FROM dccs_certificates dc WHERE dc.id = pr.dccs_id
      )
    ),
    'unlocked_without_payment_ids', (
      SELECT jsonb_agg(dc.id)
      FROM dccs_certificates dc
      WHERE dc.download_unlocked = true
      AND NOT EXISTS (
        SELECT 1 FROM payment_records pr
        WHERE pr.dccs_id = dc.id AND pr.status = 'completed'
      )
    ),
    'missing_media_ids', (
      SELECT jsonb_agg(dc.id)
      FROM dccs_certificates dc
      WHERE dc.audio_file_url IS NULL OR dc.audio_file_url = ''
      LIMIT 100
    )
  );
  
  -- Build comprehensive report
  v_report := jsonb_build_object(
    'timestamp', now(),
    'overall_status', CASE 
      WHEN v_orphaned_payments = 0 
        AND v_unlocked_without_payment = 0 
        AND v_missing_media = 0 
      THEN 'healthy'
      WHEN v_unlocked_without_payment > 0 THEN 'critical'
      ELSE 'warning'
    END,
    'checks', jsonb_build_object(
      'orphaned_payments', jsonb_build_object(
        'count', v_orphaned_payments,
        'severity', CASE WHEN v_orphaned_payments > 0 THEN 'warning' ELSE 'ok' END
      ),
      'unlocked_without_payment', jsonb_build_object(
        'count', v_unlocked_without_payment,
        'severity', CASE WHEN v_unlocked_without_payment > 0 THEN 'critical' ELSE 'ok' END
      ),
      'missing_media', jsonb_build_object(
        'count', v_missing_media,
        'severity', CASE WHEN v_missing_media > 0 THEN 'warning' ELSE 'ok' END
      ),
      'incomplete_payouts', jsonb_build_object(
        'count', v_incomplete_payouts,
        'severity', CASE WHEN v_incomplete_payouts > 10 THEN 'warning' ELSE 'ok' END
      )
    ),
    'details', v_inconsistent_records
  );
  
  -- Log integrity check to audit_logs
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    metadata
  ) 
  VALUES (
    NULL,
    'system_integrity_check',
    'dccs_system',
    v_report
  );
  
  RETURN v_report;
END;
$$;

-- Grant execution to service_role only
REVOKE EXECUTE ON FUNCTION verify_dccs_integrity FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_dccs_integrity TO service_role;

-- ============================================================================
-- SECTION 3: Financial Consistency Check Function
-- ============================================================================

-- Function to verify payment-unlock consistency
CREATE OR REPLACE FUNCTION verify_financial_consistency()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_completed_without_unlock integer;
  v_unlocked_without_payment integer;
  v_amount_mismatches integer;
  v_inconsistencies jsonb;
  v_report jsonb;
BEGIN
  -- Check 1: Completed payments without unlock
  SELECT COUNT(*) INTO v_completed_without_unlock
  FROM payment_records pr
  JOIN dccs_certificates dc ON dc.id = pr.dccs_id
  WHERE pr.status = 'completed'
  AND dc.download_unlocked = false;
  
  -- Check 2: Unlocked without completed payment (critical)
  SELECT COUNT(*) INTO v_unlocked_without_payment
  FROM dccs_certificates dc
  WHERE dc.download_unlocked = true
  AND NOT EXISTS (
    SELECT 1 FROM payment_records pr
    WHERE pr.dccs_id = dc.id
    AND pr.status = 'completed'
  );
  
  -- Check 3: Payment amount discrepancies
  SELECT COUNT(*) INTO v_amount_mismatches
  FROM payment_records pr
  WHERE pr.amount <= 0;
  
  -- Collect detailed inconsistencies
  v_inconsistencies := jsonb_build_object(
    'completed_without_unlock', (
      SELECT jsonb_agg(jsonb_build_object(
        'payment_id', pr.id,
        'dccs_id', pr.dccs_id,
        'amount', pr.amount,
        'completed_at', pr.updated_at
      ))
      FROM payment_records pr
      JOIN dccs_certificates dc ON dc.id = pr.dccs_id
      WHERE pr.status = 'completed'
      AND dc.download_unlocked = false
      LIMIT 50
    ),
    'unlocked_without_payment', (
      SELECT jsonb_agg(jsonb_build_object(
        'dccs_id', dc.id,
        'creator_id', dc.creator_id,
        'clearance_code', dc.clearance_code
      ))
      FROM dccs_certificates dc
      WHERE dc.download_unlocked = true
      AND NOT EXISTS (
        SELECT 1 FROM payment_records pr
        WHERE pr.dccs_id = dc.id AND pr.status = 'completed'
      )
      LIMIT 50
    )
  );
  
  -- Build report
  v_report := jsonb_build_object(
    'timestamp', now(),
    'overall_status', CASE 
      WHEN v_unlocked_without_payment > 0 THEN 'critical'
      WHEN v_completed_without_unlock > 0 THEN 'warning'
      ELSE 'healthy'
    END,
    'summary', jsonb_build_object(
      'completed_without_unlock', v_completed_without_unlock,
      'unlocked_without_payment', v_unlocked_without_payment,
      'amount_mismatches', v_amount_mismatches
    ),
    'details', v_inconsistencies
  );
  
  -- Log to audit_logs if inconsistencies found
  IF v_unlocked_without_payment > 0 OR v_completed_without_unlock > 0 THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      metadata
    ) VALUES (
      NULL,
      'financial_consistency_issue',
      'payment_system',
      v_report
    );
  END IF;
  
  RETURN v_report;
END;
$$;

-- Grant execution to service_role only
REVOKE EXECUTE ON FUNCTION verify_financial_consistency FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_financial_consistency TO service_role;

-- ============================================================================
-- SECTION 4: Read-Only Financial Snapshot View
-- ============================================================================

-- Create view for financial snapshots (simplified without price field)
CREATE OR REPLACE VIEW financial_snapshot_view AS
SELECT 
  dc.id AS dccs_id,
  dc.creator_id,
  dc.clearance_code,
  dc.project_title,
  dc.download_unlocked,
  dc.creation_timestamp AS dccs_created_at,
  
  -- Revenue calculations
  COALESCE(SUM(pr.amount) FILTER (WHERE pr.status = 'completed'), 0) AS total_revenue,
  COUNT(pr.id) FILTER (WHERE pr.status = 'completed') AS total_unlocked,
  COUNT(pr.id) FILTER (WHERE pr.status = 'pending') AS pending_payments,
  COUNT(pr.id) FILTER (WHERE pr.status = 'failed') AS failed_payments,
  
  -- Payout status from DCCS royalty payments
  COALESCE(SUM(drp.artist_share) FILTER (WHERE drp.payout_status = 'completed'), 0) AS total_paid_out,
  COALESCE(SUM(drp.artist_share) FILTER (WHERE drp.payout_status = 'pending'), 0) AS pending_payouts,
  
  -- Latest activity
  MAX(pr.created_at) FILTER (WHERE pr.status = 'completed') AS last_purchase_date,
  MAX(drp.paid_at) AS last_payout_date,
  
  -- Status indicators
  CASE 
    WHEN dc.download_unlocked = true 
      AND NOT EXISTS (
        SELECT 1 FROM payment_records 
        WHERE dccs_id = dc.id AND status = 'completed'
      ) 
    THEN 'INCONSISTENT'
    WHEN COUNT(pr.id) FILTER (WHERE pr.status = 'completed') > 0 
    THEN 'ACTIVE'
    ELSE 'NO_SALES'
  END AS payout_status

FROM dccs_certificates dc
LEFT JOIN payment_records pr ON pr.dccs_id = dc.id
LEFT JOIN dccs_royalty_payments drp ON drp.clearance_code = dc.clearance_code
GROUP BY dc.id, dc.creator_id, dc.clearance_code, dc.project_title, dc.download_unlocked, dc.creation_timestamp;

-- Grant SELECT to authenticated users
GRANT SELECT ON financial_snapshot_view TO authenticated;
GRANT SELECT ON financial_snapshot_view TO service_role;

-- ============================================================================
-- SECTION 5: Automated Backup Logging Functions
-- ============================================================================

-- Function to log database backup
CREATE OR REPLACE FUNCTION log_database_backup(
  p_status text,
  p_location text DEFAULT NULL,
  p_records_count integer DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_backup_id uuid;
BEGIN
  INSERT INTO backup_logs (
    backup_type,
    status,
    backup_location,
    records_count,
    error_message,
    completed_at
  ) VALUES (
    'database',
    p_status,
    p_location,
    p_records_count,
    p_error_message,
    CASE WHEN p_status IN ('success', 'failed') THEN now() ELSE NULL END
  )
  RETURNING id INTO v_backup_id;
  
  RETURN v_backup_id;
END;
$$;

-- Function to log storage backup
CREATE OR REPLACE FUNCTION log_storage_backup(
  p_status text,
  p_location text DEFAULT NULL,
  p_size_bytes bigint DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_backup_id uuid;
BEGIN
  INSERT INTO backup_logs (
    backup_type,
    status,
    backup_location,
    size_bytes,
    error_message,
    completed_at
  ) VALUES (
    'storage',
    p_status,
    p_location,
    p_size_bytes,
    p_error_message,
    CASE WHEN p_status IN ('success', 'failed') THEN now() ELSE NULL END
  )
  RETURNING id INTO v_backup_id;
  
  RETURN v_backup_id;
END;
$$;

-- Grant execution to service_role only
REVOKE EXECUTE ON FUNCTION log_database_backup FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_database_backup TO service_role;
REVOKE EXECUTE ON FUNCTION log_storage_backup FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_storage_backup TO service_role;

-- ============================================================================
-- SECTION 6: Critical Data Recovery Points
-- ============================================================================

-- Create function to identify critical recovery points
CREATE OR REPLACE FUNCTION get_recovery_checkpoints()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_report jsonb;
BEGIN
  v_report := jsonb_build_object(
    'timestamp', now(),
    'critical_tables', jsonb_build_object(
      'dccs_certificates', (SELECT COUNT(*) FROM dccs_certificates),
      'payment_records', (SELECT COUNT(*) FROM payment_records),
      'royalty_payments', (SELECT COUNT(*) FROM royalty_payments),
      'audit_logs', (SELECT COUNT(*) FROM audit_logs)
    ),
    'last_backup', (
      SELECT jsonb_build_object(
        'timestamp', created_at,
        'status', status,
        'type', backup_type
      )
      FROM backup_logs
      WHERE status = 'success'
      ORDER BY created_at DESC
      LIMIT 1
    ),
    'data_health', jsonb_build_object(
      'total_revenue', (
        SELECT COALESCE(SUM(amount), 0)
        FROM payment_records
        WHERE status = 'completed'
      ),
      'total_certificates', (SELECT COUNT(*) FROM dccs_certificates),
      'unlocked_certificates', (
        SELECT COUNT(*) FROM dccs_certificates WHERE download_unlocked = true
      ),
      'completed_payments', (
        SELECT COUNT(*) FROM payment_records WHERE status = 'completed'
      )
    )
  );
  
  RETURN v_report;
END;
$$;

-- Grant execution to service_role
REVOKE EXECUTE ON FUNCTION get_recovery_checkpoints FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_recovery_checkpoints TO service_role;

-- ============================================================================
-- SECTION 7: Automated Consistency Monitoring
-- ============================================================================

-- Create trigger to detect payment-unlock inconsistencies
CREATE OR REPLACE FUNCTION detect_payment_unlock_inconsistency()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- If payment is marked completed but certificate not unlocked
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if certificate is unlocked
    IF NOT EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE id = NEW.dccs_id
      AND download_unlocked = true
    ) THEN
      -- Log inconsistency
      INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        metadata
      ) VALUES (
        NEW.user_id,
        'payment_completed_without_unlock',
        'payment_record',
        NEW.id,
        jsonb_build_object(
          'dccs_id', NEW.dccs_id,
          'amount', NEW.amount,
          'payment_method', NEW.payment_method,
          'requires_manual_unlock', true
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS detect_payment_unlock_inconsistency_trigger ON payment_records;
CREATE TRIGGER detect_payment_unlock_inconsistency_trigger
  AFTER UPDATE ON payment_records
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION detect_payment_unlock_inconsistency();

-- ============================================================================
-- SECTION 8: Data Integrity Indexes
-- ============================================================================

-- Indexes to speed up integrity checks
CREATE INDEX IF NOT EXISTS idx_payment_records_status_dccs 
  ON payment_records(dccs_id, status) 
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_dccs_download_unlocked 
  ON dccs_certificates(download_unlocked) 
  WHERE download_unlocked = true;

CREATE INDEX IF NOT EXISTS idx_royalty_payments_status_pending 
  ON royalty_payments(payment_status, created_at) 
  WHERE payment_status = 'pending';

-- ============================================================================
-- SECTION 9: Backup Status Summary Function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_backup_status_summary()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_summary jsonb;
BEGIN
  v_summary := jsonb_build_object(
    'timestamp', now(),
    'last_24h_backups', (
      SELECT jsonb_agg(jsonb_build_object(
        'type', backup_type,
        'status', status,
        'created_at', created_at,
        'records_count', records_count
      ))
      FROM backup_logs
      WHERE created_at > now() - interval '24 hours'
      ORDER BY created_at DESC
    ),
    'failed_backups_count', (
      SELECT COUNT(*)
      FROM backup_logs
      WHERE status = 'failed'
      AND created_at > now() - interval '7 days'
    ),
    'last_successful_backup', (
      SELECT jsonb_build_object(
        'type', backup_type,
        'timestamp', created_at,
        'location', backup_location
      )
      FROM backup_logs
      WHERE status = 'success'
      ORDER BY created_at DESC
      LIMIT 1
    )
  );
  
  RETURN v_summary;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_backup_status_summary FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_backup_status_summary TO service_role;