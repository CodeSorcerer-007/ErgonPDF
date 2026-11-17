@echo off
setlocal
cd /d "%~dp0"

echo ====================================================
echo   ErgonPDF In-Place Update and Rebuild Runbook
echo ====================================================

echo [1/4] Checking for git repository updates...
where git >nul 2>&1
if %errorlevel% equ 0 (
    git pull --ff-only
    if %errorlevel% neq 0 (
        echo [WARNING] Git pull failed or branch has diverged. Continuing with local update...
    )
) else (
    echo [INFO] Git not detected; proceeding with dependency check.
)

echo [2/4] Installing updated dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
)

echo [3/4] Rebuilding production assets...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build compilation failed.
    pause
    exit /b 1
)

echo [4/4] Synchronizing with installed desktop instance (if present)...
set "INSTALLED_DIR="
for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF" /v "InstallLocation" 2^>nul ^| findstr "InstallLocation"') do set "INSTALLED_DIR=%%b"
if not defined INSTALLED_DIR if exist "%LOCALAPPDATA%\ErgonPDF\dist" set "INSTALLED_DIR=%LOCALAPPDATA%\ErgonPDF"

if defined INSTALLED_DIR if exist "%INSTALLED_DIR%" (
    echo       Stopping active background service...
    if exist "%INSTALLED_DIR%\stop-ergonpdf.bat" (
        call "%INSTALLED_DIR%\stop-ergonpdf.bat" >nul 2>&1
    ) else (
        call "installer\stop-ergonpdf.bat" >nul 2>&1
    )
    echo       Deploying updated assets to "%INSTALLED_DIR%"...
    xcopy /E /I /Y /Q "dist" "%INSTALLED_DIR%\dist" >nul
    copy /Y "installer\serve.cjs" "%INSTALLED_DIR%\serve.cjs" >nul
    copy /Y "installer\ErgonPDF.bat" "%INSTALLED_DIR%\ErgonPDF.bat" >nul
    copy /Y "installer\stop-ergonpdf.bat" "%INSTALLED_DIR%\stop-ergonpdf.bat" >nul
    copy /Y "installer\uninstall.bat" "%INSTALLED_DIR%\uninstall.bat" >nul
    if exist "installer\run-hidden.vbs" copy /Y "installer\run-hidden.vbs" "%INSTALLED_DIR%\run-hidden.vbs" >nul
    echo       Updated desktop installation synchronized successfully.
) else (
    echo       No separate desktop installation detected; local build updated.
    if exist "installer\stop-ergonpdf.bat" call "installer\stop-ergonpdf.bat" >nul 2>&1
)

echo.
echo ====================================================
echo   ErgonPDF Update Completed Successfully!
echo ====================================================
echo To launch the updated app, run launch.bat or open your desktop shortcut.
echo.
exit /b 0
