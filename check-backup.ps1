$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackupBaseDir = Join-Path $SourceDir "..\backup\ah"

if (-not (Test-Path $BackupBaseDir)) {
    Write-Host "No backup directory found. Please run backup.ps1" -ForegroundColor Yellow
    exit
}

$BackupBaseDir = (Resolve-Path $BackupBaseDir).Path
$AllBackups = Get-ChildItem -Path $BackupBaseDir -Filter "*.zip" | Sort-Object CreationTime -Descending

if ($AllBackups.Count -eq 0) {
    Write-Host "No backups found in $BackupBaseDir. Please run backup.ps1" -ForegroundColor Yellow
} else {
    $Last = $AllBackups[0]
    $Age = (Get-Date) - $Last.CreationTime
    
    Write-Host "=== Backup Status ===" -ForegroundColor Cyan
    Write-Host "Total Backups: $($AllBackups.Count)"
    Write-Host "Last Backup: $($Last.Name)"
    Write-Host "Date: $($Last.CreationTime)"
    Write-Host "Age: $([math]::Round($Age.TotalHours, 1)) hours ago"
    
    if ($Age.TotalDays -gt 7) {
        Write-Host "WARNING: Last backup is older than 7 days. Strongly consider running backup.ps1" -ForegroundColor Red
    } else {
        Write-Host "Backup status is healthy." -ForegroundColor Green
    }
}
