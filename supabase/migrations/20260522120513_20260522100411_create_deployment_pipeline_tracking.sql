/*
  # Deployment Pipeline Tracking System

  Tables: deployment_runs, deployment_health_checks, pipeline_alerts
*/

CREATE TABLE IF NOT EXISTS deployment_runs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_sha          text        NOT NULL,
  commit_message      text,
  branch              text        NOT NULL DEFAULT 'main',
  triggered_by        text        NOT NULL DEFAULT 'push',
  netlify_deploy_id   text,
  netlify_deploy_url  text,
  status              text        NOT NULL DEFAULT 'pending',
  build_started_at    timestamptz,
  build_completed_at  timestamptz,
  deploy_started_at   timestamptz,
  deploy_completed_at timestamptz,
  health_confirmed_at timestamptz,
  health_check_count  integer     NOT NULL DEFAULT 0,
  error_message       text,
  metadata            jsonb       DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deployment_runs_commit
  ON deployment_runs (commit_sha);

CREATE INDEX IF NOT EXISTS idx_deployment_runs_status
  ON deployment_runs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployment_runs_branch
  ON deployment_runs (branch, created_at DESC);

ALTER TABLE deployment_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deployment_runs' AND policyname = 'Service role full access to deployment_runs') THEN
    CREATE POLICY "Service role full access to deployment_runs"
      ON deployment_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deployment_runs' AND policyname = 'Authenticated users can read deployment_runs') THEN
    CREATE POLICY "Authenticated users can read deployment_runs"
      ON deployment_runs FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS deployment_health_checks (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_run_id   uuid        NOT NULL REFERENCES deployment_runs(id) ON DELETE CASCADE,
  check_url           text        NOT NULL,
  http_status         integer,
  response_time_ms    integer,
  passed              boolean     NOT NULL,
  attempt_number      integer     NOT NULL DEFAULT 1,
  error_detail        text,
  checked_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_checks_run
  ON deployment_health_checks (deployment_run_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_checks_passed
  ON deployment_health_checks (passed, checked_at DESC);

ALTER TABLE deployment_health_checks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deployment_health_checks' AND policyname = 'Service role full access to deployment_health_checks') THEN
    CREATE POLICY "Service role full access to deployment_health_checks"
      ON deployment_health_checks FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deployment_health_checks' AND policyname = 'Authenticated users can read deployment_health_checks') THEN
    CREATE POLICY "Authenticated users can read deployment_health_checks"
      ON deployment_health_checks FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pipeline_alerts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_run_id   uuid        REFERENCES deployment_runs(id) ON DELETE SET NULL,
  alert_type          text        NOT NULL,
  severity            text        NOT NULL DEFAULT 'warning',
  message             text        NOT NULL,
  resolved            boolean     NOT NULL DEFAULT false,
  resolved_at         timestamptz,
  metadata            jsonb       DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_alerts_unresolved
  ON pipeline_alerts (resolved, created_at DESC)
  WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_pipeline_alerts_run
  ON pipeline_alerts (deployment_run_id);

ALTER TABLE pipeline_alerts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_alerts' AND policyname = 'Service role full access to pipeline_alerts') THEN
    CREATE POLICY "Service role full access to pipeline_alerts"
      ON pipeline_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_alerts' AND policyname = 'Authenticated users can read pipeline_alerts') THEN
    CREATE POLICY "Authenticated users can read pipeline_alerts"
      ON pipeline_alerts FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_deployment_runs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deployment_runs_updated_at ON deployment_runs;

CREATE TRIGGER trg_deployment_runs_updated_at
  BEFORE UPDATE ON deployment_runs
  FOR EACH ROW EXECUTE FUNCTION update_deployment_runs_updated_at();
