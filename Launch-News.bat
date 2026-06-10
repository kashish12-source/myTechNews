@echo off
title Launch MyTechNews Console
echo ==================================================
echo         Starting Daily Tech News Console
echo ==================================================
echo.

cd /d "%~dp0"

echo 1. Launching FastAPI Python Backend Server (Port 3001)...
start /b npm run start:backend > server_output.log 2>&1

echo 2. Launching Vite React Dashboard (Port 5173)...
start /b npm run dev:frontend > client_output.log 2>&1

echo.
echo 3. Waiting for servers to initialize...
timeout /t 4 /nobreak > NUL

echo.
echo 4. Opening Dashboard in your browser...
start http://localhost:5173

echo.
echo ==================================================
echo Dashboard launched! Keep this window open to run.
echo To close, press Ctrl+C or close this window.
echo ==================================================
pause
