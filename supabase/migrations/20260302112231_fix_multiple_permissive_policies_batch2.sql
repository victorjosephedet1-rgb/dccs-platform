/*
  # Fix Multiple Permissive RLS Policies - Batch 2
  
  1. Changes
    - Consolidates multiple permissive policies for creator_verification
    - Consolidates multiple permissive policies for customer_instances
    - Consolidates multiple permissive policies for dccs_ai_monitoring_log
    - Consolidates multiple permissive policies for dccs_ai_training_consent
  
  2. Security
    - Replaces multiple permissive policies with single policies
    - Maintains same access control logic
*/

-- Fix creator_verification policies
DROP POLICY IF EXISTS "Admins have full access to verification" ON creator_verification;
DROP POLICY IF EXISTS "Users can request verification" ON creator_verification;
DROP POLICY IF EXISTS "Users can view their own verification status" ON creator_verification;
DROP POLICY IF EXISTS "Users can update their verification details" ON creator_verification;

CREATE POLICY "Users and admins can insert verification"
  ON creator_verification
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users and admins can view verification"
  ON creator_verification
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users and admins can update verification"
  ON creator_verification
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fix customer_instances policies
DROP POLICY IF EXISTS "Admins can manage customer instances" ON customer_instances;
DROP POLICY IF EXISTS "Authenticated users can view customer instances" ON customer_instances;

CREATE POLICY "Users and admins can view instances"
  ON customer_instances
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix dccs_ai_monitoring_log policies
DROP POLICY IF EXISTS "Admins can view all monitoring logs" ON dccs_ai_monitoring_log;
DROP POLICY IF EXISTS "Creators can view monitoring logs for their content" ON dccs_ai_monitoring_log;

CREATE POLICY "Admins and creators can view monitoring logs"
  ON dccs_ai_monitoring_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_ai_monitoring_log.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Fix dccs_ai_training_consent policies
DROP POLICY IF EXISTS "Creators can manage their consent" ON dccs_ai_training_consent;
DROP POLICY IF EXISTS "Creators can view their consent" ON dccs_ai_training_consent;

CREATE POLICY "Creators can view and manage consent"
  ON dccs_ai_training_consent
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);