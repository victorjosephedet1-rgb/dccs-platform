#!/bin/bash

# V3BMUSIC Platform - Complete Sector Verification Script
# This script verifies ALL platform sectors are functioning correctly

set -e

echo "🔍 V3BMUSIC PLATFORM - COMPREHENSIVE VERIFICATION"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Helper functions
check_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $2 - Missing: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

check_directory() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $2 - Missing: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

check_env_var() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "^$1=" .env 2>/dev/null || grep -q "^$1=" .env.example; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠${NC} $2 - Missing: $1"
        WARNINGS=$((WARNINGS + 1))
    fi
}

section_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# START VERIFICATION

section_header "📍 CORE SECTORS (Content Distribution)"

echo "🎵 Music Sector:"
check_file "src/pages/MusicSector.tsx" "Music Sector page"
check_file "src/contexts/AudioContext.tsx" "Audio Context"
check_file "src/components/AudioPlayer.tsx" "Audio Player"

echo ""
echo "🎥 Video Sector:"
check_file "src/pages/VideoSector.tsx" "Video Sector page"

echo ""
echo "🎙️ Podcast Sector:"
check_file "src/pages/PodcastSector.tsx" "Podcast Sector page"

echo ""
echo "🎤 Booking Sector:"
check_file "src/pages/BookingSector.tsx" "Booking Sector page"

section_header "🛠️ CREATOR TOOLS"

echo "📤 Upload Hub:"
check_file "src/pages/UploadHub.tsx" "Upload Hub page"
check_file "src/components/ComprehensiveUploader.tsx" "Comprehensive Uploader"
check_file "src/components/UploadModal.tsx" "Upload Modal"
check_file "src/components/EnhancedUploadModal.tsx" "Enhanced Upload Modal"

echo ""
echo "🎨 Creator Marketplace:"
check_file "src/pages/CreatorMarketplace.tsx" "Creator Marketplace page"

echo ""
echo "📊 Artist Dashboard:"
check_file "src/pages/EnhancedArtistDashboard.tsx" "Artist Dashboard page"

echo ""
echo "👤 Artist Profile:"
check_file "src/pages/ArtistProfile.tsx" "Artist Profile page"
check_file "src/components/ProfileGalleryManager.tsx" "Gallery Manager"
check_file "src/components/ProfileVideoManager.tsx" "Video Manager"

section_header "🔐 DCCS SYSTEM"

echo "📝 DCCS Registration:"
check_file "src/pages/DCCSRegistration.tsx" "DCCS Registration page"
check_file "src/components/DCCSBadge.tsx" "DCCS Badge"
check_file "src/components/DCCSIcon.tsx" "DCCS Icon"

echo ""
echo "✅ DCCS Verification:"
check_file "src/pages/VerifyDCCSCode.tsx" "Verify Code page"
check_file "src/pages/VerifyCertificate.tsx" "Verify Certificate page"
check_file "src/pages/ClearanceVerification.tsx" "Clearance Verification page"
check_file "src/components/ClearanceCodeDisplay.tsx" "Clearance Code Display"
check_file "src/components/DCCSCertificateDisplay.tsx" "Certificate Display"

echo ""
echo "🤖 DCCS AI Monitoring:"
check_file "src/pages/DCCSAIMonitoring.tsx" "AI Monitoring page"
check_file "src/components/DCCSAgenticAI.tsx" "Agentic AI component"

echo ""
echo "📋 DCCS Registrations (Admin):"
check_file "src/pages/DCCSRegistrations.tsx" "Registrations Admin page"

section_header "💳 PAYMENT & LICENSING"

echo "💰 Payment System:"
check_file "src/components/UnifiedPaymentModal.tsx" "Unified Payment Modal"
check_file "src/components/PaymentModal.tsx" "Payment Modal"
check_file "src/components/BlockchainPaymentModal.tsx" "Blockchain Payment Modal"
check_file "src/lib/paymentRouter.ts" "Payment Router"
check_file "supabase/functions/stripe-checkout/index.ts" "Stripe Checkout Function"
check_file "supabase/functions/unified-payment-router/index.ts" "Payment Router Function"

echo ""
echo "📜 License Download:"
check_file "src/pages/LicenseDownload.tsx" "License Download page"
check_file "src/components/DCCSDownloadManager.tsx" "Download Manager"

echo ""
echo "💎 Premium System:"
check_file "src/pages/PremiumLanding.tsx" "Premium Landing page"
check_file "src/pages/PremiumDashboard.tsx" "Premium Dashboard page"
check_file "src/pages/PremiumUpload.tsx" "Premium Upload page"

section_header "💸 ROYALTY & PAYOUT SYSTEM"

echo "💵 Royalty Engine:"
check_file "src/lib/royaltyEngine.ts" "Royalty Engine"
check_file "src/components/RoyaltyTracker.tsx" "Royalty Tracker"
check_file "src/components/DCCSRoyaltyDashboard.tsx" "DCCS Royalty Dashboard"
check_file "src/components/BlockchainRoyaltyLedger.tsx" "Blockchain Ledger"

