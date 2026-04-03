/*
  # Fix RLS Auth Performance Issues - Batch 6

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - Fixes policies for DCCS registrations and tracking

  2. Policies Updated
    - dccs_registrations: "Admins and users can view registrations"
    - dccs_royalty_collections: "Admins and creators can view collections"
    - dccs_platform_detections: "Admins and creators can view detections"
    - dccs_copyright_claims: "Admins and creators can view claims"
    - dccs_ai_monitoring_log: "Admins and creators can view monitoring logs"
    - dccs_verification_requests: "Admins creators and requesters can view verification"
*/

-- dccs_registrations: Admins and users can view registrations
DROP POLICY IF EXISTS "Admins and users can view registrations" ON dccs_registrations;
CREATE POLICY "Admins and users can view registrations"
ON dccs_registrations FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_royalty_collections: Admins and creators can view collections
DROP POLICY IF EXISTS "Admins and creators can view collections" ON dccs_royalty_collections;
CREATE POLICY "Admins and creators can view collections"
ON dccs_royalty_collections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = dccs_royalty_collections.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_platform_detections: Admins and creators can view detections
DROP POLICY IF EXISTS "Admins and creators can view detections" ON dccs_platform_detections;
CREATE POLICY "Admins and creators can view detections"
ON dccs_platform_detections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = dccs_platform_detections.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_copyright_claims: Admins and creators can view claims
DROP POLICY IF EXISTS "Admins and creators can view claims" ON dccs_copyright_claims;
CREATE POLICY "Admins and creators can view claims"
ON dccs_copyright_claims FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = dccs_copyright_claims.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_ai_monitoring_log: Admins and creators can view monitoring logs
DROP POLICY IF EXISTS "Admins and creators can view monitoring logs" ON dccs_ai_monitoring_log;
CREATE POLICY "Admins and creators can view monitoring logs"
ON dccs_ai_monitoring_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = dccs_ai_monitoring_log.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_verification_requests: Admins creators and requesters can view verification
DROP POLICY IF EXISTS "Admins creators and requesters can view verification" ON dccs_verification_requests;
CREATE POLICY "Admins creators and requesters can view verification"
ON dccs_verification_requests FOR SELECT
TO authenticated
USING (
  requested_by_user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM dccs_certificates
    WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);
