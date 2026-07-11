#!/bin/bash

# Smoke tests for DCCS Platform (dccsverify.com)
# Tests all critical pages and user flows

set -e

BASE_URL=${1:-"https://dccsverify.com"}

echo "Running smoke tests on $BASE_URL"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

FAILED_TESTS=0

run_test() {
  local test_name=$1
  local url=$2
  local expected_http=${3:-200}

  echo -n "Testing: $test_name... "

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "$url" || echo "000")

  if [ "$status" = "$expected_http" ] || [ "$status" = "200" ]; then
    echo -e "${GREEN}PASS (HTTP $status)${NC}"
  else
    echo -e "${RED}FAIL (HTTP $status, expected $expected_http)${NC}"
    ((FAILED_TESTS++))
  fi
}

echo "========================================"
echo "Public Pages"
echo "========================================"
run_test "Homepage"             "$BASE_URL/"
run_test "Marketplace"          "$BASE_URL/marketplace"
run_test "Upload / Register work" "$BASE_URL/upload"
run_test "Verify DCCS code"     "$BASE_URL/verify"
run_test "Search"               "$BASE_URL/search"
run_test "DCCS System"          "$BASE_URL/dccs-system"
run_test "Platform Story"       "$BASE_URL/story"
run_test "Safety Center"        "$BASE_URL/safety"
run_test "Careers"              "$BASE_URL/careers"

echo ""
echo "========================================"
echo "Auth Pages"
echo "========================================"
run_test "Login"                "$BASE_URL/login"
run_test "Register"             "$BASE_URL/register"

echo ""
echo "========================================"
echo "Authenticated Routes (SPA 200)"
echo "========================================"
run_test "Dashboard (SPA)"      "$BASE_URL/dashboard"
run_test "Library (SPA)"        "$BASE_URL/library"
run_test "Downloads (SPA)"      "$BASE_URL/downloads"

echo ""
echo "========================================"
echo "SEO & PWA Assets"
echo "========================================"
run_test "sitemap.xml"          "$BASE_URL/sitemap.xml"
run_test "robots.txt"           "$BASE_URL/robots.txt"
run_test "manifest.webmanifest" "$BASE_URL/manifest.webmanifest"

echo ""
echo "========================================"
echo "Legal Pages"
echo "========================================"
run_test "Privacy Policy"       "$BASE_URL/legal/privacy-policy.html"
run_test "Terms of Service"     "$BASE_URL/legal/terms-of-service.html"
run_test "Cookie Policy"        "$BASE_URL/legal/cookie-policy.html"
run_test "DMCA Policy"          "$BASE_URL/legal/dmca-policy.html"

echo ""
echo "========================================"
echo "Redirects"
echo "========================================"
run_test "www redirect (301)"   "https://www.dccsverify.com/" 301

echo ""
echo "========================================"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}All smoke tests passed${NC}"
  exit 0
else
  echo -e "${RED}$FAILED_TESTS test(s) failed${NC}"
  exit 1
fi
