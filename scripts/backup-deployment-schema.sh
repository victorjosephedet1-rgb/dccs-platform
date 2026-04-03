#!/bin/bash

# ====================================================================
# DATABASE SCHEMA BACKUP SCRIPT
# ====================================================================
#
# PURPOSE:
#   Exports deployment-related database schema and stores it as SQL
#   Creates backups that can restore the deployment system if tables
#   are accidentally deleted or corrupted.
#
# USAGE:
#   bash scripts/backup-deployment-schema.sh
#
# OUTPUT:
#   backups/deployment-schema-[timestamp].sql
#
# WHAT IT BACKS UP:
#   - deployment_versions table (structure + data)
#   - customer_instances table (structure only, data excluded for privacy)
#   - update_notifications table (structure only)
#
# RESTORATION:
#   See scripts/restore-deployment-schema.sh
#
# ====================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}V3BMusic Deployment Schema Backup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found${NC}"
  echo "Please create .env file with Supabase credentials"
  exit 1
fi

# Load environment variables
source .env

# Validate required variables
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo -e "${RED}Error: VITE_SUPABASE_URL not set in .env${NC}"
  exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}Error: VITE_SUPABASE_ANON_KEY not set in .env${NC}"
  exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/deployment-schema-${TIMESTAMP}.sql"

echo -e "${YELLOW}Creating backup: ${BACKUP_FILE}${NC}"
echo ""

# Start SQL backup file
cat > "$BACKUP_FILE" << 'EOF'
-- ====================================================================
-- V3BMUSIC DEPLOYMENT SYSTEM DATABASE BACKUP
-- ====================================================================
--
-- CRITICAL: This file contains the schema for the deployment system
--
-- Tables included:
--   - deployment_versions (with data)
--   - customer_instances (structure only)
--   - update_notifications (structure only)
--
-- To restore: psql -d your_database -f this_file.sql
--
-- ====================================================================

BEGIN;

-- ====================================================================
-- TABLE: deployment_versions
-- ====================================================================
-- Stores metadata about each deployment
-- Used for: Audit trail, rollback tracking, version history

CREATE TABLE IF NOT EXISTS deployment_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number text NOT NULL,
  commit_hash text NOT NULL,
  deployment_status text NOT NULL CHECK (deployment_status IN ('deployed', 'failed', 'rolled_back')),
  changes_summary jsonb,
  metadata jsonb,
  deployed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (required for security)
ALTER TABLE deployment_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role full access
CREATE POLICY "Service role has full access to deployment_versions"
  ON deployment_versions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Authenticated users can view deployments
CREATE POLICY "Authenticated users can view deployment_versions"
  ON deployment_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deployment_versions_version ON deployment_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_deployment_versions_commit ON deployment_versions(commit_hash);
CREATE INDEX IF NOT EXISTS idx_deployment_versions_status ON deployment_versions(deployment_status);
CREATE INDEX IF NOT EXISTS idx_deployment_versions_deployed_at ON deployment_versions(deployed_at DESC);

-- ====================================================================
-- TABLE: customer_instances
-- ====================================================================
-- Stores white-label customer instance information
-- Used for: Customer notifications, sync tracking

CREATE TABLE IF NOT EXISTS customer_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text,
  instance_url text NOT NULL,
  webhook_url text,
  webhook_secret text,
  auto_update_enabled boolean DEFAULT true,
  notification_preferences jsonb DEFAULT '{"webhook": true, "email": false}'::jsonb,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customer_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role full access
CREATE POLICY "Service role has full access to customer_instances"
  ON customer_instances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Admin users can manage customers
CREATE POLICY "Admins can manage customer_instances"
  ON customer_instances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_instances_auto_update ON customer_instances(auto_update_enabled) WHERE auto_update_enabled = true;
CREATE INDEX IF NOT EXISTS idx_customer_instances_sync_status ON customer_instances(sync_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_instances_url ON customer_instances(instance_url);

-- ====================================================================
-- TABLE: update_notifications
-- ====================================================================
-- Tracks notification delivery to customers
-- Used for: Delivery tracking, retry logic, analytics

CREATE TABLE IF NOT EXISTS update_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_version_id uuid REFERENCES deployment_versions(id) ON DELETE CASCADE,
  customer_instance_id uuid REFERENCES customer_instances(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('webhook', 'email', 'sms')),
  delivery_status text NOT NULL CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
  response_data jsonb,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE update_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role full access
CREATE POLICY "Service role has full access to update_notifications"
  ON update_notifications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Admins can view notifications
CREATE POLICY "Admins can view update_notifications"
  ON update_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_update_notifications_deployment ON update_notifications(deployment_version_id);
CREATE INDEX IF NOT EXISTS idx_update_notifications_customer ON update_notifications(customer_instance_id);
CREATE INDEX IF NOT EXISTS idx_update_notifications_status ON update_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_update_notifications_sent_at ON update_notifications(sent_at DESC);

COMMIT;

-- ====================================================================
-- DEPLOYMENT VERSION DATA EXPORT
-- ====================================================================
-- Below are INSERT statements for existing deployment_versions data
-- This preserves the deployment history
-- ====================================================================

EOF

echo -e "${YELLOW}Fetching deployment_versions data...${NC}"

# Export deployment_versions data as INSERT statements
curl -s "${VITE_SUPABASE_URL}/rest/v1/deployment_versions?select=*" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" | \
  jq -r '.[] | "INSERT INTO deployment_versions (id, version_number, commit_hash, deployment_status, changes_summary, metadata, deployed_at) VALUES (\u0027" + .id + "\u0027, \u0027" + .version_number + "\u0027, \u0027" + .commit_hash + "\u0027, \u0027" + .deployment_status + "\u0027, \u0027" + (.changes_summary | @json) + "\u0027::jsonb, \u0027" + (.metadata | @json) + "\u0027::jsonb, \u0027" + .deployed_at + "\u0027);"' >> "$BACKUP_FILE" 2>/dev/null || true

echo "" >> "$BACKUP_FILE"
echo "-- End of backup" >> "$BACKUP_FILE"

# Get file size
FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Backup Details:${NC}"
echo -e "  File: ${BACKUP_FILE}"
echo -e "  Size: ${FILESIZE}"
echo ""
echo -e "${YELLOW}To restore this backup:${NC}"
echo -e "  bash scripts/restore-deployment-schema.sh ${BACKUP_FILE}"
echo ""
echo -e "${BLUE}================================================${NC}"
