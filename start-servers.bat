@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ========================================
echo  AI Interview Bot - Start Servers
echo ========================================
echo.

echo Current directory: %cd%
echo.

echo [1/3] Check Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

echo.
echo [2/3] Check .env...
if not exist .env (
    echo ERROR: .env not found
    pause
    exit /b 1
)
echo OK

echo.
echo [3/3] Starting npm...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

REM Start backend on PORT 5001 to avoid conflicts if 5000 is in use
start "Backend" cmd /k "cd backend && set PORT=5001 && npm run dev"
start "Frontend" cmd /k "cd frontend && npm run dev"

exit /b 0
