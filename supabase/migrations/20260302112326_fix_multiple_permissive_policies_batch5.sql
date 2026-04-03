/*
  # Fix Multiple Permissive RLS Policies - Batch 5
  
  1. Changes
    - Consolidates policies for dccs_verification_requests
    - Consolidates policies for deployment_logs
    - Consolidates policies for deployment_versions
    - Consolidates policies for exclusivity_declarations
    - Consolidates policies for exclusivity_violations
  
  2. Security
    - Replaces multiple permissive policies with single policies
*/

-- Fix dccs_verification_requests policies
DROP POLICY IF EXISTS "Admins can view all verification requests" ON dccs_verification_requests;
DROP POLICY IF EXISTS "Creators can view verification requests for their certificates" ON dccs_verification_requests;
DROP POLICY IF EXISTS "Users can view own verification requests" ON dccs_verification_requests;

CREATE POLICY "Admins creators and requesters can view verification"
  ON dccs_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requested_by_user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Fix deployment_logs policies
DROP POLICY IF EXISTS "Admins can manage deployment logs" ON deployment_logs;
DROP POLICY IF EXISTS "Authenticated users can view deployment logs" ON deployment_logs;

CREATE POLICY "All authenticated can view deployment logs"
  ON deployment_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix deployment_versions policies
DROP POLICY IF EXISTS "Admins can manage deployment versions" ON deployment_versions;
DROP POLICY IF EXISTS "Anyone can view deployment versions" ON deployment_versions;

CREATE POLICY "All authenticated can view deployment versions"
  ON deployment_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix exclusivity_declarations policies
DROP POLICY IF EXISTS "Admins can view all declarations" ON exclusivity_declarations;
DROP POLICY IF EXISTS "Users can view own declarations" ON exclusivity_declarations;

CREATE POLICY "Admins and users can view declarations"
  ON exclusivity_declarations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fix exclusivity_violations INSERT policies
DROP POLICY IF EXISTS "Admins can manage all violations" ON exclusivity_violations;
DROP POLICY IF EXISTS "Users can report violations" ON exclusivity_violations;

CREATE POLICY "Admins and users can insert violations"
  ON exclusivity_violations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reported_by OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fix exclusivity_violations SELECT policies
DROP POLICY IF EXISTS "Users can view own reports" ON exclusivity_violations;

CREATE POLICY "Admins and reporters can view violations"
  ON exclusivity_violations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reported_by OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );