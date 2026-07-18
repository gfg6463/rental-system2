# push_to_github.ps1
$ErrorActionPreference = "Stop"

Write-Host "=================================================="
Write-Host " Automated GitHub Code Uploader "
Write-Host "=================================================="

# 1. Ask for the GitHub repository link
$repoUrl = Read-Host -Prompt "Enter your GitHub Repository URL (e.g., https://github.com/your-username/car-rental-system.git)"

if (-not $repoUrl.EndsWith(".git")) {
    $repoUrl = $repoUrl + ".git"
}

Write-Host "`nInitializing Git Repository..."
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}

git init
git add .
git commit -m "Initial commit of clean platform code"
git branch -M main
git remote add origin $repoUrl

Write-Host "`nUploading code to GitHub (You may be prompted to log in to GitHub in a browser window)..."
git push -u origin main --force

Write-Host "`n=================================================="
Write-Host " Code Uploaded Successfully to GitHub! "
Write-Host "=================================================="
