@echo off
setlocal
cd /d "%~dp0"

echo ====================================================
echo   Stopping ErgonPDF Local Background Service...
echo ====================================================

:: 1. Read PID from .ergon_runtime.json if present
if exist ".ergon_runtime.json" (
    for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-Content -Raw .ergon_runtime.json | ConvertFrom-Json).pid" 2^>nul') do (
        if not "%%i"=="" (
            taskkill /F /PID %%i >nul 2>&1
        )
    )
    del /f /q ".ergon_runtime.json" >nul 2>&1
)

:: 2. Fallback: Terminate any process running serve.cjs
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*serve.cjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1

echo [OK] ErgonPDF server has been stopped.
ping 127.0.0.1 -n 2 >nul
exit /b 0
