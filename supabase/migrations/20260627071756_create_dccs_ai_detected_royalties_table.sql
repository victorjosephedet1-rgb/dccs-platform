-- DCCS Agentic AI Detected Royalties Table
-- Stores automated royalty detections from the Agentic AI monitoring system

CREATE TABLE IF NOT EXISTS dccs_ai_detected_royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dccs_hash TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  asset_id TEXT,
  source_platform TEXT,
  detected_views BIGINT DEFAULT 0,
  total_revenue_eth NUMERIC(20, 8) DEFAULT 0,
  creator_share_eth NUMERIC(20, 8) DEFAULT 0,
  treasury_share_eth NUMERIC(20, 8) DEFAULT 0,
  total_revenue_gbp NUMERIC(12, 2) DEFAULT 0,
  creator_share_gbp NUMERIC(12, 2) DEFAULT 0,
  treasury_share_gbp NUMERIC(12, 2) DEFAULT 0,
  detection_timestamp TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dccs_ai_royalties_dccs_hash ON dccs_ai_detected_royalties(dccs_hash);
CREATE INDEX IF NOT EXISTS idx_dccs_ai_royalties_user_id ON dccs_ai_detected_royalties(user_id);
CREATE INDEX IF NOT EXISTS idx_dccs_ai_royalties_creator_wallet ON dccs_ai_detected_royalties(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_dccs_ai_royalties_processed ON dccs_ai_detected_royalties(processed);
CREATE INDEX IF NOT EXISTS idx_dccs_ai_royalties_source_platform ON dccs_ai_detected_royalties(source_platform);
CREATE INDEX IF NOT EXISTS idx_dccs_ai_royalties_timestamp ON dccs_ai_detected_royalties(detection_timestamp DESC);

-- Enable RLS
ALTER TABLE dccs_ai_detected_royalties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own detected royalties" ON dccs_ai_detected_royalties
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all detected royalties" ON dccs_ai_detected_royalties
  FOR ALL TO service_role
  USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_dccs_ai_royalties_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dccs_ai_royalties_updated_at ON dccs_ai_detected_royalties;
CREATE TRIGGER dccs_ai_royalties_updated_at
  BEFORE UPDATE ON dccs_ai_detected_royalties
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_ai_royalties_timestamp();

-- Add comment
COMMENT ON TABLE dccs_ai_detected_royalties IS 'Stores automated royalty detections from Agentic AI monitoring system for DCCS platform';
