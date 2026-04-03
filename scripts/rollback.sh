#!/bin/bash

# V3BMusic.AI Deployment Rollback Script
# Quickly revert to previous working version if deployment fails

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "V3BMusic.AI Deployment Rollback"
echo "========================================="
echo ""

echo -e "${YELLOW}⚠️  Warning: This will revert to the previous deployment${NC}"
echo ""
echo "This script will:"
echo "1. Fetch the latest from main branch"
echo "2. Reset to the previous commit"
echo "3. Force push to trigger redeployment"
echo ""

read -p "Are you sure you want to rollback? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo ""
echo "Starting rollback process..."
echo ""

# Fetch latest
echo "1. Fetching latest commits..."
git fetch origin main

# Get current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
echo -e "${YELLOW}Current commit: $CURRENT_COMMIT${NC}"

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
echo -e "${YELLOW}Previous commit: $PREVIOUS_COMMIT${NC}"

# Show the difference
echo ""
echo "Changes that will be reverted:"
git log --oneline HEAD~1..HEAD
echo ""

read -p "Proceed with rollback to $PREVIOUS_COMMIT? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo ""
echo "2. Creating safety backup branch..."
git branch "backup-before-rollback-$(date +%Y%m%d-%H%M%S)" HEAD

echo "3. Resetting to previous commit..."
git reset --hard HEAD~1

echo "4. Force pushing to trigger redeployment..."
git push --force origin main

echo ""
echo -e "${GREEN}✅ Rollback complete!${NC}"
echo ""
echo "Actions taken:"
echo "✓ Created backup branch"
echo "✓ Reset to previous commit: $PREVIOUS_COMMIT"
echo "✓ Triggered automatic redeployment"
echo ""
echo "Monitor deployment status:"
echo "- GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
echo "- Netlify: https://app.netlify.com"
echo "- Production: https://v3bmusic.ai"
echo ""
echo -e "${YELLOW}Note: It will take 2-3 minutes for the rollback to go live.${NC}"
