#!/bin/bash

# ====================================================================
# DEPLOYMENT SYSTEM HEALTH CHECK
# ====================================================================
#
# PURPOSE:
#   Validates that the entire deployment system is intact and functional
#   Run this before starting work to ensure nothing has been lost
#
# USAGE:
#   bash scripts/check-deployment-system.sh
#
# EXIT CODES:
#   0 - All systems healthy
#   1 - Critical issues found
#
# ====================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}V3BMUSIC DEPLOYMENT SYSTEM HEALTH CHECK${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

# ====================================================================
# CHECK 1: CRITICAL FILES
# ====================================================================
echo -e "${BLUE}[1/8] Checking critical files...${NC}"

CRITICAL_FILES=(
  ".github/workflows/production-deploy.yml:GitHub Actions production workflow"
  ".github/workflows/staging-deploy.yml:GitHub Actions staging workflow"
  "netlify.toml:Netlify configuration"
  "vite.config.ts:Vite build configuration"
  "tsconfig.json:TypeScript configuration"
  "package.json:Package configuration"
  "public/sitemap.xml:SEO sitemap"
  "public/robots.txt:Search engine directives"
  "public/manifest.json:PWA manifest"
  "DEPLOYMENT_RUNBOOK.md:Deployment runbook"
  "docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md:Architecture documentation"
)

MISSING_FILES=()

for entry in "${CRITICAL_FILES[@]}"; do
  file="${entry%%:*}"
  desc="${entry##*:}"

  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $desc"
  else
    echo -e "  ${RED}✗${NC} $desc (MISSING: $file)"
    MISSING_FILES+=("$file")
    ((ERRORS++))
  fi
done

echo ""

# ====================================================================
# CHECK 2: DEPLOYMENT SCRIPTS
# ====================================================================
echo -e "${BLUE}[2/8] Checking deployment scripts...${NC}"

SCRIPTS=(
  "scripts/pre-deploy-check.sh:Pre-deployment validation"
  "scripts/health-check.sh:Post-deployment health check"
  "scripts/smoke-tests.sh:Smoke tests"
  "scripts/rollback-deployment.sh:Rollback script"
  "scripts/validate-deployment.sh:Deployment validation"
  "scripts/update-sitemap.js:Sitemap generator"
  "scripts/generate-version-file.sh:Version file generator"
  "scripts/backup-deployment-schema.sh:Database backup"
  "scripts/setup-git-hooks.sh:Git hooks setup"
)

for entry in "${SCRIPTS[@]}"; do
  file="${entry%%:*}"
  desc="${entry##*:}"

  if [ -f "$file" ]; then
    if [ -x "$file" ]; then
      echo -e "  ${GREEN}✓${NC} $desc (executable)"
    else
      echo -e "  ${YELLOW}⚠${NC} $desc (not executable)"
      ((WARNINGS++))
    fi
  else
    echo -e "  ${RED}✗${NC} $desc (MISSING: $file)"
    ((ERRORS++))
  fi
done

echo ""

# ====================================================================
# CHECK 3: GIT HOOKS
# ====================================================================
echo -e "${BLUE}[3/8] Checking Git hooks...${NC}"

HOOKS=(
  ".git/hooks/pre-commit:Pre-commit validation"
  ".git/hooks/pre-push:Pre-push validation"
  ".git/hooks/commit-msg:Commit message validation"
)

for entry in "${HOOKS[@]}"; do
  file="${entry%%:*}"
  desc="${entry##*:}"

  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $desc"
  else
    echo -e "  ${YELLOW}⚠${NC} $desc (not installed)"
    ((WARNINGS++))
  fi
done

if [ $WARNINGS -gt 0 ] && [ ! -f ".git/hooks/pre-commit" ]; then
  echo ""
  echo -e "  ${YELLOW}Run: bash scripts/setup-git-hooks.sh${NC}"
fi

echo ""

# ====================================================================
# CHECK 4: ENVIRONMENT VARIABLES
# ====================================================================
echo -e "${BLUE}[4/8] Checking environment variables...${NC}"

if [ -f ".env" ]; then
  echo -e "  ${GREEN}✓${NC} .env file exists"

  # Check for required variables
  source .env

  REQUIRED_VARS=(
    "VITE_SUPABASE_URL:Supabase URL"
    "VITE_SUPABASE_ANON_KEY:Supabase anon key"
  )

  for entry in "${REQUIRED_VARS[@]}"; do
    var="${entry%%:*}"
    desc="${entry##*:}"

    if [ -n "${!var}" ]; then
      echo -e "  ${GREEN}✓${NC} $desc set"
    else
      echo -e "  ${RED}✗${NC} $desc (NOT SET: $var)"
      ((ERRORS++))
    fi
  done
