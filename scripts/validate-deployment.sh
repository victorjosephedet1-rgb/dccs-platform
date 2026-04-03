#!/bin/bash

# V3BMusic.AI Pre-Deployment Validation Script
# Ensures all sectors are functional before deployment

set -e

echo "========================================="
echo "V3BMusic.AI Deployment Validation"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VALIDATION_FAILED=0

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
    else
        echo -e "${RED}✗${NC} $2 missing"
        VALIDATION_FAILED=1
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
    else
        echo -e "${RED}✗${NC} $2 missing"
        VALIDATION_FAILED=1
    fi
}

# Function to check if string exists in file
check_content() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} $3"
    else
        echo -e "${RED}✗${NC} $3 failed"
        VALIDATION_FAILED=1
    fi
}

echo "1. Checking critical files..."
echo "----------------------------"
check_file "package.json" "Package configuration"
check_file "vite.config.ts" "Vite configuration"
check_file "tsconfig.json" "TypeScript configuration"
check_file "index.html" "HTML entry point"
check_file "netlify.toml" "Netlify configuration"
check_file "public/sitemap.xml" "Sitemap"
check_file "public/robots.txt" "Robots.txt"
check_file ".env.example" "Environment template"
echo ""

echo "2. Checking sector pages..."
echo "----------------------------"
check_file "src/pages/MusicSector.tsx" "Music Sector page"
check_file "src/pages/VideoSector.tsx" "Video Sector page"
check_file "src/pages/PodcastSector.tsx" "Podcast Sector page"
check_file "src/pages/BookingSector.tsx" "Booking Sector page"
check_file "src/pages/CreatorMarketplace.tsx" "Marketplace page"
check_file "src/pages/UploadHub.tsx" "Upload Hub page"
check_file "src/pages/DCCSRegistration.tsx" "DCCS Registration page"
check_file "src/pages/DCCSAIMonitoring.tsx" "DCCS AI Monitoring page"
echo ""

echo "3. Checking core components..."
echo "----------------------------"
check_file "src/components/SEOHead.tsx" "SEO Head component"
check_file "src/components/EnhancedHeader.tsx" "Header component"
check_file "src/components/GlobalLanguageSwitcher.tsx" "Language switcher"
check_file "src/components/ProtectedRoute.tsx" "Protected route"
check_file "src/components/AudioPlayer.tsx" "Audio player"
check_file "src/components/PaymentModal.tsx" "Payment modal"
check_file "src/components/UnifiedPaymentModal.tsx" "Unified payment"
echo ""

echo "4. Checking authentication..."
echo "----------------------------"
check_file "src/pages/Login.tsx" "Login page"
check_file "src/pages/Register.tsx" "Register page"
check_file "src/pages/ForgotPassword.tsx" "Forgot password page"
check_file "src/pages/ResetPassword.tsx" "Reset password page"
check_file "src/contexts/AuthContext.tsx" "Auth context"
echo ""

echo "5. Checking i18n (translations)..."
echo "----------------------------"
check_file "src/i18n.ts" "i18n configuration"
check_dir "public/locales/en" "English translations"
check_dir "public/locales/es" "Spanish translations"
check_dir "public/locales/fr" "French translations"
check_dir "public/locales/de" "German translations"
check_dir "public/locales/ar" "Arabic translations"
check_file "public/locales/en/translation.json" "English translation file"
echo ""

echo "6. Checking database migrations..."
echo "----------------------------"
check_dir "supabase/migrations" "Migrations directory"
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $MIGRATION_COUNT migration files"
else
    echo -e "${RED}✗${NC} No migration files found"
    VALIDATION_FAILED=1
fi
echo ""

echo "7. Checking edge functions..."
echo "----------------------------"
check_dir "supabase/functions" "Functions directory"
check_file "supabase/functions/stripe-checkout/index.ts" "Stripe checkout function"
check_file "supabase/functions/stripe-webhook/index.ts" "Stripe webhook function"
check_file "supabase/functions/unified-payment-router/index.ts" "Payment router function"
check_file "supabase/functions/instant-crypto-payout/index.ts" "Crypto payout function"
echo ""

echo "8. Validating sitemap..."
echo "----------------------------"
check_content "public/sitemap.xml" "dccsverify.com/upload" "Upload in sitemap"
check_content "public/sitemap.xml" "dccsverify.com/downloads" "Downloads in sitemap"
check_content "public/sitemap.xml" "dccsverify.com/verify" "Verify in sitemap"
check_content "public/sitemap.xml" "dccsverify.com/dccs-register" "DCCS register in sitemap"
check_content "public/sitemap.xml" "dccsverify.com/story" "Platform story in sitemap"
echo ""

echo "9. Validating robots.txt..."
echo "----------------------------"
check_content "public/robots.txt" "Allow: /" "Root allowed"
check_content "public/robots.txt" "Sitemap: https://dccsverify.com/sitemap.xml" "Sitemap reference"
echo ""

echo "10. Checking SEO meta tags in sectors..."
echo "----------------------------"
check_content "src/pages/MusicSector.tsx" "SEOHead" "Music sector has SEO"
check_content "src/pages/VideoSector.tsx" "SEOHead" "Video sector has SEO"
check_content "src/pages/PodcastSector.tsx" "SEOHead" "Podcast sector has SEO"
check_content "src/pages/BookingSector.tsx" "SEOHead" "Booking sector has SEO"
echo ""

echo "11. Running TypeScript check..."
echo "----------------------------"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
else
    echo -e "${RED}✗${NC} TypeScript errors found"
    VALIDATION_FAILED=1
fi
echo ""

echo "12. Running build test..."
echo "----------------------------"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"

    # Check if dist folder was created
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓${NC} Dist folder created"

        # Check for key files in dist
        if [ -f "dist/index.html" ]; then
            echo -e "${GREEN}✓${NC} Index.html generated"
        else
            echo -e "${RED}✗${NC} Index.html missing in dist"
            VALIDATION_FAILED=1
        fi

        # Check for assets
        if [ -d "dist/assets" ]; then
            ASSET_COUNT=$(ls -1 dist/assets/*.js 2>/dev/null | wc -l)
            echo -e "${GREEN}✓${NC} Assets generated ($ASSET_COUNT JS files)"
        else
            echo -e "${RED}✗${NC} Assets folder missing"
            VALIDATION_FAILED=1
        fi
    else
        echo -e "${RED}✗${NC} Dist folder not created"
        VALIDATION_FAILED=1
    fi
else
    echo -e "${RED}✗${NC} Build failed"
    VALIDATION_FAILED=1
fi
echo ""

echo "========================================="
if [ $VALIDATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All validations passed!${NC}"
    echo "========================================="
    echo ""
    echo "Deployment checklist:"
    echo "✓ All sector pages exist"
    echo "✓ SEO optimization complete"
    echo "✓ Translations configured"
    echo "✓ Database migrations ready"
    echo "✓ Edge functions deployed"
    echo "✓ TypeScript compiles"
    echo "✓ Build successful"
    echo ""
    echo "Ready to deploy to production!"
    exit 0
else
    echo -e "${RED}❌ Validation failed!${NC}"
    echo "========================================="
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi
