/*
  # Asset Access Audit Log
  Append-only table. Service role writes. Authenticated users read own logs only.
*/

CREATE TABLE IF NOT EXISTS asset_access_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  asset_id        uuid,
  bucket_id       text,
  file_path       text,
  access_type     text        NOT NULL,
  permitted       boolean     NOT NULL DEFAULT false,
  denial_reason   text,
  ip_address      text,
  user_agent      text,
  signed_url_expiry timestamptz,
  metadata        jsonb       DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_access_logs_user ON asset_access_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_access_logs_asset ON asset_access_logs (asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_access_logs_denied ON asset_access_logs (permitted, created_at DESC) WHERE permitted = false;
CREATE INDEX IF NOT EXISTS idx_asset_access_logs_bucket ON asset_access_logs (bucket_id, created_at DESC);

ALTER TABLE asset_access_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_access_logs' AND policyname = 'Service role can insert access logs') THEN
    CREATE POLICY "Service role can insert access logs" ON asset_access_logs FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_access_logs' AND policyname = 'Users can view own access logs') THEN
    CREATE POLICY "Users can view own access logs" ON asset_access_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
