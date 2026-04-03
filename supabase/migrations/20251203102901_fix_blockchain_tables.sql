/*
  # Complete Blockchain Infrastructure

  1. New Tables
    - blockchain_transactions - All blockchain tx records
    - smart_contracts - Deployed contract registry
  
  2. Security
    - RLS enabled on all tables
    - Users view only their transactions
*/

-- blockchain_transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_hash text UNIQUE NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  amount numeric(15,8) NOT NULL,
  network text NOT NULL CHECK (network IN ('ethereum', 'polygon', 'binance-smart-chain', 'base')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirming', 'completed', 'failed')),
  block_number bigint,
  confirmations integer DEFAULT 0,
  gas_used text,
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,
  license_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- smart_contracts table
CREATE TABLE IF NOT EXISTS smart_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text UNIQUE NOT NULL,
  network text NOT NULL CHECK (network IN ('ethereum', 'polygon', 'binance-smart-chain', 'base')),
  type text NOT NULL CHECK (type IN ('royalty_split', 'escrow', 'streaming')),
  abi jsonb NOT NULL DEFAULT '[]'::jsonb,
  deployed_at timestamptz NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  total_processed numeric(15,2) DEFAULT 0,
  transaction_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_network ON blockchain_transactions(network);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_snippet ON blockchain_transactions(snippet_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_license ON blockchain_transactions(license_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_created ON blockchain_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_address ON smart_contracts(address);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_network ON smart_contracts(network);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_type ON smart_contracts(type);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_verified ON smart_contracts(verified);

-- Enable RLS
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view verified contracts"
  ON smart_contracts FOR SELECT
  TO authenticated
  USING (verified = true);

CREATE POLICY "Users can view their blockchain transactions"
  ON blockchain_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_snippets
      WHERE audio_snippets.id = blockchain_transactions.snippet_id
      AND audio_snippets.artist_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM track_licenses
      WHERE track_licenses.id = blockchain_transactions.license_id
      AND track_licenses.buyer_id = auth.uid()
    )
  );

CREATE POLICY "System can insert blockchain transactions"
  ON blockchain_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update blockchain transactions"
  ON blockchain_transactions FOR UPDATE
  TO authenticated
  USING (true);
