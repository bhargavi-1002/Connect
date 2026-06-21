#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Sets up Firebase cloud project for the Connect app.
.DESCRIPTION
  Run this from your local machine (where you can open a browser for Firebase auth).
  It creates/links a Firebase project, enables Auth, Firestore, and Storage.
#>

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "=== Connect — Firebase Cloud Setup ===" -ForegroundColor Cyan
Write-Host ""

# Ensure firebase CLI is installed
$firebase = Get-Command "firebase" -ErrorAction SilentlyContinue
if (-not $firebase) {
  Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
  npm install -g firebase-tools
}

Write-Host "Step 1: Log in to Firebase" -ForegroundColor Green
Write-Host "  A browser will open. Sign in with your Google account." -ForegroundColor Gray
firebase login --no-localhost

Write-Host ""
Write-Host "Step 2: Create a Firebase project (or use existing)" -ForegroundColor Green
Write-Host "  Creating project: connect-family-app" -ForegroundColor Gray
firebase projects:create connect-family-app --display-name "Connect Family App" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "  Project may already exist. Linking..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Add Firebase to the project" -ForegroundColor Green
firebase --project connect-family-app init

Write-Host ""
Write-Host "Step 4: Enable Auth providers" -ForegroundColor Green
Write-Host "  Enable: Google, Email/Password, Phone" -ForegroundColor Gray
Write-Host "  Visit: https://console.firebase.google.com/project/connect-family-app/authentication/providers" -ForegroundColor Gray

Write-Host ""
Write-Host "Step 5: Update .env with real values" -ForegroundColor Green
Write-Host "  Get your Firebase config from Project Settings > General > Your apps > Web app" -ForegroundColor Gray
Write-Host "  Then update: artifacts/connect/.env" -ForegroundColor Gray

Write-Host ""
Write-Host "Step 6: Deploy Firestore & Storage rules" -ForegroundColor Green
firebase deploy --only firestore:rules,firestore:indexes,storage:rules

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Cyan
Write-Host "Next: Update .env with real Firebase config values from the Firebase Console." -ForegroundColor Yellow
