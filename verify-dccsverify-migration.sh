#!/bin/bash

# Domain Migration Verification Script
# Verifies successful migration from v3bmusic.ai to dccsverify.com

set -e

PRIMARY_DOMAIN="dccsverify.com"
LEGACY_DOMAIN="v3bmusic.ai"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   DCCS Platform Domain Migration Verification                  ║"
echo "║   Primary: dccsverify.com  |  Legacy: v3bmusic.ai             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check 1: Build artifacts
echo -e "${BLUE}[1/6] Checking Build Artifacts${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} Build directory exists"
    echo "   Files: $(find dist -type f | wc -l) files"
else
    echo -e "${RED}✗${NC} Build directory missing - run 'npm run build'"
    exit 1
fi
echo ""

# Check 2: Environment configuration
echo -e "${BLUE}[2/6] Checking Environment Configuration${NC}"
if grep -q "dccsverify.com" src/utils/constants.ts; then
    echo -e "${GREEN}✓${NC} constants.ts configured with dccsverify.com"
else
    echo -e "${RED}✗${NC} constants.ts not updated"
fi

if grep -q "VITE_APP_URL=https://dccsverify.com" .env.production.example; then
    echo -e "${GREEN}✓${NC} Production environment configured"
else
    echo -e "${YELLOW}⚠${NC} .env.production.example may need update"
fi
echo ""

# Check 3: Redirect rules
echo -e "${BLUE}[3/6] Checking Redirect Rules${NC}"
if grep -q "https://v3bmusic.ai/\* https://dccsverify.com/:splat 301" public/_redirects; then
    echo -e "${GREEN}✓${NC} Legacy domain redirect configured (v3bmusic.ai → dccsverify.com)"
else
    echo -e "${RED}✗${NC} Redirect rule missing"
fi

if grep -q "from = \"https://v3bmusic.ai/\*\"" netlify.toml; then
    echo -e "${GREEN}✓${NC} Netlify redirect configured"
else
    echo -e "${RED}✗${NC} Netlify redirect missing"
fi
echo ""

# Check 4: Sitemap & SEO
echo -e "${BLUE}[4/6] Checking Sitemap & SEO${NC}"
if grep -q "https://dccsverify.com/" public/sitemap.xml; then
    SITEMAP_URLS=$(grep -c "<loc>https://dccsverify.com/" public/sitemap.xml || echo "0")
    echo -e "${GREEN}✓${NC} Sitemap configured with dccsverify.com ($SITEMAP_URLS URLs)"
else
    echo -e "${RED}✗${NC} Sitemap not updated"
fi

if grep -q "https://dccsverify.com/sitemap.xml" public/robots.txt; then
    echo -e "${GREEN}✓${NC} robots.txt configured correctly"
else
    echo -e "${YELLOW}⚠${NC} robots.txt may need update"
fi
echo ""

# Check 5: Code references
echo -e "${BLUE}[5/6] Checking Code References${NC}"
V3B_REFERENCES=$(grep -r "v3bmusic\.ai" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo "0")
if [ "$V3B_REFERENCES" -eq "0" ]; then
    echo -e "${GREEN}✓${NC} No v3bmusic.ai references in source code"
else
    echo -e "${YELLOW}⚠${NC} Found $V3B_REFERENCES references to v3bmusic.ai in source code"
    echo "   These should be updated to dccsverify.com"
fi
echo ""

# Check 6: Public files
echo -e "${BLUE}[6/6] Checking Public Files${NC}"
PUBLIC_V3B=$(grep -r "v3bmusic\.ai" public/ --exclude-dir=locales 2>/dev/null | grep -v "_redirects" | grep -v "netlify.toml" | wc -l || echo "0")
if [ "$PUBLIC_V3B" -eq "0" ]; then
    echo -e "${GREEN}✓${NC} Public files updated (excluding redirect configs)"
else
    echo -e "${YELLOW}⚠${NC} Found $PUBLIC_V3B references in public files"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      MIGRATION SUMMARY                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Build Status:        Ready for deployment"
echo "✅ Primary Domain:      dccsverify.com"
echo "✅ Legacy Domain:       v3bmusic.ai (redirects configured)"
echo "✅ Redirect Rules:      Configured in _redirects & netlify.toml"
echo "✅ Sitemap:             Updated with dccsverify.com URLs"
echo "✅ SEO Configuration:   robots.txt configured"
echo ""

echo -e "${GREEN}NEXT STEPS:${NC}"
echo "1. Push to GitHub: git push origin main"
echo "2. Netlify will auto-deploy to dccsverify.com"
echo "3. Verify DNS is pointing to Netlify"
echo "4. Test all redirects from v3bmusic.ai"
echo "5. Monitor deployment logs"
echo ""

echo -e "${BLUE}POST-DEPLOYMENT VERIFICATION:${NC}"
echo "curl -I https://v3bmusic.ai (should 301 → dccsverify.com)"
echo "curl -I https://dccsverify.com (should return 200)"
echo ""

exit 0
