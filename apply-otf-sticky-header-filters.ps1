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
 * Cabecera y filtros fijos, con capa opaca real para impedir que
 * las filas del tbody se pinten por detras durante el scroll.
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

html body #app #tabla.p-datatable .p-datatable-thead {
  position: relative !important;
  z-index: 100 !important;
}

html body #app #tabla.p-datatable .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

/* Primera fila: nombres de columnas */
html body #app #tabla.p-datatable .p-datatable-thead > tr:first-child > th {
  position: sticky !important;
  top: 0 !important;
  z-index: 120 !important;
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  background-clip: border-box !important;
  opacity: 1 !important;
  isolation: isolate !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/* Segunda fila: filtros */
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  position: sticky !important;
  top: 34px !important;
  z-index: 119 !important;
  overflow: hidden !important;
  background: #fff !important;
  background-color: #fff !important;
  background-clip: border-box !important;
  opacity: 1 !important;
  isolation: isolate !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/*
 * Capa blanca fisica dentro de cada celda de filtro.
 * Esto fuerza el repintado por encima del tbody incluso en Chrome
 * cuando sticky + tablas genera artefactos de stacking.
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

/* Todo el contenido real del filtro queda sobre la capa blanca */
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

/* El tbody nunca puede competir con las capas sticky */
html body #app #tabla.p-datatable .p-datatable-tbody > tr,
html body #app #tabla.p-datatable .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
}
/* --- FIN: otf-sticky-header-filters --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Registro OTs Fallidas: cabecera y filtros fijados con capa opaca.'
Write-Host 'Las filas ya no deben verse por detras de los filtros durante el scroll.'
Write-Host "Archivo modificado: $path"
