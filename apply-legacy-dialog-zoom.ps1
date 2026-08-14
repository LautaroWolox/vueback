$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$legacyStartMarker = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
$legacyEndMarker = '/* ===== FIN: fm-legacy-responsive.css ===== */'
$startIndex = $content.IndexOf($legacyStartMarker)
$endIndex = $content.IndexOf($legacyEndMarker)

if ($startIndex -lt 0 -or $endIndex -le $startIndex) {
  throw 'No se encontro el bloque fm-legacy-responsive.css.'
}

$legacyContentStart = $startIndex + $legacyStartMarker.Length
$prefix = $content.Substring(0, $legacyContentStart)
$legacy = $content.Substring($legacyContentStart, $endIndex - $legacyContentStart)
$suffix = $content.Substring($endIndex)

$markerStart = '/* --- INICIO: fm-legacy-dialog-zoom --- */'
$markerEnd = '/* --- FIN: fm-legacy-dialog-zoom --- */'
$escapedStart = [regex]::Escape($markerStart)
$escapedEnd = [regex]::Escape($markerEnd)

$legacy = [regex]::Replace(
  $legacy,
  "(?s)\s*$escapedStart.*?$escapedEnd\s*",
  "`r`n"
)

$dialogCss = @'
/* --- INICIO: fm-legacy-dialog-zoom --- */
/*
 * Popups legacy en notebook con zoom alto.
 * - nunca superan el visualViewport real;
 * - el contenido del popup scrollea internamente;
 * - tablas internas del dialog no se convierten en grilla fullscreen;
 * - se preserva un scrollbar vertical accesible aun con body.modal-open.
 */
html.fm-legacy-notebook-compact,
html.fm-legacy-notebook-compact body.fm-responsive-legacy {
  min-height: 100% !important;
}

html.fm-legacy-notebook-compact {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}

html.fm-legacy-notebook-compact body.fm-responsive-legacy {
  overflow-y: auto !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .modal {
  width: 100% !important;
  max-width: 100% !important;
  height: var(--fm-legacy-visual-height, 100dvh) !important;
  max-height: var(--fm-legacy-visual-height, 100dvh) !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
  -webkit-overflow-scrolling: touch !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-dialog {
  width: auto !important;
  max-width: calc(var(--fm-legacy-visual-width, 100dvw) - 16px) !important;
  min-width: 0 !important;
  max-height: calc(var(--fm-legacy-visual-height, 100dvh) - 16px) !important;
  margin: 8px auto !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-content {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  max-height: calc(var(--fm-legacy-visual-height, 100dvh) - 16px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-header,
body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-footer {
  flex: 0 0 auto !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-body {
  min-width: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
  overscroll-behavior: contain !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog,
body.fm-responsive-legacy.fm-legacy-notebook-compact .p-dialog,
body.fm-responsive-legacy.fm-legacy-notebook-compact [role='dialog'],
body.fm-responsive-legacy.fm-legacy-notebook-compact [aria-modal='true'] {
  max-width: calc(var(--fm-legacy-visual-width, 100dvw) - 16px) !important;
  max-height: calc(var(--fm-legacy-visual-height, 100dvh) - 16px) !important;
  box-sizing: border-box !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog-content,
body.fm-responsive-legacy.fm-legacy-notebook-compact .p-dialog-content,
body.fm-responsive-legacy.fm-legacy-notebook-compact [role='dialog'] .modal-body,
body.fm-responsive-legacy.fm-legacy-notebook-compact [aria-modal='true'] .modal-body {
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: 100% !important;
  max-height: calc(var(--fm-legacy-visual-height, 100dvh) - 110px) !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}

/* Los widgets/tablas internos del popup pueden mantener su ancho de escritorio;
 * si no entran a zoom alto, se desplazan dentro del popup y no agrandan la página. */
body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog-content table,
body.fm-responsive-legacy.fm-legacy-notebook-compact .p-dialog-content table,
body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-body table,
body.fm-responsive-legacy.fm-legacy-notebook-compact [role='dialog'] table {
  max-width: none !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog-content .table-responsive,
body.fm-responsive-legacy.fm-legacy-notebook-compact .p-dialog-content .table-responsive,
body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-body .table-responsive,
body.fm-responsive-legacy.fm-legacy-notebook-compact [role='dialog'] .table-responsive,
body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog-content .ui-datatable-tablewrapper,
body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-body .ui-datatable-tablewrapper {
  max-width: 100% !important;
  overflow-x: auto !important;
}

/* Bootstrap suele ocultar el scroll del body al abrir un modal. El modal conserva
 * su propio scroll, y el documento no queda permanentemente bloqueado al cerrar. */
body.fm-responsive-legacy.fm-legacy-notebook-compact.modal-open {
  overflow-y: auto !important;
  padding-right: 0 !important;
}
/* --- FIN: fm-legacy-dialog-zoom --- */
'@

$legacy = $legacy.TrimEnd() + "`r`n`r`n" + $dialogCss + "`r`n"
$content = $prefix + $legacy + $suffix

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host 'Dialogs legacy adaptados para zoom alto.'
Write-Host 'El popup queda dentro del visualViewport y usa scroll interno.'
Write-Host 'Se preserva el scroll vertical principal en notebook compacta.'
Write-Host "Archivo modificado: $path"
