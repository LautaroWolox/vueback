$ErrorActionPreference = 'Stop'
$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$start = '/* --- INICIO: otf-sticky-filter-background --- */'
$end = '/* --- FIN: otf-sticky-filter-background --- */'
$startEscaped = [regex]::Escape($start)
$endEscaped = [regex]::Escape($end)
$content = [regex]::Replace($content, "(?s)\s*$startEscaped.*?$endEscaped\s*", "`r`n")

$css = @'
/* --- INICIO: otf-sticky-filter-background --- */
/*
 * Registro OTs Fallidas: evita que filas/lineas de la grilla se transparenten
 * por debajo del encabezado y de la fila de filtros al hacer scroll.
 */
html body #app .ot-fallidas-ct #tabla .p-datatable-thead {
  position: relative !important;
  z-index: 30 !important;
  background: #fff !important;
  isolation: isolate !important;
}

html body #app .ot-fallidas-ct #tabla .p-datatable-thead > tr:first-child > th {
  position: sticky !important;
  top: 0 !important;
  z-index: 32 !important;
  background: #f4f7f9 !important;
  background-clip: padding-box !important;
}

html body #app .ot-fallidas-ct #tabla .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .ot-fallidas-ct #tabla .p-datatable-thead > tr.p-filter-row > th {
  position: sticky !important;
  top: 34px !important;
  z-index: 31 !important;
  background: #fff !important;
  background-clip: padding-box !important;
}

html body #app .ot-fallidas-ct #tabla .fm-filter-cell {
  position: relative !important;
  z-index: 2 !important;
  background: #fff !important;
}

html body #app .ot-fallidas-ct #tabla .fm-column-filter,
html body #app .ot-fallidas-ct #tabla input.fm-column-filter,
html body #app .ot-fallidas-ct #tabla .p-inputtext.fm-column-filter {
  position: relative !important;
  z-index: 3 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  background-clip: padding-box !important;
}

html body #app .ot-fallidas-ct #tabla .fm-filter-prefix,
html body #app .ot-fallidas-ct #tabla .fm-icon-button {
  position: relative !important;
  z-index: 4 !important;
}
/* --- FIN: otf-sticky-filter-background --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $css + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Registro OTs Fallidas: fondo opaco de cabecera/filtros aplicado.'
Write-Host 'Las filas ya no deben verse por debajo de los campos al hacer scroll.'
Write-Host "Archivo modificado: $path"
