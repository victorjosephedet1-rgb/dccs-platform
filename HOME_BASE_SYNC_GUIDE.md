# DCCS Platform Home Base Sync System

Automatically keeps your local codebase synchronized with GitHub.

## Quick Start

### 1. Initialize Git Repository (First Time Only)

```bash
cd /path/to/project
./scripts/home-base-sync.sh --setup
```

### 2. Connect to Your GitHub Repository

```bash
# Create a new repository on GitHub first: https://github.com/new
# Then add the remote:
git remote add origin https://github.com/YOUR_USERNAME/dccs-platform.git

# Push your code:
git push -u origin main
```

### 3. Enable Auto-Sync

**macOS/Linux:**
```bash
./scripts/home-base-sync.sh --install
```

**Windows (Run as Administrator):**
```cmd
scripts\home-base-sync.bat install
```

## Commands

| Command | Description |
|---------|-------------|
| `./scripts/home-base-sync.sh` | Manual sync now |
| `./scripts/home-base-sync.sh --install` | Install auto-sync (every 5 min) |
| `./scripts/home-base-sync.sh --uninstall` | Disable auto-sync |
| `./scripts/home-base-sync.sh --status` | Check sync status |
| `./scripts/home-base-sync.sh --help` | Show usage |

## How It Works

1. **Fetch**: Checks GitHub for new commits every 5 minutes
2. **Stash**: Temporarily saves local changes if any
3. **Pull**: Downloads and merges new commits from GitHub
4. **Restore**: Restores your local changes

## Workflow

```
GitHub (Origin)
     │
     │ push when you update code
     ▼
  [GitHub Repo]
     │
     │ auto-pull every 5 minutes
     ▼
[Your Local Machine]
     │
     └──► Always has latest code
```

## Initial Setup Checklist

- [ ] Create GitHub repository
- [ ] Run `home-base-sync.sh --setup`
- [ ] Add remote: `git remote add origin YOUR_REPO_URL`
- [ ] Push: `git push -u origin main`
- [ ] Install auto-sync: `./scripts/home-base-sync.sh --install`
- [ ] Verify: `./scripts/home-base-sync.sh --status`

## Requirements

- Git installed on your system
- GitHub repository with push access
- (Optional) SSH key for password-less authentication

## Troubleshooting

**"fatal: not a git repository"**
```bash
./scripts/home-base-sync.sh --setup
```

**"fatal: 'origin' appears to be a git repository"**
```bash
git remote add origin https://github.com/YOUR_USERNAME/dccs-platform.git
```

**Sync conflicts**
```bash
# Manual resolution
git status
git add .
git commit -m "Resolve conflicts"
git push
```

## Windows Notes

- Run install/uninstall as Administrator
- Scheduled task runs every 5 minutes
- Check logs in `.sync-log.txt`

---
*Victor360 Brand Limited - DCCS Platform*
