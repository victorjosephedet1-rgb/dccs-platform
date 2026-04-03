#!/bin/bash

# DCCS Platform - dccsverify.com Deployment Verification
# Comprehensive check for domain migration from v3bmusic.ai to dccsverify.com

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PRIMARY_DOMAIN="dccsverify.com"
LEGACY_DOMAIN="v3bmusic.ai"
ERRORS=0
WARNINGS=0

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   DCCS PLATFORM - DOMAIN MIGRATION VERIFICATION              ║"
echo "║   Primary: dccsverify.com  |  Legacy: v3bmusic.ai            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Test function
check_url() {
    local url=$1
    local expected=$2
    local description=$3

    echo -n "Testing: $description... "

    response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" -L "$url" || echo "000|")
    status_code=$(echo "$response" | cut -d'|' -f1)
    redirect_url=$(echo "$response" | cut -d'|' -f2)

    if [ "$status_code" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected, got $status_code)"
        ((ERRORS++))
        return 1
    fi
}

check_redirect() {
    local from=$1
    local to=$2
    local description=$3

    echo -n "Testing redirect: $description... "

    # Follow redirects and get final URL
    final_url=$(curl -s -L -o /dev/null -w "%{url_effective}" "$from" || echo "")

    if [[ "$final_url" == *"$to"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} ($from → $final_url)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected redirect to $to, got $final_url)"
        ((ERRORS++))
        return 1
    fi
}

check_content() {
    local url=$1
    local search_string=$2
    local description=$3

    echo -n "Checking content: $description... "

    content=$(curl -s -L "$url" || echo "")

    if echo "$content" | grep -q "$search_string"; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (Content not found: $search_string)"
        ((WARNINGS++))
        return 1
    fi
}

echo -e "${BLUE}[1/10] Checking Primary Domain (dccsverify.com)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_url "https://$PRIMARY_DOMAIN" "200" "Homepage loads"
check_url "https://$PRIMARY_DOMAIN/upload" "200" "Upload page"
check_url "https://$PRIMARY_DOMAIN/register" "200" "Register page"
check_url "https://$PRIMARY_DOMAIN/verify" "200" "Verify page"
check_url "https://$PRIMARY_DOMAIN/downloads" "200" "Downloads page"
echo ""

echo -e "${BLUE}[2/10] Checking SSL Certificate${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "SSL certificate valid... "
if curl -s -I "https://$PRIMARY_DOMAIN" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    ((ERRORS++))
fi
echo ""

echo -e "${BLUE}[3/10] Checking WWW to Non-WWW Redirect${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_redirect "https://www.$PRIMARY_DOMAIN" "$PRIMARY_DOMAIN" "www redirect"
echo ""

echo -e "${BLUE}[4/10] Checking HTTP to HTTPS Redirect${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_redirect "http://$PRIMARY_DOMAIN" "https://$PRIMARY_DOMAIN" "Force HTTPS"
echo ""

echo -e "${BLUE}[5/10] Checking Legacy Domain Redirects (v3bmusic.ai)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_redirect "https://$LEGACY_DOMAIN" "$PRIMARY_DOMAIN" "v3bmusic.ai → dccsverify.com"
check_redirect "https://www.$LEGACY_DOMAIN" "$PRIMARY_DOMAIN" "www.v3bmusic.ai → dccsverify.com"
check_redirect "https://$LEGACY_DOMAIN/upload" "$PRIMARY_DOMAIN/upload" "v3bmusic.ai/upload → dccsverify.com/upload"
echo ""

echo -e "${BLUE}[6/10] Checking SPA Routing${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_url "https://$PRIMARY_DOMAIN/story" "200" "Deep route /story"
check_url "https://$PRIMARY_DOMAIN/careers" "200" "Deep route /careers"
check_url "https://$PRIMARY_DOMAIN/safety" "200" "Deep route /safety"
echo ""

echo -e "${BLUE}[7/10] Checking Static Assets${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_url "https://$PRIMARY_DOMAIN/favicon.ico" "200" "Favicon"
check_url "https://$PRIMARY_DOMAIN/manifest.json" "200" "PWA Manifest"
check_url "https://$PRIMARY_DOMAIN/sitemap.xml" "200" "Sitemap"
check_url "https://$PRIMARY_DOMAIN/robots.txt" "200" "Robots.txt"
echo ""

echo -e "${BLUE}[8/10] Checking Page Content${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_content "https://$PRIMARY_DOMAIN" "DCCS" "DCCS branding on homepage"
check_content "https://$PRIMARY_DOMAIN/robots.txt" "dccsverify.com" "Correct domain in robots.txt"
check_content "https://$PRIMARY_DOMAIN/sitemap.xml" "dccsverify.com" "Correct domain in sitemap"
echo ""

echo -e "${BLUE}[9/10] Checking Performance${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Page load time... "
load_time=$(curl -o /dev/null -s -w "%{time_total}" "https://$PRIMARY_DOMAIN")
if (( $(echo "$load_time < 3.0" | bc -l) )); then
    echo -e "${GREEN}✓ PASS${NC} (${load_time}s)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (${load_time}s - may be slow)"
    ((WARNINGS++))
fi
echo ""

echo -e "${BLUE}[10/10] Checking DNS Resolution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "DNS resolution for $PRIMARY_DOMAIN... "
if host "$PRIMARY_DOMAIN" > /dev/null 2>&1; then
    ip=$(host "$PRIMARY_DOMAIN" | grep "has address" | awk '{print $4}' | head -1)
    echo -e "${GREEN}✓ PASS${NC} (Resolves to $ip)"
else
    echo -e "${RED}✗ FAIL${NC}"
    ((ERRORS++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}VERIFICATION SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 Domain migration successful!"
    echo "🌐 Primary: https://$PRIMARY_DOMAIN"
    echo "♻️  Legacy: https://$LEGACY_DOMAIN (redirecting)"
    echo ""
    echo "Next steps:"
    echo "1. Monitor uptime for 24-48 hours"
    echo "2. Submit sitemap to Google Search Console"
    echo "3. Update external service webhooks"
    echo "4. Notify users of domain change"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "The migration is functional but has minor issues."
    echo "Review warnings above and optimize as needed."
    exit 0
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Critical issues detected. Please review errors above."
    echo ""
    echo "Common fixes:"
    echo "1. Verify all files uploaded to IONOS"
    echo "2. Check .htaccess configuration"
    echo "3. Ensure DNS is properly configured"
    echo "4. Verify SSL certificate is active"
    echo "5. Check Supabase allowed URLs"
    exit 1
fi
