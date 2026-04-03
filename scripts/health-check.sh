#!/bin/bash

# V3B Music Production Health Check Script
# Verifies all critical services are operational

set -e

PRODUCTION_URL="https://dccsverify.com"
STAGING_URL="https://staging--dccs.netlify.app"
ENVIRONMENT=${1:-production}

if [ "$ENVIRONMENT" = "staging" ]; then
  BASE_URL=$STAGING_URL
else
  BASE_URL=$PRODUCTION_URL
fi

echo "🔍 Running health checks for $ENVIRONMENT environment..."
echo "🌐 Base URL: $BASE_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED_CHECKS=0

# Function to check HTTP endpoint
check_endpoint() {
  local url=$1
  local expected_status=${2:-200}
  local description=$3

  echo -n "Checking $description... "

  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

  if [ "$response" = "$expected_status" ]; then
    echo -e "${GREEN}✓ Passed${NC} (HTTP $response)"
  else
    echo -e "${RED}✗ Failed${NC} (HTTP $response, expected $expected_status)"
    ((FAILED_CHECKS++))
  fi
}

# Function to check response time
check_response_time() {
  local url=$1
  local max_time=$2
  local description=$3

  echo -n "Checking $description response time... "

  response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" || echo "999")

  if (( $(echo "$response_time < $max_time" | bc -l) )); then
    echo -e "${GREEN}✓ Passed${NC} (${response_time}s < ${max_time}s)"
  else
    echo -e "${YELLOW}⚠ Slow${NC} (${response_time}s >= ${max_time}s)"
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "$BASE_URL" 200 "Homepage"
check_endpoint "$BASE_URL/login" 200 "Login page"
check_endpoint "$BASE_URL/register" 200 "Registration page"
check_endpoint "$BASE_URL/music" 200 "Music sector"
check_endpoint "$BASE_URL/video" 200 "Video sector"
check_endpoint "$BASE_URL/podcast" 200 "Podcast sector"
check_endpoint "$BASE_URL/booking" 200 "Booking sector"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Static Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "$BASE_URL/manifest.json" 200 "PWA manifest"
check_endpoint "$BASE_URL/robots.txt" 200 "Robots.txt"
check_endpoint "$BASE_URL/sitemap.xml" 200 "Sitemap"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Legal Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "$BASE_URL/legal/privacy-policy.html" 200 "Privacy policy"
check_endpoint "$BASE_URL/legal/terms-of-service.html" 200 "Terms of service"
check_endpoint "$BASE_URL/legal/cookie-policy.html" 200 "Cookie policy"
check_endpoint "$BASE_URL/legal/dmca-policy.html" 200 "DMCA policy"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Performance Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_response_time "$BASE_URL" 2.0 "Homepage"
check_response_time "$BASE_URL/music" 2.0 "Music sector"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Security Headers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Checking HTTPS redirect... "
http_response=$(curl -s -o /dev/null -w "%{http_code}" "http://dccsverify.com" -L || echo "000")
if [ "$http_response" = "200" ]; then
  echo -e "${GREEN}✓ Passed${NC}"
else
  echo -e "${YELLOW}⚠ Check manually${NC}"
fi

echo -n "Checking Content-Security-Policy... "
csp=$(curl -s -I "$BASE_URL" | grep -i "content-security-policy" || echo "")
if [ -n "$csp" ]; then
  echo -e "${GREEN}✓ Present${NC}"
else
  echo -e "${YELLOW}⚠ Not found${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$VITE_SUPABASE_URL" ]; then
  echo -n "Checking Supabase REST API... "
  supabase_response=$(curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL/rest/v1/" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" || echo "000")

  if [ "$supabase_response" = "200" ]; then
    echo -e "${GREEN}✓ Connected${NC}"
  else
    echo -e "${RED}✗ Failed${NC} (HTTP $supabase_response)"
    ((FAILED_CHECKS++))
  fi
else
  echo -e "${YELLOW}⚠ VITE_SUPABASE_URL not set${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED_CHECKS -eq 0 ]; then
  echo -e "${GREEN}✓ All health checks passed!${NC}"
  echo "🎉 $ENVIRONMENT environment is healthy"
  exit 0
else
  echo -e "${RED}✗ $FAILED_CHECKS health check(s) failed${NC}"
  echo "⚠️  $ENVIRONMENT environment has issues"
  exit 1
fi
