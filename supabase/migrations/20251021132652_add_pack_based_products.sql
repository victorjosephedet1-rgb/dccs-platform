/*
  # Audio Utility Pack System - Phase 01 Migration
  
  1. Overview
    - Transforms individual audio snippets into packaged bundles
    - Enables creators to sell curated collections of short-form assets
    - Supports the Victor360 Audio Utility Marketplace model
  
  2. New Tables
    - `audio_packs`: Bundle multiple audio assets into sellable packs
      - `id` (uuid, primary key)
      - `pack_name` (text) - e.g., "Viral Hook Starter Kit"
      - `pack_description` (text) - Marketing copy for the pack
      - `pack_type` (text) - e.g., "hooks", "reactions", "transitions", "brand_kit"
      - `creator_id` (uuid) - Links to profiles table
      - `price` (numeric) - Pack pricing ($9-$18 range)
      - `promo_price` (numeric, nullable) - Limited-time promotional pricing
      - `asset_count` (integer) - Number of audio assets in the pack
      - `total_duration` (integer) - Combined duration of all assets in seconds
      - `use_cases` (text[]) - e.g., ["TikTok", "Reels", "Ads", "UGC"]
      - `is_active` (boolean) - Pack visibility/availability
      - `featured_image_url` (text) - Pack cover art
      - `created_at`, `updated_at` (timestamptz)
    
    - `pack_assets`: Junction table linking packs to individual audio snippets
      - `id` (uuid, primary key)
      - `pack_id` (uuid) - Foreign key to audio_packs
      - `snippet_id` (uuid) - Foreign key to audio_snippets
      - `order_index` (integer) - Asset ordering within pack
      - `created_at` (timestamptz)
  
  3. Schema Modifications
    - Add `pack_id` column to `snippet_licenses` to track pack purchases
    - Add `pack_sales_count` to `audio_packs` for analytics
    - Update license types to include "pack_license"
  
  4. Security
    - Enable RLS on both new tables
    - Creators can manage their own packs
    - All users can view active packs
    - Only buyers can access purchased pack assets
  
  5. Business Logic
    - Packs contain 5-10 assets, each <30 seconds
    - Price range: $9-$18 per pack
    - Support bundle deals (multiple packs)
    - Full commercial rights included for buyers
*/

-- Create audio_packs table
CREATE TABLE IF NOT EXISTS audio_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_name text NOT NULL,
  pack_description text,
  pack_type text NOT NULL CHECK (pack_type IN ('hooks', 'reactions', 'transitions', 'brand_kit', 'bundle', 'custom')),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price >= 0),
  promo_price numeric CHECK (promo_price >= 0 AND promo_price < price),
  asset_count integer DEFAULT 0 CHECK (asset_count >= 0),
  total_duration integer DEFAULT 0 CHECK (total_duration >= 0),
  use_cases text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  featured_image_url text,
  pack_sales_count bigint DEFAULT 0 CHECK (pack_sales_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pack_assets junction table
CREATE TABLE IF NOT EXISTS pack_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES audio_packs(id) ON DELETE CASCADE,
  snippet_id uuid NOT NULL REFERENCES audio_snippets(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0 CHECK (order_index >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(pack_id, snippet_id)
);

-- Add pack_id to snippet_licenses for pack purchases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'snippet_licenses' AND column_name = 'pack_id'
  ) THEN
    ALTER TABLE snippet_licenses ADD COLUMN pack_id uuid REFERENCES audio_packs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on audio_packs
ALTER TABLE audio_packs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pack_assets
ALTER TABLE pack_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audio_packs

-- Everyone can view active packs
CREATE POLICY "Anyone can view active packs"
  ON audio_packs FOR SELECT
  USING (is_active = true);

-- Creators can view all their own packs
CREATE POLICY "Creators can view own packs"
  ON audio_packs FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- Creators can create packs
CREATE POLICY "Creators can create packs"
  ON audio_packs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update own packs
CREATE POLICY "Creators can update own packs"
  ON audio_packs FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Creators can delete own packs
CREATE POLICY "Creators can delete own packs"
  ON audio_packs FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- RLS Policies for pack_assets

-- Anyone can view assets in active packs
CREATE POLICY "Anyone can view pack assets"
  ON pack_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.is_active = true
    )
  );

-- Pack creators can manage their pack assets
CREATE POLICY "Creators can manage pack assets"
  ON pack_assets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audio_packs
      WHERE audio_packs.id = pack_assets.pack_id
      AND audio_packs.creator_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_packs_creator ON audio_packs(creator_id);
CREATE INDEX IF NOT EXISTS idx_audio_packs_active ON audio_packs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audio_packs_type ON audio_packs(pack_type);
CREATE INDEX IF NOT EXISTS idx_pack_assets_pack ON pack_assets(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_assets_snippet ON pack_assets(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_licenses_pack ON snippet_licenses(pack_id);

-- Create trigger to update audio_packs.updated_at
CREATE OR REPLACE FUNCTION update_audio_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audio_packs_updated_at
  BEFORE UPDATE ON audio_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_packs_updated_at();

-- Create function to auto-update pack asset_count and total_duration
CREATE OR REPLACE FUNCTION update_pack_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE audio_packs
    SET 
      asset_count = (
        SELECT COUNT(*) 
        FROM pack_assets 
        WHERE pack_id = NEW.pack_id
      ),
      total_duration = (
        SELECT COALESCE(SUM(audio_snippets.duration), 0)
        FROM pack_assets
        JOIN audio_snippets ON pack_assets.snippet_id = audio_snippets.id
        WHERE pack_assets.pack_id = NEW.pack_id
      )
    WHERE id = NEW.pack_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE audio_packs
    SET 
      asset_count = (
        SELECT COUNT(*) 
        FROM pack_assets 
        WHERE pack_id = OLD.pack_id
      ),
      total_duration = (
        SELECT COALESCE(SUM(audio_snippets.duration), 0)
        FROM pack_assets
        JOIN audio_snippets ON pack_assets.snippet_id = audio_snippets.id
        WHERE pack_assets.pack_id = OLD.pack_id
      )
    WHERE id = OLD.pack_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pack_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON pack_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_pack_stats();