/*
  # Asset Access Audit Log

  ## Overview
  Tracks every file access, download, signed URL generation, and failed
  permission check. Required for DCCS enterprise-grade audit trail.

  ## Table: asset_access_logs
  - Records who accessed what, when, and whether it was permitted.
  - Append-only: no UPDATE or DELETE policies for any user role.
  - Service role writes via Edge Functions; authenticated users read their own.

  ## Notes
  - ip_address stored as text (IPv4/IPv6 compatible)
  - user_agent truncated at 500 chars to prevent bloat
*/

CREATE TABLE IF NOT EXISTS asset_access_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  asset_id        uuid,
  bucket_id       text,
  file_path       text,
  access_type     text        NOT NULL,
  -- download | stream | signed_url_generated | access_denied | upload | delete
  permitted       boolean     NOT NULL DEFAULT false,
  denial_reason   text,
  ip_address      text,
  user_agent      text,
  signed_url_expiry timestamptz,
  metadata        jsonb       DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_access_logs_user
  ON asset_access_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_access_logs_asset
  ON asset_access_logs (asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_access_logs_denied
  ON asset_access_logs (permitted, created_at DESC)
  WHERE permitted = false;

CREATE INDEX IF NOT EXISTS idx_asset_access_logs_bucket
  ON asset_access_logs (bucket_id, created_at DESC);

ALTER TABLE asset_access_logs ENABLE ROW LEVEL SECURITY;

-- Service role writes all logs
CREATE POLICY "Service role can insert access logs"
ON asset_access_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can read only their own access history
CREATE POLICY "Users can view own access logs"
ON asset_access_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No UPDATE or DELETE for any user — audit logs are immutable
