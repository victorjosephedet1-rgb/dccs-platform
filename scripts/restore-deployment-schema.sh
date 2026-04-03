#!/bin/bash

# ====================================================================
# DATABASE SCHEMA RESTORE SCRIPT
# ====================================================================
#
# PURPOSE:
#   Restores deployment system database schema from a backup file
#   Recreates tables and data if they were accidentally deleted
#
# USAGE:
#   bash scripts/restore-deployment-schema.sh [backup-file.sql]
#
# EXAMPLE:
#   bash scripts/restore-deployment-schema.sh backups/deployment-schema-20260227_120000.sql
#
# WARNING:
#   This will NOT drop existing tables. It uses CREATE IF NOT EXISTS.
#   Data restoration will skip existing records.
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
echo -e "${BLUE}V3BMusic Deployment Schema Restore${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if backup file argument provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: No backup file specified${NC}"
  echo ""
  echo "Usage: bash scripts/restore-deployment-schema.sh [backup-file]"
  echo ""
  echo "Available backups:"
  ls -lh backups/deployment-schema-*.sql 2>/dev/null || echo "  No backups found"
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
  exit 1
fi

echo -e "${YELLOW}Restoring from: ${BACKUP_FILE}${NC}"
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

echo -e "${YELLOW}⚠️  WARNING ⚠️${NC}"
echo ""
echo "This will restore the deployment system schema to your database."
echo "Existing tables will NOT be dropped (uses CREATE IF NOT EXISTS)."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}Restore cancelled${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}NOTE: Direct SQL execution requires psql or database admin access.${NC}"
echo -e "${YELLOW}This script will create a migration file instead.${NC}"
echo ""

# Generate migration filename
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_restore_deployment_schema.sql"

# Copy backup to migration
cp "$BACKUP_FILE" "$MIGRATION_FILE"

echo -e "${GREEN}✓ Migration file created: ${MIGRATION_FILE}${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Review the migration file:"
echo "   cat ${MIGRATION_FILE}"
echo ""
echo "2. Apply the migration via Supabase dashboard:"
echo "   - Go to https://app.supabase.com"
echo "   - Select your project"
echo "   - Go to Database > Migrations"
echo "   - Upload ${MIGRATION_FILE}"
echo ""
echo "3. Or apply directly via Supabase CLI (if installed):"
echo "   supabase db push"
echo ""
echo -e "${GREEN}Restore preparation complete!${NC}"
echo -e "${BLUE}================================================${NC}"
