#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
#  PepperImports — Monitoramento de Containers
# ═══════════════════════════════════════════════════════════════════════════════
param(
  [switch]$Watch,  # Atualizar a cada 5s
  [switch]$Logs    # Mostrar logs ao invés de status
)

function Show-Status {
  Clear-Host
  Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkCyan
  Write-Host "  PepperImports — Status dos Containers  $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
  Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkCyan

  $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1
  Write-Host $containers

  Write-Host ""
  Write-Host "── Uso de Recursos ─────────────────────────────────" -ForegroundColor DarkGray
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>&1

  Write-Host ""
  Write-Host "── Volumes no D: ───────────────────────────────────" -ForegroundColor DarkGray
  if (Test-Path "D:\docker-data\postgres") {
    $sz = (Get-ChildItem "D:\docker-data\postgres" -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB
    Write-Host "  PostgreSQL: $([math]::Round($sz, 1)) MB" -ForegroundColor Gray
  }
}

if ($Logs) {
  $compose = if (Test-Path "docker-compose.prod.yml" -and (docker ps -q -f name=prod)) {
    "docker-compose.prod.yml"
  } else { "docker-compose.dev.yml" }
  docker compose -f $compose logs -f --tail=100
  exit 0
}

if ($Watch) {
  while ($true) {
    Show-Status
    Write-Host ""
    Write-Host "  Atualizando em 5s... (Ctrl+C para sair)" -ForegroundColor DarkGray
    Start-Sleep -Seconds 5
  }
} else {
  Show-Status
}
