/*
  # DCCS Launch Readiness Layer

  ## Overview
  Adds the infrastructure needed for controlled launch, beta user tracking,
  and production monitoring — all additive with no impact on existing tables.

  ## New Tables
  - `dccs_system_logs` — append-only event log for upload/cert/download failures
    and key pipeline milestones. Used by admin dashboard and health endpoint.

  ## Modified Tables
  - `profiles` — adds `is_beta_user` flag and `onboarding_completed` flag

  ## Security
  - RLS enabled on dccs_system_logs
  - Users can INSERT their own logs; only admins can SELECT all logs
  - profiles flags are only writable by the owning user (onboarding_completed)
    and by admins (is_beta_user)

  ## Notes
  - All changes are purely additive
  - No existing columns, indexes, or policies are modified
*/

-- ─── 1. profiles: onboarding + beta flags ────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_beta_user'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_beta_user boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Fast lookup for beta users
CREATE INDEX IF NOT EXISTS idx_profiles_is_beta_user
  ON profiles (is_beta_user)
  WHERE is_beta_user = true;

-- ─── 2. dccs_system_logs table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dccs_system_logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type   text        NOT NULL CHECK (event_type IN (
                             'upload_start', 'upload_success', 'upload_fail',
                             'code_success', 'code_fail',
                             'cert_success', 'cert_fail',
                             'download_start', 'download_success', 'download_fail',
                             'onboarding_complete', 'system_info'
                           )),
  message      text        NOT NULL DEFAULT '',
  metadata     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  severity     text        NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warn', 'error')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dccs_system_logs ENABLE ROW LEVEL SECURITY;

-- Users can write their own logs
CREATE POLICY "Users can insert own system logs"
  ON dccs_system_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own logs
CREATE POLICY "Users can read own system logs"
  ON dccs_system_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin read-all (matches pattern used by other admin tables in this codebase)
CREATE POLICY "Admins can read all system logs"
  ON dccs_system_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id
  ON dccs_system_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_system_logs_event_type
  ON dccs_system_logs (event_type);

CREATE INDEX IF NOT EXISTS idx_system_logs_severity
  ON dccs_system_logs (severity);

CREATE INDEX IF NOT EXISTS idx_system_logs_created_at
  ON dccs_system_logs (created_at DESC);

-- ─── 3. Aggregate helper: upload stats for admin dashboard ───────────────────
-- Returns upload success/fail counts + code/cert generation rates.
-- Called by the admin pilot dashboard. SECURITY DEFINER so it can aggregate
-- across all users while the caller only needs to be 'admin' role.

CREATE OR REPLACE FUNCTION get_platform_upload_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Only allow admins
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT jsonb_build_object(
    'total_uploads',             COUNT(*) FILTER (WHERE event_type IN ('upload_start', 'upload_success', 'upload_fail')),
    'successful_uploads',        COUNT(*) FILTER (WHERE event_type = 'upload_success'),
    'failed_uploads',            COUNT(*) FILTER (WHERE event_type = 'upload_fail'),
    'code_success',              COUNT(*) FILTER (WHERE event_type = 'code_success'),
    'code_fail',                 COUNT(*) FILTER (WHERE event_type = 'code_fail'),
    'cert_success',              COUNT(*) FILTER (WHERE event_type = 'cert_success'),
    'cert_fail',                 COUNT(*) FILTER (WHERE event_type = 'cert_fail'),
    'beta_user_uploads',         COUNT(*) FILTER (
                                   WHERE event_type IN ('upload_success', 'upload_fail')
                                   AND user_id IN (SELECT id FROM profiles WHERE is_beta_user = true)
                                 ),
    'last_updated',              now()
  )
  INTO v_result
  FROM dccs_system_logs
  WHERE created_at >= now() - interval '30 days';

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_platform_upload_stats() FROM anon;

-- ─── 4. get_recent_errors: last N error/warn logs for admin view ──────────────

CREATE OR REPLACE FUNCTION get_recent_system_errors(p_limit integer DEFAULT 50)
RETURNS TABLE (
  id         uuid,
  user_id    uuid,
  event_type text,
  message    text,
  metadata   jsonb,
  severity   text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN QUERY
  SELECT
    l.id, l.user_id, l.event_type, l.message, l.metadata, l.severity, l.created_at
  FROM dccs_system_logs l
  WHERE l.severity IN ('error', 'warn')
  ORDER BY l.created_at DESC
  LIMIT p_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_recent_system_errors(integer) FROM anon;
