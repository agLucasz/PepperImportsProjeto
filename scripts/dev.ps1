#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Subir ambiente DEV com Docker
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [switch]$Build,     # Forçar rebuild das imagens
  [switch]$Logs,      # Mostrar logs após subir
  [switch]$Down       # Derrubar ambiente
)

$Root = Split-Path $PSScriptRoot -Parent

Set-Location $Root

if ($Down) {
  Write-Host "🛑 Derrubando ambiente DEV..." -ForegroundColor Yellow
  docker compose -f docker-compose.dev.yml down
  exit 0
}

if ($Build) {
  Write-Host "🔨 Rebuilding imagens DEV..." -ForegroundColor Cyan
  docker compose -f docker-compose.dev.yml build --no-cache
}

Write-Host "🚀 Subindo ambiente DEV..." -ForegroundColor Green
docker compose -f docker-compose.dev.yml --env-file .env up -d

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Erro ao subir containers!" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "✅ Ambiente DEV no ar!" -ForegroundColor Green
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:5139" -ForegroundColor Cyan
Write-Host "   Swagger:   http://localhost:5139/swagger" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host ""

if ($Logs) {
  docker compose -f docker-compose.dev.yml logs -f
}
