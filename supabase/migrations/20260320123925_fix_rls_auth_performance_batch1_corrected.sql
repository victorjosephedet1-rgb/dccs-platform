/*
  # Fix RLS Auth Performance - Batch 1 (Corrected)

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
    - Uses correct profile_type/role check instead of is_admin

  2. Changes
    - Update policies with optimized auth checks
*/

-- platform_ownership_metadata
DROP POLICY IF EXISTS "Only admins can view ownership metadata" ON public.platform_ownership_metadata;

CREATE POLICY "Only admins can view ownership metadata"
  ON public.platform_ownership_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- usage_snapshots
DROP POLICY IF EXISTS "Admins can view usage snapshots" ON public.usage_snapshots;
DROP POLICY IF EXISTS "System can insert usage snapshots" ON public.usage_snapshots;

CREATE POLICY "Admins can view usage snapshots"
  ON public.usage_snapshots
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert usage snapshots"
  ON public.usage_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- data_asset_registry
DROP POLICY IF EXISTS "Only admins can view asset registry" ON public.data_asset_registry;

CREATE POLICY "Only admins can view asset registry"
  ON public.data_asset_registry
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ip_protection_log
DROP POLICY IF EXISTS "Only admins can view IP protection log" ON public.ip_protection_log;

CREATE POLICY "Only admins can view IP protection log"
  ON public.ip_protection_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );