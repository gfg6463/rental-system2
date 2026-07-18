# start-dev.ps1
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$projectRoot = $PSScriptRoot

# 1. Resolve Portable Node Directory based on OS architecture
$is64Bit = [Environment]::Is64BitOperatingSystem
$nodeDirName = if ($is64Bit) { "node-v20.14.0-win-x64" } else { "node-v20.14.0-win-x86" }
$nodeDir = Join-Path $projectRoot ".bin\$nodeDirName"

if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
    Write-Error "Portable Node.js runtime not found. Please run: powershell -ExecutionPolicy Bypass -File setup_workspace.ps1"
    exit 1
}

Write-Host "Starting Call Center Car Rental System on ($nodeDirName) runtime..."

# Run Backend Express Server
Write-Host "Starting Backend Express server on http://localhost:8000..."
$backendCmd = @"
`$env:PATH = '$nodeDir;' + `$env:PATH; cd '$projectRoot\backend'; npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Run Frontend Next.js Dashboard
Write-Host "Starting Next.js Frontend on http://localhost:3000..."
$frontendCmd = @"
`$env:PATH = '$nodeDir;' + `$env:PATH; cd '$projectRoot\apps\dashboard'; npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "Both servers are launching. Check the new terminal windows for log output."
