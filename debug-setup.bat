@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

cls
echo.
echo DEBUG SETUP
echo.

echo Step 1: Node.js
node --version
echo errorlevel: %errorlevel%

echo.
echo Step 2: npm
npm --version
echo errorlevel: %errorlevel%

echo.
echo Step 3: PostgreSQL check
where psql >nul 2>&1
echo errorlevel: %errorlevel%

echo.
echo Step 4: Check if backend folder exists
if exist backend (
    echo YES - backend folder exists
) else (
    echo NO - backend folder missing!
)

echo.
echo Step 5: Check if backend\package.json exists
if exist backend\package.json (
    echo YES - backend\package.json exists
) else (
    echo NO - backend\package.json missing!
)

echo.
echo Step 6: List what's in backend
dir backend

echo.
echo Script completed
pause
