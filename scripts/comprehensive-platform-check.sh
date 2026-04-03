#!/bin/bash

# ============================================
# V3BMUSIC.AI COMPREHENSIVE PLATFORM CHECK
# For Investor Meeting - March 2026
# ============================================

set -e

echo "=========================================="
echo "V3BMUSIC.AI PLATFORM VERIFICATION"
echo "Comprehensive System Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✓ PASS${NC} - $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗ FAIL${NC} - $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠ WARNING${NC} - $1"
    ((WARN++))
}

echo "=========================================="
echo "SECTOR 1: ENVIRONMENT CONFIGURATION"
echo "=========================================="

# Check .env file
if [ -f .env ]; then
    check_pass ".env file exists"

    if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        check_pass "Supabase credentials configured"
    else
        check_fail "Supabase credentials missing"
    fi
else
    check_fail ".env file not found"
fi

echo ""
echo "=========================================="
echo "SECTOR 2: PROJECT DEPENDENCIES"
echo "=========================================="

# Check package.json
if [ -f package.json ]; then
    check_pass "package.json exists"

    # Check critical dependencies
    if grep -q "@supabase/supabase-js" package.json; then
        check_pass "Supabase client library installed"
    else
        check_fail "Supabase client library missing"
    fi

    if grep -q "react-router-dom" package.json; then
        check_pass "React Router installed"
    else
        check_fail "React Router missing"
    fi

    if grep -q "i18next" package.json; then
        check_pass "Internationalization library installed"
    else
        check_warn "i18next missing - multilingual features may not work"
    fi
else
    check_fail "package.json not found"
fi

echo ""
echo "=========================================="
echo "SECTOR 3: CORE APPLICATION FILES"
echo "=========================================="