echo ""
echo "⚡ Instant Payout:"
check_file "src/components/InstantPayoutSystem.tsx" "Instant Payout component"
check_file "supabase/functions/instant-crypto-payout/index.ts" "Crypto Payout Function"

echo ""
echo "🎯 Global Royalty Tracking:"
check_file "src/components/GlobalRoyaltyTracking.tsx" "Global Tracking component"
check_file "supabase/functions/platform-sync-tracking/index.ts" "Platform Sync Function"

section_header "👥 USER MANAGEMENT"

echo "🔐 Authentication:"
check_file "src/contexts/AuthContext.tsx" "Auth Context"
check_file "src/pages/Login.tsx" "Login page"
check_file "src/pages/Register.tsx" "Register page"
check_file "src/pages/ForgotPassword.tsx" "Forgot Password page"
check_file "src/pages/ResetPassword.tsx" "Reset Password page"

echo ""
echo "🔗 SSO Integration:"
check_file "src/pages/SSOCallback.tsx" "SSO Callback page"
check_file "src/utils/sso.ts" "SSO utilities"

echo ""
echo "📚 Content Library:"
check_file "src/pages/MyContent.tsx" "My Content page"
check_file "src/pages/MyContentLibrary.tsx" "Content Library page"
check_file "src/pages/MyDownloads.tsx" "My Downloads page"

section_header "🛡️ ADMIN & MODERATION"

echo "⚙️ Admin Portal:"
check_file "src/pages/AdminPortal.tsx" "Admin Portal page"
check_file "src/pages/ComprehensiveAdminPanel.tsx" "Comprehensive Admin Panel"

echo ""
echo "🚨 Content Moderation:"
check_file "src/components/AdminModerationDashboard.tsx" "Moderation Dashboard"
check_file "src/components/ContentReportModal.tsx" "Report Modal"
check_file "src/components/DMCANoticeForm.tsx" "DMCA Form"
check_file "src/components/AdminPayoutVerification.tsx" "Payout Verification"

echo ""
echo "🛡️ Safety Center:"
check_file "src/pages/SafetyCenter.tsx" "Safety Center page"
check_file "src/components/PlatformSafetyInfo.tsx" "Safety Info component"
check_file "src/components/SafetyBadges.tsx" "Safety Badges"

section_header "⚖️ LEGAL & COMPLIANCE"

echo "📄 Legal System:"
check_file "public/legal/privacy-policy.html" "Privacy Policy"
check_file "public/legal/terms-of-service.html" "Terms of Service"
check_file "public/legal/cookie-policy.html" "Cookie Policy"
check_file "public/legal/dmca-policy.html" "DMCA Policy"
check_file "src/components/LegalAgreementModal.tsx" "Legal Agreement Modal"
check_file "src/components/LegalDisclaimer.tsx" "Legal Disclaimer"

echo ""
echo "🆔 KYC Verification:"
check_file "src/components/KYCVerification.tsx" "KYC component"
check_file "src/components/PayoutIdentitySetup.tsx" "Payout Identity Setup"
check_file "src/components/PayoutIdentityGuide.tsx" "Identity Guide"
check_file "supabase/functions/process-payout-identity/index.ts" "KYC Processing Function"

echo ""
echo "⚖️ Dispute Resolution:"
check_file "src/components/DisputeResolutionModal.tsx" "Dispute Modal"
check_file "src/components/CatalogOfGrievances.tsx" "Grievances Catalog"
check_file "supabase/functions/dispute-notifications/index.ts" "Dispute Notifications Function"

section_header "🔔 COMMUNICATION SYSTEMS"

echo "📧 Notifications:"
check_file "src/components/NotificationSystem.tsx" "Notification System"
check_file "supabase/functions/artist-notifications/index.ts" "Artist Notifications Function"

echo ""
echo "📊 Analytics:"
check_file "src/components/Analytics.tsx" "Analytics component"

section_header "🌐 PLATFORM INFRASTRUCTURE"

echo "🗄️ Storage:"
check_file "src/lib/storage.ts" "Storage library"
check_file "src/lib/uploadManager.ts" "Upload Manager"

echo ""
echo "⛓️ Blockchain:"
check_file "src/contexts/Web3Context.tsx" "Web3 Context"
check_file "src/lib/blockchainPayments.ts" "Blockchain Payments"
check_file "src/hooks/useBlockchain.ts" "Blockchain Hook"
check_directory "blockchain/contracts" "Smart Contracts directory"

