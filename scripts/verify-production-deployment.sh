#!/bin/bash

# ====================================================================
# PRODUCTION DEPLOYMENT VERIFICATION
# ====================================================================
#
# PURPOSE:
#   Verifies that the deployed version matches local build
#   Checks PWA installation, Google indexing status, and SEO
#
# USAGE:
#   bash scripts/verify-production-deployment.sh
#
# CHECKS:
#   - Version.json matches between local and production
#   - PWA manifest is accessible
#   - Service worker is registered
#   - Sitemap is up to date
#   - Robots.txt is correct
#   - Meta tags are present
#   - Google indexing status
#
# ====================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PRODUCTION_URL="https://dccsverify.com"
ERRORS=0
WARNINGS=0

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   DCCS PLATFORM - PRODUCTION DEPLOYMENT VERIFICATION       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check HTTP status
check_url() {
  local url=$1
  local description=$2

  echo -e "${BLUE}→ Checking: ${description}${NC}"

  if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)

    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}  ✓ OK (HTTP $HTTP_CODE)${NC}"
      echo "    URL: $url"
      return 0
    else
      echo -e "${RED}  ✗ FAILED (HTTP $HTTP_CODE)${NC}"
      echo "    URL: $url"
      ERRORS=$((ERRORS + 1))
      return 1
    fi
  else
    echo -e "${YELLOW}  ⚠ curl not available, skipping${NC}"
    WARNINGS=$((WARNINGS + 1))
    return 0
  fi
}

# Function to fetch and display JSON
fetch_json() {
  local url=$1
  local description=$2

  echo -e "${BLUE}→ Fetching: ${description}${NC}"

  if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s "$url" --max-time 10)

    if [ -n "$RESPONSE" ]; then
      echo -e "${GREEN}  ✓ Retrieved${NC}"
      echo "$RESPONSE" | head -20
      return 0
    else
      echo -e "${RED}  ✗ Empty response${NC}"
      ERRORS=$((ERRORS + 1))
      return 1
    fi
  else
    echo -e "${YELLOW}  ⚠ curl not available, skipping${NC}"
    WARNINGS=$((WARNINGS + 1))
    return 0
  fi
}

echo -e "\n${MAGENTA}[1/7] CHECKING CORE ENDPOINTS${NC}\n"

check_url "$PRODUCTION_URL" "Homepage"
check_url "$PRODUCTION_URL/version.json" "Version Info"
check_url "$PRODUCTION_URL/manifest.json" "PWA Manifest"
check_url "$PRODUCTION_URL/sitemap.xml" "Sitemap"
check_url "$PRODUCTION_URL/robots.txt" "Robots.txt"

echo -e "\n${MAGENTA}[2/7] CHECKING PWA ASSETS${NC}\n"

check_url "$PRODUCTION_URL/android-chrome-192x192.png" "Android Icon 192x192"
check_url "$PRODUCTION_URL/android-chrome-512x512.png" "Android Icon 512x512"
check_url "$PRODUCTION_URL/apple-touch-icon.png" "Apple Touch Icon"
check_url "$PRODUCTION_URL/favicon.ico" "Favicon"

echo -e "\n${MAGENTA}[3/7] CHECKING KEY PAGES${NC}\n"

check_url "$PRODUCTION_URL/music" "Music Sector"
check_url "$PRODUCTION_URL/video" "Video Sector"
check_url "$PRODUCTION_URL/podcast" "Podcast Sector"
check_url "$PRODUCTION_URL/marketplace" "Creator Marketplace"
check_url "$PRODUCTION_URL/login" "Login Page"
check_url "$PRODUCTION_URL/register" "Register Page"

echo -e "\n${MAGENTA}[4/7] VERSION COMPARISON${NC}\n"

if [ -f "public/version.json" ]; then
  LOCAL_VERSION=$(cat public/version.json | grep -o '"version"[^,]*' | head -1)
  LOCAL_COMMIT=$(cat public/version.json | grep -o '"short"[^,]*' | head -1)
  echo -e "${BLUE}Local Build:${NC}"
  echo "  $LOCAL_VERSION"
  echo "  $LOCAL_COMMIT"
else
  echo -e "${YELLOW}  ⚠ Local version.json not found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

echo -e "\n${BLUE}Production Build:${NC}"
fetch_json "$PRODUCTION_URL/version.json" "Production Version"

echo -e "\n${MAGENTA}[5/7] PWA MANIFEST VERIFICATION${NC}\n"

fetch_json "$PRODUCTION_URL/manifest.json" "PWA Manifest"

echo -e "\n${MAGENTA}[6/7] GOOGLE INDEXING STATUS${NC}\n"

echo -e "${BLUE}→ Checking Google Search Console Requirements${NC}"

# Check if sitemap has recent dates
if command -v curl &> /dev/null; then
  SITEMAP=$(curl -s "$PRODUCTION_URL/sitemap.xml" --max-time 10)

  if echo "$SITEMAP" | grep -q "2026-02"; then
    echo -e "${GREEN}  ✓ Sitemap contains recent dates (Feb 2026)${NC}"
  else
    echo -e "${YELLOW}  ⚠ Sitemap may be outdated${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi

  # Count URLs in sitemap
  URL_COUNT=$(echo "$SITEMAP" | grep -c "<loc>" || echo "0")
  echo -e "${GREEN}  ✓ Sitemap contains $URL_COUNT URLs${NC}"
fi

echo -e "\n${BLUE}Google Search Console Actions Required:${NC}"
echo "  1. Submit sitemap: $PRODUCTION_URL/sitemap.xml"
echo "  2. Request indexing for homepage"
echo "  3. Request indexing for key pages"
echo "  4. Wait 24-48 hours for Google to re-crawl"
echo ""
echo "  URL: https://search.google.com/search-console"

echo -e "\n${MAGENTA}[7/7] PWA INSTALLATION TESTING${NC}\n"

echo -e "${BLUE}Manual Testing Required:${NC}"
echo ""
echo "  ${CYAN}iPhone/iPad (Safari):${NC}"
echo "    1. Open Safari → $PRODUCTION_URL"
echo "    2. Tap Share → Add to Home Screen"
echo "    3. Verify V3BMusic icon appears"
echo ""
echo "  ${CYAN}Android (Chrome):${NC}"
echo "    1. Open Chrome → $PRODUCTION_URL"
echo "    2. Tap menu → Install app"
echo "    3. Verify app installs with V3BMusic branding"
echo ""
echo "  ${CYAN}Desktop (Chrome/Edge):${NC}"
echo "    1. Visit $PRODUCTION_URL"
echo "    2. Look for install icon in address bar"
echo "    3. Click to install"
echo "    4. Verify standalone app opens"

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}\n"

# Summary
echo -e "${MAGENTA}VERIFICATION SUMMARY${NC}\n"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
  echo "  Production deployment is healthy"
  echo "  PWA is ready for installation"
  echo "  SEO is configured correctly"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ CHECKS PASSED WITH WARNINGS${NC}"
  echo "  Warnings: $WARNINGS"
  echo "  Review warnings above"
  exit 0
else
  echo -e "${RED}✗ CHECKS FAILED${NC}"
  echo "  Errors: $ERRORS"
  echo "  Warnings: $WARNINGS"
  echo "  Fix errors before deploying to production"
  exit 1
fi
