$ErrorActionPreference = 'Stop'

$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$markerStart = '/* --- INICIO: fm-filter-row-pure-white-final --- */'
$markerEnd = '/* --- FIN: fm-filter-row-pure-white-final --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)

$content = [regex]::Replace(
  $content,
  "(?s)\s*$startEscaped.*?$endEscaped\s*",
  "`r`n"
)

$css = @'
/* --- INICIO: fm-filter-row-pure-white-final --- */
/*
 * Override final de la fila de filtros para grillas Vue migradas.
 *
 * Motivo: el estilo global base de cabeceras aplica --fm-header-bg (#f3f7f9)
 * a TODOS los th del THEAD. En PrimeVue la fila de filtros tambien esta dentro
 * del THEAD, por eso algunos th conservaban gris aunque el input fuera blanco.
 *
 * Se fuerza la segunda fila del THEAD (filterDisplay="row") y cualquier th que
 * contenga .fm-filter-cell a blanco puro. Registro OTs Fallidas (#tabla) se
 * excluye porque ya tiene su fix aprobado.
 */

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:nth-child(2),
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:nth-child(2) > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:nth-child(2),
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* Chrome moderno: identifica semanticamente las celdas que contienen filtros. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr > th:has(.fm-filter-cell),
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr > th:has(.fm-filter-cell) {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
  border-top: 0 !important;
  border-bottom: 1px solid #dce3e8 !important;
}

/* Elimina tambien el gris de wrappers internos de PrimeVue. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:nth-child(2) > th > *,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:nth-child(2) .fm-filter-cell,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:nth-child(2) .p-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:nth-child(2) [data-pc-section='columnfilter'],
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:nth-child(2) > th > *,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:nth-child(2) .fm-filter-cell,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:nth-child(2) .p-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:nth-child(2) [data-pc-section='columnfilter'] {
  background-color: #ffffff !important;
  background-image: none !important;
}

/* Input siempre blanco, sin gradiente ni sombra de tema. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead .fm-column-filter,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead input.p-inputtext,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead input,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead .fm-column-filter,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead input.p-inputtext,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead input {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  box-shadow: none !important;
}

/* Una sola linea fina entre nombres y filtros. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable .p-datatable-thead > tr:first-child > th {
  border-bottom: 1px solid #c9d3da !important;
  box-shadow: none !important;
}
/* --- FIN: fm-filter-row-pure-white-final --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host ''
Write-Host 'Fila de filtros corregida a blanco puro.' -ForegroundColor Green
Write-Host 'Se neutralizo el gris heredado de --fm-header-bg en los th de filtros.' -ForegroundColor Cyan
Write-Host 'Registro OTs Fallidas (#tabla) queda intacto.' -ForegroundColor Yellow
Write-Host "Archivo modificado: $path"
