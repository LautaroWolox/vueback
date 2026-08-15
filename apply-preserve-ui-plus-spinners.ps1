$ErrorActionPreference = 'Stop'

$sourceRef = 'github-origen/fix-grids-fullscreen-loader-final'

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' RESTAURAR UI ESTABLE + AGREGAR SPINNERS' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host 'Este proceso conserva/reaplica:' -ForegroundColor Gray
Write-Host '  1) submenus sin estiramiento' -ForegroundColor Gray
Write-Host '  2) responsive final de pantallas legacy/iframe' -ForegroundColor Gray
Write-Host '  3) detalle Acta usando todo el viewport' -ForegroundColor Gray
Write-Host '  4) dialogs iframe con zoom reversible y centrado' -ForegroundColor Gray
Write-Host '  5) limpieza de bloques responsive duplicados' -ForegroundColor Gray
Write-Host '  6) cabecera + filtros sticky de OTs Fallidas' -ForegroundColor Gray
Write-Host '  7) cabecera + filtros sticky en las demas grillas' -ForegroundColor Gray
Write-Host '  8) sticky reforzado especifico de Reporte SAS' -ForegroundColor Gray
Write-Host '  9) spinners contextuales Telecom / Personal' -ForegroundColor Gray
Write-Host ''

$scripts = @(
  'apply-submenu-final.ps1',
  'apply-legacy-responsive-final.ps1',
  'apply-detail-dialog-zoom-v2.ps1',
  'apply-legacy-dialog-zoom-reversible.ps1',
  'apply-responsive-iframe-deduplicate.ps1',
  'apply-otf-sticky-header-filters.ps1',
  'apply-grid-sticky-all.ps1',
  'apply-reporte-sas-sticky-final.ps1',
  'apply-spinner-only.ps1'
)

foreach ($script in $scripts) {
  Write-Host "Aplicando $script ..." -ForegroundColor Yellow

  $scriptContent = git show "$sourceRef`:$script"
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo leer $script desde $sourceRef. Ejecuta primero: git fetch github-origen"
  }

  $tempFile = Join-Path $env:TEMP ("fm-" + [guid]::NewGuid().ToString('N') + '.ps1')
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($tempFile, (($scriptContent -join "`n") + "`n"), $utf8NoBom)

  try {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $tempFile
    if ($LASTEXITCODE -ne 0) {
      throw "$script termino con codigo $LASTEXITCODE"
    }
  }
  finally {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
  }

  Write-Host "OK: $script" -ForegroundColor Green
  Write-Host ''
}

Write-Host '============================================================' -ForegroundColor Green
Write-Host ' LISTO: UI estable restaurada + spinners aplicados' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Archivos que pueden cambiar por los fixes ya aprobados:' -ForegroundColor Gray
Write-Host ' - src/assets/css/fm-global.css' -ForegroundColor Gray
Write-Host ' - src/components/CustomMenu.vue' -ForegroundColor Gray
Write-Host ' - src/plugins/responsiveIframes.js' -ForegroundColor Gray
Write-Host ' - src/modules/reporteSas/components/Tabla.vue' -ForegroundColor Gray
Write-Host ' - archivos responsive legacy que actualicen los scripts finales' -ForegroundColor Gray
Write-Host ' - src/components/shared/FmTypingLoader.vue' -ForegroundColor Gray
Write-Host ' - src/components/shared/fmLoaderProfiles.js' -ForegroundColor Gray
Write-Host ' - src/modules/shared/components/LoadingOverlay.vue' -ForegroundColor Gray
Write-Host ''
Write-Host 'No hace pull, merge ni rebase.' -ForegroundColor Cyan
Write-Host 'Revisar ahora con: git status' -ForegroundColor Yellow
