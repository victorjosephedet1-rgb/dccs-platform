#!/bin/bash

# DCCS Platform - Deployment Readiness Verification
# Run this before pushing to GitHub

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DCCS Platform - Deployment Readiness Check"
echo "  Victor360 Brand Limited"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check function
check() {
    local test_name="$1"
    local command="$2"

    echo -n "Checking $test_name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Warning function
warn() {
    local test_name="$1"
    local command="$2"

    echo -n "Checking $test_name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ WARNING${NC}"
        ((WARNINGS++))
    fi
}

echo -e "${BLUE}1. Git Repository Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "Git initialized" "test -d .git"
check "Git user configured" "git config user.email"
check "Git remote configured" "git remote get-url origin"
check "On main branch" "test \$(git branch --show-current) = 'main'"
warn "No uncommitted changes" "test -z \"\$(git status --porcelain)\""
echo ""

echo -e "${BLUE}2. Build System Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "package.json exists" "test -f package.json"
check "node_modules installed" "test -d node_modules"
check "Build succeeds" "npm run build"
check "Dist folder created" "test -d dist"
check "Index.html generated" "test -f dist/index.html"
echo ""

echo -e "${BLUE}3. Configuration Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "netlify.toml exists" "test -f netlify.toml"
check ".env.example exists" "test -f .env.example"
check ".gitignore exists" "test -f .gitignore"
check ".env is gitignored" "grep -q '^\.env$' .gitignore"
check "GitHub workflow exists" "test -f .github/workflows/netlify-deploy.yml"
echo ""

echo -e "${BLUE}4. Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f .env ]; then
    check "VITE_SUPABASE_URL set" "grep -q 'VITE_SUPABASE_URL=' .env"
    check "VITE_SUPABASE_ANON_KEY set" "grep -q 'VITE_SUPABASE_ANON_KEY=' .env"
    check "VITE_STRIPE_PUBLISHABLE_KEY set" "grep -q 'VITE_STRIPE_PUBLISHABLE_KEY=' .env"
else
    echo -e "${YELLOW}⚠ .env file not found (will use Netlify env vars)${NC}"
    ((WARNINGS++))
fi
echo ""

echo -e "${BLUE}5. Key Files Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "README.md exists" "test -f README.md"
check "LICENSE exists" "test -f LICENSE"
check "index.html exists" "test -f index.html"
check "package-lock.json exists" "test -f package-lock.json"
check "tsconfig.json exists" "test -f tsconfig.json"
check "vite.config.ts exists" "test -f vite.config.ts"
echo ""

echo -e "${BLUE}6. Public Assets${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "favicon.ico exists" "test -f public/favicon.ico"
check "manifest.json exists" "test -f public/manifest.json"
check "robots.txt exists" "test -f public/robots.txt"
check "sitemap.xml exists" "test -f public/sitemap.xml"
check "_redirects exists" "test -f public/_redirects"
echo ""

echo -e "${BLUE}7. Documentation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "Deployment checklist" "test -f FINAL_DEPLOYMENT_CHECKLIST.md"
check "Push guide" "test -f PUSH_TO_GITHUB.md"
check "DCCS documentation" "test -f DCCS_QUICK_START.md"
echo ""

echo -e "${BLUE}8. Security Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check "No .env in git" "! git ls-files --error-unmatch .env 2>/dev/null"
check "No node_modules in git" "! git ls-files | grep -q 'node_modules/'"
check "No dist in git" "! git ls-files | grep -q '^dist/'"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ READY TO DEPLOY!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub:"
    echo "   git push -u origin main"
    echo ""
    echo "2. Configure GitHub Secrets (see FINAL_DEPLOYMENT_CHECKLIST.md)"
    echo ""
    echo "3. Configure Netlify Environment Variables"
    echo ""
    echo "4. Monitor deployment at:"
    echo "   https://github.com/victorjosephedet1-rgb/victorjosephedet1-rgb-dccs-platform/actions"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ NOT READY - FIX ISSUES ABOVE${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Fix the failed checks above and run this script again."
    echo ""
    exit 1
fi
