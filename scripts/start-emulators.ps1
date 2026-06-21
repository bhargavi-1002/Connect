#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Starts Firebase Emulator Suite for local development.
.DESCRIPTION
  Requires Java 17+ (for Firestore emulator).
  Install: https://adoptium.net/ or via winget: winget install EclipseAdoptium.Temurin.17.JDK
#>

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

Write-Host "=== Starting Firebase Emulator Suite ===" -ForegroundColor Cyan
Write-Host ""

# Ensure firebase CLI is installed
$firebase = Get-Command "firebase" -ErrorAction SilentlyContinue
if (-not $firebase) {
  Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
  npm install -g firebase-tools
}

Write-Host "Starting emulators (Auth:9099, Firestore:8085, Storage:9199, UI:4000)" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all emulators" -ForegroundColor Gray
Write-Host ""

firebase emulators:start --project connect-family-app
