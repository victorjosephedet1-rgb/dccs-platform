/*
  # Set Platform Currency to GBP

  ## Overview
  Updates the platform configuration to use British Pounds (GBP) as the primary currency.
  Adds currency configuration to platform_info table.

  ## Changes
  1. Add currency configuration to platform_info
  2. Update any price-related metadata

  ## Notes
  - Platform founder is Nigerian-British, hence GBP as primary currency
  - All prices displayed in pounds sterling (£)
*/

-- Add currency column to platform_info if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'platform_info' AND column_name = 'currency'
  ) THEN
    ALTER TABLE platform_info ADD COLUMN currency text DEFAULT 'GBP';
    ALTER TABLE platform_info ADD COLUMN currency_symbol text DEFAULT '£';
  END IF;
END $$;

-- Update the platform info with GBP currency
UPDATE platform_info 
SET 
  currency = 'GBP',
  currency_symbol = '£',
  description = jsonb_set(
    description,
    '{currency_note}',
    '"Platform operates in British Pounds (GBP). All prices and payouts are in £ Sterling."'
  )
WHERE id IS NOT NULL;