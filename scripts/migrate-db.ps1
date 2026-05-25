<#
.SYNOPSIS
    PepperImports - Aplicar Migrations no PostgreSQL Docker

    IMPORTANTE: Nao usa 'dotnet ef database update' diretamente do host
    pois pode haver conflito com postgres local na porta 5432.
    Usa o script SQL gerado (postgres/migrations.sql) aplicado
    diretamente no container Docker - metodo seguro e confiavel.

.PARAMETER Regenerate
    Regenerar o migrations.sql antes de aplicar (use apos novas migrations)
.PARAMETER EnvFile
    Arquivo .env a usar (default: .env)
#>
param(
    [switch]$Regenerate,
    [string]$EnvFile = ".env"
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

# Carregar variaveis
$envVars = @{}
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | Where-Object { $_ -match "^[A-Z_]" -and $_ -notmatch "^#" } | ForEach-Object {
        $parts = $_ -split "=", 2
        if ($parts.Count -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
    }
}
$db   = if ($envVars["POSTGRES_DB"])   { $envVars["POSTGRES_DB"] }   else { "PepperImports" }
$user = if ($envVars["POSTGRES_USER"]) { $envVars["POSTGRES_USER"] } else { "postgres" }

# Detectar container postgres
$container = docker ps --format "{{.Names}}" | Where-Object { $_ -match "postgres" } | Select-Object -First 1
if (-not $container) {
    Write-Host "[ERRO] Container PostgreSQL nao esta rodando!" -ForegroundColor Red
    Write-Host "  Execute: .\scripts\dev.ps1" -ForegroundColor Yellow
    exit 1
}

# Regenerar SQL se solicitado ou se nao existir
$sqlFile = "$Root\postgres\migrations.sql"
if ($Regenerate -or -not (Test-Path $sqlFile)) {
    Write-Host "[MIGRATE] Gerando migrations.sql..." -ForegroundColor Cyan
    $proj = "$Root\backend\PepperImportsAPI"
    Set-Location $proj
    dotnet ef migrations script --idempotent --output $sqlFile 2>&1 | Where-Object { $_ -match "^Build|error|Error" }
    Set-Location $Root
    if (-not (Test-Path $sqlFile)) {
        Write-Host "[ERRO] Falha ao gerar migrations.sql!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] migrations.sql gerado." -ForegroundColor Green
}

# Aplicar SQL diretamente no container Docker
Write-Host "[MIGRATE] Aplicando migrations no container '$container' (banco: $db)..." -ForegroundColor Cyan
docker cp $sqlFile "${container}:/tmp/migrations.sql"
docker exec $container psql -U $user -d $db -f /tmp/migrations.sql 2>&1 | Select-Object -Last 5
docker exec $container rm -f /tmp/migrations.sql

# Verificar tabelas criadas
$tables = docker exec $container psql -U $user -d $db -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" 2>&1
$tables = $tables.Trim()
Write-Host "[OK] Migrations aplicadas! Tabelas no banco: $tables" -ForegroundColor Green
