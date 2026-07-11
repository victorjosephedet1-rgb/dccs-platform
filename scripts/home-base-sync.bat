@echo off
REM DCCS Platform Home Base Sync System for Windows
REM Automatically syncs local codebase with GitHub repository
REM By Victor360 Brand Limited
REM
REM Usage:
REM   home-base-sync.bat              - Manual sync
REM   home-base-sync.bat install       - Install as scheduled task
REM   home-base-sync.bat uninstall     - Remove scheduled task
REM   home-base-sync.bat status        - Check sync status

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set REPO_DIR=%SCRIPT_DIR%..
set LOG_FILE=%REPO_DIR%\.sync-log.txt
set BRANCH=main
set REMOTE_NAME=origin

REM Colors (Windows 10+)
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Change to repo directory
cd /d "%REPO_DIR%"

:main
if "%1"=="" goto sync
if "%1"=="install" goto install
if "%1"=="uninstall" goto uninstall
if "%1"=="status" goto status
if "%1"=="--help" goto help
if "%1"=="-h" goto help
goto sync

:log
echo %BLUE%[%date% %time%]%NC% %* >> "%LOG_FILE%"
echo %BLUE%[%date% %time%]%NC% %*
goto :eof

:log_success
call :log %GREEN%SUCCESS:%NC% %*
goto :eof

:log_error
call :log %RED%ERROR:%NC% %*
goto :eof

:log_warning
call :log %YELLOW%WARNING:%NC% %*
goto :eof

:check_git
if not exist .git (
    call :log_error "Not a git repository"
    call :log "Initializing git repository..."
    git init
    call :log_success "Git repository initialized"
    call :log "Next: git remote add origin https://github.com/YOUR_USERNAME/dccs-platform.git"
    exit /b 1
)
exit /b 0

:sync
call :log "=========================================="
call :log "DCCS Platform Home Base Sync Starting"
call :log "=========================================="

call :check_git
if errorlevel 1 goto :eof

call :log "Fetching latest from %REMOTE_NAME%/%BRANCH%..."
git fetch %REMOTE_NAME% %BRANCH% 2>&1

REM Check if behind remote
git rev-parse HEAD > nul 2>&1
for /f "tokens=*" %%a in ('git rev-parse HEAD') do set LOCAL_REV=%%a
for /f "tokens=*" %%a in ('git rev-parse %REMOTE_NAME%/%BRANCH%') do set REMOTE_REV=%%a

if "%LOCAL_REV%"=="%REMOTE_REV%" (
    call :log_success "Already up to date with %REMOTE_NAME%/%BRANCH%"
) else (
    call :log "Updates available from remote, pulling..."
    git stash push -m "Auto-stash before sync" 2>nul
    git pull %REMOTE_NAME% %BRANCH%
    git stash pop 2>nul
    call :log_success "Sync complete - local codebase updated"
)

call :log "=========================================="
goto :eof

:install
call :log "Installing home base sync as scheduled task..."

schtasks /create /tn "DCCS-HomeBase-Sync" /tr "\"%REPO_DIR%\scripts\home-base-sync.bat\" cron" /sc minute /mo 5 /f

if errorlevel 1 (
    call :log_error "Failed to create scheduled task. Run as Administrator."
    goto :eof
)

call :log_success "Scheduled task installed - will sync every 5 minutes"
goto :eof

:uninstall
call :log "Removing home base sync scheduled task..."

schtasks /delete /tn "DCCS-HomeBase-Sync" /f

call :log_success "Scheduled task removed"
goto :eof

:status
echo.
echo === DCCS Platform Home Base Sync Status ===
echo.

if not exist .git (
    echo   %RED%Not a git repository%NC%
    echo   Run with setup to initialize
    goto :eof
)

echo   %GREEN%Repository:%NC% %REPO_DIR%
echo.

for /f "tokens=*" %%a in ('git branch --show-current') do set CURRENT_BRANCH=%%a
echo   %GREEN%Current Branch:%NC% !CURRENT_BRANCH!

for /f "tokens=*" %%a in ('git rev-parse --short HEAD') do set LOCAL_COMMIT=%%a
echo   %GREEN%Local Commit:%NC% !LOCAL_COMMIT!

for /f "tokens=*" %%a in ('git remote get-url %REMOTE_NAME%') do set REMOTE_URL=%%a
echo   %GREEN%Remote URL:%NC% !REMOTE_URL!

REM Check scheduled task
schtasks /query /tn "DCCS-HomeBase-Sync" >nul 2>&1
if errorlevel 1 (
    echo   %YELLOW%Auto-sync:%NC% Disabled
) else (
    echo   %GREEN%Auto-sync:%NC% Enabled ^(scheduled task active^)
)

echo.

REM Check for changes
git diff-index --quiet HEAD 2>nul
if errorlevel 1 (
    echo   %YELLOW%Local Changes:%NC% Uncommitted changes detected
    git status -s
) else (
    echo   %GREEN%Local Changes:%NC% Working directory clean
)

echo.

if exist "%LOG_FILE%" (
    echo   %BLUE%Recent Sync Activity:%NC%
    type "%LOG_FILE%" | findstr /n "." | findstr "^[1-9]:" >nul
    for /f "skip=1 tokens=*" %%L in ('type "%LOG_FILE%" ^| more +1') do (
        echo     %%L
    )
)

echo.
goto :eof

:cron
REM Silent mode for scheduled task
cd /d "%REPO_DIR%"
git fetch %REMOTE_NAME% %BRANCH% >nul 2>&1

git diff --quiet HEAD %REMOTE_NAME%/%BRANCH% >nul 2>&1
if errorlevel 1 (
    git stash push -m "Auto-stash" >nul 2>&1
    git pull %REMOTE_NAME% %BRANCH% >nul 2>&1
    git stash pop >nul 2>&1
    echo [%date% %time%] Auto-synced latest changes >> "%LOG_FILE%"
)
goto :eof

:help
echo DCCS Platform Home Base Sync System
echo.
echo Usage: %~nx0 [option]
echo.
echo Options:
echo   install     Install auto-sync scheduled task (every 5 min)
echo   uninstall   Remove auto-sync scheduled task
echo   status      Show sync status
echo   --help      Show this help message
echo.
echo Examples:
echo   %~nx0           # Sync now
echo   %~nx0 install   # Enable auto-sync ^(run as Admin^)
echo   %~nx0 status    # Check status
goto :eof
