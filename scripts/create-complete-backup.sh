#!/bin/bash

# Complete Backup Script for V3BMusic Platform
# Creates a comprehensive backup of all project files

set -e

echo "=========================================="
echo "V3BMusic Platform - Complete Backup"
echo "=========================================="

# Create timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/complete-backup-${TIMESTAMP}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo ""
echo "Step 1: Backing up source code..."
echo "-----------------------------------"

# Copy all source files
cp -r src "${BACKUP_DIR}/"
cp -r public "${BACKUP_DIR}/"
cp -r supabase "${BACKUP_DIR}/"
cp -r blockchain "${BACKUP_DIR}/" 2>/dev/null || echo "No blockchain folder"
cp -r scripts "${BACKUP_DIR}/"

echo "✓ Source code backed up"

echo ""
echo "Step 2: Backing up configuration files..."
echo "------------------------------------------"

# Copy configuration files
cp package.json "${BACKUP_DIR}/"
cp package-lock.json "${BACKUP_DIR}/" 2>/dev/null || true
cp tsconfig.json "${BACKUP_DIR}/"
cp vite.config.ts "${BACKUP_DIR}/"
cp tailwind.config.js "${BACKUP_DIR}/"
cp netlify.toml "${BACKUP_DIR}/"
cp .nvmrc "${BACKUP_DIR}/" 2>/dev/null || true

echo "✓ Configuration files backed up"

echo ""
echo "Step 3: Backing up documentation..."
echo "-------------------------------------"

# Copy all markdown files
find . -maxdepth 1 -name "*.md" -exec cp {} "${BACKUP_DIR}/" \;
find . -maxdepth 1 -name "*.txt" -exec cp {} "${BACKUP_DIR}/" \;

# Copy important documentation
cp LICENSE "${BACKUP_DIR}/"
cp COPYRIGHT "${BACKUP_DIR}/"
cp BACKUP_AND_OWNERSHIP_GUIDE.md "${BACKUP_DIR}/"

echo "✓ Documentation backed up"

echo ""
echo "Step 4: Backing up environment template..."
echo "-------------------------------------------"

# Copy environment template (NOT actual .env with secrets)
cp .env.example "${BACKUP_DIR}/"
echo "✓ Environment template backed up"
echo "⚠️  Remember to backup your actual .env file separately!"

echo ""
echo "Step 5: Creating backup archive..."
echo "-----------------------------------"

# Create compressed archive
cd backups
tar -czf "v3bmusic-complete-backup-${TIMESTAMP}.tar.gz" "complete-backup-${TIMESTAMP}"
cd ..

ARCHIVE_SIZE=$(du -h "backups/v3bmusic-complete-backup-${TIMESTAMP}.tar.gz" | cut -f1)

echo "✓ Archive created: v3bmusic-complete-backup-${TIMESTAMP}.tar.gz"
echo "  Size: ${ARCHIVE_SIZE}"

echo ""
echo "Step 6: Creating backup manifest..."
echo "------------------------------------"

# Create manifest file
cat > "${BACKUP_DIR}/BACKUP_MANIFEST.txt" << EOF
V3BMusic Platform - Complete Backup
====================================

Backup Date: $(date)
Backup ID: ${TIMESTAMP}

Contents:
---------
✓ Complete source code (frontend)
✓ Supabase migrations and functions
✓ Blockchain smart contracts
✓ Configuration files
✓ Build and deployment scripts
✓ Documentation (100+ files)
✓ LICENSE and COPYRIGHT files

Not Included (Backup Separately):
----------------------------------
⚠️  .env file (contains secrets - backup manually)
⚠️  node_modules (reinstall with npm install)
⚠️  Supabase database data (export from dashboard)
⚠️  Storage bucket files (download from Supabase)

Restoration Instructions:
-------------------------
1. Extract: tar -xzf v3bmusic-complete-backup-${TIMESTAMP}.tar.gz
2. Install: npm install
3. Configure: Copy your .env file
4. Run: npm run dev

Git Repository:
---------------
Primary: https://github.com/yourusername/v3bmusic
Ensure git repository is also backed up separately

Owner Information:
------------------
Platform: V3BMusic (v3bmusic.ai)
Creator: [Add Your Name]
Copyright: 2024-2026

This backup proves your ownership and allows complete
platform restoration independent of any cloud service.
EOF

echo "✓ Manifest created"

echo ""
echo "=========================================="
echo "Backup Complete!"
echo "=========================================="
echo ""
echo "Location: backups/v3bmusic-complete-backup-${TIMESTAMP}.tar.gz"
echo "Size: ${ARCHIVE_SIZE}"
echo ""
echo "Next Steps:"
echo "----------"
echo "1. Copy backup to external drive/USB"
echo "2. Upload to encrypted cloud storage"
echo "3. Keep in secure location"
echo ""
echo "Don't Forget:"
echo "-------------"
echo "• Backup your .env file separately (contains API keys)"
echo "• Export Supabase database from dashboard"
echo "• Download storage bucket files if needed"
echo "• Keep git repository synced to GitHub"
echo ""
echo "You own this platform completely!"
echo "=========================================="
