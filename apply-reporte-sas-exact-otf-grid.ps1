$ErrorActionPreference = 'Stop'

$globalPath = 'src/assets/css/fm-global.css'
$reportPath = 'src/modules/reporteSas/components/Tabla.vue'

if (-not (Test-Path $globalPath)) { throw "No se encontro $globalPath" }
if (-not (Test-Path $reportPath)) { throw "No se encontro $reportPath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# -----------------------------------------------------------------------------
# 1) Reporte SAS: eliminar estilos visuales propios de la grilla.
#    Conserva solo estructura del contenedor y estilos especificos del campo
#    Legajo NOLDAP. Cabecera/filtros/celdas/paginador pasan a heredar el global.
# -----------------------------------------------------------------------------
$report = [System.IO.File]::ReadAllText($reportPath, [System.Text.Encoding]::UTF8)

$report = $report.Replace('class="fm-filter-cell reporte-sas-filter-cell"', 'class="fm-filter-cell"')
$report = $report.Replace('class="fm-column-filter reporte-sas-filter-input"', 'class="fm-column-filter"')
$report = $report.Replace('class="reporte-sas-filter-clear"', 'class="fm-icon-button"')
$report = $report.Replace('>×</button>', '><span aria-hidden="true">×</span></button>')

$minimalStyle = @'
<style scoped>
.reporte-sas-table-shell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  background: #fff;
}

/* Solo geometria. El aspecto de la grilla viene de fm-global.css. */
.reporte-sas-main-grid,
.reporte-sas-main-grid.p-datatable {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  border: 0 !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-table-container),
.reporte-sas-main-grid :deep(.p-datatable-wrapper),
.reporte-sas-main-grid :deep([data-pc-section='tablecontainer']) {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
  background: #fff !important;
}

.reporte-sas-cell-text {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reporte-sas-legajo-preview {
  appearance: none;
  width: 100%;
  min-width: 0;
  min-height: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 2px 5px;
  border: 1px solid #cfe1e6;
  border-radius: 3px;
  background: #fff;
  color: #263238;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.reporte-sas-legajo-preview > span {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reporte-sas-legajo-preview--expanded {
  min-height: 35px;
  white-space: normal;
}

.reporte-sas-legajo-preview--expanded > span {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}
</style>
'@

$report = [regex]::Replace($report, '(?s)<style scoped>.*?</style>', $minimalStyle)
[System.IO.File]::WriteAllText($reportPath, $report, $utf8NoBom)

# -----------------------------------------------------------------------------
# 2) Global: mismo estilo APROBADO de Registro OTs Fallidas para todas las
#    grillas Vue migradas. #tabla se excluye para no tocar la referencia.
# -----------------------------------------------------------------------------
$global = [System.IO.File]::ReadAllText($globalPath, [System.Text.Encoding]::UTF8)
$markerStart = '/* --- INICIO: fm-global-exact-otf-grid --- */'
$markerEnd = '/* --- FIN: fm-global-exact-otf-grid --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)
$global = [regex]::Replace($global, "(?s)\s*$startEscaped.*?$endEscaped\s*", "`r`n")

$css = @'
/* --- INICIO: fm-global-exact-otf-grid --- */
/*
 * ESTILO GLOBAL DE GRILLAS MIGRADAS
 * Replica los valores visuales de Registro OTs Fallidas.
 * #tabla queda excluida: es la referencia aprobada y no se toca.
 */
html body #app .fm-pass-grid.p-datatable:not(#tabla),
html body #app .fm-pt-datatable.p-datatable {
  width: 100% !important;
  max-width: 100% !important;
  border-left: 0 !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table-container,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-wrapper,
html body #app .fm-pass-grid.p-datatable:not(#tabla) [data-pc-section='tablecontainer'],
html body #app .fm-pt-datatable.p-datatable .p-datatable-table-container,
html body #app .fm-pt-datatable.p-datatable .p-datatable-wrapper,
html body #app .fm-pt-datatable.p-datatable [data-pc-section='tablecontainer'] {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow: auto !important;
  isolation: isolate !important;
  border: 1px solid #d1d1d1 !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table,
html body #app .fm-pt-datatable.p-datatable .p-datatable-table {
  width: max-content !important;
  min-width: 100% !important;
  table-layout: fixed !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 12px !important;
}

/* THEAD completo sticky: titulo + filtros se desplazan como una sola unidad. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 120 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody > tr > td {
  box-sizing: border-box !important;
  border: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  vertical-align: middle !important;
}

/* Nombres de columnas: exactamente como OTs Fallidas. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  position: relative !important;
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
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-column-header-content,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-column-title,
html body #app .fm-pt-datatable.p-datatable .p-column-header-content,
html body #app .fm-pt-datatable.p-datatable .p-datatable-column-title {
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* Filtros: 33px, blanco puro, linea simple de 1px. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row {
  background: #fff !important;
  background-color: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  position: relative !important;
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  overflow: visible !important;
  border-top: 0 !important;
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* Capa blanca opaca: el tbody nunca se ve por detras. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th > * {
  position: relative !important;
  z-index: 2 !important;
}

/* Mismo filtro de OTs Fallidas. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .fm-filter-cell,
html body #app .fm-pt-datatable.p-datatable .fm-filter-cell {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .fm-filter-prefix,
html body #app .fm-pt-datatable.p-datatable .fm-filter-prefix {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .fm-column-filter,
html body #app .fm-pt-datatable.p-datatable .fm-column-filter {
  width: 100% !important;
  min-width: 20px !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 3px 5px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 11px !important;
  box-sizing: border-box !important;
  box-shadow: none !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .fm-column-filter:focus,
html body #app .fm-pt-datatable.p-datatable .fm-column-filter:focus {
  outline: none !important;
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, .14) !important;
}

/* Datos: exactamente alturas/padding/tipografia de OTs Fallidas. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
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

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr:hover > td,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody > tr:hover > td {
  background: #edfafd !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-empty-message > td,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .fm-grid-empty,
html body #app .fm-pt-datatable.p-datatable .p-datatable-empty-message > td,
html body #app .fm-pt-datatable.p-datatable .fm-grid-empty {
  height: 110px !important;
  min-height: 110px !important;
  background: #eafcff !important;
  color: #407080 !important;
  text-align: center !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-paginator,
html body #app .fm-pt-datatable.p-datatable .p-paginator {
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 !important;
  border: 1px solid #d1d1d1 !important;
  border-top: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
}
/* --- FIN: fm-global-exact-otf-grid --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($globalPath, $global, $utf8NoBom)

Write-Host ''
Write-Host 'Reporte SAS ahora hereda el MISMO estilo de Registro OTs Fallidas.' -ForegroundColor Green
Write-Host 'Se quitaron los estilos visuales propios que lo estaban pisando.' -ForegroundColor Cyan
Write-Host 'El patron tambien queda global para las grillas Vue migradas.' -ForegroundColor Cyan
Write-Host 'Registro OTs Fallidas (#tabla) queda intacto.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Archivos modificados:'
Write-Host " - $globalPath"
Write-Host " - $reportPath"
