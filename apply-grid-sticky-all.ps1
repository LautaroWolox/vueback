$ErrorActionPreference = 'Stop'

$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# -----------------------------------------------------------------------------
# A) Grillas Vue / PrimeVue compartidas (excepto #tabla de OTs Fallidas,
#    que conserva su bloque especifico ya aprobado).
# -----------------------------------------------------------------------------
$vueStart = '/* --- INICIO: fm-vue-grid-sticky-all --- */'
$vueEnd = '/* --- FIN: fm-vue-grid-sticky-all --- */'
$vueStartEscaped = [regex]::Escape($vueStart)
$vueEndEscaped = [regex]::Escape($vueEnd)
$content = [regex]::Replace(
  $content,
  "(?s)\s*$vueStartEscaped.*?$vueEndEscaped\s*",
  "`r`n"
)

$vueCss = @'
/* --- INICIO: fm-vue-grid-sticky-all --- */
/*
 * Cabecera + filtros fijos para las grillas PrimeVue migradas.
 * Registro OTs Fallidas (#tabla) conserva su ajuste especifico.
 * El THEAD se congela como una sola unidad para que los registros nunca
 * aparezcan por detras de la fila de filtros durante el scroll vertical.
 */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table-container,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-wrapper,
html body #app .fm-pass-grid.p-datatable:not(#tabla) [data-pc-section='tablecontainer'],
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-table-container,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-wrapper {
  position: relative !important;
  overflow: auto !important;
  isolation: isolate !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table,
html body #app .fm-pass-grid.p-datatable:not(#tabla) table,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-table,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 110 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr > th {
  position: relative !important;
  top: auto !important;
  z-index: auto !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th {
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th {
  overflow: visible !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > * {
  position: relative !important;
  z-index: 2 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}
/* --- FIN: fm-vue-grid-sticky-all --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $vueCss + "`r`n"

# -----------------------------------------------------------------------------
# B) Grilla principal de pantallas legacy/iframe.
#    responsiveIframes.js inyecta SOLO el contenido entre los marcadores legacy,
#    por eso este bloque debe vivir dentro de esa seccion.
# -----------------------------------------------------------------------------
$legacyStart = '/* --- INICIO: fm-legacy-grid-sticky --- */'
$legacyEnd = '/* --- FIN: fm-legacy-grid-sticky --- */'
$legacyStartEscaped = [regex]::Escape($legacyStart)
$legacyEndEscaped = [regex]::Escape($legacyEnd)
$content = [regex]::Replace(
  $content,
  "(?s)\s*$legacyStartEscaped.*?$legacyEndEscaped\s*",
  "`r`n"
)

$legacySectionEnd = '/* ===== FIN: fm-legacy-responsive.css ===== */'
if (-not $content.Contains($legacySectionEnd)) {
  throw 'No se encontro el cierre de fm-legacy-responsive.css.'
}

$legacyCss = @'

/* --- INICIO: fm-legacy-grid-sticky --- */
/* Cabecera/filtros opacos de la grilla principal detectada dentro del iframe. */
body.fm-responsive-legacy .fm-legacy-main-grid table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 80 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid thead > tr > th,
body.fm-responsive-legacy .fm-legacy-main-grid thead > tr > td {
  position: relative !important;
  z-index: 1 !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid thead > tr:first-child > th,
body.fm-responsive-legacy .fm-legacy-main-grid thead > tr:first-child > td {
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid thead > tr:not(:first-child),
body.fm-responsive-legacy .fm-legacy-main-grid thead > tr:not(:first-child) > th,
body.fm-responsive-legacy .fm-legacy-main-grid thead > tr:not(:first-child) > td {
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid tbody {
  position: relative !important;
  z-index: 1 !important;
}
/* --- FIN: fm-legacy-grid-sticky --- */
'@

$content = $content.Replace($legacySectionEnd, $legacyCss + "`r`n" + $legacySectionEnd)

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Sticky compartido aplicado a grillas Vue/PrimeVue.'
Write-Host 'Reporte SAS y las demas fm-pass-grid mantienen cabecera + filtros opacos.'
Write-Host 'Tambien se protege la grilla principal detectada dentro de iframes legacy.'
Write-Host "Archivo modificado: $path"
