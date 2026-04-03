#!/bin/bash

# Pre-deployment validation script
# Run this before deploying to catch issues early

set -e

echo "🔍 V3B Music Pre-Deployment Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED_CHECKS=0

# Check Node version
echo -n "Checking Node.js version... "
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo -e "${GREEN}✓ v$(node -v)${NC}"
else
  echo -e "${RED}✗ v$(node -v) (requires v18+)${NC}"
  ((FAILED_CHECKS++))
fi

# Check npm version
echo -n "Checking npm version... "
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ v$NPM_VERSION${NC}"

# Check if dependencies are installed
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓ Installed${NC}"
else
  echo -e "${YELLOW}⚠ Not found - running npm install${NC}"
  npm install
fi

# Check environment variables
echo ""
echo "Checking environment variables..."

check_env_var() {
  local var_name=$1
  local required=$2

  echo -n "  $var_name... "

  if [ -n "${!var_name}" ]; then
    echo -e "${GREEN}✓ Set${NC}"
  else
    if [ "$required" = "required" ]; then
      echo -e "${RED}✗ Missing (required)${NC}"
      ((FAILED_CHECKS++))
    else
      echo -e "${YELLOW}⚠ Not set (optional)${NC}"
    fi
  fi
}

check_env_var "VITE_SUPABASE_URL" "required"
check_env_var "VITE_SUPABASE_ANON_KEY" "required"
check_env_var "NETLIFY_AUTH_TOKEN" "optional"
check_env_var "NETLIFY_SITE_ID" "optional"

# Run linting
echo ""
echo -n "Running ESLint... "
if npm run lint > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Passed${NC}"
else
  echo -e "${RED}✗ Failed${NC}"
  echo "Run 'npm run lint' to see errors"
  ((FAILED_CHECKS++))
fi

# Run type checking
echo -n "Running TypeScript type check... "
if npm run type-check > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Passed${NC}"
else
  echo -e "${RED}✗ Failed${NC}"
  echo "Run 'npm run type-check' to see errors"
  ((FAILED_CHECKS++))
fi

# Test build
echo -n "Testing production build... "
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Successful${NC}"

  # Check build size
  if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo "  Build size: $BUILD_SIZE"
  fi
else
  echo -e "${RED}✗ Failed${NC}"
  echo "Run 'npm run build' to see errors"
  ((FAILED_CHECKS++))
fi

# Check critical files exist
echo ""
echo "Checking critical files..."

check_file() {
  local file=$1
  echo -n "  $file... "

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
  else
    echo -e "${RED}✗ Missing${NC}"
    ((FAILED_CHECKS++))
  fi
}

check_file "package.json"
check_file "vite.config.ts"
check_file "netlify.toml"
check_file "public/robots.txt"
check_file "public/sitemap.xml"
check_file "public/manifest.json"

# Check critical components
echo ""
echo "Checking critical components..."

check_component() {
  local component=$1
  echo -n "  $component... "

  if [ -f "$component" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
  else
    echo -e "${YELLOW}⚠ Missing${NC}"
  fi
}

check_component "src/App.tsx"
check_component "src/main.tsx"
check_component "src/lib/supabase.ts"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED_CHECKS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Commit your changes: git add . && git commit -m 'Your message'"
  echo "  2. Push to trigger deployment: git push origin main"
  exit 0
else
  echo -e "${RED}✗ $FAILED_CHECKS check(s) failed${NC}"
  echo ""
  echo "Please fix the issues above before deploying."
  exit 1
fi
