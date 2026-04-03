/*
  # Fix RLS Auth Performance - Batch 2 (Corrected)

  1. Performance Improvements
    - Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
    - Uses correct profile_type/role check

  2. Changes
    - Update policies with optimized auth checks
*/

-- search_performance
DROP POLICY IF EXISTS "Admins can insert search performance data" ON public.search_performance;
DROP POLICY IF EXISTS "Admins can view search performance" ON public.search_performance;

CREATE POLICY "Admins can insert search performance data"
  ON public.search_performance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view search performance"
  ON public.search_performance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- crawl_errors
DROP POLICY IF EXISTS "Admins can create crawl errors" ON public.crawl_errors;
DROP POLICY IF EXISTS "Admins can update crawl errors" ON public.crawl_errors;
DROP POLICY IF EXISTS "Admins can view crawl errors" ON public.crawl_errors;

CREATE POLICY "Admins can create crawl errors"
  ON public.crawl_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update crawl errors"
  ON public.crawl_errors
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

CREATE POLICY "Admins can view crawl errors"
  ON public.crawl_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- search_indexing_requests
DROP POLICY IF EXISTS "Admins can create indexing requests" ON public.search_indexing_requests;
DROP POLICY IF EXISTS "Admins can update indexing requests" ON public.search_indexing_requests;
DROP POLICY IF EXISTS "Admins can view all indexing requests" ON public.search_indexing_requests;

CREATE POLICY "Admins can create indexing requests"
  ON public.search_indexing_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update indexing requests"
  ON public.search_indexing_requests
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

CREATE POLICY "Admins can view all indexing requests"
  ON public.search_indexing_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );