<#
.SYNOPSIS
    PepperImports - Backup do PostgreSQL
.PARAMETER EnvFile
    Arquivo .env a usar (default: .env)
.PARAMETER OutputDir
    Diretorio de saida dos backups
#>
param(
    [string]$EnvFile = ".env",
    [string]$OutputDir = "D:\docker-data\backups"
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

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
$ts   = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$file = "$OutputDir\pepper_backup_$ts.sql"

# Detecta container postgres em execucao
$container = docker ps --format "{{.Names}}" | Where-Object { $_ -match "postgres" } | Select-Object -First 1
if (-not $container) {
    Write-Host "[ERRO] Nenhum container PostgreSQL rodando!" -ForegroundColor Red
    exit 1
}

Write-Host "[BACKUP] Banco: $db | Container: $container" -ForegroundColor Cyan
Write-Host "[BACKUP] Salvando em: $file" -ForegroundColor Cyan

docker exec $container pg_dump -U $user -d $db -f /tmp/pepper_backup.sql
docker cp "${container}:/tmp/pepper_backup.sql" $file
docker exec $container rm -f /tmp/pepper_backup.sql

if (Test-Path $file) {
    $size = [math]::Round((Get-Item $file).Length / 1KB, 1)
    Write-Host "[OK] Backup concluido: $file ($size KB)" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Backup falhou!" -ForegroundColor Red
    exit 1
}
