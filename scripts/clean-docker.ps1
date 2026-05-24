<#
.SYNOPSIS
    PepperImports - Limpeza segura do Docker
    NAO remove volumes com dados (postgres, uploads)
.PARAMETER Full
    Limpeza completa (inclui imagens nao usadas)
.PARAMETER DryRun
    Apenas mostra o que seria removido
#>
param(
    [switch]$Full,
    [switch]$DryRun
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

Write-Host "[CLEAN] Limpeza Docker (dados persistentes PRESERVADOS)" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY-RUN] Apenas simulando, nada sera removido." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[1/4] Parando containers do projeto..." -ForegroundColor Gray
if (-not $DryRun) {
    docker compose -f docker-compose.dev.yml down  2>&1 | Out-Null
    docker compose -f docker-compose.prod.yml down 2>&1 | Out-Null
}

Write-Host "[2/4] Removendo containers parados..." -ForegroundColor Gray
if (-not $DryRun) { docker container prune -f }

Write-Host "[3/4] Removendo networks nao usadas..." -ForegroundColor Gray
if (-not $DryRun) { docker network prune -f }

Write-Host "[4/4] Limpando build cache..." -ForegroundColor Gray
if (-not $DryRun) { docker builder prune -f }

if ($Full) {
    Write-Host "[FULL] Removendo imagens nao usadas..." -ForegroundColor Yellow
    if (-not $DryRun) { docker image prune -a -f }
}

Write-Host ""
Write-Host "[OK] Limpeza concluida!" -ForegroundColor Green
Write-Host "  AVISO: Dados em D:\docker-data\ foram preservados." -ForegroundColor Yellow
Write-Host ""
Write-Host "Espaco Docker atual:"
docker system df
