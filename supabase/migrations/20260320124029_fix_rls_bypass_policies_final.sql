/*
  # Fix RLS Policies That Bypass Security (Final Fix)

  1. Security Improvements
    - Replace policies with "true" that bypass RLS
    - Uses correct column names from schema

  2. Changes
    - Fix dccs_distortion_profiles INSERT policy
    - Fix dccs_fingerprint_data INSERT policy
    - Fix dccs_structured_identifiers INSERT policy
    - Fix dccs_verification_matches INSERT policy
*/

-- dccs_distortion_profiles: require ownership
DROP POLICY IF EXISTS "Authenticated users can create distortion profiles" ON public.dccs_distortion_profiles;
DROP POLICY IF EXISTS "Users can create their own distortion profiles" ON public.dccs_distortion_profiles;

CREATE POLICY "Users can create their own distortion profiles"
  ON public.dccs_distortion_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

-- dccs_fingerprint_data: require certificate ownership
DROP POLICY IF EXISTS "System can create fingerprint data" ON public.dccs_fingerprint_data;
DROP POLICY IF EXISTS "System can create fingerprint for owned certificates" ON public.dccs_fingerprint_data;

CREATE POLICY "System can create fingerprint for owned certificates"
  ON public.dccs_fingerprint_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dccs_certificates
      WHERE dccs_certificates.id = dccs_fingerprint_data.certificate_id
      AND dccs_certificates.creator_id = (select auth.uid())
    )
  );

-- dccs_structured_identifiers: require certificate ownership
DROP POLICY IF EXISTS "System can create structured identifiers" ON public.dccs_structured_identifiers;
DROP POLICY IF EXISTS "System can create identifiers for owned certificates" ON public.dccs_structured_identifiers;

CREATE POLICY "System can create identifiers for owned certificates"
  ON public.dccs_structured_identifiers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dccs_certificates
      WHERE dccs_certificates.id = dccs_structured_identifiers.certificate_id
      AND dccs_certificates.creator_id = (select auth.uid())
    )
  );

-- dccs_verification_matches: require ownership of verification request
DROP POLICY IF EXISTS "Authenticated users can create verification matches" ON public.dccs_verification_matches;
DROP POLICY IF EXISTS "Users can create matches for their verification requests" ON public.dccs_verification_matches;

CREATE POLICY "Users can create matches for their verification requests"
  ON public.dccs_verification_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (verified_by = (select auth.uid()));