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
/* Registro OTs Fallidas: encabezado + filtros permanecen fijos al scroll vertical. */
html body #app #tabla .p-datatable-thead > tr:first-child > th {
  position: sticky !important;
  top: 0 !important;
  z-index: 42 !important;
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  background-clip: padding-box !important;
}

html body #app #tabla .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app #tabla .p-datatable-thead > tr.p-filter-row > th {
  position: sticky !important;
  top: 34px !important;
  z-index: 41 !important;
  background: #fff !important;
  background-color: #fff !important;
  background-clip: padding-box !important;
  box-shadow: 0 1px 0 #c9d3da !important;
}

html body #app #tabla .p-datatable-thead > tr.p-datatable-filter-row > th .fm-filter-cell,
html body #app #tabla .p-datatable-thead > tr.p-filter-row > th .fm-filter-cell {
  position: relative !important;
  z-index: 2 !important;
  background: #fff !important;
  background-color: #fff !important;
}

html body #app #tabla .p-datatable-thead .fm-column-filter,
html body #app #tabla .p-datatable-thead .p-inputtext {
  position: relative !important;
  z-index: 3 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app #tabla .p-datatable-thead .fm-filter-prefix,
html body #app #tabla .p-datatable-thead .fm-icon-button {
  position: relative !important;
  z-index: 4 !important;
}

/* Mantiene el scroll dentro del contenedor de la grilla, que es el contexto sticky. */
html body #app #tabla .p-datatable-table-container,
html body #app #tabla .p-datatable-wrapper,
html body #app #tabla [data-pc-section='tablecontainer'] {
  position: relative !important;
  overflow: auto !important;
}
/* --- FIN: otf-sticky-header-filters --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Registro OTs Fallidas: encabezado y filtros fijados al scroll vertical.'
Write-Host 'El scroll de datos pasa por debajo sin mover las dos filas superiores.'
Write-Host "Archivo modificado: $path"
