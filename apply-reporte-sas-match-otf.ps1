$ErrorActionPreference = 'Stop'

$reportPath = 'src/modules/reporteSas/ReporteSAS.vue'
$tablePath = 'src/modules/reporteSas/components/Tabla.vue'

if (-not (Test-Path $reportPath)) { throw "No se encontro $reportPath" }
if (-not (Test-Path $tablePath)) { throw "No se encontro $tablePath" }

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

$reportCss = @'
/* Mismo contenedor/acordeon visual que Registro OTs Fallidas. */
.report-sas-page {
  margin: -12px 0 0 !important;
  padding: 0 6px 4px !important;
  box-sizing: border-box !important;
}

.report-sas-page :deep(.report-sas-accordion.p-accordion) {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.report-sas-page :deep(.report-sas-results-panel.p-accordionpanel) {
  margin: 0 !important;
  border: 1px solid #d6dde2 !important;
  border-radius: 0 !important;
  background: #fff !important;
  overflow: hidden !important;
}

.report-sas-page :deep(.report-sas-results-panel .p-accordionheader) {
  min-height: 28px !important;
  height: 28px !important;
  flex: 0 0 28px !important;
  padding: 5px 10px !important;
  border: 0 !important;
  border-bottom: 1px solid #dfe4e8 !important;
  border-radius: 0 !important;
  background: #f7f7f7 !important;
  color: #000 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  line-height: 18px !important;
  box-shadow: none !important;
}

.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent),
.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent-content) {
  padding: 0 !important;
  border: 0 !important;
  background: #fff !important;
}

/* El error queda separado de la grilla, sin cambiar la geometria de columnas/filtros. */
.report-sas-error {
  min-height: 38px !important;
  padding: 7px 10px !important;
  border: 0 !important;
  border-bottom: 1px solid #efd2d6 !important;
  background: #fff6f7 !important;
  font-size: 12px !important;
}
'@

$tableCss = @'
/* Reporte SAS: misma grilla visual que Registro OTs Fallidas. */
.reporte-sas-main-grid,
.reporte-sas-main-grid.p-datatable {
  width: 100% !important;
  max-width: 100% !important;
  border-left: 0 !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-table-container),
.reporte-sas-main-grid :deep(.p-datatable-wrapper),
.reporte-sas-main-grid :deep([data-pc-section='tablecontainer']) {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 186px !important;
  overflow: auto !important;
  isolation: isolate !important;
  border: 1px solid #d1d1d1 !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-table) {
  width: max-content !important;
  min-width: 100% !important;
  table-layout: fixed !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 12px !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead) {
  position: relative !important;
  z-index: 120 !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr > th),
.reporte-sas-main-grid :deep(.p-datatable-tbody > tr > td) {
  box-sizing: border-box !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  vertical-align: middle !important;
}

/* Nombres de columnas: visibles y fijos. */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child > th) {
  position: sticky !important;
  top: 0 !important;
  z-index: 122 !important;
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  overflow: visible !important;
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

.reporte-sas-main-grid :deep(.p-column-header-content),
.reporte-sas-main-grid :deep(.p-datatable-column-title),
.reporte-sas-main-grid :deep(.p-sortable-column-icon) {
  position: relative !important;
  z-index: 3 !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.reporte-sas-main-grid :deep(.p-column-header-content),
.reporte-sas-main-grid :deep(.p-datatable-column-title) {
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* Filtros: segunda fila fija, opaca y pegada a los nombres. */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:nth-child(2) > th) {
  position: sticky !important;
  top: 34px !important;
  z-index: 121 !important;
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  overflow: visible !important;
  border-top: 0 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th::before),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th::before),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:nth-child(2) > th::before) {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  opacity: 1 !important;
}

.reporte-sas-main-grid :deep(.fm-filter-cell),
.reporte-sas-main-grid :deep(.p-column-filter),
.reporte-sas-main-grid :deep(.p-datatable-thead .p-inputtext) {
  position: relative !important;
  z-index: 2 !important;
}

.reporte-sas-filter-cell {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
}

.reporte-sas-main-grid :deep(.fm-filter-prefix) {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}

.reporte-sas-filter-input,
.reporte-sas-filter-input.p-inputtext {
  width: 100% !important;
  min-width: 20px !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 3px 5px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  background: #fff !important;
  font-size: 11px !important;
  box-sizing: border-box !important;
}

.reporte-sas-filter-input:focus,
.reporte-sas-filter-input.p-inputtext:focus {
  outline: none !important;
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, .14) !important;
}

.reporte-sas-filter-clear {
  width: 16px !important;
  min-width: 16px !important;
  height: 24px !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  color: #111 !important;
  font-size: 13px !important;
  font-weight: 700 !important;
}

.reporte-sas-filter-clear:hover {
  color: #00a9bd !important;
}

.reporte-sas-main-grid :deep(.p-datatable-tbody),
.reporte-sas-main-grid :deep(.p-datatable-tbody > tr),
.reporte-sas-main-grid :deep(.p-datatable-tbody > tr > td) {
  position: relative !important;
  z-index: 1 !important;
}

.reporte-sas-main-grid :deep(.p-datatable-tbody > tr > td) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 5px 8px !important;
  overflow: hidden !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 12px !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.reporte-sas-main-grid :deep(.p-datatable-tbody > tr:hover > td) {
  background: #edfafd !important;
}

.reporte-sas-main-grid :deep(.p-datatable-empty-message > td),
.reporte-sas-main-grid :deep(.fm-grid-empty) {
  height: 110px !important;
  min-height: 110px !important;
  background: #eafcff !important;
  color: #407080 !important;
  text-align: center !important;
}

.reporte-sas-main-grid :deep(.p-paginator) {
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 !important;
  overflow: visible !important;
  border: 1px solid #d1d1d1 !important;
  border-top: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
}
'@

Upsert-StyleBlock -Path $reportPath -StartMarker '/* --- INICIO: reporte-sas-match-otf-page --- */' -EndMarker '/* --- FIN: reporte-sas-match-otf-page --- */' -Css $reportCss
Upsert-StyleBlock -Path $tablePath -StartMarker '/* --- INICIO: reporte-sas-match-otf-grid --- */' -EndMarker '/* --- FIN: reporte-sas-match-otf-grid --- */' -Css $tableCss

Write-Host ''
Write-Host 'Reporte SAS igualado visualmente a Registro OTs Fallidas.' -ForegroundColor Green
Write-Host 'Se modificaron SOLO:' -ForegroundColor Cyan
Write-Host " - $reportPath"
Write-Host " - $tablePath"
Write-Host 'No se modifico responsive iframe, menu, spinner ni OTs Fallidas.' -ForegroundColor Yellow
