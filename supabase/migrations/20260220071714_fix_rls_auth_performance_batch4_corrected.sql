/*
  # Fix RLS Auth Function Performance - Batch 4 Corrected

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  2. Tables Updated
    - platform_features (1 policy)
    - platform_milestones (1 policy)
    - platform_info (2 policies)
    - dccs_platform_detections (2 policies)
*/

-- Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Drop and recreate platform_features policy with optimized auth calls
DROP POLICY IF EXISTS "Only admins can manage features" ON public.platform_features;

CREATE POLICY "Only admins can manage features"
ON public.platform_features
FOR ALL
TO authenticated
USING ((select public.is_admin()));

-- Drop and recreate platform_milestones policy with optimized auth calls
DROP POLICY IF EXISTS "Only admins can manage milestones" ON public.platform_milestones;

CREATE POLICY "Only admins can manage milestones"
ON public.platform_milestones
FOR ALL
TO authenticated
USING ((select public.is_admin()));

-- Drop and recreate platform_info policies with optimized auth calls
DROP POLICY IF EXISTS "Only admins can insert platform info" ON public.platform_info;
DROP POLICY IF EXISTS "Only admins can update platform info" ON public.platform_info;

CREATE POLICY "Only admins can insert platform info"
ON public.platform_info
FOR INSERT
TO authenticated
WITH CHECK ((select public.is_admin()));

CREATE POLICY "Only admins can update platform info"
ON public.platform_info
FOR UPDATE
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

-- Drop and recreate dccs_platform_detections policies with optimized auth calls
DROP POLICY IF EXISTS "Admins can view all detections" ON public.dccs_platform_detections;
DROP POLICY IF EXISTS "Creators can view detections of their content" ON public.dccs_platform_detections;

CREATE POLICY "Admins can view all detections"
ON public.dccs_platform_detections
FOR SELECT
TO authenticated
USING ((select public.is_admin()));

CREATE POLICY "Creators can view detections of their content"
ON public.dccs_platform_detections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dccs_certificates
    WHERE dccs_certificates.id = dccs_platform_detections.dccs_certificate_id
    AND dccs_certificates.creator_id = (select auth.uid())
  )
);
