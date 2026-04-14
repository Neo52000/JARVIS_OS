@echo off
REM ══════════════════════════════════════════════════
REM JARVIS BUSINESS OS — Installation (Windows)
REM ══════════════════════════════════════════════════

echo ========================================
echo   JARVIS BUSINESS OS — Install
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.10+ first.
    pause
    exit /b 1
)

echo [OK] Python detected

REM Create virtual environment
echo.
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
echo.
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create data directories
echo.
echo Creating data directories...
mkdir data\chroma 2>nul
mkdir data\logs 2>nul
mkdir data\exports 2>nul

echo.
echo ========================================
echo   Installation complete!
echo ========================================
echo.
echo   1. Edit .env - add your MISTRAL_API_KEY
echo   2. Run: start.bat
echo   3. Open: http://localhost:8000
echo.
pause
