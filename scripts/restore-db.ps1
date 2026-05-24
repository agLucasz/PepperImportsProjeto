<#
.SYNOPSIS
    PepperImports - Restore do PostgreSQL
.PARAMETER BackupFile
    Caminho do arquivo .sql de backup (obrigatorio)
.PARAMETER EnvFile
    Arquivo .env a usar (default: .env)
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$EnvFile = ".env"
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if (-not (Test-Path $BackupFile)) {
    Write-Host "[ERRO] Arquivo de backup nao encontrado: $BackupFile" -ForegroundColor Red
    exit 1
}

# Carregar variaveis de ambiente
$envVars = @{}
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | Where-Object { $_ -match "^[A-Z_]" -and $_ -notmatch "^#" } | ForEach-Object {
        $parts = $_ -split "=", 2
        if ($parts.Count -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
    }
}

$db   = if ($envVars["POSTGRES_DB"])   { $envVars["POSTGRES_DB"] }   else { "PepperImports" }
$user = if ($envVars["POSTGRES_USER"]) { $envVars["POSTGRES_USER"] } else { "postgres" }

$container = docker ps --format "{{.Names}}" | Where-Object { $_ -match "postgres" } | Select-Object -First 1
if (-not $container) {
    Write-Host "[ERRO] Container PostgreSQL nao esta rodando!" -ForegroundColor Red
    exit 1
}

Write-Host "[AVISO] Isso vai SUBSTITUIR o banco '$db' pelo backup!" -ForegroundColor Yellow
$confirm = Read-Host "Digite CONFIRMAR para continuar"
if ($confirm -ne "CONFIRMAR") {
    Write-Host "Operacao cancelada." -ForegroundColor Gray
    exit 0
}

Write-Host "[RESTORE] Restaurando backup em '$db'..." -ForegroundColor Cyan

docker cp $BackupFile "${container}:/tmp/restore_backup.sql"
docker exec $container psql -U $user -d $db -f /tmp/restore_backup.sql
docker exec $container rm -f /tmp/restore_backup.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Restore concluido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Falha durante o restore!" -ForegroundColor Red
    exit 1
}
