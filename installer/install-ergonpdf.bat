@echo off
setlocal
title ErgonPDF Windows Installer

echo ========================================================================
echo   ErgonPDF - Privacy-First All-in-One PDF Workspace Setup
echo   Version 1.2.0  ^|  100%% Local In-Browser Processing [WASM]
echo ========================================================================
echo.

:: Parse Command Line Arguments
set "INSTALLER_DIR=%~dp0"
set "AUTO_YES=0"
set "ARG_TARGET="

:parse_args
if [%1]==[] goto done_args
if /i [%1]==[/y] (
    set "AUTO_YES=1"
    shift
    goto parse_args
)
if /i [%1]==[-y] (
    set "AUTO_YES=1"
    shift
    goto parse_args
)
if /i [%1]==[/s] (
    set "AUTO_YES=1"
    shift
    goto parse_args
)
if not defined ARG_TARGET (
    set "ARG_TARGET=%~1"
    shift
    goto parse_args
)
shift
goto parse_args

:done_args

:: 1. Locate Source Folder and Dist Directory
set "DIST_DIR="
if exist "%INSTALLER_DIR%dist\index.html" set "DIST_DIR=%INSTALLER_DIR%dist"
if not defined DIST_DIR if exist "%CD%\dist\index.html" set "DIST_DIR=%CD%\dist"
if not defined DIST_DIR if exist "%INSTALLER_DIR%..\dist\index.html" (
    for %%i in ("%INSTALLER_DIR%..\dist") do set "DIST_DIR=%%~fi"
)

if not defined DIST_DIR (
    echo [ERROR] Production application bundle dist\index.html was not found.
    echo Please make sure the dist folder is present next to this installer.
    echo If building from source, run 'npm run build' first.
    echo.
    pause
    exit /b 1
)

:: 2. Check Node.js Runtime
echo [1/5] Checking Node.js runtime environment...
set "NODE_OK=0"
set "NODE_VER_RAW="

where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER_RAW=%%v"
)

if defined NODE_VER_RAW (
    for /f "tokens=1 delims=." %%m in ("%NODE_VER_RAW:v=%") do (
        if %%m geq 18 (
            set "NODE_OK=1"
            echo       Detected Node.js %NODE_VER_RAW% [Supported: 18+].
        ) else (
            echo       Node.js %NODE_VER_RAW% is installed, but version 18 or higher is required.
        )
    )
)

if "%NODE_OK%"=="1" goto node_ready

echo.
echo [!] Node.js 18 or higher is required to run the local ErgonPDF server.
echo     Would you like the installer to automatically download and install
set /p "INSTALL_NODE=    the official Node.js LTS package now? [Y/N, Default: Y]: "
if "%INSTALL_NODE%"=="" set "INSTALL_NODE=Y"

if /i not "%INSTALL_NODE%"=="Y" (
    echo.
    echo [INFO] Installation halted. Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

echo.
echo       Downloading official Node.js LTS installer...
set "NODE_MSI_URL=https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi"
set "NODE_MSI_DEST=%TEMP%\nodejs-setup.msi"

powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%NODE_MSI_URL%', '%NODE_MSI_DEST%')"

if not exist "%NODE_MSI_DEST%" (
    echo [ERROR] Failed to download Node.js installer automatically.
    echo Please install Node.js manually from https://nodejs.org and re-run this installer.
    pause
    exit /b 1
)

echo       Installing Node.js...
msiexec.exe /i "%NODE_MSI_DEST%" /passive /norestart

set "PATH=%ProgramFiles%\nodejs;%LOCALAPPDATA%\Programs\node;%PATH%"
del /f /q "%NODE_MSI_DEST%" >nul 2>&1

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Node.js installation finished, but PATH may require a terminal restart.
) else (
    echo       Node.js installed successfully.
)

:node_ready

:: 3. Determine Destination Directory
echo.
echo [2/5] Selecting installation destination...
set "DEFAULT_TARGET=%LOCALAPPDATA%\ErgonPDF"
set "TARGET_DIR="

if defined ARG_TARGET (
    set "TARGET_DIR=%ARG_TARGET%"
    echo       Using specified directory: "%ARG_TARGET%"
    goto after_target_select
)

if "%AUTO_YES%"=="1" (
    set "TARGET_DIR=%DEFAULT_TARGET%"
    echo       Silent/Auto mode: using default directory: "%DEFAULT_TARGET%"
    goto after_target_select
)

echo       Default location: %DEFAULT_TARGET%
set /p "TARGET_INPUT=      Press Enter for default, or type a custom path: "

if "%TARGET_INPUT%"=="" (
    set "TARGET_DIR=%DEFAULT_TARGET%"
) else (
    set "TARGET_DIR=%TARGET_INPUT%"
)

:after_target_select

if "%TARGET_DIR:~-1%"=="\" set "TARGET_DIR=%TARGET_DIR:~0,-1%"

echo       Installing to: "%TARGET_DIR%"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%" >nul 2>&1
if not exist "%TARGET_DIR%\dist" mkdir "%TARGET_DIR%\dist" >nul 2>&1

