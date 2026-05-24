#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Backup do PostgreSQL
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [string]$EnvFile = ".env",
  [string]$OutputDir = "D:\docker-data\backups"
)

$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

# Criar diretório de backup se não existir
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Carregar variáveis de ambiente
$envVars = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^[A-Z]" -and $_ -notmatch "^#" } | ForEach-Object {
  $parts = $_ -split "=", 2
  if ($parts.Count -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
}

$db   = $envVars["POSTGRES_DB"] ?? "PepperImports"
$user = $envVars["POSTGRES_USER"] ?? "postgres"
$ts   = (Get-Date -Format "yyyy-MM-dd_HH-mm-ss")
$file = "$OutputDir\pepper_backup_$ts.sql.gz"

Write-Host "📦 Iniciando backup do banco '$db'..." -ForegroundColor Cyan

# Detecta qual compose está rodando
$container = "pepper_postgres_prod"
$running = docker ps --format "{{.Names}}" | Where-Object { $_ -match "postgres" }
if ($running) { $container = $running | Select-Object -First 1 }

docker exec $container pg_dump -U $user -d $db | `
  & { param($in) $in | gzip } | `
  Set-Content -Path $file -AsByteStream

if ($LASTEXITCODE -eq 0) {
  $size = (Get-Item $file).Length / 1MB
  Write-Host "✅ Backup salvo em: $file ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
  Write-Host "❌ Erro no backup!" -ForegroundColor Red
  # Fallback sem gzip
  $fileRaw = "$OutputDir\pepper_backup_$ts.sql"
  docker exec $container pg_dump -U $user -d $db -f /tmp/backup.sql
  docker cp "${container}:/tmp/backup.sql" $fileRaw
  Write-Host "✅ Backup salvo sem compressão: $fileRaw" -ForegroundColor Yellow
}
