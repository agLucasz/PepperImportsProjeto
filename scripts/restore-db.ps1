#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Restore do PostgreSQL
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [Parameter(Mandatory=$true)]
  [string]$BackupFile,
  [string]$EnvFile = ".env"
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if (-not (Test-Path $BackupFile)) {
  Write-Host "❌ Arquivo de backup não encontrado: $BackupFile" -ForegroundColor Red
  exit 1
}

# Carregar variáveis de ambiente
$envVars = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[A-Z]" -and $_ -notmatch "^#" } | ForEach-Object {
  $parts = $_ -split "=", 2
  if ($parts.Count -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
}

$db   = $envVars["POSTGRES_DB"] ?? "PepperImports"
$user = $envVars["POSTGRES_USER"] ?? "postgres"

# Detecta container postgres
$container = docker ps --format "{{.Names}}" | Where-Object { $_ -match "postgres" } | Select-Object -First 1
if (-not $container) {
  Write-Host "❌ Container PostgreSQL não está rodando!" -ForegroundColor Red
  exit 1
}

Write-Host "⚠️  ATENÇÃO: Isso vai SUBSTITUIR o banco '$db' pelo backup!" -ForegroundColor Yellow
$confirm = Read-Host "Digite 'CONFIRMAR' para continuar"
if ($confirm -ne "CONFIRMAR") {
  Write-Host "Operação cancelada." -ForegroundColor Gray
  exit 0
}

Write-Host "📥 Restaurando backup em '$db'..." -ForegroundColor Cyan

# Copia backup para o container
docker cp $BackupFile "${container}:/tmp/restore_backup.sql"

# Restaura
docker exec $container psql -U $user -d $db -f /tmp/restore_backup.sql

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Restore concluído com sucesso!" -ForegroundColor Green
} else {
  Write-Host "❌ Erro durante o restore!" -ForegroundColor Red
}

# Limpa arquivo temporário
docker exec $container rm -f /tmp/restore_backup.sql
