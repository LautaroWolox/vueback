$ErrorActionPreference = 'Stop'

$globalPath = 'src/assets/css/fm-global.css'
$reportPath = 'src/modules/reporteSas/components/Tabla.vue'

if (-not (Test-Path $globalPath)) { throw "No se encontro $globalPath" }
if (-not (Test-Path $reportPath)) { throw "No se encontro $reportPath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1) Refuerzo GLOBAL para todas las grillas Vue migradas.
$global = [System.IO.File]::ReadAllText($globalPath, [System.Text.Encoding]::UTF8)
$markerStart = '/* --- INICIO: fm-global-sticky-grid-visual-final --- */'
$markerEnd = '/* --- FIN: fm-global-sticky-grid-visual-final --- */'
$global = [regex]::Replace(
  $global,
  "(?s)\s*" + [regex]::Escape($markerStart) + ".*?" + [regex]::Escape($markerEnd) + "\s*",
  "`r`n"
)

$globalCss = @'
/* --- INICIO: fm-global-sticky-grid-visual-final --- */
/*
 * Ajuste visual FINAL de cabecera + filtros sticky para grillas Vue migradas.
 * - separador fino y claro, igual al resto de la grilla;
 * - filtros completamente blancos;
 * - sin sombras ni dobles bordes;
 * - Registro OTs Fallidas (#tabla) queda intacto.
 */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  border-top: 0 !important;
  border-bottom: 1px solid #d3d3d3 !important;
  box-shadow: none !important;
  outline: 0 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  border-top: 0 !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  box-shadow: none !important;
  outline: 0 !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th::before {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-filter-cell,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-inputtext,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead input,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-filter-cell,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-inputtext,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead input {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
}
/* --- FIN: fm-global-sticky-grid-visual-final --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $globalCss.Trim() + "`r`n"
[System.IO.File]::WriteAllText($globalPath, $global, $utf8NoBom)

# 2) Reporte SAS tenia estilos scoped propios que seguian imponiendo un borde
#    gris mas oscuro. Se neutralizan SOLO esas propiedades para que herede el
#    comportamiento global, sin cambiar estructura, datos ni funcionalidad.
$report = [System.IO.File]::ReadAllText($reportPath, [System.Text.Encoding]::UTF8)
$reportMarkerStart = '/* --- INICIO: reporte-sas-neutralize-local-header-filter-borders --- */'
$reportMarkerEnd = '/* --- FIN: reporte-sas-neutralize-local-header-filter-borders --- */'
$report = [regex]::Replace(
  $report,
  "(?s)\s*" + [regex]::Escape($reportMarkerStart) + ".*?" + [regex]::Escape($reportMarkerEnd) + "\s*",
  "`r`n"
)

$reportCss = @'
/* --- INICIO: reporte-sas-neutralize-local-header-filter-borders --- */
/* Deja que el sticky global gobierne separadores y fondo de filtros. */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child > th) {
  border-top: 0 !important;
  border-bottom: 1px solid #d3d3d3 !important;
  box-shadow: none !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th) {
  border-top: 0 !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  box-shadow: none !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th::before),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th::before),
.reporte-sas-main-grid :deep(.p-datatable-thead .fm-filter-cell),
.reporte-sas-main-grid :deep(.p-datatable-thead .p-column-filter),
.reporte-sas-main-grid :deep(.p-datatable-thead .p-inputtext) {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
}
/* --- FIN: reporte-sas-neutralize-local-header-filter-borders --- */
'@

$styleClose = $report.LastIndexOf('</style>')
if ($styleClose -lt 0) { throw "No se encontro </style> en $reportPath" }
$report = $report.Insert($styleClose, "`r`n" + $reportCss.Trim() + "`r`n")
[System.IO.File]::WriteAllText($reportPath, $report, $utf8NoBom)

Write-Host ''
Write-Host 'Ajuste visual FINAL aplicado.' -ForegroundColor Green
Write-Host 'Separador cabecera/filtros: 1px #d3d3d3, sin sombra ni doble borde.' -ForegroundColor Cyan
Write-Host 'Fila de filtros: blanco puro #ffffff.' -ForegroundColor Cyan
Write-Host 'Reporte SAS: neutralizados los estilos scoped que estaban pisando el global.' -ForegroundColor Cyan
Write-Host 'Registro OTs Fallidas (#tabla): intacto.' -ForegroundColor Yellow
Write-Host 'Archivos modificados:' -ForegroundColor Gray
Write-Host " - $globalPath"
Write-Host " - $reportPath"
