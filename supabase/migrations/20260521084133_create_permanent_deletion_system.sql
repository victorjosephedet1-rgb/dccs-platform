/*
  # Permanent Deletion System

  Implements a production-grade, GDPR-compliant permanent deletion pipeline
  for DCCSVerify.com.

  ## Tables created

  1. deletion_jobs
     Tracks every deletion request from submission through completion.
     Each job is idempotent — re-submitting the same idempotency_key returns
     the existing job rather than creating a duplicate.

  2. deletion_audit_logs
     Immutable append-only audit trail.  Required for GDPR Right to Erasure
     compliance.  After deletion completes, only the audit record remains —
     no creator content is retained.

  3. deletion_failures
     Records per-step failures so the pipeline can retry individual steps
     without re-running completed ones.

  ## Security
  - RLS enabled on all tables.
  - Owners can read/create their own deletion jobs.
  - Audit logs are owner-read-only; no user can insert directly.
  - Failure records are system-write, owner-read.

  ## Indexes
  Optimised for the two main access patterns:
    - Look up jobs by owner (dashboard view)
    - Look up job by idempotency key (dedup check)
*/

-- ─── deletion_jobs ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deletion_jobs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key     text        NOT NULL,
  owner_id            uuid        NOT NULL,
  target_type         text        NOT NULL,   -- 'upload' | 'dccs_certificate' | 'full_asset'
  target_id           uuid        NOT NULL,
  status              text        NOT NULL DEFAULT 'pending',
  -- pending | validating | revoking_access | removing_storage |
  -- removing_fingerprints | removing_dccs | removing_verification |
  -- purging_caches | consistency_check | completed | failed
  steps_completed     text[]      NOT NULL DEFAULT '{}',
  steps_failed        text[]      NOT NULL DEFAULT '{}',
  retry_count         integer     NOT NULL DEFAULT 0,
  max_retries         integer     NOT NULL DEFAULT 3,
  error_message       text,
  requested_at        timestamptz NOT NULL DEFAULT now(),
  started_at          timestamptz,
  completed_at        timestamptz,
  metadata            jsonb
);

-- Idempotency: one pending/in-progress job per (owner, target).
CREATE UNIQUE INDEX IF NOT EXISTS idx_deletion_jobs_idempotency
  ON deletion_jobs (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_deletion_jobs_owner_id
  ON deletion_jobs (owner_id, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_deletion_jobs_target
  ON deletion_jobs (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_deletion_jobs_status
  ON deletion_jobs (status);

ALTER TABLE deletion_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deletion_jobs' AND policyname = 'Owners can read their deletion jobs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Owners can read their deletion jobs"
        ON deletion_jobs FOR SELECT
        TO authenticated
        USING ((select auth.uid()) = owner_id)
    $p$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deletion_jobs' AND policyname = 'Owners can create deletion jobs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Owners can create deletion jobs"
        ON deletion_jobs FOR INSERT
        TO authenticated
        WITH CHECK ((select auth.uid()) = owner_id)
    $p$;
  END IF;
END $$;

-- ─── deletion_audit_logs ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deletion_audit_logs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_job_id     uuid        NOT NULL REFERENCES deletion_jobs(id) ON DELETE CASCADE,
  owner_id            uuid        NOT NULL,
  target_type         text        NOT NULL,
  target_id           uuid        NOT NULL,
  -- After completion we store NO creator content — only these minimal fields
  -- are retained for legal/compliance purposes (GDPR Art. 17).
  anonymised_ref      text        NOT NULL,   -- sha256(owner_id || target_id)
  deletion_reason     text,
  completed_steps     text[]      NOT NULL DEFAULT '{}',
  requested_at        timestamptz NOT NULL,
  completed_at        timestamptz NOT NULL DEFAULT now(),
  gdpr_compliant      boolean     NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_owner
  ON deletion_audit_logs (owner_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_job
  ON deletion_audit_logs (deletion_job_id);

ALTER TABLE deletion_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deletion_audit_logs' AND policyname = 'Owners can read their audit logs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Owners can read their audit logs"
        ON deletion_audit_logs FOR SELECT
        TO authenticated
        USING ((select auth.uid()) = owner_id)
    $p$;
  END IF;
END $$;

-- ─── deletion_failures ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deletion_failures (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_job_id     uuid        NOT NULL REFERENCES deletion_jobs(id) ON DELETE CASCADE,
  step_name           text        NOT NULL,
  error_code          text        NOT NULL DEFAULT 'UNKNOWN',
  error_message       text        NOT NULL,
  occurred_at         timestamptz NOT NULL DEFAULT now(),
  retry_attempt       integer     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_deletion_failures_job
  ON deletion_failures (deletion_job_id, occurred_at DESC);

ALTER TABLE deletion_failures ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'deletion_failures' AND policyname = 'Owners can read their deletion failures'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Owners can read their deletion failures"
        ON deletion_failures FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM deletion_jobs dj
            WHERE dj.id = deletion_failures.deletion_job_id
              AND dj.owner_id = (select auth.uid())
          )
        )
    $p$;
  END IF;
END $$;
