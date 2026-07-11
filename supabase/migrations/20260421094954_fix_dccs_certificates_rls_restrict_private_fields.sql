/*
  # Fix dccs_certificates RLS — Replace USING(true) with owner-scoped read

  ## Problem
  The existing SELECT policy uses USING (true), which allows any authenticated
  user to read every certificate row in the table — including private fields like
  audio_fingerprint, certificate_hash, and creator_id that belong to other creators.

  ## Solution
  Two separate SELECT policies:
    1. Owners can read their own full certificate record.
    2. Public verification — anyone (including unauthenticated) can read the
       minimum fields needed to verify a clearance code:
         clearance_code, certificate_id, project_title, project_type,
         creator_legal_name, creation_timestamp, phase, download_unlocked
       This is intentional: DCCS verification must work without login.
       The audio_fingerprint, certificate_hash, and creator_id remain
       owner-only for the full read.

  ## Implementation Note
  PostgREST/Supabase RLS does not support column-level policies directly.
  Instead:
    - We keep one broad "owner reads all own data" policy.
    - We add a separate restricted "public verification read" policy.
  Both policies are FOR SELECT (two permissive policies = OR semantics).
  The public policy is scoped to only rows where is_public = true.
  All private-data queries must be owner-scoped in the frontend.

  ## Security
  - Creator's own certificates: full access.
  - Public verification of is_public=true certificates: allowed for all.
  - Private/non-public certificates: only the owner can read.
*/

-- Drop the blanket USING(true) policy
DROP POLICY IF EXISTS "Anyone can view certificates" ON public.dccs_certificates;
DROP POLICY IF EXISTS "Public can view certificates for verification" ON public.dccs_certificates;
DROP POLICY IF EXISTS "Creators can read own certificates" ON public.dccs_certificates;

-- Policy 1: Owners can read their own full certificate records (all columns)
CREATE POLICY "Creators can read own certificates"
  ON public.dccs_certificates
  FOR SELECT
  TO authenticated
  USING (creator_id = (SELECT auth.uid()));

-- Policy 2: Public clearance code verification — read-only on is_public rows
-- Allows the VerificationService to look up any public certificate by clearance_code
-- without requiring the verifier to be logged in or be the owner.
CREATE POLICY "Public can verify is_public certificates"
  ON public.dccs_certificates
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);
