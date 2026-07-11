#!/bin/bash
#
# DCCS Platform Home Base Sync System
# Automatically syncs local codebase with GitHub repository
# By Victor360 Brand Limited
#
# Usage:
#   ./home-base-sync.sh              - Manual sync
#   ./home-base-sync.sh --install    - Install as cron job (runs every 5 min)
#   ./home-base-sync.sh --uninstall  - Remove cron job
#   ./home-base-sync.sh --status     - Check sync status
#

set -e

# Configuration
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$REPO_DIR/.sync-log.txt"
BRANCH="main"
REMOTE="origin"
MAX_LOG_ENTRIES=100

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" >> "$LOG_FILE"
    echo -e "${BLUE}[$timestamp]${NC} $1"
}

log_success() {
    log "${GREEN}$1${NC}"
}

log_error() {
    log "${RED}ERROR: $1${NC}"
}

log_warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Trim log file if too large
trim_log() {
    if [ -f "$LOG_FILE" ]; then
        lines=$(wc -l < "$LOG_FILE")
        if [ "$lines" -gt "$MAX_LOG_ENTRIES" ]; then
            tail -n $MAX_LOG_ENTRIES "$LOG_FILE" > "$LOG_FILE.tmp"
            mv "$LOG_FILE.tmp" "$LOG_FILE"
        fi
    fi
}

# Check if we're in a git repository
check_git_repo() {
    if [ ! -d "$REPO_DIR/.git" ]; then
        log_error "Not a git repository: $REPO_DIR"
        log "Initializing git repository..."
        cd "$REPO_DIR"
        git init
        git remote add origin https://github.com/YOUR_USERNAME/dccs-platform.git 2>/dev/null || true
        log_success "Git repository initialized. Update the remote URL with your actual GitHub repo."
        return 1
    fi
    return 0
}

# Check for uncommitted changes
has_uncommitted_changes() {
    cd "$REPO_DIR"
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        return 0
    fi
    return 1
}

# Stash any local changes
stash_changes() {
    if has_uncommitted_changes; then
        log_warning "Uncommitted changes detected, stashing..."
        cd "$REPO_DIR"
        git stash push -m "Auto-stash before sync $(date '+%Y%m%d-%H%M%S')"
        log_success "Changes stashed"
        return 0
    fi
    return 1
}

# Pop stashed changes
pop_stash() {
    cd "$REPO_DIR"
    if git stash list | grep -q .; then
        log "Restoring stashed changes..."
        git stash pop
        log_success "Stashed changes restored"
    fi
}

# Fetch latest from remote
fetch_latest() {
    cd "$REPO_DIR"
    log "Fetching latest from $REMOTE/$BRANCH..."
    git fetch "$REMOTE" "$BRANCH" 2>&1 | while read -r line; do
        log "$line"
    done
}

# Check if we're behind remote
is_behind_remote() {
    cd "$REPO_DIR"
    local local_rev=$(git rev-parse HEAD 2>/dev/null)
    local remote_rev=$(git rev-parse "$REMOTE/$BRANCH" 2>/dev/null)

    if [ "$local_rev" = "$remote_rev" ]; then
        return 1  # Not behind
    fi

    # Check if remote has commits we don't have
    local merge_base=$(git merge-base HEAD "$REMOTE/$BRANCH" 2>/dev/null)
    if [ "$merge_base" != "$remote_rev" ]; then
        return 0  # Behind
    fi
    return 1
}

# Pull latest changes
pull_latest() {
    cd "$REPO_DIR"

    local stashed=0
    if stash_changes; then
        stashed=1
    fi

    log "Pulling latest changes..."

    if git pull "$REMOTE" "$BRANCH" 2>&1 | while read -r line; do
        log "$line"
    done; then
        log_success "Successfully pulled latest changes"
    else
        log_error "Failed to pull changes. Check for merge conflicts."
        if [ $stashed -eq 1 ]; then
            pop_stash
        fi
        return 1
    fi

    if [ $stashed -eq 1 ]; then
        pop_stash
    fi

    return 0
}

# Install as cron job
install_cron() {
    log "Installing home base sync as cron job..."

    local script_path="$REPO_DIR/scripts/home-base-sync.sh"
    local cron_entry="*/5 * * * * $script_path --cron >> $LOG_FILE 2>&1"

    # Check if already installed
    if crontab -l 2>/dev/null | grep -q "home-base-sync"; then
        log_warning "Cron job already installed"
        return
    fi

    # Add to crontab
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -

    log_success "Cron job installed - will sync every 5 minutes"
}

# Uninstall cron job
uninstall_cron() {
    log "Removing home base sync cron job..."

    crontab -l 2>/dev/null | grep -v "home-base-sync" | crontab -

    log_success "Cron job removed"
}

