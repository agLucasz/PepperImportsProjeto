#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Executar Migrations do Entity Framework
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [string]$EnvFile = ".env",
  [switch]$Docker   # Executar via container Docker
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if ($Docker) {
  Write-Host "🗄️  Executando migrations via Docker..." -ForegroundColor Cyan
  $container = docker ps --format "{{.Names}}" | Where-Object { $_ -match "backend" } | Select-Object -First 1
  if (-not $container) {
    Write-Host "❌ Container backend não está rodando!" -ForegroundColor Red
    exit 1
  }
  docker exec $container dotnet ef database update
} else {
  Write-Host "🗄️  Executando migrations localmente..." -ForegroundColor Cyan

  # Carregar connection string do .env
  $envVars = @{}
  Get-Content $EnvFile | Where-Object { $_ -match "^[A-Z_]" -and $_ -notmatch "^#" } | ForEach-Object {
    $parts = $_ -split "=", 2
    if ($parts.Count -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
  }

  $db   = $envVars["POSTGRES_DB"] ?? "PepperImports"
  $user = $envVars["POSTGRES_USER"] ?? "postgres"
  $pass = $envVars["POSTGRES_PASSWORD"] ?? "changeme"
  $conn = "Host=localhost;Port=5432;Database=$db;Username=$user;Password=$pass"

  Set-Location "$Root\backend\PepperImportsAPI"
  $env:ConnectionStrings__DefaultConnection = $conn
  dotnet ef database update
}

Write-Host "✅ Migrations executadas!" -ForegroundColor Green
