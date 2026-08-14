$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$markerStart = '/* --- INICIO: otf-sticky-header-filters --- */'
$markerEnd = '/* --- FIN: otf-sticky-header-filters --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)

$content = [regex]::Replace(
  $content,
  "(?s)\s*$startEscaped.*?$endEscaped\s*",
  "`r`n"
)

$css = @'
/* --- INICIO: otf-sticky-header-filters --- */
/*
 * Registro OTs Fallidas
 * Se congela el THEAD completo como una sola unidad para evitar
 * saltos/espacios entre cabecera y filtros. El fondo es totalmente
 * opaco para que el tbody no se vea por detras durante el scroll.
 */
html body #app #tabla.p-datatable .p-datatable-table-container,
html body #app #tabla.p-datatable .p-datatable-wrapper,
html body #app #tabla.p-datatable [data-pc-section='tablecontainer'] {
  position: relative !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  isolation: isolate !important;
  background: #fff !important;
}

html body #app #tabla.p-datatable .p-datatable-table,
html body #app #tabla.p-datatable table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

/*
 * IMPORTANTE:
 * Sticky sobre todo el THEAD, no fila por fila.
 * Asi desaparece el hueco blanco que se generaba al separar
 * la cabecera y los filtros con top distintos.
 */
html body #app #tabla.p-datatable .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 120 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
}

/* Las celdas ya no manejan sticky individualmente. */
html body #app #tabla.p-datatable .p-datatable-thead > tr > th {
  position: relative !important;
  top: auto !important;
  z-index: auto !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

/* Primera fila: nombres de columnas */
html body #app #tabla.p-datatable .p-datatable-thead > tr:first-child,
html body #app #tabla.p-datatable .p-datatable-thead > tr:first-child > th {
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
}

html body #app #tabla.p-datatable .p-datatable-thead > tr:first-child > th {
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/* Segunda fila: filtros, pegada directamente debajo de la cabecera */
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2),
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  overflow: visible !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/*
 * Una capa opaca cubre toda la celda de filtro.
 * El contenido real del filtro se pinta por encima de esa capa.
 */
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row > th::before,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2) > th::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row > th > *,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2) > th > * {
  position: relative !important;
  z-index: 2 !important;
}

html body #app #tabla.p-datatable .p-datatable-thead .fm-filter-cell,
html body #app #tabla.p-datatable .p-datatable-thead .fm-column-filter,
html body #app #tabla.p-datatable .p-datatable-thead .p-inputtext {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

/* El contenido de datos queda siempre por debajo del THEAD. */
html body #app #tabla.p-datatable .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

html body #app #tabla.p-datatable .p-datatable-tbody > tr,
html body #app #tabla.p-datatable .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
}
/* --- FIN: otf-sticky-header-filters --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Registro OTs Fallidas: THEAD completo congelado sin huecos.'
Write-Host 'Cabecera y filtros quedan unidos y opacos durante el scroll.'
Write-Host "Archivo modificado: $path"
