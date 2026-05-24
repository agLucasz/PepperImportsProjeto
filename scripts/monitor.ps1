<#
.SYNOPSIS
    PepperImports - Monitoramento de Containers
.PARAMETER Watch
    Atualizar continuamente a cada 5s
.PARAMETER Logs
    Mostrar logs ao inves de status
#>
param(
    [switch]$Watch,
    [switch]$Logs
)

function Show-Status {
    Clear-Host
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "=== PepperImports - Status dos Containers [$ts] ===" -ForegroundColor Cyan

    Write-Host ""
    Write-Host "--- Containers ---" -ForegroundColor DarkGray
    docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" 2>&1

    Write-Host ""
    Write-Host "--- Uso de Recursos ---" -ForegroundColor DarkGray
    docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}" 2>&1

    Write-Host ""
    Write-Host "--- Volumes em D:\docker-data ---" -ForegroundColor DarkGray
    $paths = @("postgres", "uploads", "logs")
    foreach ($p in $paths) {
        $full = "D:\docker-data\$p"
        if (Test-Path $full) {
            $sz = (Get-ChildItem $full -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
            $mb = [math]::Round($sz / 1MB, 1)
            Write-Host "  $p : $mb MB" -ForegroundColor Gray
        }
    }
}

if ($Logs) {
    $isRunningProd = docker ps --format "{{.Names}}" | Where-Object { $_ -match "prod" }
    if ($isRunningProd) {
        docker compose -f docker-compose.prod.yml logs -f --tail=100
    } else {
        docker compose -f docker-compose.dev.yml logs -f --tail=100
    }
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
