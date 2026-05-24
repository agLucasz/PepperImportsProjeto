<#
.SYNOPSIS
    PepperImports - Subir ambiente PRODUCAO com Docker
.PARAMETER Build
    Forcar rebuild das imagens
.PARAMETER Logs
    Mostrar logs apos subir
.PARAMETER Down
    Derrubar ambiente
#>
param(
    [switch]$Build,
    [switch]$Logs,
    [switch]$Down
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if (-not (Test-Path ".env.production")) {
    Write-Host "[ERRO] Arquivo .env.production nao encontrado!" -ForegroundColor Red
    Write-Host "  Copie .env.example para .env.production e preencha os valores." -ForegroundColor Yellow
    exit 1
}

if ($Down) {
    Write-Host "[PROD] Derrubando ambiente..." -ForegroundColor Yellow
    docker compose -f docker-compose.prod.yml down
    exit 0
}

if ($Build) {
    Write-Host "[PROD] Rebuilding imagens..." -ForegroundColor Cyan
    docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
}

Write-Host "[PROD] Subindo ambiente..." -ForegroundColor Green
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao subir containers!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Ambiente PRODUCAO no ar!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:80"   -ForegroundColor Cyan
Write-Host "  API:      http://localhost:80/api" -ForegroundColor Cyan
Write-Host ""

if ($Logs) {
    docker compose -f docker-compose.prod.yml logs -f
}
