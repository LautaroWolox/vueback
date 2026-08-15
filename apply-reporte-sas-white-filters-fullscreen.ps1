$ErrorActionPreference = 'Stop'

$globalPath = 'src/assets/css/fm-global.css'
$pagePath = 'src/modules/reporteSas/ReporteSAS.vue'

if (-not (Test-Path $globalPath)) { throw "No se encontro $globalPath" }
if (-not (Test-Path $pagePath)) { throw "No se encontro $pagePath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Upsert-StyleBlock {
  param(
    [string]$Path,
    [string]$StartMarker,
    [string]$EndMarker,
    [string]$Css
  )

  $content = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  $startEscaped = [regex]::Escape($StartMarker)
  $endEscaped = [regex]::Escape($EndMarker)

  $content = [regex]::Replace(
    $content,
    "(?s)\s*$startEscaped.*?$endEscaped\s*",
    "`r`n"
  )

  $styleClose = $content.LastIndexOf('</style>')
  if ($styleClose -lt 0) { throw "No se encontro </style> en $Path" }

  $block = "`r`n" + $StartMarker + "`r`n" + $Css.Trim() + "`r`n" + $EndMarker + "`r`n"
  $content = $content.Insert($styleClose, $block)
  [System.IO.File]::WriteAllText($Path, $content, $utf8NoBom)
}

# -----------------------------------------------------------------------------
# 1) GLOBAL: filtros blancos y separadores finos en TODAS las grillas migradas.
#    Registro OTs Fallidas (#tabla) queda excluido porque ya es la referencia.
# -----------------------------------------------------------------------------
$global = [System.IO.File]::ReadAllText($globalPath, [System.Text.Encoding]::UTF8)
$globalStart = '/* --- INICIO: fm-global-grid-white-filter-final --- */'
$globalEnd = '/* --- FIN: fm-global-grid-white-filter-final --- */'
$globalStartEscaped = [regex]::Escape($globalStart)
$globalEndEscaped = [regex]::Escape($globalEnd)
$global = [regex]::Replace($global, "(?s)\s*$globalStartEscaped.*?$globalEndEscaped\s*", "`r`n")

$globalCss = @'
/* --- INICIO: fm-global-grid-white-filter-final --- */
/*
 * Grillas Vue migradas: mismo acabado visual que Registro OTs Fallidas.
 * - separador cabecera/filtros de 1px;
 * - fila de filtros 100% blanca;
 * - inputs blancos sin gradientes ni fondos heredados.
 * #tabla se excluye porque ya tiene el comportamiento aprobado.
 */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  border-bottom: 1px solid #dce3e8 !important;
  box-shadow: none !important;
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
  border-bottom: 1px solid #dce3e8 !important;
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-filter-cell,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-inputtext,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead input,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-filter-cell,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-inputtext,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead input {
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-inputtext,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead input,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-inputtext,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead input {
  border: 1px solid #c7d1d8 !important;
  color: #263238 !important;
}
/* --- FIN: fm-global-grid-white-filter-final --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $globalCss.Trim() + "`r`n"
[System.IO.File]::WriteAllText($globalPath, $global, $utf8NoBom)

# -----------------------------------------------------------------------------
# 2) REPORTE SAS: ocupar TODO el alto disponible debajo del menu.
#    El menu actual ocupa 42px + 3px de acento + 37px de spacer = 82px.
# -----------------------------------------------------------------------------
$pageCss = @'
/* Reporte SAS full viewport debajo del menu (42 + 3 + 37 = 82px). */
.report-sas-page {
  width: 100% !important;
  max-width: 100% !important;
  height: calc(100dvh - 82px) !important;
  min-height: calc(100dvh - 82px) !important;
  max-height: calc(100dvh - 82px) !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.report-sas-page :deep(.report-sas-accordion.p-accordion),
.report-sas-page :deep(.report-sas-results-panel.p-accordionpanel),
.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent),
.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent-content),
.report-sas-page :deep(.report-sas-grid-shell.fm-grid-shell),
.report-sas-page :deep(.reporte-sas-table-shell),
.report-sas-page :deep(#tabla-reporte-sas.p-datatable) {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 0 !important;
}

.report-sas-page :deep(.report-sas-results-panel.p-accordionpanel),
.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent),
.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent-content),
.report-sas-page :deep(.report-sas-grid-shell.fm-grid-shell),
.report-sas-page :deep(.reporte-sas-table-shell),
.report-sas-page :deep(#tabla-reporte-sas.p-datatable) {
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* El cuerpo de la tabla absorbe todo el alto libre; el paginador queda abajo. */
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-table-container),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-wrapper),
.report-sas-page :deep(#tabla-reporte-sas [data-pc-section='tablecontainer']) {
  width: 100% !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 0 !important;
  overflow: auto !important;
  background: #fff !important;
}

.report-sas-page :deep(#tabla-reporte-sas .p-datatable-paginator-bottom),
.report-sas-page :deep(#tabla-reporte-sas > .p-paginator),
.report-sas-page :deep(#tabla-reporte-sas .p-paginator) {
  flex: 0 0 38px !important;
  height: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
}

/* Refuerzo especifico: ni PrimeVue ni estilos scoped pueden volver gris los filtros. */
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr.p-datatable-filter-row),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr.p-filter-row),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr.p-datatable-filter-row > th),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr.p-filter-row > th),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead .fm-filter-cell),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead .p-column-filter),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead .fm-column-filter),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead .p-inputtext),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead input) {
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
}

.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr:first-child > th) {
  border-bottom: 1px solid #dce3e8 !important;
  box-shadow: none !important;
}

.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr.p-datatable-filter-row > th),
.report-sas-page :deep(#tabla-reporte-sas .p-datatable-thead > tr.p-filter-row > th) {
  border-top: 0 !important;
  border-bottom: 1px solid #dce3e8 !important;
  box-shadow: none !important;
}
'@

Upsert-StyleBlock -Path $pagePath -StartMarker '/* --- INICIO: reporte-sas-white-filters-fullscreen --- */' -EndMarker '/* --- FIN: reporte-sas-white-filters-fullscreen --- */' -Css $pageCss

Write-Host ''
Write-Host 'Reporte SAS corregido:' -ForegroundColor Green
Write-Host ' - filtros y campos completamente blancos' -ForegroundColor Cyan
Write-Host ' - separador cabecera/filtros fino (1px)' -ForegroundColor Cyan
Write-Host ' - grilla expandida a todo el viewport disponible' -ForegroundColor Cyan
Write-Host 'Global:' -ForegroundColor Green
Write-Host ' - el fondo blanco de filtros se aplica a todas las grillas migradas' -ForegroundColor Cyan
Write-Host ' - Registro OTs Fallidas (#tabla) permanece intacto' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Archivos modificados:' -ForegroundColor Gray
Write-Host " - $globalPath"
Write-Host " - $pagePath"
