/*
  # Create DCCS Registrations Table

  ## Summary
  Creates the core table for tracking all DCCS registration transactions in Phase 1.
  This table records the registration fee payment, blockchain registration status,
  and download capabilities for each registered asset.

  ## New Table: dccs_registrations
  
  ### Purpose
  Track all DCCS registration transactions including payment processing, blockchain
  verification, and download management.

  ### Columns Created
  - `id`: Primary key (UUID)
  - `user_id`: Reference to profiles table
  - `upload_id`: Reference to uploads table
  - `dccs_certificate_id`: Reference to dccs_certificates table
  - `registration_type`: 'new' or 'reregistration'
  - `registration_fee`: Amount paid (default £4.99)
  - `payment_status`: pending, completed, failed, refunded
  - `payment_method`: Payment method used
  - `stripe_payment_intent`: Stripe payment ID
  - `content_category`: audio, video, podcast, other
  - `content_title`: Title of registered content
  - `content_description`: Optional description
  - `ownership_verified`: Verification status
  - `ownership_verification_method`: How ownership was verified
  - `verified_at`: Timestamp of verification
  - `blockchain_registered`: Whether blockchain registration completed
  - `blockchain_tx_hash`: Blockchain transaction hash
  - `blockchain_network`: Network used (default: polygon)
  - `blockchain_confirmations`: Number of confirmations
  - `download_enabled`: Whether downloads are enabled
  - `download_count`: Number of times downloaded
  - `last_downloaded_at`: Last download timestamp
  - `created_at`, `updated_at`: Standard timestamps

  ## Security
  - Row Level Security (RLS) policies ensure users can only access their own registrations
  - Foreign key constraints ensure data integrity
  - Indexes for optimal query performance

  ## Important Notes
  - This table is central to Phase 1 operations
  - Payment processing flows through this table
  - Blockchain integration is tracked here
  - Download capabilities are managed per registration
*/

-- Create the dccs_registrations table
CREATE TABLE IF NOT EXISTS dccs_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
  dccs_certificate_id UUID REFERENCES dccs_certificates(id) ON DELETE SET NULL,

  -- Registration metadata
  registration_type TEXT NOT NULL CHECK (registration_type IN ('new', 'reregistration')),
  registration_fee NUMERIC(10,2) DEFAULT 4.99 NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_intent TEXT UNIQUE,

  -- Content classification
  content_category TEXT NOT NULL CHECK (content_category IN ('audio', 'video', 'podcast', 'other')),
  content_title TEXT NOT NULL,
  content_description TEXT,

  -- Ownership verification
  ownership_verified BOOLEAN DEFAULT FALSE,
  ownership_verification_method TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Blockchain integration
  blockchain_registered BOOLEAN DEFAULT FALSE,
  blockchain_tx_hash TEXT,
  blockchain_network TEXT DEFAULT 'polygon',
  blockchain_confirmations INTEGER DEFAULT 0,

  -- Download capabilities
  download_enabled BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_dccs_registrations_user_id 
ON dccs_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_upload_id 
ON dccs_registrations(upload_id);

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_certificate_id 
ON dccs_registrations(dccs_certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_payment_status 
ON dccs_registrations(payment_status) 
WHERE payment_status != 'completed';

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_blockchain_tx 
ON dccs_registrations(blockchain_tx_hash) 
WHERE blockchain_tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_created_at 
ON dccs_registrations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_stripe_intent 
ON dccs_registrations(stripe_payment_intent) 
WHERE stripe_payment_intent IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE dccs_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON dccs_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own registrations
CREATE POLICY "Users can insert own registrations"
  ON dccs_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own registrations
CREATE POLICY "Users can update own registrations"
  ON dccs_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admin users can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON dccs_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dccs_registrations_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic updated_at updates
DROP TRIGGER IF EXISTS update_dccs_registrations_updated_at_trigger ON dccs_registrations;
CREATE TRIGGER update_dccs_registrations_updated_at_trigger
  BEFORE UPDATE ON dccs_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_registrations_updated_at();

-- Add table and column comments for documentation
COMMENT ON TABLE dccs_registrations IS 'Core table for tracking DCCS registration transactions in Phase 1';
COMMENT ON COLUMN dccs_registrations.registration_type IS 'Type of registration: new (first time) or reregistration (re-registering existing content)';
COMMENT ON COLUMN dccs_registrations.registration_fee IS 'Registration fee paid in GBP (default £4.99)';
COMMENT ON COLUMN dccs_registrations.payment_status IS 'Payment processing status: pending, completed, failed, refunded';
COMMENT ON COLUMN dccs_registrations.stripe_payment_intent IS 'Stripe PaymentIntent ID for payment tracking';
COMMENT ON COLUMN dccs_registrations.blockchain_registered IS 'Whether content has been registered on blockchain';
COMMENT ON COLUMN dccs_registrations.blockchain_tx_hash IS 'Blockchain transaction hash for immutable proof';
COMMENT ON COLUMN dccs_registrations.download_enabled IS 'Whether user can re-download their registered content';
COMMENT ON COLUMN dccs_registrations.download_count IS 'Number of times content has been re-downloaded';
