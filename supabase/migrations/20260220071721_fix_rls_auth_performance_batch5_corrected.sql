/*
  # Fix RLS Auth Function Performance - Batch 5 Corrected

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  2. Tables Updated
    - dccs_copyright_claims (2 policies)
    - dccs_royalty_collections (2 policies)
    - dccs_ai_monitoring_log (2 policies)
    - dccs_platform_licenses (1 policy)
*/

-- Drop and recreate dccs_copyright_claims policies with optimized auth calls
DROP POLICY IF EXISTS "Admins can view all claims" ON public.dccs_copyright_claims;
DROP POLICY IF EXISTS "Creators can view claims for their content" ON public.dccs_copyright_claims;

CREATE POLICY "Admins can view all claims"
ON public.dccs_copyright_claims
FOR SELECT
TO authenticated
USING ((select public.is_admin()));

CREATE POLICY "Creators can view claims for their content"
ON public.dccs_copyright_claims
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dccs_platform_detections det
    INNER JOIN public.dccs_certificates cert ON cert.id = det.dccs_certificate_id
    WHERE det.id = dccs_copyright_claims.detection_id
    AND cert.creator_id = (select auth.uid())
  )
);

-- Drop and recreate dccs_royalty_collections policies with optimized auth calls
DROP POLICY IF EXISTS "Admins can view all royalty collections" ON public.dccs_royalty_collections;
DROP POLICY IF EXISTS "Creators can view their royalty collections" ON public.dccs_royalty_collections;

CREATE POLICY "Admins can view all royalty collections"
ON public.dccs_royalty_collections
FOR SELECT
TO authenticated
USING ((select public.is_admin()));

CREATE POLICY "Creators can view their royalty collections"
ON public.dccs_royalty_collections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dccs_copyright_claims claim
    INNER JOIN public.dccs_platform_detections det ON det.id = claim.detection_id
    INNER JOIN public.dccs_certificates cert ON cert.id = det.dccs_certificate_id
    WHERE claim.id = dccs_royalty_collections.claim_id
    AND cert.creator_id = (select auth.uid())
  )
);

-- Drop and recreate dccs_ai_monitoring_log policies with optimized auth calls
DROP POLICY IF EXISTS "Admins can view all monitoring logs" ON public.dccs_ai_monitoring_log;
DROP POLICY IF EXISTS "Creators can view monitoring logs for their content" ON public.dccs_ai_monitoring_log;

CREATE POLICY "Admins can view all monitoring logs"
ON public.dccs_ai_monitoring_log
FOR SELECT
TO authenticated
USING ((select public.is_admin()));

CREATE POLICY "Creators can view monitoring logs for their content"
ON public.dccs_ai_monitoring_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dccs_platform_detections det
    INNER JOIN public.dccs_certificates cert ON cert.id = det.dccs_certificate_id
    WHERE det.id = dccs_ai_monitoring_log.detection_id
    AND cert.creator_id = (select auth.uid())
  )
);

-- Drop and recreate dccs_platform_licenses policy with optimized auth calls
DROP POLICY IF EXISTS "Admins can view platform licenses" ON public.dccs_platform_licenses;

CREATE POLICY "Admins can view platform licenses"
ON public.dccs_platform_licenses
FOR SELECT
TO authenticated
USING ((select public.is_admin()));
