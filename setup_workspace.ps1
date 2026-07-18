# setup_workspace.ps1
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$projectRoot = $PSScriptRoot
$binDir      = Join-Path $projectRoot ".bin"

Write-Host "Project Root Resolved to: $projectRoot"

if (-not (Test-Path $projectRoot)) {
    New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
}

# ────────────────────────────────────────────────
# Step 1 – Node.js Portable Environment Resolution
# ────────────────────────────────────────────────
Write-Host "`n--- Step 1: Resolving Node.js Portable Environment ---"

$is64Bit = [Environment]::Is64BitOperatingSystem
$nodeDirName = ""
$nodeZipUrl = ""

if ($is64Bit) {
    Write-Host "  System is 64-bit."
    $nodeDirName = "node-v20.14.0-win-x64"
    $nodeZipUrl  = "https://nodejs.org/dist/v20.14.0/node-v20.14.0-win-x64.zip"
} else {
    Write-Host "  System is 32-bit (x86)."
    $nodeDirName = "node-v20.14.0-win-x86"
    $nodeZipUrl  = "https://nodejs.org/dist/v20.14.0/node-v20.14.0-win-x86.zip"
}

$nodeDir = Join-Path $binDir $nodeDirName

if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
    $nodeZipPath = Join-Path $binDir "node.zip"
    $nodeTmpDir  = Join-Path $binDir "node_tmp"

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host "  Downloading Node.js portable zip from $nodeZipUrl ..."
    Invoke-WebRequest -Uri $nodeZipUrl -OutFile $nodeZipPath
    Write-Host "  Extracting Node.js zip..."
    Expand-Archive -Path $nodeZipPath -DestinationPath $nodeTmpDir -Force
    $inner = Get-ChildItem -Path $nodeTmpDir -Directory | Select-Object -First 1
    Move-Item -Path $inner.FullName -Destination $nodeDir -Force
    Remove-Item $nodeZipPath -Force -ErrorAction SilentlyContinue
    Remove-Item $nodeTmpDir  -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Node.js local portable runtime is ready!"
} else {
    Write-Host "  Node.js local portable runtime is already present."
}

# ────────────────────────────────────────────────
# Step 2 – Create Directories
# ────────────────────────────────────────────────
Write-Host "`n--- Step 2: Creating project directories ---"
$backendDir = Join-Path $projectRoot "backend"
$appsDir    = Join-Path $projectRoot "apps"
$dashDir    = Join-Path $appsDir "dashboard"

foreach ($dir in @($backendDir, $appsDir, $dashDir, (Join-Path $backendDir "uploads"))) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "  Directories created."

# ────────────────────────────────────────────────
# Step 3 – Install Dependencies (npm install)
# ────────────────────────────────────────────────
Write-Host "`n--- Step 3: Installing Backend Dependencies ---"
cd "$projectRoot\backend"
$nodeExe = Join-Path $nodeDir "node.exe"
$npmCli = Join-Path $nodeDir "node_modules\npm\bin\npm-cli.js"
& $nodeExe $npmCli install --legacy-peer-deps

Write-Host "`n--- Step 4: Installing Frontend Dashboard Dependencies ---"
cd "$projectRoot\apps\dashboard"
& $nodeExe $npmCli install --legacy-peer-deps

Write-Host "`n=================================================="
Write-Host " Workspace Setup and Dependencies Installation Completed! "
Write-Host "=================================================="
