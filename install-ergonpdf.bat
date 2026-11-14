@echo off
setlocal
cd /d "%~dp0"

if exist "installer\install-ergonpdf.bat" (
    call "installer\install-ergonpdf.bat" %*
) else (
    echo [ERROR] Could not find installer\install-ergonpdf.bat.
    pause
    exit /b 1
)
