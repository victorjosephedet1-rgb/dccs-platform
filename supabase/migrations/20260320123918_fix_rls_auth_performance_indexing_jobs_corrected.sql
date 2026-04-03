/*
  # Fix RLS Auth Performance - Indexing Jobs Table (Corrected)

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
    - Fixes policies on indexing_jobs table
    - Uses correct profile_type check instead of is_admin

  2. Changes
    - Update "Admins can create indexing jobs" policy
    - Update "Admins can update indexing jobs" policy
    - Update "Admins can view all indexing jobs" policy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can create indexing jobs" ON public.indexing_jobs;
DROP POLICY IF EXISTS "Admins can update indexing jobs" ON public.indexing_jobs;
DROP POLICY IF EXISTS "Admins can view all indexing jobs" ON public.indexing_jobs;

-- Recreate with optimized auth check
CREATE POLICY "Admins can create indexing jobs"
  ON public.indexing_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update indexing jobs"
  ON public.indexing_jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all indexing jobs"
  ON public.indexing_jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );