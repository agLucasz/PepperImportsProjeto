#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Limpeza segura do Docker
#  NÃO remove volumes com dados (postgres, uploads)
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [switch]$Full,      # Limpeza completa (inclui imagens não usadas)
  [switch]$DryRun     # Apenas mostra o que seria removido
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

Write-Host "🧹 Limpeza do Docker (dados persistentes PRESERVADOS)..." -ForegroundColor Cyan

if ($DryRun) {
  Write-Host "── DRY RUN: Apenas simulando ────────────────────────" -ForegroundColor Yellow
}

# Parar e remover containers do projeto
Write-Host "`n📦 Parando containers..."
if (-not $DryRun) {
  docker compose -f docker-compose.dev.yml down 2>&1 | Out-Null
  docker compose -f docker-compose.prod.yml down 2>&1 | Out-Null
}

# Limpar containers parados
Write-Host "🗑️  Removendo containers parados..."
if (-not $DryRun) { docker container prune -f }

# Limpar networks não usadas
Write-Host "🌐 Removendo networks não usadas..."
if (-not $DryRun) { docker network prune -f }

# Limpar build cache
Write-Host "🏗️  Limpando build cache..."
if (-not $DryRun) { docker builder prune -f }

if ($Full) {
  Write-Host "🖼️  Removendo imagens não usadas..."
  if (-not $DryRun) { docker image prune -a -f }
}

Write-Host ""
Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host "   ⚠️  Dados em D:\docker-data\ preservados" -ForegroundColor Yellow
Write-Host ""
Write-Host "Espaço Docker atual:"
docker system df
