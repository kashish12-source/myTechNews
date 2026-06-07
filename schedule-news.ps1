# schedule-news.ps1
# Automates the scheduling of the daily news aggregator at 5:50 AM on Windows.
# Run this script as Administrator.

$InstallDir = $PSScriptRoot
if (-not $InstallDir) {
    $InstallDir = Get-Location
}

$ScriptPath = Join-Path $InstallDir "scripts\update-news.mjs"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Scheduling Daily Tech News Scraper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Target Workspace: $InstallDir" -ForegroundColor Gray
Write-Host "Target Aggregator: $ScriptPath" -ForegroundColor Gray

# Verify Node.js is installed
$NodePath = Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $NodePath) {
    Write-Host "WARNING: Node.exe was not found in your PATH." -ForegroundColor Yellow
    Write-Host "Ensure Node.js is installed. Falling back to default system call." -ForegroundColor Yellow
    $NodePath = "node"
} else {
    Write-Host "Detected Node.js path: $NodePath" -ForegroundColor Gray
}

# Create Scheduled Task parameters
$Action = New-ScheduledTaskAction -Execute $NodePath -Argument "`"$ScriptPath`"" -WorkingDirectory $InstallDir
$Trigger = New-ScheduledTaskTrigger -Daily -At "5:50 AM"

# Ensure task can run on laptop battery and executes immediately if missed (e.g. computer was asleep)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
    Register-ScheduledTask -TaskName "DailyTechNewsScrape" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Runs the daily Hacker News, Lobsters, and PG aggregator at 5:50 AM for myTechNews dashboard" -Force -ErrorAction Stop | Out-Null
    Write-Host ""
    Write-Host "SUCCESS: Windows Scheduled Task 'DailyTechNewsScrape' registered." -ForegroundColor Green
    Write-Host "The aggregator will execute daily at 5:50 AM, preparing the morning feed." -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "ERROR: Registration failed." -ForegroundColor Red
    Write-Host "Reason: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please open PowerShell as Administrator and run the script again." -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
}
