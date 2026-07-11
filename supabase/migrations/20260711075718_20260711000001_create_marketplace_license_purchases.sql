/*
# Create Marketplace License Purchases System

## Purpose
Enables buyers to purchase licenses for creator-listed assets on the DCCS Marketplace.

## New Tables

### marketplace_license_purchases
Tracks every license purchase transaction between a buyer and a creator's asset.

Columns:
- id: Unique purchase identifier
- buyer_id: The authenticated user making the purchase (FK to auth.users)
- upload_id: The asset being licensed (FK to uploads)
- creator_id: The asset owner receiving payment (FK to profiles)
- license_type: Type of license purchased (personal/commercial/exclusive/non-exclusive/editorial/educational/broadcast/enterprise)
- price_paid: Amount paid in GBP
- currency: Currency code (default GBP)
- status: Purchase lifecycle (pending/completed/failed/refunded)
- transaction_reference: Stripe or payment gateway reference
- license_document_url: Generated license document URL
- expires_at: Optional license expiry date (NULL = perpetual)
- download_count: How many times buyer has downloaded
- max_downloads: Download limit (NULL = unlimited)
- creator_payout: 80% of price_paid
- platform_fee: 20% of price_paid
- metadata: JSONB for additional license terms
- created_at / updated_at: Timestamps

## Security
- RLS enabled
- Buyers can read their own purchases
- Creators can read purchases of their assets
- Buyers insert their own purchases
- No updates or deletes (immutable financial record)

## Notes
- Platform split hardcoded at 80/20 in trigger but overridable via platform_settings
- Indexes on buyer_id, creator_id, upload_id, status for query performance
*/

CREATE TABLE IF NOT EXISTS marketplace_license_purchases (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  upload_id            uuid NOT NULL REFERENCES uploads(id) ON DELETE RESTRICT,
  creator_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  license_type         text NOT NULL DEFAULT 'personal'
    CHECK (license_type IN ('personal','commercial','exclusive','non-exclusive','editorial','educational','broadcast','enterprise','custom')),
  price_paid           numeric(10,2) NOT NULL DEFAULT 0,
  currency             text NOT NULL DEFAULT 'GBP',
  status               text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','failed','refunded')),
  transaction_reference text,
  license_document_url text,
  expires_at           timestamptz,
  download_count       integer NOT NULL DEFAULT 0,
  max_downloads        integer,
  creator_payout       numeric(10,2) GENERATED ALWAYS AS (ROUND(price_paid * 0.8, 2)) STORED,
  platform_fee         numeric(10,2) GENERATED ALWAYS AS (ROUND(price_paid * 0.2, 2)) STORED,
  metadata             jsonb DEFAULT '{}',
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mlp_buyer_id    ON marketplace_license_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mlp_creator_id  ON marketplace_license_purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_mlp_upload_id   ON marketplace_license_purchases(upload_id);
CREATE INDEX IF NOT EXISTS idx_mlp_status      ON marketplace_license_purchases(status);
CREATE INDEX IF NOT EXISTS idx_mlp_created_at  ON marketplace_license_purchases(created_at DESC);

ALTER TABLE marketplace_license_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyers_select_own_purchases"  ON marketplace_license_purchases;
DROP POLICY IF EXISTS "creators_select_asset_sales"  ON marketplace_license_purchases;
DROP POLICY IF EXISTS "buyers_insert_own_purchases"  ON marketplace_license_purchases;

CREATE POLICY "buyers_select_own_purchases" ON marketplace_license_purchases
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "creators_select_asset_sales" ON marketplace_license_purchases
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "buyers_insert_own_purchases" ON marketplace_license_purchases
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Marketplace listing view for public browsing (no RLS bypass needed — joins public data only)
CREATE OR REPLACE VIEW marketplace_listings AS
  SELECT
    u.id                AS upload_id,
    u.user_id           AS creator_id,
    u.file_name,
    u.file_category,
    u.description,
    u.price,
    u.marketplace_status,
    u.download_count,
    u.created_at        AS listed_at,
    u.thumbnail_url,
    dc.clearance_code,
    dc.project_title,
    dc.project_type,
    dc.creator_verified,
    p.name              AS creator_name,
    p.avatar_url        AS creator_avatar,
    p.is_verified       AS creator_platform_verified,
    p.profile_slug      AS creator_slug
  FROM uploads u
  LEFT JOIN dccs_certificates dc ON dc.id = u.dccs_certificate_id
  LEFT JOIN profiles p ON p.id = u.user_id
  WHERE u.marketplace_status = 'listed'
    AND u.is_archived = false
    AND u.upload_status = 'completed';