:: 4. Copy Application Files
echo.
echo [3/5] Deploying ErgonPDF assets and local server...

:: Copy dist assets
xcopy /E /I /Y /Q "%DIST_DIR%" "%TARGET_DIR%\dist" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to copy application distribution files to destination.
    pause
    exit /b 1
)

:: Copy server and launcher scripts
copy /Y "%INSTALLER_DIR%serve.cjs" "%TARGET_DIR%\serve.cjs" >nul
copy /Y "%INSTALLER_DIR%ErgonPDF.bat" "%TARGET_DIR%\ErgonPDF.bat" >nul
copy /Y "%INSTALLER_DIR%stop-ergonpdf.bat" "%TARGET_DIR%\stop-ergonpdf.bat" >nul
copy /Y "%INSTALLER_DIR%uninstall.bat" "%TARGET_DIR%\uninstall.bat" >nul
if exist "%INSTALLER_DIR%run-hidden.vbs" copy /Y "%INSTALLER_DIR%run-hidden.vbs" "%TARGET_DIR%\run-hidden.vbs" >nul
if exist "%INSTALLER_DIR%create-shortcuts.ps1" copy /Y "%INSTALLER_DIR%create-shortcuts.ps1" "%TARGET_DIR%\create-shortcuts.ps1" >nul
if exist "%INSTALLER_DIR%icon.ico" copy /Y "%INSTALLER_DIR%icon.ico" "%TARGET_DIR%\icon.ico" >nul
if not exist "%TARGET_DIR%\icon.ico" if exist "%DIST_DIR%\icon.ico" copy /Y "%DIST_DIR%\icon.ico" "%TARGET_DIR%\icon.ico" >nul

:: Create version manifest
echo 1.2.0> "%TARGET_DIR%\version.txt"

:: 5. Create Desktop and Start Menu Shortcuts
echo.
echo [4/5] Creating Windows Desktop and Start Menu shortcuts...

powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALLER_DIR%create-shortcuts.ps1" -TargetDir "%TARGET_DIR%"

:: 6. Register in Windows Add/Remove Programs
echo.
echo [5/5] Registering in Windows Add/Remove Programs...

set "REG_KEY=HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\ErgonPDF"
reg add "%REG_KEY%" /v "DisplayName" /t REG_SZ /d "ErgonPDF" /f >nul
reg add "%REG_KEY%" /v "DisplayVersion" /t REG_SZ /d "1.2.0" /f >nul
reg add "%REG_KEY%" /v "Publisher" /t REG_SZ /d "ErgonPDF Open Source Project" /f >nul
reg add "%REG_KEY%" /v "InstallLocation" /t REG_SZ /d "%TARGET_DIR%" /f >nul
reg add "%REG_KEY%" /v "UninstallString" /t REG_SZ /d "\"%TARGET_DIR%\uninstall.bat\"" /f >nul
reg add "%REG_KEY%" /v "DisplayIcon" /t REG_SZ /d "%TARGET_DIR%\icon.ico" /f >nul
reg add "%REG_KEY%" /v "URLInfoAbout" /t REG_SZ /d "https://github.com/CodeSorcerer-007/ErgonPDF" /f >nul
reg add "%REG_KEY%" /v "HelpLink" /t REG_SZ /d "https://github.com/CodeSorcerer-007/ErgonPDF" /f >nul
reg add "%REG_KEY%" /v "NoModify" /t REG_DWORD /d 1 /f >nul
reg add "%REG_KEY%" /v "NoRepair" /t REG_DWORD /d 1 /f >nul
reg add "%REG_KEY%" /v "EstimatedSize" /t REG_DWORD /d 16384 /f >nul

echo.
echo ========================================================================
echo   [SUCCESS] ErgonPDF has been installed successfully!
echo ========================================================================
echo.
echo   Application Location : %TARGET_DIR%
echo   Desktop Shortcut     : Created
echo   Start Menu Shortcut  : Created
echo   Windows Apps List    : Registered [under ErgonPDF]
echo   Local Web URL        : http://127.0.0.1:8074
echo.
echo   You can launch ErgonPDF at any time from your Desktop or Start Menu.
echo   To shut down the background server, run 'stop-ergonpdf.bat' in the install folder.
echo.

if "%AUTO_YES%"=="1" (
    set "LAUNCH_NOW=N"
    goto after_launch_prompt
)

set /p "LAUNCH_NOW=Would you like to launch ErgonPDF right now? [Y/N, Default: Y]: "
if "%LAUNCH_NOW%"=="" set "LAUNCH_NOW=Y"

:after_launch_prompt

if /i "%LAUNCH_NOW%"=="Y" (
    echo Launching ErgonPDF...
    start "" "%TARGET_DIR%\ErgonPDF.bat"
)

echo Done. Thank you for using ErgonPDF!
if "%AUTO_YES%"=="0" (
    ping 127.0.0.1 -n 2 >nul
)
exit /b 0