<#
.SYNOPSIS
    PepperImports - Executar Migrations do Entity Framework
.PARAMETER EnvFile
    Arquivo .env com connection string (default: .env)
.PARAMETER Docker
    Executar via container Docker ao inves de local
#>
param(
    [string]$EnvFile = ".env",
    [switch]$Docker
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if ($Docker) {
    Write-Host "[MIGRATE] Executando via container Docker..." -ForegroundColor Cyan
    $container = docker ps --format "{{.Names}}" | Where-Object { $_ -match "backend" } | Select-Object -First 1
    if (-not $container) {
        Write-Host "[ERRO] Container backend nao esta rodando!" -ForegroundColor Red
        exit 1
    }
    docker exec $container dotnet ef database update
} else {
    Write-Host "[MIGRATE] Executando localmente..." -ForegroundColor Cyan

    # Carregar connection string do .env
    $envVars = @{}
    if (Test-Path $EnvFile) {
        Get-Content $EnvFile | Where-Object { $_ -match "^[A-Z_]" -and $_ -notmatch "^#" } | ForEach-Object {
            $parts = $_ -split "=", 2
            if ($parts.Count -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
        }
    }

    $db   = if ($envVars["POSTGRES_DB"])       { $envVars["POSTGRES_DB"] }       else { "PepperImports" }
    $user = if ($envVars["POSTGRES_USER"])     { $envVars["POSTGRES_USER"] }     else { "postgres" }
    $pass = if ($envVars["POSTGRES_PASSWORD"]) { $envVars["POSTGRES_PASSWORD"] } else { "changeme" }
    $conn = "Host=localhost;Port=5432;Database=$db;Username=$user;Password=$pass"

    Write-Host "[MIGRATE] Banco: $db @ localhost:5432" -ForegroundColor Gray

    $env:ConnectionStrings__DefaultConnection = $conn
    Set-Location "$Root\backend\PepperImportsAPI"
    dotnet ef database update
    Set-Location $Root
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Migrations executadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Falha ao executar migrations!" -ForegroundColor Red
    exit 1
}
