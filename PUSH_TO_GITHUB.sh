#!/bin/bash

# DCCS Platform - Push to GitHub Script
# Repository: dccs-platform
# Owner: victorjosephedet1-rgb

echo "🚀 Pushing DCCS Platform to GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add remote (if not exists)
git remote add origin https://github.com/victorjosephedet1-rgb/dccs-platform.git 2>/dev/null || true

# Add all files
echo "📁 Adding all project files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit: DCCS Platform - Phase 1 Production Ready

- Digital Creative Copyright System (DCCS)
- Free DCCS registration and verification
- Supabase backend with comprehensive schema
- React + TypeScript + Tailwind CSS frontend
- Production-ready deployment configuration
- Automated Netlify deployment setup

Built by Victor Joseph Edet - Victor360 Brand Limited"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "✅ Done! Your repository is now on GitHub:"
echo "   https://github.com/victorjosephedet1-rgb/dccs-platform"
echo ""
echo "🌐 Next step: Configure Netlify deployment"
