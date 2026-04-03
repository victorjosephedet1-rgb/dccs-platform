#!/bin/bash

# ====================================================================
# GIT HOOKS SETUP SCRIPT
# ====================================================================
#
# PURPOSE:
#   Installs Git hooks that protect critical deployment files
#   Prevents accidental deletion or modification
#
# USAGE:
#   bash scripts/setup-git-hooks.sh
#
# HOOKS INSTALLED:
#   - pre-commit: Validates critical files haven't been deleted
#   - pre-push: Ensures deployment system is intact
#
# ====================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Setting up Git Hooks${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# ====================================================================
# PRE-COMMIT HOOK
# ====================================================================
echo -e "${YELLOW}Installing pre-commit hook...${NC}"

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# V3BMusic Deployment System Protection
# This hook prevents deletion of critical deployment files

# ANSI colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Critical files that must not be deleted
CRITICAL_FILES=(
  ".github/workflows/production-deploy.yml"
  ".github/workflows/staging-deploy.yml"
  "netlify.toml"
  "vite.config.ts"
  "scripts/pre-deploy-check.sh"
  "scripts/health-check.sh"
  "scripts/rollback-deployment.sh"
  "scripts/validate-deployment.sh"
  "supabase/functions/notify-deployment-updates/index.ts"
  "public/sitemap.xml"
  "public/robots.txt"
  "DEPLOYMENT_RUNBOOK.md"
  "docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md"
)

# Check for deleted critical files
DELETED_CRITICAL=()

for file in "${CRITICAL_FILES[@]}"; do
  if git diff --cached --name-status | grep -q "^D.*${file}$"; then
    DELETED_CRITICAL+=("$file")
  fi
done

# If critical files were deleted, abort commit
if [ ${#DELETED_CRITICAL[@]} -gt 0 ]; then
  echo -e "${RED}================================================${NC}"
  echo -e "${RED}CRITICAL FILE DELETION DETECTED${NC}"
  echo -e "${RED}================================================${NC}"
  echo ""
  echo -e "${YELLOW}The following critical deployment files are being deleted:${NC}"
  echo ""

  for file in "${DELETED_CRITICAL[@]}"; do
    echo -e "  ${RED}✗${NC} $file"
  done

  echo ""
  echo -e "${YELLOW}These files are essential for the deployment system.${NC}"
  echo -e "${YELLOW}Deleting them will break automated deployments.${NC}"
  echo ""
  echo "If you really need to delete these files:"
  echo "  1. Review docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md"
  echo "  2. Understand the impact"
  echo "  3. Use: git commit --no-verify"
  echo ""
  echo "To restore these files:"
  echo "  git restore ${DELETED_CRITICAL[0]}"
  echo ""

  exit 1
fi

# Check for modifications to critical workflow files
MODIFIED_WORKFLOWS=$(git diff --cached --name-only | grep -E "^\.github/workflows/.*\.yml$" || true)

if [ -n "$MODIFIED_WORKFLOWS" ]; then
  echo -e "${YELLOW}================================================${NC}"
  echo -e "${YELLOW}WARNING: GitHub workflow files modified${NC}"
  echo -e "${YELLOW}================================================${NC}"
  echo ""
  echo "Modified workflow files:"
  echo "$MODIFIED_WORKFLOWS" | sed 's/^/  - /'
  echo ""
  echo -e "${YELLOW}Please ensure you:${NC}"
  echo "  1. Understand the deployment system architecture"
  echo "  2. Have tested the changes"
  echo "  3. Won't break automated deployments"
  echo ""
  echo "Reference: docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md"
  echo ""
fi

exit 0
EOF

chmod +x .git/hooks/pre-commit
echo -e "${GREEN}✓ pre-commit hook installed${NC}"

# ====================================================================
# PRE-PUSH HOOK
# ====================================================================
echo -e "${YELLOW}Installing pre-push hook...${NC}"

cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# V3BMusic Deployment System Validation
# This hook validates the deployment system before pushing

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Pre-Push Validation${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# List of critical files that must exist
CRITICAL_FILES=(
  ".github/workflows/production-deploy.yml"
  "netlify.toml"
  "vite.config.ts"
  "public/sitemap.xml"
  "public/robots.txt"
)

MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo -e "${RED}Critical deployment files are missing:${NC}"
  for file in "${MISSING_FILES[@]}"; do
    echo -e "  ${RED}✗${NC} $file"
  done
  echo ""
  echo -e "${RED}Push aborted. Restore missing files before pushing.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All critical deployment files present${NC}"

# Check if pushing to main branch
while read local_ref local_sha remote_ref remote_sha; do
  if [[ $remote_ref == "refs/heads/main" ]]; then
    echo ""
    echo -e "${YELLOW}================================================${NC}"
    echo -e "${YELLOW}PUSHING TO MAIN BRANCH${NC}"
    echo -e "${YELLOW}================================================${NC}"
    echo ""
    echo "This will trigger:"
    echo "  1. GitHub Actions production deployment"
    echo "  2. Automated build and testing"
    echo "  3. Deployment to https://dccsverify.com"
    echo "  4. Customer notifications"
    echo ""
    echo -e "${YELLOW}Ensure:${NC}"
    echo "  ✓ Code has been reviewed"
    echo "  ✓ Tests pass locally"
    echo "  ✓ Breaking changes are documented"
    echo ""
  fi
done

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Pre-push validation passed${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

exit 0
EOF

chmod +x .git/hooks/pre-push
echo -e "${GREEN}✓ pre-push hook installed${NC}"

# ====================================================================
# COMMIT-MSG HOOK
# ====================================================================
echo -e "${YELLOW}Installing commit-msg hook...${NC}"

cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# V3BMusic Commit Message Validator
# Ensures commit messages are descriptive

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# ANSI colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check minimum length
if [ ${#COMMIT_MSG} -lt 10 ]; then
  echo -e "${RED}Commit message too short (minimum 10 characters)${NC}"
  echo ""
  echo "Good commit messages help with:"
  echo "  - Deployment tracking"
  echo "  - Rollback decisions"
  echo "  - Customer notifications"
  echo ""
  echo "Example: 'Add email notification system for deployments'"
  exit 1
fi

# Warn about deployment-related commits
if echo "$COMMIT_MSG" | grep -qi -E "(deploy|workflow|github.*action|netlify|cicd|ci/cd)"; then
  echo -e "${YELLOW}================================================${NC}"
  echo -e "${YELLOW}DEPLOYMENT-RELATED COMMIT DETECTED${NC}"
  echo -e "${YELLOW}================================================${NC}"
  echo ""
  echo "This commit affects deployment infrastructure."
  echo ""
  echo "Please ensure:"
  echo "  ✓ Changes have been tested"
  echo "  ✓ Documentation is updated"
  echo "  ✓ Team is aware of changes"
  echo ""
fi

exit 0
EOF

chmod +x .git/hooks/commit-msg
echo -e "${GREEN}✓ commit-msg hook installed${NC}"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Git Hooks Setup Complete${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Installed hooks:"
echo "  ✓ pre-commit: Prevents deletion of critical files"
echo "  ✓ pre-push: Validates deployment system integrity"
echo "  ✓ commit-msg: Ensures descriptive commit messages"
echo ""
echo "To bypass hooks (emergency only):"
echo "  git commit --no-verify"
echo "  git push --no-verify"
echo ""
