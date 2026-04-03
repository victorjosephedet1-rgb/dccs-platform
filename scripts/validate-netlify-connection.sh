#!/bin/bash

# DCCS - Netlify Connection Validation
# This script helps verify Netlify is properly connected and configured

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "========================================="
echo "  Netlify Connection Validation"
echo "========================================="
echo -e "${NC}\n"

# Check if netlify.toml exists
if [ ! -f "netlify.toml" ]; then
    echo -e "${RED}❌ netlify.toml not found${NC}"
    echo -e "This file is required for Netlify configuration.\n"
    exit 1
fi

echo -e "${GREEN}✅ netlify.toml found${NC}\n"

# Parse netlify.toml
echo -e "${BLUE}Current Netlify Configuration:${NC}\n"

if grep -q "command" netlify.toml; then
    BUILD_CMD=$(grep "command" netlify.toml | head -1 | sed 's/.*"\(.*\)".*/\1/')
    echo -e "  ${CYAN}Build Command:${NC}     $BUILD_CMD"
fi

if grep -q "publish" netlify.toml; then
    PUBLISH_DIR=$(grep "publish" netlify.toml | head -1 | sed 's/.*"\(.*\)".*/\1/')
    echo -e "  ${CYAN}Publish Directory:${NC} $PUBLISH_DIR"
fi

if grep -q "NODE_VERSION" netlify.toml; then
    NODE_VER=$(grep "NODE_VERSION" netlify.toml | sed 's/.*"\(.*\)".*/\1/')
    echo -e "  ${CYAN}Node Version:${NC}      $NODE_VER"
fi

echo ""

# Netlify setup instructions
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Netlify Setup Instructions${NC}"
echo -e "${YELLOW}=========================================${NC}\n"

echo -e "${BLUE}Step 1: Create/Access Netlify Site${NC}\n"
echo -e "  1. Go to: ${GREEN}https://app.netlify.com${NC}"
echo -e "  2. Click 'Add new site' → 'Import an existing project'"
echo -e "  3. Choose 'GitHub' as your Git provider"
echo -e "  4. Authorize Netlify to access your GitHub account\n"

echo -e "${BLUE}Step 2: Select Repository${NC}\n"
echo -e "  1. Find and select your repository from the list"
echo -e "  2. If not visible, click 'Configure Netlify on GitHub' to grant access\n"

echo -e "${BLUE}Step 3: Configure Build Settings${NC}\n"
echo -e "  Use these exact settings:\n"
echo -e "  ${CYAN}Base directory:${NC}       (leave empty)"
echo -e "  ${CYAN}Build command:${NC}        npm run build"
echo -e "  ${CYAN}Publish directory:${NC}    dist"
echo -e "  ${CYAN}Branch to deploy:${NC}     main\n"

echo -e "${BLUE}Step 4: Add Environment Variables${NC}\n"
echo -e "  After creating the site, go to:"
echo -e "  Site Settings → Build & Deploy → Environment Variables\n"
echo -e "  Add these variables:\n"

ENV_VARS=(
    "VITE_SUPABASE_URL:Your Supabase project URL"
    "VITE_SUPABASE_ANON_KEY:Your Supabase anon key"
    "VITE_STRIPE_PUBLIC_KEY:Your Stripe publishable key"
    "NODE_VERSION:20"
)

for var in "${ENV_VARS[@]}"; do
    IFS=':' read -r name desc <<< "$var"
    echo -e "  ${CYAN}$name${NC}"
    echo -e "    → $desc"
done

echo ""

echo -e "${BLUE}Step 5: Configure Deploy Settings${NC}\n"
echo -e "  Go to: Site Settings → Build & Deploy → Deploy contexts\n"
echo -e "  ${GREEN}✓${NC} Enable 'Auto publishing' for production branch"
echo -e "  ${GREEN}✓${NC} Set production branch to 'main'"
echo -e "  ${GREEN}✓${NC} Enable 'Branch deploys' for main branch\n"

echo -e "${BLUE}Step 6: Configure Custom Domain${NC}\n"
echo -e "  Go to: Site Settings → Domain Management\n"
echo -e "  Add your custom domain:"
echo -e "  ${CYAN}•${NC} dccs.platform (primary)\n"
echo -e "  Follow Netlify's DNS configuration instructions\n"

