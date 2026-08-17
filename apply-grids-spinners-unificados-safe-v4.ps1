$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$sourceRef = 'github-origen/unificar-grids-spinners-safe-v1'
$baseScript = 'apply-grids-spinners-unificados-safe-v3.ps1'

Write-Host ''
Write-Host 'FM - GRILLAS + SPINNERS SAFE V4' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor Cyan

$lines = @(git show "$sourceRef`:$baseScript")
if ($LASTEXITCODE -ne 0 -or $lines.Count -eq 0) {
  throw "No se pudo leer $baseScript desde $sourceRef. Ejecuta primero: git fetch github-origen"
}

Invoke-Expression ($lines -join "`r`n")

# Refuerzo final del Buscador: no depende de ningún toggle para renderizar filtros.
$path = 'src/modules/buscadorOts/components/Tabla.vue'
$content = [System.IO.File]::ReadAllText((Resolve-Path $path), [System.Text.Encoding]::UTF8)
$content = $content.Replace(':filter="store.showColumnFilters"', 'filter')
$content = $content.Replace('<div v-if="store.showColumnFilters" class="busqueda-ots-column-filter">', '<div class="fm-filter-cell busqueda-ots-column-filter">')

if ($content.Contains(':filter="store.showColumnFilters"')) {
  throw 'La grilla del Buscador todavía depende de showColumnFilters.'
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path $path), $content, $utf8NoBom)

Write-Host ''
Write-Host 'REFUERZO V4 OK' -ForegroundColor Green
Write-Host 'La fila de filtros del Buscador queda permanente.' -ForegroundColor Green