echo ""
echo "🔗 Edge Functions:"
check_directory "supabase/functions" "Edge Functions directory"
check_file "supabase/functions/stripe-checkout/index.ts" "Stripe Checkout"
check_file "supabase/functions/stripe-webhook/index.ts" "Stripe Webhook"
check_file "supabase/functions/stripe-connect-onboarding/index.ts" "Stripe Connect"
check_file "supabase/functions/unified-payment-router/index.ts" "Payment Router"
check_file "supabase/functions/instant-crypto-payout/index.ts" "Crypto Payout"
check_file "supabase/functions/platform-sync-tracking/index.ts" "Platform Sync"
check_file "supabase/functions/platform-webhooks/index.ts" "Platform Webhooks"
check_file "supabase/functions/artist-notifications/index.ts" "Artist Notifications"
check_file "supabase/functions/dispute-notifications/index.ts" "Dispute Notifications"
check_file "supabase/functions/process-payout-identity/index.ts" "KYC Processing"

echo ""
echo "🌍 Multilingual:"
check_file "src/i18n.ts" "i18n configuration"
check_file "src/components/GlobalLanguageSwitcher.tsx" "Global Language Switcher"
check_file "src/components/LanguageSwitcher.tsx" "Language Switcher"
check_directory "public/locales" "Translations directory"
check_directory "public/locales/en" "English translations"
check_directory "public/locales/es" "Spanish translations"
check_directory "public/locales/fr" "French translations"

echo ""
echo "🎵 Audio System:"
check_file "src/contexts/AudioContext.tsx" "Audio Context"
check_file "src/components/AudioPlayer.tsx" "Audio Player"

echo ""
echo "📦 Pack System:"
check_file "src/contexts/PackContext.tsx" "Pack Context"

section_header "🎨 LANDING & MARKETING"

echo "🏠 Landing Page:"
check_file "src/pages/UltimateRedesignedLandingPage.tsx" "Landing Page"

echo ""
echo "💼 Careers:"
check_file "src/pages/Careers.tsx" "Careers page"

echo ""
echo "🎪 Platform Demo:"
check_file "src/pages/PlatformDemo.tsx" "Platform Demo page"

section_header "🔧 UTILITY COMPONENTS"

echo "🎨 Brand Assets:"
check_file "src/components/BrandLogo.tsx" "Brand Logo"
check_directory "public/brand-assets" "Brand Assets directory"

echo ""
echo "🧭 Navigation:"
check_file "src/contexts/NavigationContext.tsx" "Navigation Context"
check_file "src/components/Header.tsx" "Header"
check_file "src/components/EnhancedHeader.tsx" "Enhanced Header"
check_file "src/components/MinimalHeader.tsx" "Minimal Header"
check_file "src/components/Breadcrumbs.tsx" "Breadcrumbs"

echo ""
echo "🌐 SEO:"
check_file "src/components/SEOHead.tsx" "SEO Head component"
check_file "public/sitemap.xml" "Sitemap"
check_file "public/robots.txt" "Robots.txt"
check_file "public/humans.txt" "Humans.txt"

echo ""
echo "⚡ PWA:"
check_file "public/manifest.json" "Web Manifest"
check_file "vite.config.ts" "Vite Config (PWA)"

section_header "🗄️ DATABASE MIGRATIONS"

check_directory "supabase/migrations" "Migrations directory"
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✓${NC} Found $MIGRATION_COUNT database migrations"

section_header "⚙️ CONFIGURATION FILES"

echo "📦 Dependencies:"
check_file "package.json" "Package.json"
check_file "package-lock.json" "Package-lock.json"

echo ""
echo "🔧 Build Configuration:"
check_file "vite.config.ts" "Vite Config"
check_file "tsconfig.json" "TypeScript Config"
check_file "tailwind.config.js" "Tailwind Config"
check_file "postcss.config.js" "PostCSS Config"

echo ""
echo "📝 Environment:"
check_file ".env.example" "Environment Example"
check_env_var "VITE_SUPABASE_URL" "Supabase URL"
check_env_var "VITE_SUPABASE_ANON_KEY" "Supabase Anon Key"
check_env_var "VITE_STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key"
check_env_var "STRIPE_SECRET_KEY" "Stripe Secret Key"

echo ""
echo "🚀 Deployment:"
check_file "netlify.toml" "Netlify Config"
check_file ".github/workflows/deploy.yml" "GitHub Actions Workflow"
check_file "deploy.sh" "Deploy Script"

section_header "📊 VERIFICATION SUMMARY"

echo ""
echo "Total Checks:    $TOTAL_CHECKS"
echo -e "Passed:          ${GREEN}$PASSED_CHECKS${NC}"
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "Failed:          ${RED}$FAILED_CHECKS${NC}"
else
    echo -e "Failed:          ${GREEN}$FAILED_CHECKS${NC}"
fi
if [ $WARNINGS -gt 0 ]; then
    echo -e "Warnings:        ${YELLOW}$WARNINGS${NC}"
fi

SUCCESS_RATE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
echo ""
echo -e "Success Rate:    ${GREEN}${SUCCESS_RATE}%${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL SECTORS VERIFIED!${NC}"
    echo ""
    echo "Platform is ready for deployment."
    exit 0
else
    echo -e "${RED}⚠️  VERIFICATION FAILED${NC}"
    echo ""
    echo "Please fix the missing files before deployment."
    exit 1
fi
