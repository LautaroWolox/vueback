$ErrorActionPreference = 'Stop'

$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$markerStart = '/* --- INICIO: fm-global-sticky-grid-visual-refine --- */'
$markerEnd = '/* --- FIN: fm-global-sticky-grid-visual-refine --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)

$content = [regex]::Replace(
  $content,
  "(?s)\s*$startEscaped.*?$endEscaped\s*",
  "`r`n"
)

$css = @'
/* --- INICIO: fm-global-sticky-grid-visual-refine --- */
/*
 * Ajuste visual global para grillas Vue migradas:
 * - una sola linea fina entre nombres de columnas y filtros;
 * - fila de filtros completamente blanca, sin mezcla gris;
 * - Registro OTs Fallidas (#tabla) queda intacto.
 */

/* La separacion entre cabecera y filtros debe ser una sola linea de 1px. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  border-bottom: 1px solid #c9d3da !important;
  box-shadow: none !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  border-top: 0 !important;
}

/* Fondo blanco real en toda la fila de filtros y en sus huecos internos. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-filter-cell,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .p-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-filter-cell,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .p-column-filter {
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
}

/* Mantiene una linea fina inferior igual a las lineas de la grilla. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  border-bottom: 1px solid #dfe6ea !important;
  box-shadow: none !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr.p-filter-row > th::before {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}
/* --- FIN: fm-global-sticky-grid-visual-refine --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host ''
Write-Host 'Ajuste visual aplicado a grillas sticky globales.' -ForegroundColor Green
Write-Host 'Separador cabecera/filtros: 1px.' -ForegroundColor Cyan
Write-Host 'Fondo de filtros: blanco puro.' -ForegroundColor Cyan
Write-Host 'Registro OTs Fallidas (#tabla) no fue modificado.' -ForegroundColor Yellow
Write-Host "Archivo modificado: $path"
