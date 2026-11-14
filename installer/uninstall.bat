@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

echo ========================================================================
echo   ErgonPDF - Uninstallation Utility
echo ========================================================================
echo.
echo This will remove ErgonPDF, its desktop shortcuts, and registration from your PC.
echo Installation Directory: %APP_DIR%
echo.

if /i not "%~1"=="/y" if /i not "%~1"=="-y" (
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
) else (
    powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*serve.cjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1
)

echo [2/4] Removing Desktop and Start Menu shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop); if ($d) { Remove-Item (Join-Path $d 'ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue }; $dd = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory); if ($dd) { Remove-Item (Join-Path $dd 'ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue }; $p = [Environment]::GetFolderPath([Environment+SpecialFolder]::Programs); if ($p) { Remove-Item (Join-Path $p 'ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue }; Remove-Item (Join-Path $env:USERPROFILE 'Desktop\ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue; Remove-Item (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\ErgonPDF.lnk') -Force -ErrorAction SilentlyContinue;" >nul 2>&1

echo [3/4] Removing Windows Add/Remove Programs registration...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF" /f >nul 2>&1

echo [4/4] Removing installation directory files...
echo.
echo ========================================================================
echo   ErgonPDF has been successfully uninstalled from your PC.
echo ========================================================================
ping 127.0.0.1 -n 2 >nul

:: Self-deleting cleanup routine
cd /d "%TEMP%"
start "" /b cmd /c "ping 127.0.0.1 -n 3 >nul & rd /s /q ""%APP_DIR%"""
exit /b 0
