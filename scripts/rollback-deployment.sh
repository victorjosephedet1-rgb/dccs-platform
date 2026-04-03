#!/bin/bash

# Emergency rollback script for V3B Music deployments
# Use this to quickly rollback to the last known good deployment

set -e

echo "🔄 V3B Music Emergency Rollback"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
  echo -e "${RED}Error: Netlify CLI not found${NC}"
  echo "Install it with: npm install -g netlify-cli"
  echo "Then run: netlify login"
  exit 1
fi

# Check if logged in
if ! netlify status &> /dev/null; then
  echo -e "${YELLOW}Please log in to Netlify first${NC}"
  netlify login
fi

echo -e "${YELLOW}⚠️  WARNING: This will rollback production to the previous deployment${NC}"
echo ""
echo "This action will:"
echo "  1. List recent deployments"
echo "  2. Let you select which deployment to restore"
echo "  3. Publish that deployment to production"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

echo ""
echo "Fetching recent deployments..."
echo ""

# List recent deployments
netlify deploy:list --json | head -20

echo ""
echo "To rollback:"
echo "  1. Go to https://app.netlify.com"
echo "  2. Select your site (dccsverify.com)"
echo "  3. Go to 'Deploys' tab"
echo "  4. Find the last successful deploy"
echo "  5. Click on it and select 'Publish deploy'"
echo ""
echo "Or use the Netlify CLI:"
echo "  netlify deploy:publish --prod --site <deploy-id>"
echo ""

read -p "Enter the deploy ID to rollback to (or 'cancel'): " deploy_id

if [ "$deploy_id" = "cancel" ]; then
  echo "Rollback cancelled"
  exit 0
fi

if [ -z "$deploy_id" ]; then
  echo -e "${RED}Error: No deploy ID provided${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Publishing deploy $deploy_id to production...${NC}"

# Publish the selected deploy
netlify api publishDeploy --data "deploy_id=$deploy_id"

echo ""
echo -e "${GREEN}✓ Rollback initiated${NC}"
echo ""
echo "Waiting for deployment to complete..."
sleep 10

# Verify the rollback
echo ""
echo "Verifying rollback..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://dccsverify.com)

if [ $response -eq 200 ]; then
  echo -e "${GREEN}✓ Rollback successful!${NC}"
  echo "🌐 https://dccsverify.com is responding"
else
  echo -e "${RED}✗ Rollback verification failed${NC}"
  echo "HTTP status: $response"
  echo "Please check Netlify dashboard for details"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next Steps:"
echo "  1. Run smoke tests: bash scripts/smoke-tests.sh"
echo "  2. Monitor error rates in production"
echo "  3. Investigate what caused the need for rollback"
echo "  4. Fix the issue before next deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
