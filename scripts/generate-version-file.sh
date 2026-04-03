#!/bin/bash

# ====================================================================
# VERSION FILE GENERATOR
# ====================================================================
#
# PURPOSE:
#   Creates a version.json file containing deployment metadata
#   Enables version display in app and proper cache busting
#
# USAGE:
#   bash scripts/generate-version-file.sh
#
# OUTPUT:
#   public/version.json
#
# RUNS:
#   Automatically during GitHub Actions build
#   Can be run manually for local builds
#
# ====================================================================

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}Generating version file...${NC}"

# Get Git information
if git rev-parse --git-dir > /dev/null 2>&1 && git rev-parse HEAD > /dev/null 2>&1; then
  COMMIT_HASH=$(git rev-parse HEAD)
  COMMIT_SHORT=$(git rev-parse --short HEAD)
  COMMIT_MESSAGE=$(git log -1 --pretty=%B | head -n 1)
  COMMIT_AUTHOR=$(git log -1 --pretty=%an)
  COMMIT_DATE=$(git log -1 --pretty=%aI)
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
else
  COMMIT_HASH="production-ready"
  COMMIT_SHORT="prod"
  COMMIT_MESSAGE="DCCS Platform Production Deployment"
  COMMIT_AUTHOR="Victor Joseph Edet"
  COMMIT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  BRANCH="main"
fi

# Get build timestamp
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get version from package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")

# GitHub Actions environment variables (if available)
GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER:-"local"}
GITHUB_ACTOR=${GITHUB_ACTOR:-$COMMIT_AUTHOR}

# Create version.json
cat > public/version.json << EOF
{
  "version": "${VERSION}",
  "commit": {
    "hash": "${COMMIT_HASH}",
    "short": "${COMMIT_SHORT}",
    "message": "${COMMIT_MESSAGE}",
    "author": "${COMMIT_AUTHOR}",
    "date": "${COMMIT_DATE}",
    "branch": "${BRANCH}"
  },
  "build": {
    "number": "${GITHUB_RUN_NUMBER}",
    "timestamp": "${BUILD_TIMESTAMP}",
    "actor": "${GITHUB_ACTOR}"
  },
  "deployment": {
    "platform": "Netlify",
    "url": "https://dccs.platform"
  }
}
EOF

echo -e "${GREEN}✓ Version file generated${NC}"
echo "  Version: ${VERSION}"
echo "  Commit: ${COMMIT_SHORT}"
echo "  Build: ${GITHUB_RUN_NUMBER}"
echo "  File: public/version.json"