else
  echo -e "  ${RED}✗${NC} .env file missing"
  ((ERRORS++))
fi

echo ""

# ====================================================================
# CHECK 5: SUPABASE EDGE FUNCTIONS
# ====================================================================
echo -e "${BLUE}[5/8] Checking Edge Functions...${NC}"

EDGE_FUNCTIONS=(
  "supabase/functions/notify-deployment-updates/index.ts:Deployment notifications"
  "supabase/functions/platform-webhooks/index.ts:Platform webhooks"
  "supabase/functions/stripe-webhook/index.ts:Stripe webhooks"
)

for entry in "${EDGE_FUNCTIONS[@]}"; do
  file="${entry%%:*}"
  desc="${entry##*:}"

  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $desc"
  else
    echo -e "  ${YELLOW}⚠${NC} $desc (file not found)"
    ((WARNINGS++))
  fi
done

echo ""

# ====================================================================
# CHECK 6: NODE MODULES
# ====================================================================
echo -e "${BLUE}[6/8] Checking dependencies...${NC}"

if [ -d "node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} node_modules installed"

  # Check if package-lock.json exists
  if [ -f "package-lock.json" ]; then
    echo -e "  ${GREEN}✓${NC} package-lock.json exists"
  else
    echo -e "  ${YELLOW}⚠${NC} package-lock.json missing"
    ((WARNINGS++))
  fi
else
  echo -e "  ${RED}✗${NC} node_modules not installed"
  echo -e "      Run: npm install"
  ((ERRORS++))
fi

echo ""

# ====================================================================
# CHECK 7: BUILD SYSTEM
# ====================================================================
echo -e "${BLUE}[7/8] Checking build system...${NC}"

# Check if vite is available
if command -v npx &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} npx available"
else
  echo -e "  ${RED}✗${NC} npx not available"
  ((ERRORS++))
fi

# Check if build script exists
if grep -q '"build"' package.json; then
  echo -e "  ${GREEN}✓${NC} build script defined"
else
  echo -e "  ${RED}✗${NC} build script missing in package.json"
  ((ERRORS++))
fi

# Check prebuild hook
if grep -q '"prebuild"' package.json; then
  echo -e "  ${GREEN}✓${NC} prebuild hook configured"
else
  echo -e "  ${YELLOW}⚠${NC} prebuild hook not configured"
  ((WARNINGS++))
fi

echo ""

# ====================================================================
# CHECK 8: DOCUMENTATION
# ====================================================================
echo -e "${BLUE}[8/8] Checking documentation...${NC}"

DOCS=(
  "README.md:Main README"
  "DEPLOYMENT_RUNBOOK.md:Deployment procedures"
  "docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md:System architecture"
  ".github/CODEOWNERS:Code ownership"
)

for entry in "${DOCS[@]}"; do
  file="${entry%%:*}"
  desc="${entry##*:}"

  if [ -f "$file" ]; then
    # Check if file has content
    if [ -s "$file" ]; then
      echo -e "  ${GREEN}✓${NC} $desc"
    else
      echo -e "  ${YELLOW}⚠${NC} $desc (empty file)"
      ((WARNINGS++))
    fi
  else
    echo -e "  ${YELLOW}⚠${NC} $desc (missing)"
    ((WARNINGS++))
  fi
done

echo ""
echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}HEALTH CHECK SUMMARY${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ ALL SYSTEMS HEALTHY${NC}"
  echo ""
  echo "The deployment system is fully operational."
  echo "You can safely proceed with development."
  echo ""
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ WARNINGS DETECTED${NC}"
  echo ""
  echo "  Warnings: $WARNINGS"
  echo ""
  echo "The deployment system is functional but has minor issues."
  echo "Consider addressing the warnings above."
  echo ""
  exit 0
else
  echo -e "${RED}✗ CRITICAL ISSUES FOUND${NC}"
  echo ""
  echo "  Errors: $ERRORS"
  echo "  Warnings: $WARNINGS"
  echo ""
  echo "The deployment system has critical issues that must be fixed."
  echo ""

  if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "Missing critical files:"
    for file in "${MISSING_FILES[@]}"; do
      echo "  - $file"
    done
    echo ""
  fi

  echo "Recommended actions:"
  echo "  1. Review docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md"
  echo "  2. Restore missing files from git history"
  echo "  3. Run: bash scripts/setup-git-hooks.sh"
  echo "  4. Run: npm install"
  echo ""
  exit 1
fi
