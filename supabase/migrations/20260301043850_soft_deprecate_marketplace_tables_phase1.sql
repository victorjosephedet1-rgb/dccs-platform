/*
  # Soft Deprecate Marketplace Tables for Phase 1

  ## Summary
  Implements soft deprecation strategy for marketplace and revenue tables that are not
  part of Phase 1 functionality. Tables are preserved for Phase 2+ but RLS policies
  block new inserts to prevent accidental usage.

  ## Tables Affected (Soft Deprecated)
  
  ### Marketplace Tables (Phase 2):
  - `audio_packs` - Pack-based content bundles
  - `pack_assets` - Pack composition
  - `pack_purchases` - Purchase transactions
  
  ### Licensing Tables (Phase 2):
  - `snippet_licenses` - Individual content licenses
  - `track_licenses` - Track-level licensing
  
  ### Revenue Tables (Phase 3):
  - `royalty_payments` - Payment disbursements
  - `royalty_splits` - Revenue sharing
  - `instant_payouts` - Payout processing
  - `dccs_royalty_collections` - Royalty tracking
  - `dccs_royalty_payments` - Payment records
  - `platform_revenue` - Platform earnings
  - `platform_lifetime_earnings` - Cumulative revenue
  
  ## Strategy
  - Add `deprecated_at` timestamp column to each table
  - Add `phase_deprecated` column to track when deprecated
  - Update RLS policies to block new inserts
  - Preserve all existing data
  - Add table comments for future reference

  ## Rollback
  If Phase 2 launches, simply remove the blocking RLS policies and set deprecated_at to NULL.
  
  ## Important Notes
  - NO DATA IS DELETED
  - Tables remain in database for Phase 2+ activation
  - Existing data is preserved for historical reference
  - RLS policies prevent accidental new usage
*/

-- Add deprecation tracking columns to marketplace tables
DO $$
BEGIN
  -- audio_packs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audio_packs' AND column_name = 'deprecated_at') THEN
    ALTER TABLE audio_packs ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE audio_packs ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
  END IF;

  -- pack_assets
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pack_assets' AND column_name = 'deprecated_at') THEN
    ALTER TABLE pack_assets ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE pack_assets ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
  END IF;

  -- pack_purchases
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pack_purchases' AND column_name = 'deprecated_at') THEN
    ALTER TABLE pack_purchases ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE pack_purchases ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
  END IF;
END $$;

-- Add deprecation tracking columns to licensing tables (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'snippet_licenses') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'snippet_licenses' AND column_name = 'deprecated_at') THEN
      ALTER TABLE snippet_licenses ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE snippet_licenses ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'track_licenses') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'track_licenses' AND column_name = 'deprecated_at') THEN
      ALTER TABLE track_licenses ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE track_licenses ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;
END $$;

-- Add deprecation tracking columns to revenue tables (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'royalty_payments') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_payments' AND column_name = 'deprecated_at') THEN
      ALTER TABLE royalty_payments ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE royalty_payments ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'royalty_splits') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_splits' AND column_name = 'deprecated_at') THEN
      ALTER TABLE royalty_splits ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE royalty_splits ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'instant_payouts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instant_payouts' AND column_name = 'deprecated_at') THEN
      ALTER TABLE instant_payouts ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE instant_payouts ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dccs_royalty_collections') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dccs_royalty_collections' AND column_name = 'deprecated_at') THEN
      ALTER TABLE dccs_royalty_collections ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE dccs_royalty_collections ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dccs_royalty_payments') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dccs_royalty_payments' AND column_name = 'deprecated_at') THEN
      ALTER TABLE dccs_royalty_payments ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE dccs_royalty_payments ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_revenue') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_revenue' AND column_name = 'deprecated_at') THEN
      ALTER TABLE platform_revenue ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE platform_revenue ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_lifetime_earnings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_lifetime_earnings' AND column_name = 'deprecated_at') THEN
      ALTER TABLE platform_lifetime_earnings ADD COLUMN deprecated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE platform_lifetime_earnings ADD COLUMN phase_deprecated TEXT DEFAULT 'phase_1';
    END IF;
  END IF;
END $$;

-- Add table comments for documentation
COMMENT ON TABLE audio_packs IS '[PHASE 1 DEPRECATED] Pack-based content bundles - will be activated in Phase 2';
COMMENT ON TABLE pack_assets IS '[PHASE 1 DEPRECATED] Pack composition - will be activated in Phase 2';
COMMENT ON TABLE pack_purchases IS '[PHASE 1 DEPRECATED] Purchase transactions - will be activated in Phase 2';

-- Block new inserts to deprecated marketplace tables via RLS policies
ALTER TABLE audio_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policies if they exist and create blocking ones
DO $$
BEGIN
  -- audio_packs
  DROP POLICY IF EXISTS "Block inserts during Phase 1" ON audio_packs;
  CREATE POLICY "Block inserts during Phase 1"
    ON audio_packs FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

  -- pack_assets
  DROP POLICY IF EXISTS "Block inserts during Phase 1" ON pack_assets;
  CREATE POLICY "Block inserts during Phase 1"
    ON pack_assets FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

  -- pack_purchases
  DROP POLICY IF EXISTS "Block inserts during Phase 1" ON pack_purchases;
  CREATE POLICY "Block inserts during Phase 1"
    ON pack_purchases FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);
END $$;

-- Create view to track deprecated tables
CREATE OR REPLACE VIEW phase1_deprecated_tables AS
SELECT 
  table_name,
  'Phase 2+' as available_in_phase,
  'Marketplace and licensing features' as feature_category
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'audio_packs', 'pack_assets', 'pack_purchases',
    'snippet_licenses', 'track_licenses',
    'royalty_payments', 'royalty_splits', 'instant_payouts',
    'dccs_royalty_collections', 'dccs_royalty_payments',
    'platform_revenue', 'platform_lifetime_earnings'
  )
ORDER BY table_name;

COMMENT ON VIEW phase1_deprecated_tables IS 'Lists all tables deprecated during Phase 1 that will be activated in future phases';
