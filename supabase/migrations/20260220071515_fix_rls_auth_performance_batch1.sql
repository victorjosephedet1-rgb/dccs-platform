/*
  # Fix RLS Auth Function Performance - Batch 1

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row
    - Improves RLS policy performance at scale

  2. Tables Updated
    - pack_purchases (4 policies)
    - projects (4 policies)
    - upload_chunks (4 policies)
*/

-- Drop and recreate pack_purchases policies with optimized auth calls
DROP POLICY IF EXISTS "purchases_creator_select" ON public.pack_purchases;
DROP POLICY IF EXISTS "purchases_user_insert" ON public.pack_purchases;
DROP POLICY IF EXISTS "purchases_user_select" ON public.pack_purchases;
DROP POLICY IF EXISTS "purchases_user_update" ON public.pack_purchases;

CREATE POLICY "purchases_creator_select"
ON public.pack_purchases
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audio_packs
    WHERE audio_packs.id = pack_purchases.pack_id
    AND audio_packs.creator_id = (select auth.uid())
  )
);

CREATE POLICY "purchases_user_insert"
ON public.pack_purchases
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "purchases_user_select"
ON public.pack_purchases
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "purchases_user_update"
ON public.pack_purchases
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate projects policies with optimized auth calls
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

CREATE POLICY "Users can create their own projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- Drop and recreate upload_chunks policies with optimized auth calls
DROP POLICY IF EXISTS "Users can create their own upload chunks" ON public.upload_chunks;
DROP POLICY IF EXISTS "Users can delete their own upload chunks" ON public.upload_chunks;
DROP POLICY IF EXISTS "Users can update their own upload chunks" ON public.upload_chunks;
DROP POLICY IF EXISTS "Users can view their own upload chunks" ON public.upload_chunks;

CREATE POLICY "Users can create their own upload chunks"
ON public.upload_chunks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.uploads
    WHERE uploads.id = upload_chunks.upload_id
    AND uploads.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can delete their own upload chunks"
ON public.upload_chunks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.uploads
    WHERE uploads.id = upload_chunks.upload_id
    AND uploads.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can update their own upload chunks"
ON public.upload_chunks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.uploads
    WHERE uploads.id = upload_chunks.upload_id
    AND uploads.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can view their own upload chunks"
ON public.upload_chunks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.uploads
    WHERE uploads.id = upload_chunks.upload_id
    AND uploads.user_id = (select auth.uid())
  )
);
