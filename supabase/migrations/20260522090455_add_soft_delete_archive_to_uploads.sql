/*
  # Add Soft-Delete / Archive System to Uploads

  ## What this does
  Adds a two-stage lifecycle to every upload:

  Stage 1 — Soft Delete (Archive)
    - Sets `archived_at` timestamp on the row.
    - Item disappears from the active library view.
    - Can be restored at any time by clearing `archived_at`.

  Stage 2 — Permanent Delete (existing pipeline)
    - Hard-deletes via the existing `deletion_jobs` pipeline.
    - Only accessible from the "Archived" view.

  ## Changes

  ### uploads table
  - `archived_at` (timestamptz, nullable) — NULL = active; set = archived
  - `archive_reason` (text, nullable) — optional label stored with archive action

  ### asset_archive_events table (new)
  Append-only audit trail for every archive / restore action.
  Columns:
    - id            uuid PK
    - upload_id     uuid FK → uploads
    - user_id       uuid FK → auth.users
    - action        text  ('archived' | 'restored')
    - reason        text  (nullable)
    - occurred_at   timestamptz

  ## Security
  - RLS enabled on asset_archive_events
  - Users can only read/insert their own events
  - uploads table RLS already exists; no changes needed there
*/

-- ─── 1. Add archive columns to uploads ───────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE uploads ADD COLUMN archived_at timestamptz DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'archive_reason'
  ) THEN
    ALTER TABLE uploads ADD COLUMN archive_reason text DEFAULT NULL;
  END IF;
END $$;

-- Fast lookup: active items (archived_at IS NULL) sorted by date
CREATE INDEX IF NOT EXISTS idx_uploads_active
  ON uploads (user_id, created_at DESC)
  WHERE archived_at IS NULL;

-- Fast lookup: archived items
CREATE INDEX IF NOT EXISTS idx_uploads_archived
  ON uploads (user_id, archived_at DESC)
  WHERE archived_at IS NOT NULL;

-- ─── 2. asset_archive_events ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_archive_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id    uuid        NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL,
  action       text        NOT NULL CHECK (action IN ('archived', 'restored')),
  reason       text        DEFAULT NULL,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_archive_events_user
  ON asset_archive_events (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_archive_events_upload
  ON asset_archive_events (upload_id, occurred_at DESC);

ALTER TABLE asset_archive_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'asset_archive_events'
      AND policyname = 'Users can read their own archive events'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can read their own archive events"
        ON asset_archive_events FOR SELECT
        TO authenticated
        USING ((select auth.uid()) = user_id)
    $p$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'asset_archive_events'
      AND policyname = 'Users can insert their own archive events'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can insert their own archive events"
        ON asset_archive_events FOR INSERT
        TO authenticated
        WITH CHECK ((select auth.uid()) = user_id)
    $p$;
  END IF;
END $$;
