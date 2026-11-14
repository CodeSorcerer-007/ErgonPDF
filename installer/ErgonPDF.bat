@echo off
setlocal
cd /d "%~dp0"

:: 1. Verify Node.js is present
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js runtime was not found on this system.
    echo Please install Node.js from https://nodejs.org or run install-ergonpdf.bat again.
    pause
    exit /b 1
)

:: 2. Check if ErgonPDF server is already running and healthy
powershell -NoProfile -Command "(Invoke-WebRequest -Uri 'http://127.0.0.1:8074/healthz' -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode" 2>nul | findstr "200" >nul
if %errorlevel% equ 0 (
    start "" "http://127.0.0.1:8074"
    exit /b 0
)

:: 3. Launch background server silently
if exist "run-hidden.vbs" (
    wscript //nologo "run-hidden.vbs"
) else (
    start /b "" node serve.cjs
)

:: 4. Wait briefly for server to bind and verify
set /a retries=0
:wait_loop
ping 127.0.0.1 -n 2 >nul
set /a retries+=1
powershell -NoProfile -Command "(Invoke-WebRequest -Uri 'http://127.0.0.1:8074/healthz' -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode" 2>nul | findstr "200" >nul
if %errorlevel% equ 0 (
    start "" "http://127.0.0.1:8074"
    exit /b 0
)
if %retries% lss 4 goto wait_loop

:: Final fallback open
start "" "http://127.0.0.1:8074"
exit /b 0
