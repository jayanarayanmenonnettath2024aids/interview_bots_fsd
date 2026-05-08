@echo off
REM ========================================
REM AI Interview Bot - Diagnostic Script
REM Use this to check what's working
REM ========================================

cls
echo.
echo ========================================
echo  Diagnostic Check
echo ========================================
echo.

echo Checking Node.js...
node --version
echo.

echo Checking npm...
npm --version
echo.

echo Checking PostgreSQL...
psql --version
echo.

echo Checking Ollama...
ollama --version
echo.

echo Current directory:
cd
echo.

echo .env exists?
if exist .env (
    echo YES - .env file found
) else (
    echo NO - .env file missing
)
echo.

echo backend\node_modules exists?
if exist backend\node_modules (
    echo YES - backend dependencies installed
) else (
    echo NO - backend dependencies NOT installed
)
echo.

echo frontend\node_modules exists?
if exist frontend\node_modules (
    echo YES - frontend dependencies installed
) else (
    echo NO - frontend dependencies NOT installed
)
echo.

echo backend\package.json exists?
if exist backend\package.json (
    echo YES
) else (
    echo NO - MISSING!
)
echo.

echo frontend\package.json exists?
if exist frontend\package.json (
    echo YES
) else (
    echo NO - MISSING!
)
echo.

echo ========================================
echo Diagnostic complete
echo ========================================
echo.
pause
