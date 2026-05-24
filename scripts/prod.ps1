#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Subir ambiente PRODUÇÃO com Docker
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [switch]$Build,     # Forçar rebuild das imagens
  [switch]$Logs,      # Mostrar logs após subir
  [switch]$Down       # Derrubar ambiente
)

$Root = Split-Path $PSScriptRoot -Parent

Set-Location $Root

# Verificar .env.production existe
if (-not (Test-Path ".env.production")) {
  Write-Host "❌ Arquivo .env.production não encontrado!" -ForegroundColor Red
  Write-Host "   Copie .env.example para .env.production e preencha os valores." -ForegroundColor Yellow
  exit 1
}

if ($Down) {
  Write-Host "🛑 Derrubando ambiente PRODUÇÃO..." -ForegroundColor Yellow
  docker compose -f docker-compose.prod.yml down
  exit 0
}

if ($Build) {
  Write-Host "🔨 Rebuilding imagens PRODUÇÃO..." -ForegroundColor Cyan
  docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
}

Write-Host "🚀 Subindo ambiente PRODUÇÃO..." -ForegroundColor Green
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Erro ao subir containers!" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "✅ Ambiente PRODUÇÃO no ar!" -ForegroundColor Green
Write-Host "   Frontend:  http://localhost:80" -ForegroundColor Cyan
Write-Host "   API:       http://localhost:80/api" -ForegroundColor Cyan
Write-Host ""

if ($Logs) {
  docker compose -f docker-compose.prod.yml logs -f
}
