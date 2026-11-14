param(
    [Parameter(Mandatory=$true)]
    [string]$TargetDir
)

$ws = New-Object -ComObject WScript.Shell

# 1. True Windows Desktop Directory (handles OneDrive, Folder Redirection, etc.)
$desktopDir = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop)
if (-not $desktopDir -or -not (Test-Path $desktopDir)) {
    $desktopDir = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)
}
if (-not $desktopDir -or -not (Test-Path $desktopDir)) {
    $desktopDir = [System.IO.Path]::Combine($env:USERPROFILE, 'Desktop')
    if (-not (Test-Path $desktopDir)) {
        New-Item -ItemType Directory -Path $desktopDir -Force | Out-Null
    }
}

$desktopPath = [System.IO.Path]::Combine($desktopDir, 'ErgonPDF.lnk')
$shortcut = $ws.CreateShortcut($desktopPath)
$shortcut.TargetPath = [System.IO.Path]::Combine($TargetDir, 'ErgonPDF.bat')
$shortcut.WorkingDirectory = $TargetDir
$shortcut.IconLocation = [System.IO.Path]::Combine($TargetDir, 'icon.ico') + ',0'
$shortcut.Description = 'ErgonPDF — Privacy-First Document Workspace'
$shortcut.Save()

# 2. True Start Menu Programs Directory
$programsDir = [Environment]::GetFolderPath([Environment+SpecialFolder]::Programs)
if (-not $programsDir -or -not (Test-Path $programsDir)) {
    $programsDir = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    if (-not (Test-Path $programsDir)) {
        New-Item -ItemType Directory -Path $programsDir -Force | Out-Null
    }
}

$startMenuPath = [System.IO.Path]::Combine($programsDir, 'ErgonPDF.lnk')
$shortcut2 = $ws.CreateShortcut($startMenuPath)
$shortcut2.TargetPath = [System.IO.Path]::Combine($TargetDir, 'ErgonPDF.bat')
$shortcut2.WorkingDirectory = $TargetDir
$shortcut2.IconLocation = [System.IO.Path]::Combine($TargetDir, 'icon.ico') + ',0'
$shortcut2.Description = 'ErgonPDF — Privacy-First Document Workspace'
$shortcut2.Save()

Write-Host "      Desktop shortcut    : $desktopPath"
Write-Host "      Start Menu shortcut : $startMenuPath"
