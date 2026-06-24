# schedule-news.ps1
# Automates the scheduling of the daily news aggregator at 5:50 AM on Windows.
# Run this script as Administrator.

$InstallDir = $PSScriptRoot
if (-not $InstallDir) {
    $InstallDir = Get-Location
}

$ScriptPath = "backend\app\scrape_cli.py"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Scheduling Daily Tech News Scraper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Target Workspace: $InstallDir" -ForegroundColor Gray
Write-Host "Target Aggregator: $ScriptPath" -ForegroundColor Gray

# Verify Python virtualenv is present, otherwise fallback to system Python
$PythonPath = Join-Path $InstallDir "venv\Scripts\python.exe"
if (-not (Test-Path $PythonPath)) {
    $PythonPath = Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    if (-not $PythonPath) {
        Write-Host "WARNING: python.exe was not found in virtualenv or your PATH." -ForegroundColor Yellow
        $PythonPath = "python"
    } else {
        Write-Host "Detected System Python path: $PythonPath" -ForegroundColor Gray
    }
} else {
    Write-Host "Detected Virtualenv Python path: $PythonPath" -ForegroundColor Gray
}

# Create Scheduled Task parameters
$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument "`"$ScriptPath`"" -WorkingDirectory $InstallDir
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
