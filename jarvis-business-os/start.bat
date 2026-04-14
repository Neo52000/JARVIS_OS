@echo off
REM JARVIS BUSINESS OS — Start Server
cd /d "%~dp0"
call venv\Scripts\activate.bat 2>nul

echo.
echo   JARVIS BUSINESS OS
echo   Dashboard: http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.

REM Open browser after 2 seconds
start "" /B cmd /c "timeout /t 2 >nul && start http://localhost:8000"

REM Start server
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
