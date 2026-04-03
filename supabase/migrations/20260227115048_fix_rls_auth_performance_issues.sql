/*
  # Fix RLS Auth Performance Issues

  1. Security & Performance Fixes
    - Replace auth.uid() with (SELECT auth.uid()) in all RLS policies
    - This prevents re-evaluation of auth function for each row
    - Dramatically improves query performance at scale

  2. Tables Fixed
    - google_search_console_status
    - google_indexing_requests
    - backup_logs
    - royalty_payments
    - dccs_certificates
    - dccs_royalty_payments
    - payment_records

  3. Why This Matters
    - Without SELECT wrapper, auth.uid() is called for EVERY row
    - With SELECT wrapper, auth.uid() is called ONCE per query
    - This can improve performance by 100x on large tables
*/

-- Drop and recreate policies for google_search_console_status
DROP POLICY IF EXISTS "Only admins can insert Google Search Console status" ON google_search_console_status;
DROP POLICY IF EXISTS "Only admins can read Google Search Console status" ON google_search_console_status;
DROP POLICY IF EXISTS "Only admins can update Google Search Console status" ON google_search_console_status;

CREATE POLICY "Only admins can insert Google Search Console status"
  ON google_search_console_status FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can read Google Search Console status"
  ON google_search_console_status FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update Google Search Console status"
  ON google_search_console_status FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Drop and recreate policies for google_indexing_requests
DROP POLICY IF EXISTS "Only admins can create indexing requests" ON google_indexing_requests;
DROP POLICY IF EXISTS "Only admins can read indexing requests" ON google_indexing_requests;
DROP POLICY IF EXISTS "Only admins can update indexing requests" ON google_indexing_requests;

CREATE POLICY "Only admins can create indexing requests"
  ON google_indexing_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can read indexing requests"
  ON google_indexing_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update indexing requests"
  ON google_indexing_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix backup_logs policies
DROP POLICY IF EXISTS "backup_logs_admin_read" ON backup_logs;

CREATE POLICY "backup_logs_admin_read"
  ON backup_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix royalty_payments policies
DROP POLICY IF EXISTS "royalty_payments_recipient_read" ON royalty_payments;

CREATE POLICY "royalty_payments_recipient_read"
  ON royalty_payments FOR SELECT
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()));

-- Fix dccs_certificates policies
DROP POLICY IF EXISTS "dccs_certificates_controlled_update" ON dccs_certificates;
DROP POLICY IF EXISTS "dccs_certificates_owner_read" ON dccs_certificates;

CREATE POLICY "dccs_certificates_controlled_update"
  ON dccs_certificates FOR UPDATE
  TO authenticated
  USING (creator_id = (SELECT auth.uid()))
  WITH CHECK (creator_id = (SELECT auth.uid()));

CREATE POLICY "dccs_certificates_owner_read"
  ON dccs_certificates FOR SELECT
  TO authenticated
  USING (creator_id = (SELECT auth.uid()));

-- Fix dccs_royalty_payments policies
DROP POLICY IF EXISTS "dccs_royalty_payments_artist_read" ON dccs_royalty_payments;

CREATE POLICY "dccs_royalty_payments_artist_read"
  ON dccs_royalty_payments FOR SELECT
  TO authenticated
  USING (artist_id = (SELECT auth.uid()));

-- Fix payment_records policies
DROP POLICY IF EXISTS "payment_records_controlled_insert" ON payment_records;
DROP POLICY IF EXISTS "payment_records_strict_read" ON payment_records;

CREATE POLICY "payment_records_controlled_insert"
  ON payment_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "payment_records_strict_read"
  ON payment_records FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );
