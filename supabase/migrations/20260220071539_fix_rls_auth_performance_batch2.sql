/*
  # Fix RLS Auth Function Performance - Batch 2

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  2. Tables Updated
    - project_collaborators (4 policies)
    - audio_packs (4 policies)
*/

-- Drop and recreate project_collaborators policies with optimized auth calls
DROP POLICY IF EXISTS "Project owners can add collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Project owners can remove collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Project owners can update collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Users can view collaborators of their projects" ON public.project_collaborators;

CREATE POLICY "Project owners can add collaborators"
ON public.project_collaborators
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_collaborators.project_id
    AND projects.user_id = (select auth.uid())
  )
);

CREATE POLICY "Project owners can remove collaborators"
ON public.project_collaborators
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_collaborators.project_id
    AND projects.user_id = (select auth.uid())
  )
);

CREATE POLICY "Project owners can update collaborators"
ON public.project_collaborators
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_collaborators.project_id
    AND projects.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can view collaborators of their projects"
ON public.project_collaborators
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_collaborators.project_id
    AND (projects.user_id = (select auth.uid()) OR project_collaborators.user_id = (select auth.uid()))
  )
);

-- Drop and recreate audio_packs policies with optimized auth calls
DROP POLICY IF EXISTS "packs_creator_delete" ON public.audio_packs;
DROP POLICY IF EXISTS "packs_creator_insert" ON public.audio_packs;
DROP POLICY IF EXISTS "packs_creator_select" ON public.audio_packs;
DROP POLICY IF EXISTS "packs_creator_update" ON public.audio_packs;

CREATE POLICY "packs_creator_delete"
ON public.audio_packs
FOR DELETE
TO authenticated
USING (creator_id = (select auth.uid()));

CREATE POLICY "packs_creator_insert"
ON public.audio_packs
FOR INSERT
TO authenticated
WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "packs_creator_select"
ON public.audio_packs
FOR SELECT
TO authenticated
USING (creator_id = (select auth.uid()));

CREATE POLICY "packs_creator_update"
ON public.audio_packs
FOR UPDATE
TO authenticated
USING (creator_id = (select auth.uid()))
WITH CHECK (creator_id = (select auth.uid()));
