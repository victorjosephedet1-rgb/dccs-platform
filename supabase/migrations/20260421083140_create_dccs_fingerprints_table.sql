/*
  # Create dccs_fingerprints table

  ## Purpose
  Stores the cryptographic fingerprint record produced in Stage 2 (Fingerprint Generation)
  of the DCCS clearance pipeline. Each row represents a unique file identity anchor —
  independent of the dccs_certificates record — providing a tamper-evident ownership
  proof trail at the binary level.

  ## New Tables
  - `dccs_fingerprints`
    - `id` (uuid, pk) — auto-generated
    - `upload_id` (uuid, fk → uploads.id CASCADE) — the file this fingerprint belongs to
    - `user_id` (uuid, fk → auth.users.id CASCADE) — creator who owns this record
    - `sha256_hash` (text) — full 64-char hex SHA-256 of the raw file bytes
    - `file_size` (bigint) — byte count at time of fingerprinting
    - `file_type` (text) — MIME type
    - `file_category` (text) — normalised category: audio | video | image | document
    - `asset_id` (text) — the DCCS clearance code (e.g. DCCS-AUD-2026-A4B2C1)
      used as a human-readable asset identity anchor independent of the certificate UUID
    - `created_at` (timestamptz) — immutable creation timestamp

  ## Security
  - RLS enabled; table is locked by default
  - INSERT: authenticated users may only insert rows where user_id = their own uid
  - SELECT: authenticated users may only read their own rows
  - No UPDATE or DELETE policies — fingerprint records are append-only for integrity

  ## Indexes
  - upload_id — fast lookup of fingerprint by upload
  - user_id — fast lookup of all fingerprints for a creator
  - sha256_hash — duplicate-detection and cross-upload similarity queries
*/

CREATE TABLE IF NOT EXISTS public.dccs_fingerprints (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id     uuid        NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  sha256_hash   text        NOT NULL,
  file_size     bigint      NOT NULL,
  file_type     text        NOT NULL,
  file_category text        NOT NULL,
  asset_id      text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dccs_fingerprints_upload_id_idx ON public.dccs_fingerprints(upload_id);
CREATE INDEX IF NOT EXISTS dccs_fingerprints_user_id_idx   ON public.dccs_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS dccs_fingerprints_sha256_idx    ON public.dccs_fingerprints(sha256_hash);

ALTER TABLE public.dccs_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own fingerprints"
  ON public.dccs_fingerprints
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can read own fingerprints"
  ON public.dccs_fingerprints
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
