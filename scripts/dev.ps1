<#
.SYNOPSIS
    PepperImports - Subir ambiente DEV com Docker
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

if ($Down) {
    Write-Host "[DEV] Derrubando ambiente..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.yml down
    exit 0
}

if ($Build) {
    Write-Host "[DEV] Rebuilding imagens..." -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml build --no-cache
}

Write-Host "[DEV] Subindo ambiente..." -ForegroundColor Green
docker compose -f docker-compose.dev.yml --env-file .env up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao subir containers!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Ambiente DEV no ar!" -ForegroundColor Green
Write-Host "  Frontend:   http://localhost:5173"   -ForegroundColor Cyan
Write-Host "  Backend:    http://localhost:5139"   -ForegroundColor Cyan
Write-Host "  Swagger:    http://localhost:5139/swagger" -ForegroundColor Cyan
Write-Host "  PostgreSQL: localhost:5432"           -ForegroundColor Cyan
Write-Host ""

if ($Logs) {
    docker compose -f docker-compose.dev.yml logs -f
}
