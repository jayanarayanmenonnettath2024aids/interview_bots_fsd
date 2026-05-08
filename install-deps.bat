@echo off
cd /d "%~dp0"

echo ========================================
echo  Installing Dependencies
echo ========================================
echo.

echo Current directory: %cd%
echo.

echo Step 1: Backend
echo Changing to backend directory...
cd backend
echo Now in: %cd%
echo Running npm install...
call npm install
if errorlevel 1 (
    echo FAILED to install backend
    cd ..
    pause
    exit /b 1
)
echo Backend done
cd ..

echo.
echo Step 2: Frontend
echo Changing to frontend directory...
cd frontend
echo Now in: %cd%
echo Running npm install...
call npm install
if errorlevel 1 (
    echo FAILED to install frontend
    cd ..
    pause
    exit /b 1
)
echo Frontend done
cd ..

echo.
echo ========================================
echo Installation Complete
echo ========================================
echo.
echo Next: start-servers.bat
echo.
pause
