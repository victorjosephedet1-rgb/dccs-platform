#!/bin/bash

# V3BMUSIC.AI - One-Command Automation Setup
# This script helps configure the complete automation pipeline

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
echo "  V3BMUSIC.AI - Automation Setup"
echo "========================================="
echo -e "${NC}\n"

echo -e "${BLUE}This script will help you set up the complete automation pipeline:${NC}"
echo -e "  • Bolt → GitHub → Netlify → Supabase\n"

# Check if git is initialized
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}Git repository not initialized.${NC}"
    read -p "Initialize git repository? (y/n): " init_git
    if [[ $init_git =~ ^[Yy]$ ]]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${RED}Git is required for automation. Exiting.${NC}"
        exit 1
    fi
fi

# Check for git remote
if ! git remote -v | grep -q "origin"; then
    echo -e "${YELLOW}Git remote not configured.${NC}"
    echo -e "Enter your GitHub repository URL:"
    echo -e "${CYAN}Example: https://github.com/yourusername/dccs-platform.git${NC}"
    read -p "Repository URL: " repo_url

    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo -e "${GREEN}✅ Git remote configured${NC}"
    else
        echo -e "${RED}Repository URL is required. Exiting.${NC}"
        exit 1
    fi
fi

# Display current remote
REMOTE_URL=$(git remote get-url origin)
echo -e "\n${GREEN}Git repository configured:${NC} $REMOTE_URL\n"

# Check if files are committed
if ! git log > /dev/null 2>&1; then
    echo -e "${YELLOW}No commits found. Creating initial commit...${NC}"
    git add .
    git commit -m "Initial commit - V3BMUSIC.AI automation setup"
    echo -e "${GREEN}✅ Initial commit created${NC}"
fi

# Push to GitHub
echo -e "\n${BLUE}Would you like to push to GitHub now?${NC}"
read -p "Push to GitHub? (y/n): " push_now
if [[ $push_now =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing to GitHub...${NC}"
    if git push -u origin main 2>&1; then
        echo -e "${GREEN}✅ Pushed to GitHub successfully${NC}"
    else
        echo -e "${YELLOW}Note: If this is the first push, you may need to authenticate with GitHub${NC}"
        echo -e "${YELLOW}Try running: git push -u origin main${NC}"
    fi
fi

# GitHub Secrets Instructions
echo -e "\n${CYAN}=========================================${NC}"
echo -e "${CYAN}STEP 1: Configure GitHub Secrets${NC}"
echo -e "${CYAN}=========================================${NC}\n"

echo -e "${BLUE}Visit this URL to add secrets:${NC}"
REPO_NAME=$(basename -s .git "$REMOTE_URL")
REPO_OWNER=$(basename $(dirname "$REMOTE_URL"))
echo -e "${GREEN}https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions${NC}\n"

echo -e "${YELLOW}Add these 5 secrets:${NC}"
echo -e "  1. ${CYAN}VITE_SUPABASE_URL${NC}        - Your Supabase project URL"
echo -e "  2. ${CYAN}VITE_SUPABASE_ANON_KEY${NC}   - Your Supabase anon key"
echo -e "  3. ${CYAN}VITE_STRIPE_PUBLIC_KEY${NC}   - Your Stripe public key"
echo -e "  4. ${CYAN}NETLIFY_AUTH_TOKEN${NC}       - Netlify personal access token"
echo -e "  5. ${CYAN}NETLIFY_SITE_ID${NC}          - Netlify site API ID\n"

echo -e "${BLUE}Where to find these values:${NC}"
echo -e "  • Supabase: Project Settings → API"
echo -e "  • Stripe: Dashboard → Developers → API Keys"
echo -e "  • Netlify Token: https://app.netlify.com/user/applications"
echo -e "  • Netlify Site ID: Site Settings → General → Site Information\n"

read -p "Press Enter when you've added all 5 secrets..."

# Netlify Configuration
echo -e "\n${CYAN}=========================================${NC}"
echo -e "${CYAN}STEP 2: Configure Netlify${NC}"
echo -e "${CYAN}=========================================${NC}\n"

echo -e "${BLUE}Follow these steps in Netlify:${NC}\n"
echo -e "1. Go to: ${GREEN}https://app.netlify.com${NC}"
echo -e "2. Click 'Add new site' → 'Import an existing project'"
echo -e "3. Choose 'GitHub' and select your repository"
echo -e "4. Configure build settings:"
echo -e "   ${CYAN}Build command:${NC}     npm run build"
echo -e "   ${CYAN}Publish directory:${NC} dist"
echo -e "   ${CYAN}Branch:${NC}            main"
echo -e "5. Add environment variables (same as GitHub secrets):"
echo -e "   • VITE_SUPABASE_URL"
echo -e "   • VITE_SUPABASE_ANON_KEY"
echo -e "   • VITE_STRIPE_PUBLIC_KEY"
echo -e "   • NODE_VERSION = 20"
echo -e "6. Click 'Deploy site'\n"

read -p "Press Enter when Netlify is configured..."

# Verify setup
echo -e "\n${CYAN}=========================================${NC}"
echo -e "${CYAN}STEP 3: Verify Setup${NC}"
echo -e "${CYAN}=========================================${NC}\n"

echo -e "${YELLOW}Running verification checks...${NC}\n"
bash scripts/verify-automation-setup.sh

# Final instructions
echo -e "\n${CYAN}=========================================${NC}"
echo -e "${CYAN}Setup Complete!${NC}"
echo -e "${CYAN}=========================================${NC}\n"

echo -e "${GREEN}✅ Your automation pipeline is configured!${NC}\n"

echo -e "${BLUE}Test your automation:${NC}"
echo -e "  1. Make a small change to any file"
echo -e "  2. Commit and push:"
echo -e "     ${CYAN}git add .${NC}"
echo -e "     ${CYAN}git commit -m \"Test automation\"${NC}"
echo -e "     ${CYAN}git push origin main${NC}"
echo -e "  3. Watch the deployment:"
echo -e "     ${GREEN}GitHub Actions:${NC} https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
echo -e "     ${GREEN}Netlify:${NC} https://app.netlify.com\n"

echo -e "${YELLOW}From now on:${NC}"
echo -e "  • Every change in Bolt automatically deploys"
echo -e "  • No manual steps required"
echo -e "  • Changes go live in ~3 minutes"
echo -e "  • All systems stay synchronized\n"

echo -e "${GREEN}🎉 Automation setup complete!${NC}\n"

# Save setup timestamp
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .automation-setup-complete

exit 0
