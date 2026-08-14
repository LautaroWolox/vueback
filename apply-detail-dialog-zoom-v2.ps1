$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Quita el intento anterior para que no compita con la deteccion dinamica v2.
$oldStart = '/* --- INICIO: fm-legacy-dialog-zoom --- */'
$oldEnd = '/* --- FIN: fm-legacy-dialog-zoom --- */'
$oldStartEscaped = [regex]::Escape($oldStart)
$oldEndEscaped = [regex]::Escape($oldEnd)
$content = [regex]::Replace(
  $content,
  "(?s)\s*$oldStartEscaped.*?$oldEndEscaped\s*",
  "`r`n"
)

# Bloque exterior Vue: Detalle de Acta NO tiene menu, por lo tanto debe usar 100dvh.
$outerStart = '/* --- INICIO: fm-detail-iframe-full-viewport-v2 --- */'
$outerEnd = '/* --- FIN: fm-detail-iframe-full-viewport-v2 --- */'
$outerStartEscaped = [regex]::Escape($outerStart)
$outerEndEscaped = [regex]::Escape($outerEnd)
$content = [regex]::Replace(
  $content,
  "(?s)\s*$outerStartEscaped.*?$outerEndEscaped\s*",
  "`r`n"
)

$outerCss = @'
/* --- INICIO: fm-detail-iframe-full-viewport-v2 --- */
/* Detalle Acta es una ruta sin menu: el iframe usa todo el viewport real. */
html body #app .legacy-iframe-stage--detail {
  position: relative !important;
  width: 100% !important;
  height: 100dvh !important;
  min-height: 100dvh !important;
  max-height: 100dvh !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

html body #app .legacy-iframe-stage--detail > .legacy-iframe {
  position: static !important;
  inset: auto !important;
  width: 100% !important;
  height: 100dvh !important;
  min-height: 0 !important;
  max-height: 100dvh !important;
  margin: 0 !important;
  display: block !important;
  border: 0 !important;
}
/* --- FIN: fm-detail-iframe-full-viewport-v2 --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $outerCss + "`r`n"

# Bloque que se inyecta dentro de TODOS los iframe legacy.
$legacyStartMarker = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
$legacyEndMarker = '/* ===== FIN: fm-legacy-responsive.css ===== */'
$legacyStartIndex = $content.IndexOf($legacyStartMarker)
$legacyEndIndex = $content.IndexOf($legacyEndMarker)

if ($legacyStartIndex -lt 0 -or $legacyEndIndex -le $legacyStartIndex) {
  throw 'No se encontro el bloque fm-legacy-responsive.css.'
}

$dynamicStart = '/* --- INICIO: fm-legacy-dynamic-dialog-v2 --- */'
$dynamicEnd = '/* --- FIN: fm-legacy-dynamic-dialog-v2 --- */'
$dynamicStartEscaped = [regex]::Escape($dynamicStart)
$dynamicEndEscaped = [regex]::Escape($dynamicEnd)

$prefix = $content.Substring(0, $legacyEndIndex)
$suffix = $content.Substring($legacyEndIndex)
$prefix = [regex]::Replace(
  $prefix,
  "(?s)\s*$dynamicStartEscaped.*?$dynamicEndEscaped\s*",
  "`r`n"
)

$dynamicCss = @'
/* --- INICIO: fm-legacy-dynamic-dialog-v2 --- */
/*
 * responsiveIframes.js marca el dialog REAL que este visible, incluso si el JSP
 * no usa Bootstrap/PrimeFaces. Estas reglas son respaldo de las medidas que JS
 * calcula contra visualViewport.
 */
html.fm-legacy-dialog-open,
html.fm-legacy-dialog-open body.fm-responsive-legacy,
body.fm-responsive-legacy.fm-legacy-dialog-open {
  overflow-y: auto !important;
}

body.fm-responsive-legacy .fm-legacy-responsive-dialog-overlay {
  max-width: var(--fm-legacy-visual-width, 100dvw) !important;
  max-height: var(--fm-legacy-visual-height, 100dvh) !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}

body.fm-responsive-legacy .fm-legacy-responsive-dialog {
  box-sizing: border-box !important;
  max-width: calc(var(--fm-legacy-visual-width, 100dvw) - 16px) !important;
  max-height: calc(var(--fm-legacy-visual-height, 100dvh) - 16px) !important;
}

/* A zoom alto el dialog completo tambien scrollea. Si el JSP calcula mal su body,
 * nunca se pierden tabs, botones o contenido por fuera del viewport. */
body.fm-responsive-legacy.fm-legacy-notebook-compact .fm-legacy-responsive-dialog {
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}

body.fm-responsive-legacy .fm-legacy-responsive-dialog-scroll {
  min-width: 0 !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
  -webkit-overflow-scrolling: touch !important;
}

body.fm-responsive-legacy .fm-legacy-responsive-dialog-scroll table,
body.fm-responsive-legacy .fm-legacy-responsive-dialog-scroll .ui-datatable,
body.fm-responsive-legacy .fm-legacy-responsive-dialog-scroll .dataTables_wrapper {
  max-width: none !important;
}
/* --- FIN: fm-legacy-dynamic-dialog-v2 --- */
'@

$content = $prefix.TrimEnd() + "`r`n`r`n" + $dynamicCss + "`r`n" + $suffix

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host 'Detalle Acta: iframe corregido a 100dvh reales.'
Write-Host 'Dialogs legacy: deteccion dinamica v2 preparada para zoom alto.'
Write-Host 'Scroll horizontal y vertical del popup quedan disponibles.'
Write-Host "Archivo modificado: $path"
