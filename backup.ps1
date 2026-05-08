param(
    [string]$CommitMessage = "manual-backup"
)

$Source = "C:\Users\hashm\Desktop\Projects\Workplace AH"
$Dest   = "C:\Users\hashm\Desktop\Projects\backup\ah"

# Create destination folder if missing
if (-not (Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
    Write-Host "Created backup folder: $Dest" -ForegroundColor Yellow
}

# Build filename
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$SafeMsg   = $CommitMessage -replace '[^a-zA-Z0-9_\-]', '-' -replace '-+', '-'
$SafeMsg   = $SafeMsg.Trim('-')
$ZipName   = "${Timestamp}_${SafeMsg}.zip"
$ZipPath   = Join-Path $Dest $ZipName

Write-Host ""
Write-Host "=== Amir Hashmi Website Backup ===" -ForegroundColor Cyan
Write-Host "Source  : $Source"
Write-Host "Dest    : $ZipPath"
Write-Host "Message : $CommitMessage"
Write-Host "-----------------------------------"

$StartTime = Get-Date
$7zExe     = "C:\Program Files\7-Zip\7z.exe"

if (Test-Path $7zExe) {
    Write-Host "Compressing with 7-Zip..." -ForegroundColor Green
    $Args = "a -tzip `"$ZipPath`" `"$Source\*`" -xr!`.git -xr!node_modules -xr!dist -xr!build -xr!*.zip"
    Start-Process -FilePath $7zExe -ArgumentList $Args -Wait -NoNewWindow
} else {
    Write-Host "Compressing with Compress-Archive..." -ForegroundColor Green
    $Items = Get-ChildItem -Path $Source -Exclude ".git","node_modules","dist","build","*.zip"
    Compress-Archive -Path $Items.FullName -DestinationPath $ZipPath -Force
}

$Duration = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 1)

if (Test-Path $ZipPath) {
    $SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB, 1)
    Write-Host ""
    Write-Host "Backup complete!" -ForegroundColor Green
    Write-Host "File   : $ZipName"
    Write-Host "Size   : $SizeMB MB"
    Write-Host "Time   : ${Duration}s"
    Write-Host "Saved  : $ZipPath"
} else {
    Write-Host ""
    Write-Host "BACKUP FAILED. Check errors above." -ForegroundColor Red
    exit 1
}
