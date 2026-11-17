@echo off
setlocal
cd /d "%~dp0"

echo ====================================================
echo   ErgonPDF Windows Uninstallation Wrapper
echo ====================================================

if exist "installer\uninstall.bat" (
    call "installer\uninstall.bat" %*
) else (
    echo [ERROR] Could not find installer\uninstall.bat
    pause
    exit /b 1
)
