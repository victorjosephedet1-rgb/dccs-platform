/*
  # Fix RLS Auth Performance Issues - Batch 2
  
  1. Performance Improvements
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies
    - Prevents re-evaluation of auth functions for each row
  
  2. Tables Fixed (Batch 2)
    - dccs_registrations (4 policies)
    - dccs_verification_requests (5 policies)
*/

-- Fix dccs_registrations policies
DROP POLICY IF EXISTS "Admins can view all registrations" ON dccs_registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON dccs_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON dccs_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON dccs_registrations;

CREATE POLICY "Admins can view all registrations"
  ON dccs_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own registrations"
  ON dccs_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
  );

CREATE POLICY "Users can update own registrations"
  ON dccs_registrations
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own registrations"
  ON dccs_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix dccs_verification_requests policies
DROP POLICY IF EXISTS "Admins can update verification requests" ON dccs_verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON dccs_verification_requests;
DROP POLICY IF EXISTS "Authenticated users can create verification requests for their content" ON dccs_verification_requests;
DROP POLICY IF EXISTS "Creators can view verification requests for their certificates" ON dccs_verification_requests;
DROP POLICY IF EXISTS "Users can view own verification requests" ON dccs_verification_requests;

CREATE POLICY "Admins can update verification requests"
  ON dccs_verification_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all verification requests"
  ON dccs_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create verification requests for their content"
  ON dccs_verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
      AND dccs_certificates.creator_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Creators can view verification requests for their certificates"
  ON dccs_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
      AND dccs_certificates.creator_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own verification requests"
  ON dccs_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
      AND dccs_certificates.creator_id = (SELECT auth.uid())
    )
  );