# Show sync status
show_status() {
    cd "$REPO_DIR"

    echo ""
    echo -e "${BLUE}=== DCCS Platform Home Base Sync Status ===${NC}"
    echo ""

    if [ ! -d ".git" ]; then
        echo -e "  ${RED}Not a git repository${NC}"
        echo "  Run with --setup to initialize"
        return
    fi

    echo -e "  ${GREEN}Repository:${NC} $REPO_DIR"
    echo ""

    local current_branch=$(git branch --show-current 2>/dev/null)
    echo -e "  ${GREEN}Current Branch:${NC} $current_branch"

    local local_rev=$(git rev-parse HEAD 2>/dev/null | cut -c1-7)
    echo -e "  ${GREEN}Local Commit:${NC} $local_rev"

    local remote_url=$(git remote get-url "$REMOTE" 2>/dev/null)
    echo -e "  ${GREEN}Remote URL:${NC} $remote_url"

    # Check cron status
    if crontab -l 2>/dev/null | grep -q "home-base-sync"; then
        echo -e "  ${GREEN}Auto-sync:${NC} Enabled (cron job active)"
    else
        echo -e "  ${YELLOW}Auto-sync:${NC} Disabled"
    fi

    echo ""

    # Check for uncommitted changes
    if has_uncommitted_changes; then
        echo -e "  ${YELLOW}Local Changes:${NC} Uncommitted changes detected"
        git status -s
    else
        echo -e "  ${GREEN}Local Changes:${NC} Working directory clean"
    fi

    echo ""

    # Check if behind/ahead of remote
    fetch_latest >/dev/null 2>&1

    local ahead=$(git rev-list --count HEAD.."$REMOTE/$BRANCH" 2>/dev/null || echo "0")
    local behind=$(git rev-list --count "$REMOTE/$BRANCH"..HEAD 2>/dev/null || echo "0")

    if [ "$ahead" -gt 0 ]; then
        echo -e "  ${YELLOW}Behind Remote:${NC} $ahead commits (run sync to update)"
    else
        echo -e "  ${GREEN}Behind Remote:${NC} 0 commits (up to date)"
    fi

    if [ "$behind" -gt 0 ]; then
        echo -e "  ${YELLOW}Ahead of Remote:${NC} $behind commits (consider pushing)"
    else
        echo -e "  ${GREEN}Ahead of Remote:${NC} 0 commits"
    fi

    echo ""

    # Recent log entries
    if [ -f "$LOG_FILE" ]; then
        echo -e "  ${BLUE}Recent Sync Activity:${NC}"
        tail -n 5 "$LOG_FILE" | sed 's/^/    /'
    fi

    echo ""
}

# Setup git repository
setup_repo() {
    cd "$REPO_DIR"

    log "Setting up DCCS Platform Home Base repository..."

    if [ -d ".git" ]; then
        log_warning "Git repository already exists"
        return
    fi

    git init
    git branch -M "$BRANCH"

    log_success "Git repository initialized"
    log "Next steps:"
    log "  1. Create repository on GitHub: https://github.com/new"
    log "  2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/dccs-platform.git"
    log "  3. Push: git push -u origin $BRANCH"
    log "  4. Install auto-sync: ./scripts/home-base-sync.sh --install"
}

# Main sync function
sync() {
    trim_log

    log "=========================================="
    log "DCCS Platform Home Base Sync Starting"
    log "=========================================="

    if ! check_git_repo; then
        setup_repo
        exit 0
    fi

    fetch_latest

    if is_behind_remote; then
        log "Updates available from remote"
        if pull_latest; then
            log_success "Sync complete - local codebase updated"
        else
            log_error "Sync failed - manual intervention required"
            exit 1
        fi
    else
        log_success "Already up to date with $REMOTE/$BRANCH"
    fi

    log "=========================================="
}

# Run in cron mode (silent except for errors)
cron_sync() {
    trim_log

    cd "$REPO_DIR" 2>/dev/null || exit 1

    fetch_latest >/dev/null 2>&1

    if is_behind_remote; then
        if stash_changes >/dev/null 2>&1; then
            git pull "$REMOTE" "$BRANCH" >/dev/null 2>&1
            pop_stash >/dev/null 2>&1
            log_success "Auto-synced latest changes"
        fi
    fi
}

# Parse arguments
case "${1:-}" in
    --install|-i)
        install_cron
        ;;
    --uninstall|-u)
        uninstall_cron
        ;;
    --status|-s)
        show_status
        ;;
    --setup)
        setup_repo
        ;;
    --cron)
        cron_sync
        ;;
    --help|-h)
        echo "DCCS Platform Home Base Sync System"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --install, -i    Install auto-sync cron job (every 5 min)"
        echo "  --uninstall, -u  Remove auto-sync cron job"
        echo "  --status, -s    Show sync status"
        echo "  --setup         Initialize git repository"
        echo "  --cron          Run in cron mode (silent)"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              # Sync now"
        echo "  $0 --install    # Enable auto-sync"
        echo "  $0 --status     # Check status"
        ;;
    *)
        sync
        ;;
esac
