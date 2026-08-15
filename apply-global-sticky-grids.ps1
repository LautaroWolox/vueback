$ErrorActionPreference = 'Stop'

$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$markerStart = '/* --- INICIO: fm-global-sticky-grid-header-filters --- */'
$markerEnd = '/* --- FIN: fm-global-sticky-grid-header-filters --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)

# Idempotente: si ya estaba aplicado, reemplaza solamente este bloque.
$content = [regex]::Replace(
  $content,
  "(?s)\s*$startEscaped.*?$endEscaped\s*",
  "`r`n"
)

$css = @'
/* --- INICIO: fm-global-sticky-grid-header-filters --- */
/*
 * GLOBAL - grillas Vue migradas.
 * Replica el comportamiento aprobado de Registro OTs Fallidas:
 * THEAD completo sticky + nombres y filtros unidos + fondo opaco.
 *
 * #tabla (Registro OTs Fallidas) queda excluida porque ya posee su
 * implementacion especifica y no se modifica.
 */

/* Contenedor de scroll: crea una capa aislada para que tbody no atraviese THEAD. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table-container,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-wrapper,
html body #app .fm-pass-grid.p-datatable:not(#tabla) [data-pc-section='tablecontainer'],
html body #app .fm-pt-datatable.p-datatable .p-datatable-table-container,
html body #app .fm-pt-datatable.p-datatable .p-datatable-wrapper,
html body #app .fm-pt-datatable.p-datatable [data-pc-section='tablecontainer'] {
  position: relative !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  isolation: isolate !important;
  background: #fff !important;
}

/* Sticky sobre TODO el THEAD, no fila por fila. */
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

/* Evita huecos entre celdas cuando el THEAD queda sticky. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table,
html body #app .fm-pass-grid.p-datatable:not(#tabla) table,
html body #app .fm-pt-datatable.p-datatable .p-datatable-table,
html body #app .fm-pt-datatable.p-datatable table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

/* Las celdas no manejan sticky individualmente. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr > th {
  position: relative !important;
  top: auto !important;
  z-index: auto !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

/* Primera fila: nombres de columnas. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/* Segunda fila: filtros. Solo se aplica a las filas que PrimeVue marca como filtros. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  overflow: visible !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/* Capa opaca SOLO en las celdas de filtro. */
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
  background-color: #fff !important;
  opacity: 1 !important;
}

/* El contenido real del filtro se dibuja sobre la capa opaca. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th > * {
  position: relative !important;
  z-index: 2 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-filter-cell,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-inputtext,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-filter-cell,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-inputtext {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

/* Tbody siempre queda debajo del THEAD. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody > tr,
html body #app .fm-pt-datatable.p-datatable .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
}
/* --- FIN: fm-global-sticky-grid-header-filters --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host ''
Write-Host 'Sticky global aplicado a grillas Vue migradas.' -ForegroundColor Green
Write-Host 'Reporte SAS queda incluido mediante .fm-pass-grid.' -ForegroundColor Cyan
Write-Host 'Registro OTs Fallidas (#tabla) queda intacto con su fix especifico.' -ForegroundColor Yellow
Write-Host "Archivo modificado: $path"
