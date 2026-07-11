@echo off
setlocal enabledelayedexpansion
color 0A
echo ============================================================
echo    DCCS PLATFORM - PROJECT LOCATOR AND GITHUB PUSH
echo ============================================================
echo.
echo This script will:
echo 1. Search for your DCCS project folder
echo 2. Show Git status
echo 3. Push to GitHub
echo.
echo ============================================================
echo.

REM Store found paths
set "FOUND_PATH="
set "MOST_RECENT_PATH="
set "MOST_RECENT_DATE=0"

echo [STEP 1] Searching for project folders...
echo.

REM Check common locations
for %%d in (
    "C:\Users\%USERNAME%\Projects\dccs-platform"
    "C:\Users\%USERNAME%\Documents\dccs-platform"
    "C:\Users\%USERNAME%\Desktop\dccs-platform"
    "C:\Users\%USERNAME%\Downloads\dccs-platform"
    "C:\Users\%USERNAME%\Documents\GitHub\dccs-platform"
    "C:\Users\%USERNAME%\source\repos\dccs-platform"
) do (
    if exist %%d (
        echo [FOUND] %%d
        set "FOUND_PATH=%%d"
        goto :found_project
    )
)

echo [INFO] Not found in common locations. Searching deeper...
echo.

REM Deep search in user directory
echo Searching C:\Users\%USERNAME% for dccs-platform...
for /f "tokens=*" %%i in ('dir "C:\Users\%USERNAME%" /s /b /ad 2^>nul ^| findstr /i "\\dccs-platform$"') do (
    echo [FOUND] %%i
    set "FOUND_PATH=%%i"
    goto :found_project
)

echo.
echo Searching for v3bmusic folders...
for /f "tokens=*" %%i in ('dir "C:\Users\%USERNAME%" /s /b /ad 2^>nul ^| findstr /i "\\v3bmusic$"') do (
    echo [FOUND] %%i
    set "FOUND_PATH=%%i"
    goto :found_project
)

echo.
echo Searching for DCCS folders...
for /f "tokens=*" %%i in ('dir "C:\Users\%USERNAME%" /s /b /ad 2^>nul ^| findstr /i "\\DCCS$"') do (
    echo [FOUND] %%i
    set "FOUND_PATH=%%i"
    goto :found_project
)

echo.
echo ============================================================
echo [ERROR] Could not find DCCS project folder.
echo.
echo Please check if you have the project saved anywhere.
echo Alternatively, download from bolt.new or your GitHub repo.
echo ============================================================
pause
exit /b 1

:found_project
echo.
echo ============================================================
echo [SUCCESS] Project located!
echo ============================================================
echo.
echo Path: %FOUND_PATH%
echo.

REM Check for package.json
if exist "%FOUND_PATH%\package.json" (
    echo [OK] package.json found - This is a valid project
) else (
    echo [WARNING] No package.json - may not be the right folder
)

REM Check for .git folder
if exist "%FOUND_PATH%\.git" (
    echo [OK] Git repository detected
) else (
    echo [INFO] Not a git repository yet
)

echo.
echo ============================================================
echo Press any key to navigate to this folder and check status...
pause >nul

cd /d "%FOUND_PATH%"

echo.
echo Current directory: %CD%
echo.
echo ============================================================
echo [STEP 2] Git Status Check
echo ============================================================
echo.

git status 2>nul
if errorlevel 1 (
    echo [INFO] Initializing Git repository...
    git init
    git branch -M main
)

echo.
echo ============================================================
echo [STEP 3] Remote Configuration
echo ============================================================
echo.

git remote -v 2>nul
if errorlevel 1 (
    echo [INFO] Adding GitHub remote...
    git remote add origin https://github.com/victorjosephedet1-rgb/dccs-platform.git
)

echo.
echo ============================================================
echo [STEP 4] Branch Information
echo ============================================================
echo.

git branch 2>nul

echo.
echo ============================================================
echo Ready to push to GitHub?
echo.
echo This will:
echo   1. Add all files
echo   2. Commit changes
echo   3. Push to main branch
echo.
echo Which will trigger automatic deployment to:
echo   - GitHub: https://github.com/victorjosephedet1-rgb/dccs-platform
echo   - Website: https://dccsverify.com
echo   - Google: Re-index notification
echo.
echo Press Y to continue or N to cancel...
echo ============================================================

choice /c YN /n /m "Your choice: "
if errorlevel 2 (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Adding files...
git add .

echo.
echo Creating commit...
git commit -m "Update DCCS Platform - %date% %time%"

echo.
echo Pushing to GitHub...
git push -u origin main --force

echo.
echo ============================================================
echo [SUCCESS] Pushed to GitHub!
echo ============================================================
echo.
echo Repository: https://github.com/victorjosephedet1-rgb/dccs-platform
echo Website:    https://dccsverify.com
echo.
echo GitHub Actions will now:
echo   1. Build your project
echo   2. Deploy to Netlify
echo   3. Update dccsverify.com
echo   4. Ping Google for re-indexing
echo.
echo Check deployment status at:
echo   https://github.com/victorjosephedet1-rgb/dccs-platform/actions
echo.
echo ============================================================
pause