# Check critical files
critical_files=(
    "src/main.tsx"
    "src/App.tsx"
    "src/lib/supabase.ts"
    "src/contexts/AuthContext.tsx"
    "index.html"
    "vite.config.ts"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Core file: $file"
    else
        check_fail "Missing core file: $file"
    fi
done

echo ""
echo "=========================================="
echo "SECTOR 4: AUTHENTICATION SYSTEM"
echo "=========================================="

# Check auth-related files
if [ -f "src/contexts/AuthContext.tsx" ]; then
    check_pass "AuthContext exists"

    if grep -q "signInWithOtp" src/contexts/AuthContext.tsx; then
        check_pass "OTP authentication implemented"
    else
        check_warn "OTP authentication may not be configured"
    fi

    if grep -q "signInWithPassword" src/contexts/AuthContext.tsx; then
        check_pass "Password authentication implemented"
    else
        check_fail "Password authentication missing"
    fi
fi

if [ -f "src/pages/Login.tsx" ]; then
    check_pass "Login page exists"
else
    check_fail "Login page missing"
fi

if [ -f "src/pages/Register.tsx" ]; then
    check_pass "Register page exists"
else
    check_fail "Register page missing"
fi

echo ""
echo "=========================================="
echo "SECTOR 5: DCCS SYSTEM"
echo "=========================================="

dccs_files=(
    "src/pages/DCCSRegistration.tsx"
    "src/pages/VerifyCertificate.tsx"
    "src/components/DCCSCertificateDisplay.tsx"
    "src/components/DCCSBadge.tsx"
)

for file in "${dccs_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "DCCS component: $(basename $file)"
    else
        check_fail "Missing DCCS component: $(basename $file)"
    fi
done

echo ""
echo "=========================================="
echo "SECTOR 6: UPLOAD SYSTEM"
echo "=========================================="

upload_files=(
    "src/pages/Phase1Upload.tsx"
    "src/components/ComprehensiveUploader.tsx"
    "src/lib/uploadManager.ts"
)

for file in "${upload_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Upload component: $(basename $file)"
    else
        check_fail "Missing upload component: $(basename $file)"
    fi
done

echo ""
echo "=========================================="
echo "SECTOR 7: DATABASE MIGRATIONS"
echo "=========================================="

migration_count=$(find supabase/migrations -name "*.sql" 2>/dev/null | wc -l)
if [ "$migration_count" -gt 0 ]; then
    check_pass "Database migrations found: $migration_count files"

    # Check for critical migrations
    if ls supabase/migrations/*instant_otp*.sql 1> /dev/null 2>&1; then
        check_pass "OTP authentication migration exists"
    else
        check_warn "OTP authentication migration may be missing"
    fi

    if ls supabase/migrations/*dccs*.sql 1> /dev/null 2>&1; then
        check_pass "DCCS system migrations exist"
    else
        check_fail "DCCS system migrations missing"
    fi
else
    check_fail "No database migrations found"
fi

echo ""
echo "=========================================="
echo "SECTOR 8: EDGE FUNCTIONS"
echo "=========================================="

edge_functions_count=$(find supabase/functions -type d -maxdepth 1 -mindepth 1 2>/dev/null | wc -l)
if [ "$edge_functions_count" -gt 0 ]; then
    check_pass "Edge functions found: $edge_functions_count functions"

    # Check for critical edge functions
    critical_functions=(
        "supabase/functions/dccs-download-url"
        "supabase/functions/dccs-payment-checkout"
    )

    for func in "${critical_functions[@]}"; do
        if [ -d "$func" ]; then
            check_pass "Edge function: $(basename $func)"
        else
            check_warn "Edge function missing: $(basename $func)"
        fi
    done
else
    check_warn "No edge functions found"
fi

echo ""
echo "=========================================="
echo "SECTOR 9: MULTILINGUAL SUPPORT"
echo "=========================================="

translation_count=$(find public/locales -name "translation.json" 2>/dev/null | wc -l)
if [ "$translation_count" -gt 0 ]; then
    check_pass "Translation files found: $translation_count languages"
else
    check_warn "No translation files found"
fi

if [ -f "src/i18n.ts" ]; then
    check_pass "i18n configuration exists"
else
    check_warn "i18n configuration missing"
fi

echo ""
echo "=========================================="
echo "SECTOR 10: BUILD & DEPLOYMENT"
echo "=========================================="

if [ -f "netlify.toml" ]; then
    check_pass "Netlify configuration exists"
else
    check_warn "Netlify configuration missing"
fi

if [ -f ".github/workflows/netlify-deploy.yml" ]; then
    check_pass "GitHub Actions workflow exists"
else
    check_warn "GitHub Actions workflow missing"
fi

# Check if build scripts exist
if grep -q "\"build\"" package.json; then
    check_pass "Build script configured"
else
    check_fail "Build script missing"
fi

echo ""
echo "=========================================="
echo "SECTOR 11: SEO & METADATA"
echo "=========================================="

if [ -f "public/sitemap.xml" ]; then
    check_pass "Sitemap exists"
else
    check_warn "Sitemap missing"
fi

if [ -f "public/robots.txt" ]; then
    check_pass "robots.txt exists"
else
    check_warn "robots.txt missing"
fi

if [ -f "public/manifest.json" ]; then
    check_pass "PWA manifest exists"

    if grep -q "DCCS" public/manifest.json; then
        check_pass "Manifest updated for Phase 1 DCCS"
    else
        check_warn "Manifest may need Phase 1 updates"
    fi
else
    check_warn "PWA manifest missing"
fi

echo ""
echo "=========================================="
echo "SECTOR 12: SECURITY & LEGAL"
echo "=========================================="

legal_files=(
    "public/legal/terms-of-service.html"
    "public/legal/privacy-policy.html"
    "public/legal/dmca-policy.html"
    "public/legal/cookie-policy.html"
)

for file in "${legal_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Legal document: $(basename $file)"
    else
        check_warn "Missing legal document: $(basename $file)"
    fi
done

echo ""
echo "=========================================="
echo "FINAL SUMMARY"
echo "=========================================="
echo ""
echo -e "${GREEN}PASSED:${NC} $PASS checks"
echo -e "${YELLOW}WARNINGS:${NC} $WARN checks"
echo -e "${RED}FAILED:${NC} $FAIL checks"
echo ""

TOTAL=$((PASS + WARN + FAIL))
SCORE=$((PASS * 100 / TOTAL))

echo "Overall Score: $SCORE%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ PLATFORM READY FOR INVESTOR MEETING${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ CRITICAL ISSUES DETECTED${NC}"
    echo "Please review failed checks before investor meeting"
    echo ""
    exit 1
fi
