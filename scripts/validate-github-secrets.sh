#!/bin/bash

# V3BMUSIC.AI - GitHub Secrets Validation
# This script helps verify that GitHub secrets are properly configured

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
echo "  GitHub Secrets Validation"
echo "========================================="
echo -e "${NC}\n"

# Get repository info
if git remote -v | grep -q "origin"; then
    REMOTE_URL=$(git remote get-url origin)
    REPO_NAME=$(basename -s .git "$REMOTE_URL")
    REPO_OWNER=$(basename $(dirname "$REMOTE_URL"))
else
    echo -e "${RED}❌ Git remote not configured${NC}"
    echo -e "Run: git remote add origin <your-repo-url>"
    exit 1
fi

echo -e "${BLUE}Repository:${NC} ${REPO_OWNER}/${REPO_NAME}\n"

# Required secrets
REQUIRED_SECRETS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_STRIPE_PUBLIC_KEY"
    "NETLIFY_AUTH_TOKEN"
    "NETLIFY_SITE_ID"
)

echo -e "${YELLOW}Required GitHub Secrets:${NC}\n"

for secret in "${REQUIRED_SECRETS[@]}"; do
    echo -e "  ${CYAN}•${NC} $secret"
done

echo -e "\n${BLUE}To add/verify secrets, visit:${NC}"
echo -e "${GREEN}https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions${NC}\n"

echo -e "${YELLOW}Note:${NC} GitHub does not allow reading secret values via API for security."
echo -e "You must manually verify these secrets exist in your GitHub repository settings.\n"

# Instructions for each secret
echo -e "${BLUE}Where to find each value:${NC}\n"

echo -e "${CYAN}1. VITE_SUPABASE_URL${NC}"
echo -e "   Location: Supabase Dashboard → Project Settings → API → Project URL"
echo -e "   Example: https://abcdefghijklmnop.supabase.co\n"

echo -e "${CYAN}2. VITE_SUPABASE_ANON_KEY${NC}"
echo -e "   Location: Supabase Dashboard → Project Settings → API → anon/public key"
echo -e "   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n"

echo -e "${CYAN}3. VITE_STRIPE_PUBLIC_KEY${NC}"
echo -e "   Location: Stripe Dashboard → Developers → API Keys → Publishable key"
echo -e "   Example: pk_test_51... or pk_live_51...\n"

echo -e "${CYAN}4. NETLIFY_AUTH_TOKEN${NC}"
echo -e "   Location: Netlify → User Settings → Applications → Personal Access Tokens"
echo -e "   How to create:"
echo -e "   • Go to: https://app.netlify.com/user/applications"
echo -e "   • Click 'New access token'"
echo -e "   • Name: 'GitHub Actions Deployment'"
echo -e "   • Copy the token (you won't see it again!)"
echo -e "   Example: nfp_abc123...\n"

echo -e "${CYAN}5. NETLIFY_SITE_ID${NC}"
echo -e "   Location: Netlify → Site Settings → General → Site Information → API ID"
echo -e "   Example: 12345678-1234-1234-1234-123456789abc\n"

# Checklist
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Setup Checklist${NC}"
echo -e "${YELLOW}=========================================${NC}\n"

echo -e "Complete these steps:\n"
echo -e "  [ ] 1. Visit GitHub repository secrets page"
echo -e "  [ ] 2. Add VITE_SUPABASE_URL"
echo -e "  [ ] 3. Add VITE_SUPABASE_ANON_KEY"
echo -e "  [ ] 4. Add VITE_STRIPE_PUBLIC_KEY"
echo -e "  [ ] 5. Add NETLIFY_AUTH_TOKEN"
echo -e "  [ ] 6. Add NETLIFY_SITE_ID"
echo -e "  [ ] 7. Verify all 5 secrets appear in the list\n"

# Test workflow
echo -e "${BLUE}After adding secrets, test the workflow:${NC}\n"
echo -e "  1. Make a small change:"
echo -e "     ${CYAN}echo \"# Test\" >> README.md${NC}"
echo -e "\n  2. Commit and push:"
echo -e "     ${CYAN}git add .${NC}"
echo -e "     ${CYAN}git commit -m \"Test GitHub Actions\"${NC}"
echo -e "     ${CYAN}git push origin main${NC}"
echo -e "\n  3. Watch the workflow run:"
echo -e "     ${GREEN}https://github.com/${REPO_OWNER}/${REPO_NAME}/actions${NC}\n"

# Common issues
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Common Issues & Solutions${NC}"
echo -e "${YELLOW}=========================================${NC}\n"

echo -e "${RED}Issue:${NC} Workflow fails with 'secret not found'"
echo -e "${GREEN}Solution:${NC} Verify secret name matches exactly (case-sensitive)\n"

echo -e "${RED}Issue:${NC} Netlify deployment fails with authentication error"
echo -e "${GREEN}Solution:${NC} Regenerate NETLIFY_AUTH_TOKEN and update secret\n"

echo -e "${RED}Issue:${NC} Build fails with environment variable errors"
echo -e "${GREEN}Solution:${NC} Ensure all VITE_ prefixed variables are added\n"

echo -e "${GREEN}✅ Use this checklist to ensure all secrets are properly configured${NC}\n"

exit 0
