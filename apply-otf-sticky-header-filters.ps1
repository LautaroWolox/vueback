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
 * Registro OTs Fallidas:
 * se congela TODO el THEAD para que nombres de columnas + filtros
 * permanezcan juntos arriba durante el scroll vertical.
 */
html body #app #tabla.p-datatable .p-datatable-table-container,
html body #app #tabla.p-datatable .p-datatable-wrapper,
html body #app #tabla.p-datatable [data-pc-section='tablecontainer'] {
  position: relative !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
}

html body #app #tabla.p-datatable .p-datatable-table > .p-datatable-thead,
html body #app #tabla.p-datatable table > .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 80 !important;
  background: #fff !important;
  background-color: #fff !important;
}

/* La geometria sticky la maneja el THEAD completo. */
html body #app #tabla.p-datatable .p-datatable-thead > tr > th {
  position: relative !important;
  top: auto !important;
  z-index: auto !important;
  background-clip: padding-box !important;
}

/* Primera fila: nombres de columnas. */
html body #app #tabla.p-datatable .p-datatable-thead > tr:first-child > th {
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/* Segunda fila: filtros. */
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr.p-filter-row > th,
html body #app #tabla.p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  background: #fff !important;
  background-color: #fff !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

html body #app #tabla.p-datatable .p-datatable-thead .fm-filter-cell {
  position: relative !important;
  z-index: 2 !important;
  background: #fff !important;
  background-color: #fff !important;
}

html body #app #tabla.p-datatable .p-datatable-thead .fm-column-filter,
html body #app #tabla.p-datatable .p-datatable-thead .p-inputtext {
  position: relative !important;
  z-index: 3 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app #tabla.p-datatable .p-datatable-thead .fm-filter-prefix,
html body #app #tabla.p-datatable .p-datatable-thead .fm-icon-button {
  position: relative !important;
  z-index: 4 !important;
}
/* --- FIN: otf-sticky-header-filters --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Registro OTs Fallidas: THEAD completo congelado.'
Write-Host 'Nombres de columnas y filtros permanecen fijos durante el scroll vertical.'
Write-Host "Archivo modificado: $path"
