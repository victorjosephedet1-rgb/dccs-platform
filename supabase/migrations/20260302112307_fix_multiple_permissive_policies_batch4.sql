/*
  # Fix Multiple Permissive RLS Policies - Batch 4
  
  1. Changes
    - Consolidates policies for dccs_platform_detections
    - Consolidates policies for dccs_registrations
    - Consolidates policies for dccs_royalty_collections
    - Consolidates policies for dccs_royalty_payment_audit
    - Consolidates policies for dccs_royalty_payments
  
  2. Security
    - Replaces multiple permissive policies with single policies
*/

-- Fix dccs_platform_detections policies
DROP POLICY IF EXISTS "Admins can view all detections" ON dccs_platform_detections;
DROP POLICY IF EXISTS "Creators can view detections of their content" ON dccs_platform_detections;

CREATE POLICY "Admins and creators can view detections"
  ON dccs_platform_detections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_platform_detections.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Fix dccs_registrations policies
DROP POLICY IF EXISTS "Admins can view all registrations" ON dccs_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON dccs_registrations;

CREATE POLICY "Admins and users can view registrations"
  ON dccs_registrations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fix dccs_royalty_collections policies
DROP POLICY IF EXISTS "Admins can view all royalty collections" ON dccs_royalty_collections;
DROP POLICY IF EXISTS "Creators can view their royalty collections" ON dccs_royalty_collections;

CREATE POLICY "Admins and creators can view collections"
  ON dccs_royalty_collections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_royalty_collections.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Fix dccs_royalty_payment_audit policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON dccs_royalty_payment_audit;
DROP POLICY IF EXISTS "Artists can view their payment audit logs" ON dccs_royalty_payment_audit;

CREATE POLICY "Admins and artists can view audit logs"
  ON dccs_royalty_payment_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_royalty_payments
      WHERE dccs_royalty_payments.id = dccs_royalty_payment_audit.payment_id
      AND dccs_royalty_payments.artist_id = auth.uid()
    )
  );

-- Fix dccs_royalty_payments policies
DROP POLICY IF EXISTS "Artists can view their DCCS royalty payments" ON dccs_royalty_payments;
DROP POLICY IF EXISTS "Buyers can view DCCS royalty data for their content" ON dccs_royalty_payments;
DROP POLICY IF EXISTS dccs_royalty_payments_artist_read ON dccs_royalty_payments;

CREATE POLICY "Artists and buyers can view royalty payments"
  ON dccs_royalty_payments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = artist_id OR
    auth.uid() = buyer_id
  );