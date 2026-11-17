@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set "CALLER_DIR=%~dp0"
if "%CALLER_DIR:~-1%"=="\" set "CALLER_DIR=%CALLER_DIR:~0,-1%"

echo ========================================================================
echo   ErgonPDF - Uninstallation Utility
echo ========================================================================
echo.

:: Detect if running from source repository (protect repo from self-deletion)
set "IS_DEV_REPO=0"
if exist "%CALLER_DIR%\..\package.json" set "IS_DEV_REPO=1"
if exist "%CALLER_DIR%\package.json" set "IS_DEV_REPO=1"
if exist "%CALLER_DIR%\..\.git" set "IS_DEV_REPO=1"
if exist "%CALLER_DIR%\.git" set "IS_DEV_REPO=1"

:: Resolve installed application directory from registry or default LOCALAPPDATA
set "INSTALLED_DIR="
for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF" /v "InstallLocation" 2^>nul ^| findstr "InstallLocation"') do set "INSTALLED_DIR=%%b"
if not defined INSTALLED_DIR set "INSTALLED_DIR=%LOCALAPPDATA%\ErgonPDF"

if "%IS_DEV_REPO%"=="1" (
    echo [DEVELOPER MODE] Running uninstaller from source repository.
    echo Target Installation Location: %INSTALLED_DIR%
    echo Repository files will be strictly preserved.
) else (
    echo Application Directory: %CALLER_DIR%
)
echo.

if /i not "%~1"=="/y" if /i not "%~1"=="-y" if /i not "%~1"=="/s" if /i not "%~1"=="-s" (
    set /p "CONFIRM=Are you sure you want to uninstall ErgonPDF? (Y/N): "
    if /i "!CONFIRM!" neq "Y" (
        echo [INFO] Uninstallation cancelled by user.
        pause
        exit /b 0
    )
)

echo.
echo [1/4] Stopping any active ErgonPDF background services...
if exist "stop-ergonpdf.bat" (
    call "stop-ergonpdf.bat" >nul 2>&1
) else if exist "%INSTALLED_DIR%\stop-ergonpdf.bat" (
    call "%INSTALLED_DIR%\stop-ergonpdf.bat" >nul 2>&1
) else (
    powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*serve.cjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1
)

echo [2/4] Removing Desktop and Start Menu shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop); if ($d) { Remove-Item (Join-Path $d 'ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue }; $dd = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory); if ($dd) { Remove-Item (Join-Path $dd 'ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue }; $p = [Environment]::GetFolderPath([Environment+SpecialFolder]::Programs); if ($p) { Remove-Item (Join-Path $p 'ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue }; Remove-Item (Join-Path $env:USERPROFILE 'Desktop\ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue; Remove-Item (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue;" >nul 2>&1

echo [3/4] Removing Windows Add/Remove Programs registration...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF" /f >nul 2>&1

echo [4/4] Removing installed application files...
if "%IS_DEV_REPO%"=="1" (
    if exist "%INSTALLED_DIR%" (
        rd /s /q "%INSTALLED_DIR%" >nul 2>&1
        echo       Cleaned deployed files in: %INSTALLED_DIR%
    ) else (
        echo       No deployed application files found in: %INSTALLED_DIR%
    )
    echo       Source repository files safely preserved.
    echo.
    echo ========================================================================
    echo   ErgonPDF desktop installation has been uninstalled.
    echo ========================================================================
    exit /b 0
) else (
    echo.
    echo ========================================================================
    echo   ErgonPDF has been successfully uninstalled from your PC.
    echo ========================================================================
    ping 127.0.0.1 -n 2 >nul
    cd /d "%TEMP%"
    start "" /b cmd /c "ping 127.0.0.1 -n 3 >nul & rd /s /q ""%CALLER_DIR%"""
    exit /b 0
)
