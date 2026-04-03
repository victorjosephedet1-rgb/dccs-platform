#!/bin/bash

# Smoke tests for critical user flows
# Tests the most important features users need

set -e

BASE_URL=${1:-"https://dccsverify.com"}

echo "🧪 Running smoke tests on $BASE_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED_TESTS=0

run_test() {
  local test_name=$1
  local url=$2
  local search_text=$3

  echo -n "Testing: $test_name... "

  response=$(curl -s "$url")
  status=$?

  if [ $status -eq 0 ]; then
    if [ -n "$search_text" ]; then
      if echo "$response" | grep -q "$search_text"; then
        echo -e "${GREEN}✓ Passed${NC}"
      else
        echo -e "${RED}✗ Failed${NC} (content not found: $search_text)"
        ((FAILED_TESTS++))
      fi
    else
      echo -e "${GREEN}✓ Passed${NC}"
    fi
  else
    echo -e "${RED}✗ Failed${NC} (curl error: $status)"
    ((FAILED_TESTS++))
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Critical User Flows"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Homepage loads" "$BASE_URL" "V3B Music"
run_test "Login page accessible" "$BASE_URL/login" "Login"
run_test "Registration page accessible" "$BASE_URL/register" "Register"
run_test "Music sector loads" "$BASE_URL/music" ""
run_test "Video sector loads" "$BASE_URL/video" ""
run_test "Podcast sector loads" "$BASE_URL/podcast" ""
run_test "Booking sector loads" "$BASE_URL/booking" ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Legal & Compliance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Privacy policy accessible" "$BASE_URL/legal/privacy-policy.html" "Privacy"
run_test "Terms of service accessible" "$BASE_URL/legal/terms-of-service.html" "Terms"
run_test "Cookie policy accessible" "$BASE_URL/legal/cookie-policy.html" "Cookie"
run_test "DMCA policy accessible" "$BASE_URL/legal/dmca-policy.html" "DMCA"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PWA & SEO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "Manifest file accessible" "$BASE_URL/manifest.json" "V3B Music"
run_test "Robots.txt accessible" "$BASE_URL/robots.txt" ""
run_test "Sitemap accessible" "$BASE_URL/sitemap.xml" "sitemap"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "JavaScript & Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Testing: JavaScript bundle loads... "
html=$(curl -s "$BASE_URL")
if echo "$html" | grep -q "script.*src="; then
  echo -e "${GREEN}✓ Passed${NC}"
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED_TESTS++))
fi

echo -n "Testing: CSS loads... "
if echo "$html" | grep -q "stylesheet"; then
  echo -e "${GREEN}✓ Passed${NC}"
else
  echo -e "${RED}✗ Failed${NC}"
  ((FAILED_TESTS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✓ All smoke tests passed!${NC}"
  echo "🎉 Critical user flows are working"
  exit 0
else
  echo -e "${RED}✗ $FAILED_TESTS test(s) failed${NC}"
  echo "⚠️  Critical issues detected"
  exit 1
fi
