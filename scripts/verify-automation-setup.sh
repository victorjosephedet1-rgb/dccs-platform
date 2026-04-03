#!/bin/bash

# V3BMUSIC.AI - Complete Automation Setup Verification
# This script verifies that all automation components are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Status counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}V3BMUSIC.AI - Automation Setup Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status
print_status() {
    local status=$1
    local message=$2

    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASS:${NC} $message"
            ((CHECKS_PASSED++))
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL:${NC} $message"
            ((CHECKS_FAILED++))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARN:${NC} $message"
            ((CHECKS_WARNING++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO:${NC} $message"
            ;;
    esac
}

# Check 1: Git Repository
echo -e "\n${BLUE}[1/10] Checking Git Repository...${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    print_status "PASS" "Git repository initialized"

    # Check for remote
    if git remote -v | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin)
        print_status "PASS" "Git remote configured: $REMOTE_URL"
    else
        print_status "FAIL" "Git remote 'origin' not configured"
        print_status "INFO" "Run: git remote add origin https://github.com/yourusername/dccs-platform.git"
    fi
else
    print_status "FAIL" "Not a git repository"
    print_status "INFO" "Run: git init && git remote add origin https://github.com/yourusername/dccs-platform.git"
fi

# Check 2: GitHub Actions Workflow
echo -e "\n${BLUE}[2/10] Checking GitHub Actions Workflow...${NC}"
WORKFLOW_FILE=".github/workflows/netlify-deploy.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    print_status "PASS" "GitHub Actions workflow file exists"

    # Verify workflow content
    if grep -q "on:" "$WORKFLOW_FILE" && grep -q "push:" "$WORKFLOW_FILE"; then
        print_status "PASS" "Workflow triggers configured"
    else
        print_status "WARN" "Workflow triggers may be misconfigured"
    fi

    if grep -q "NETLIFY_AUTH_TOKEN" "$WORKFLOW_FILE"; then
        print_status "PASS" "Netlify deployment configured in workflow"
    else
        print_status "WARN" "Netlify deployment may not be configured"
    fi
else
    print_status "FAIL" "GitHub Actions workflow file not found"
fi

# Check 3: Netlify Configuration
echo -e "\n${BLUE}[3/10] Checking Netlify Configuration...${NC}"
if [ -f "netlify.toml" ]; then
    print_status "PASS" "netlify.toml exists"

    # Check build command
    if grep -q "build" "netlify.toml"; then
        BUILD_CMD=$(grep "command" netlify.toml | head -1 | cut -d'"' -f2)
        print_status "PASS" "Build command: $BUILD_CMD"
    fi

    # Check publish directory
    if grep -q "publish" "netlify.toml"; then
        PUBLISH_DIR=$(grep "publish" netlify.toml | head -1 | cut -d'"' -f2)
        print_status "PASS" "Publish directory: $PUBLISH_DIR"
    fi
else
    print_status "FAIL" "netlify.toml not found"
fi

# Check 4: Package.json and Scripts
echo -e "\n${BLUE}[4/10] Checking Package Configuration...${NC}"
if [ -f "package.json" ]; then
    print_status "PASS" "package.json exists"

    # Check build script
    if grep -q '"build"' package.json; then
        print_status "PASS" "Build script configured"
    else
        print_status "FAIL" "Build script not found in package.json"
    fi

    # Check prebuild script
    if grep -q '"prebuild"' package.json; then
        print_status "PASS" "Prebuild script configured"
    fi

    # Check deployment scripts
    if grep -q '"validate"' package.json; then
        print_status "PASS" "Validation script configured"
    fi
else
    print_status "FAIL" "package.json not found"
fi

# Check 5: Environment Files
echo -e "\n${BLUE}[5/10] Checking Environment Configuration...${NC}"
if [ -f ".env.example" ]; then
    print_status "PASS" ".env.example exists"
else
    print_status "WARN" ".env.example not found"
fi

if [ -f ".env.production.example" ]; then
    print_status "PASS" ".env.production.example exists"
else
    print_status "WARN" ".env.production.example not found"
fi

# Check for required environment variables in examples
if [ -f ".env.example" ]; then
    for var in "VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_STRIPE_PUBLIC_KEY"; do
        if grep -q "$var" ".env.example"; then
            print_status "PASS" "$var documented in .env.example"
        else
            print_status "WARN" "$var not found in .env.example"
        fi
    done
fi

# Check 6: Build Configuration
echo -e "\n${BLUE}[6/10] Checking Build Configuration...${NC}"
if [ -f "vite.config.ts" ]; then
    print_status "PASS" "Vite configuration exists"
else
    print_status "FAIL" "vite.config.ts not found"
fi

if [ -f "tsconfig.json" ]; then
    print_status "PASS" "TypeScript configuration exists"
else
    print_status "FAIL" "tsconfig.json not found"
fi

# Check 7: Deployment Scripts
echo -e "\n${BLUE}[7/10] Checking Deployment Scripts...${NC}"
REQUIRED_SCRIPTS=(
    "scripts/validate-deployment.sh"
    "scripts/health-check.sh"
    "scripts/rollback-deployment.sh"
    "scripts/generate-version-file.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        print_status "PASS" "$script exists"

        # Check if executable
        if [ -x "$script" ]; then
            print_status "PASS" "$script is executable"
        else
            print_status "WARN" "$script is not executable (run: chmod +x $script)"
        fi
    else
        print_status "WARN" "$script not found"
    fi
done

# Check 8: Public Assets
echo -e "\n${BLUE}[8/10] Checking Public Assets...${NC}"
REQUIRED_FILES=(
    "public/robots.txt"
    "public/sitemap.xml"
    "public/manifest.json"
    "public/_redirects"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "PASS" "$file exists"
    else
        print_status "WARN" "$file not found"
    fi
done

# Check 9: Dependencies
echo -e "\n${BLUE}[9/10] Checking Dependencies...${NC}"
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ]; then
    print_status "PASS" "Lockfile exists"
else
    print_status "WARN" "No lockfile found (run: npm install)"
fi

if [ -d "node_modules" ]; then
    print_status "PASS" "node_modules directory exists"
else
    print_status "WARN" "node_modules not found (run: npm install)"
fi

# Check 10: Documentation
echo -e "\n${BLUE}[10/10] Checking Documentation...${NC}"
DOC_FILES=(
    "README.md"
    "AUTOMATION_COMPLETE_SETUP_GUIDE.md"
    "DEPLOYMENT_GUIDE.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        print_status "PASS" "$doc exists"
    else
        print_status "WARN" "$doc not found"
    fi
done

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed:  $CHECKS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $CHECKS_WARNING${NC}"
echo -e "${RED}Failed:  $CHECKS_FAILED${NC}"

# Overall status
echo -e "\n${BLUE}Overall Status:${NC}"
if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}✅ ALL CHECKS PASSED - Automation setup is complete!${NC}"
        echo -e "\n${GREEN}Your automation pipeline is ready to use.${NC}"
        echo -e "${GREEN}Next steps:${NC}"
        echo -e "  1. Ensure GitHub secrets are configured"
        echo -e "  2. Connect Netlify to your GitHub repository"
        echo -e "  3. Make a test commit to verify the pipeline"
        exit 0
    else
        echo -e "${YELLOW}⚠️  SETUP COMPLETE WITH WARNINGS${NC}"
        echo -e "\n${YELLOW}Core functionality is in place, but some optional components have warnings.${NC}"
        echo -e "${YELLOW}Review warnings above and fix if needed.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ SETUP INCOMPLETE - Please fix the failed checks above${NC}"
    echo -e "\n${RED}Critical components are missing or misconfigured.${NC}"
    echo -e "${RED}Review the failed checks and fix them before proceeding.${NC}"
    exit 1
fi
