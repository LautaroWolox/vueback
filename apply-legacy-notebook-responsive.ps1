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

# Los inputs de tipo boton no deben ser tratados como campos de texto.
$legacy = $legacy.Replace(
  'body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]),',
  'body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]),'
)

# Evita imponer box-sizing a absolutamente todo el JSP. Los acordeones y widgets
# legacy conservan su box model original; sólo los controles/estructuras que
# realmente necesitan ajuste responsive usan border-box.
$selectiveBoxSizing = @'
body.fm-responsive-legacy form,
body.fm-responsive-legacy fieldset,
body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]),
body.fm-responsive-legacy select,
body.fm-responsive-legacy textarea,
body.fm-responsive-legacy .table-responsive,
body.fm-responsive-legacy .ui-datatable,
body.fm-responsive-legacy .dataTables_wrapper,
body.fm-responsive-legacy [class*=table-container],
body.fm-responsive-legacy [class*=grid-container] {
  box-sizing: border-box !important;
}
'@

$universalPattern = '(?ms)^body\.fm-responsive-legacy(?::not\(\.fm-legacy-native-controls\))? \*,\r?\nbody\.fm-responsive-legacy(?::not\(\.fm-legacy-native-controls\))? \*::before,\r?\nbody\.fm-responsive-legacy(?::not\(\.fm-legacy-native-controls\))? \*::after \{\r?\n\s*box-sizing: border-box !important;\r?\n\}'
$universalRegex = New-Object System.Text.RegularExpressions.Regex($universalPattern)
$legacy = $universalRegex.Replace($legacy, $selectiveBoxSizing, 1)

# No modificar el box/layout propio de los acordeones legacy. Este bloque sólo
# mantiene anchos fluidos en formularios/paneles comunes.
$accordionWidthPattern = '(?ms)body\.fm-responsive-legacy form,\r?\nbody\.fm-responsive-legacy fieldset,\r?\nbody\.fm-responsive-legacy \.panel,\r?\nbody\.fm-responsive-legacy \.card,\r?\nbody\.fm-responsive-legacy \.ui-panel,\r?\nbody\.fm-responsive-legacy \.ui-accordion,\r?\nbody\.fm-responsive-legacy \.accordion,\r?\nbody\.fm-responsive-legacy \.ui-accordion-content,\r?\nbody\.fm-responsive-legacy \.accordion-inner,\r?\nbody\.fm-responsive-legacy \.accordion-content \{'
$accordionWidthReplacement = @'
body.fm-responsive-legacy form,
body.fm-responsive-legacy fieldset,
body.fm-responsive-legacy .panel,
body.fm-responsive-legacy .card,
body.fm-responsive-legacy .ui-panel {
'@
$accordionRegex = New-Object System.Text.RegularExpressions.Regex($accordionWidthPattern)
$legacy = $accordionRegex.Replace($legacy, $accordionWidthReplacement, 1)

# En notebook no se deben activar las transformaciones agresivas pensadas para
# móvil (convertir filas a grid, apilar botones, rearmar footers, etc.) aunque
# el zoom del navegador reduzca el viewport CSS por debajo de 768/600 px.
$structuralSelectors = @(
  '.row',
  '.form-row',
  '[class*=form-grid]',
  '[class*=filter-grid]',
  '.btn-toolbar',
  '.button-bar',
  '.actions',
  '.form-actions',
  '.toolbar',
  '[class*=action-bar]',
  '[class*=button-bar]',
  '.ui-dialog-buttonpane',
  '.p-dialog-footer',
  '.modal-footer',
  'button:not(.ui-datepicker-trigger):not(.p-datepicker-trigger)',
  'input[type=button]',
  'input[type=submit]',
  '.btn',
  '.ui-button',
  '.p-button'
)

foreach ($selector in $structuralSelectors) {
  $nativePrefix = "body.fm-responsive-legacy:not(.fm-legacy-native-controls) $selector"
  $nativeNotebookPrefix = "body.fm-responsive-legacy:not(.fm-legacy-native-controls):not(.fm-legacy-notebook) $selector"
  $legacy = $legacy.Replace($nativePrefix, $nativeNotebookPrefix)

  $plainPrefix = "body.fm-responsive-legacy $selector"
  $notebookPrefix = "body.fm-responsive-legacy:not(.fm-legacy-notebook) $selector"
  $legacy = $legacy.Replace($plainPrefix, $notebookPrefix)
}

$markerStart = '/* --- INICIO: fm-legacy-notebook-zoom --- */'
$markerEnd = '/* --- FIN: fm-legacy-notebook-zoom --- */'
$legacy = [regex]::Replace(
  $legacy,
  "(?s)\s*$([regex]::Escape($markerStart)).*?$([regex]::Escape($markerEnd))\s*",
  "`r`n"
)

$notebookCss = @'
/* --- INICIO: fm-legacy-notebook-zoom --- */
/*
 * Notebook/desktop con zoom alto: conservar la geometría legacy y adaptar sólo
 * viewport, scroll y grilla. La clase la aplica responsiveIframes.js usando
 * screen + tipo de puntero, no sólo el ancho CSS reducido por el zoom.
 */
body.fm-responsive-legacy.fm-legacy-notebook {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  padding-right: 0 !important;
  padding-left: 0 !important;
  overflow-x: auto !important;
}

body.fm-responsive-legacy.fm-legacy-notebook .table-responsive,
body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable-tablewrapper,
body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable-scrollable-header,
body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable-scrollable-body,
body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable-scrollable-footer,
body.fm-responsive-legacy.fm-legacy-notebook .dataTables_wrapper,
body.fm-responsive-legacy.fm-legacy-notebook [class*=table-container],
body.fm-responsive-legacy.fm-legacy-notebook [class*=grid-container] {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: auto !important;
}

body.fm-responsive-legacy.fm-legacy-notebook .fm-legacy-main-grid {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

body.fm-responsive-legacy.fm-legacy-notebook .fm-legacy-main-grid-scroll {
  width: 100% !important;
  min-width: 0 !important;
  height: var(--fm-legacy-main-grid-body-height, auto) !important;
  min-height: 120px !important;
  max-height: var(--fm-legacy-main-grid-body-height, none) !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}

body.fm-responsive-legacy.fm-legacy-notebook .fm-legacy-main-grid-paginator {
  width: 100% !important;
  max-width: 100% !important;
}

@media (max-width: 1100px) {
  body.fm-responsive-legacy.fm-legacy-notebook table th,
  body.fm-responsive-legacy.fm-legacy-notebook table td,
  body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable th,
  body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable td {
    padding-right: 5px !important;
    padding-left: 5px !important;
  }
}

/* Una notebook de 1024 px a 150% puede quedar cerca de 680 CSS px. En ese caso
 * se conserva la tabla de escritorio y se permite scroll, en vez de rearmar el JSP.
 */
@media (max-width: 760px) {
  body.fm-responsive-legacy.fm-legacy-notebook table,
  body.fm-responsive-legacy.fm-legacy-notebook .ui-datatable table,
  body.fm-responsive-legacy.fm-legacy-notebook table.dataTable {
    min-width: 680px !important;
  }
}
/* --- FIN: fm-legacy-notebook-zoom --- */
'@

$legacy = $legacy.TrimEnd() + "`r`n`r`n" + $notebookCss + "`r`n"
$content = $prefix + $legacy + $suffix

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host 'Responsive legacy de notebooks aplicado.'
Write-Host 'Se preservan acordeones legacy y se evita el modo movil por zoom alto.'
Write-Host "Archivo modificado: $path"