# Verification checklist
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Netlify Configuration Checklist${NC}"
echo -e "${YELLOW}=========================================${NC}\n"

echo -e "Complete these steps:\n"
echo -e "  [ ] 1. Netlify site created and connected to GitHub"
echo -e "  [ ] 2. Build command set to 'npm run build'"
echo -e "  [ ] 3. Publish directory set to 'dist'"
echo -e "  [ ] 4. Production branch set to 'main'"
echo -e "  [ ] 5. All environment variables added:"
echo -e "      [ ] VITE_SUPABASE_URL"
echo -e "      [ ] VITE_SUPABASE_ANON_KEY"
echo -e "      [ ] VITE_STRIPE_PUBLIC_KEY"
echo -e "      [ ] NODE_VERSION = 20"
echo -e "  [ ] 6. Auto publishing enabled"
echo -e "  [ ] 7. Custom domains configured"
echo -e "  [ ] 8. HTTPS enabled (automatic)\n"

# Get Netlify Site ID
echo -e "${BLUE}Important: Get Your Netlify Site ID${NC}\n"
echo -e "  1. In Netlify dashboard, go to: Site Settings → General"
echo -e "  2. Find 'Site Information' section"
echo -e "  3. Copy the 'API ID' (looks like: abc12345-6789-...)"
echo -e "  4. Add this as NETLIFY_SITE_ID in GitHub secrets\n"

# Test deployment
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Test Your Netlify Deployment${NC}"
echo -e "${YELLOW}=========================================${NC}\n"

echo -e "${BLUE}Option 1: Manual Deploy (Test Configuration)${NC}\n"
echo -e "  In Netlify dashboard:"
echo -e "  1. Click 'Deploys' tab"
echo -e "  2. Click 'Trigger deploy' → 'Deploy site'"
echo -e "  3. Watch the build logs"
echo -e "  4. Verify deployment succeeds\n"

echo -e "${BLUE}Option 2: Git Push (Test Automation)${NC}\n"
echo -e "  1. Make a small change:"
echo -e "     ${CYAN}echo \"# Test\" >> README.md${NC}"
echo -e "\n  2. Commit and push:"
echo -e "     ${CYAN}git add .${NC}"
echo -e "     ${CYAN}git commit -m \"Test Netlify deployment\"${NC}"
echo -e "     ${CYAN}git push origin main${NC}"
echo -e "\n  3. Watch deployment in Netlify dashboard"
echo -e "  4. Should auto-deploy in ~2-3 minutes\n"

# Common issues
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Common Issues & Solutions${NC}"
echo -e "${YELLOW}=========================================${NC}\n"

echo -e "${RED}Issue:${NC} Build fails with 'command not found'"
echo -e "${GREEN}Solution:${NC} Ensure build command is exactly 'npm run build'\n"

echo -e "${RED}Issue:${NC} Build succeeds but site shows 404"
echo -e "${GREEN}Solution:${NC} Check publish directory is 'dist' not 'build'\n"

echo -e "${RED}Issue:${NC} Environment variables not working"
echo -e "${GREEN}Solution:${NC} Redeploy site after adding env vars (they don't auto-apply)\n"

echo -e "${RED}Issue:${NC} Custom domain not working"
echo -e "${GREEN}Solution:${NC} Verify DNS records and wait for propagation (up to 24h)\n"

echo -e "${RED}Issue:${NC} GitHub integration not triggering deploys"
echo -e "${GREEN}Solution:${NC} Check 'Build hooks' in Netlify and 'Deploy notifications'\n"

# Verification URL
echo -e "${BLUE}Netlify Dashboard Links:${NC}\n"
echo -e "  ${GREEN}Main Dashboard:${NC}     https://app.netlify.com"
echo -e "  ${GREEN}Site Settings:${NC}      https://app.netlify.com/sites/[your-site]/settings"
echo -e "  ${GREEN}Build Settings:${NC}     https://app.netlify.com/sites/[your-site]/settings/deploys"
echo -e "  ${GREEN}Environment Vars:${NC}   https://app.netlify.com/sites/[your-site]/settings/env"
echo -e "  ${GREEN}Domain Settings:${NC}    https://app.netlify.com/sites/[your-site]/settings/domain\n"

echo -e "${GREEN}✅ Use this guide to ensure Netlify is properly configured${NC}\n"

exit 0
