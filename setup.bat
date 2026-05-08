@echo off

cd /d "%~dp0"

echo.
echo ========================================
echo  AI Interview Bot - Setup
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version

echo.
echo [2/4] Installing Backend...
cd backend
call npm install --prefer-offline --no-audit
if errorlevel 1 (
    echo FAILED
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Installing Frontend...
cd frontend
call npm install --prefer-offline --no-audit
if errorlevel 1 (
    echo FAILED
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Creating .env...
if not exist .env (
    copy .env.example .env
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next:
echo 1. Create database: psql -U postgres -d ai_interview_bot -f database/schema.sql
echo 2. Start servers: start-servers.bat
echo.
pause

