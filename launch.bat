@echo off
setlocal
cd /d "%~dp0"

echo ====================================================
echo   Launching ErgonPDF (100%% Local, Zero Cloud)
echo ====================================================

if exist "installer\ErgonPDF.bat" (
    call "installer\ErgonPDF.bat" %*
) else (
    echo [INFO] Starting local preview server...
    start "" "http://127.0.0.1:4173"
    npm run preview
)
