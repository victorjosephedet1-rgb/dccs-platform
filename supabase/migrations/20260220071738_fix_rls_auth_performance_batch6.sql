/*
  # Fix RLS Auth Function Performance - Batch 6

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  2. Tables Updated
    - uploads (8 policies)
    - dccs_download_history (2 policies)
*/

-- Drop and recreate uploads policies with optimized auth calls
DROP POLICY IF EXISTS "Users can create their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can read own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can update own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can update their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.uploads;

-- Create single set of optimized policies for uploads
CREATE POLICY "Users can insert own uploads"
ON public.uploads
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own uploads"
ON public.uploads
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own uploads"
ON public.uploads
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own uploads"
ON public.uploads
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- Drop and recreate dccs_download_history policies with optimized auth calls
DROP POLICY IF EXISTS "System can insert download history" ON public.dccs_download_history;
DROP POLICY IF EXISTS "Users can view own download history" ON public.dccs_download_history;

CREATE POLICY "System can insert download history"
ON public.dccs_download_history
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own download history"
ON public.dccs_download_history
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));
