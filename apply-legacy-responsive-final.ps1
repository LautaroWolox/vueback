$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$legacyStart = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
$legacyEnd = '/* ===== FIN: fm-legacy-responsive.css ===== */'
$startIndex = $content.IndexOf($legacyStart)
$endIndex = $content.IndexOf($legacyEnd)

if ($startIndex -lt 0 -or $endIndex -le $startIndex) {
  throw 'No se encontro el bloque fm-legacy-responsive.css.'
}

$newLegacy = @'
/* ===== INICIO: fm-legacy-responsive.css ===== */
/*
 * Responsive FINAL para documentos legacy cargados dentro de iframe.
 * Objetivos:
 * - no modificar la geometria propia de los acordeones legacy;
 * - estirar la grilla principal del segundo acordeon hasta el final del viewport;
 * - mantener el paginador debajo de la grilla;
 * - soportar notebooks con zoom 100/125/150/175/200% sin entrar en layout movil;
 * - contener dialogs/popups dentro del visualViewport con scroll accesible;
 * - permitir scroll horizontal en tablas anchas en lugar de romper el JSP.
 */

html.fm-legacy-notebook,
html.fm-legacy-notebook body.fm-responsive-legacy {
  min-width: 0 !important;
  min-height: 100% !important;
}

body.fm-responsive-legacy {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  overflow-x: auto !important;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Border-box selectivo. Nunca se fuerza sobre absolutamente todo el JSP. */
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

body.fm-responsive-legacy img,
body.fm-responsive-legacy svg,
body.fm-responsive-legacy video,
body.fm-responsive-legacy canvas {
  max-width: 100% !important;
}

/* Formularios/paneles fluidos. A proposito NO se incluyen .ui-accordion,
 * .accordion, sus paneles ni sus contenidos. */
body.fm-responsive-legacy form,
body.fm-responsive-legacy fieldset,
body.fm-responsive-legacy .panel,
body.fm-responsive-legacy .card,
body.fm-responsive-legacy .ui-panel {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]),
body.fm-responsive-legacy select,
body.fm-responsive-legacy textarea,
body.fm-responsive-legacy .ui-inputfield,
body.fm-responsive-legacy .p-inputtext,
body.fm-responsive-legacy .p-select,
body.fm-responsive-legacy .ui-selectonemenu,
body.fm-responsive-legacy .ui-autocomplete,
body.fm-responsive-legacy .ui-autocomplete-input {
  max-width: 100% !important;
}

/* Tablas y wrappers: siempre conservan scroll si el contenido no entra. */
body.fm-responsive-legacy .table-responsive,
body.fm-responsive-legacy .ui-datatable-tablewrapper,
body.fm-responsive-legacy .ui-datatable-scrollable-header,
body.fm-responsive-legacy .ui-datatable-scrollable-body,
body.fm-responsive-legacy .ui-datatable-scrollable-footer,
body.fm-responsive-legacy .dataTables_wrapper,
body.fm-responsive-legacy .dataTables_scrollBody,
body.fm-responsive-legacy .p-datatable-table-container,
body.fm-responsive-legacy .p-datatable-wrapper,
body.fm-responsive-legacy .ui-jqgrid-bdiv,
body.fm-responsive-legacy [class*=table-container],
body.fm-responsive-legacy [class*=grid-container] {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow-x: auto !important;
  overscroll-behavior-inline: contain !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: thin !important;
}

body.fm-responsive-legacy table,
body.fm-responsive-legacy .ui-datatable table,
body.fm-responsive-legacy table.dataTable {
  max-width: none !important;
}

/* Grilla principal marcada por useLegacyIframeLayout.js. No se toca el acordeon. */
body.fm-responsive-legacy .fm-legacy-main-grid {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid-scroll {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  height: var(--fm-legacy-main-grid-body-height, auto) !important;
  max-height: var(--fm-legacy-main-grid-body-height, none) !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}

body.fm-responsive-legacy .fm-legacy-main-grid-paginator {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

body.fm-responsive-legacy .ui-paginator,
body.fm-responsive-legacy .p-paginator,
body.fm-responsive-legacy .dataTables_paginate,
body.fm-responsive-legacy .pagination,
body.fm-responsive-legacy .pager {
  width: 100% !important;
  max-width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  flex-wrap: wrap !important;
}

/* Notebook real: el zoom no debe activar reflow de tablet/movil. */
body.fm-responsive-legacy.fm-legacy-notebook {
  padding-right: 0 !important;
  padding-left: 0 !important;
  overflow-x: auto !important;
}

body.fm-responsive-legacy.fm-legacy-notebook-compact table,
body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-datatable table,
body.fm-responsive-legacy.fm-legacy-notebook-compact table.dataTable {
  min-width: min(680px, max-content) !important;
}

/* Dialogs legacy generales. responsiveIframes.js publica las variables usando
 * visualViewport y marca el popup real aunque no sea Bootstrap/PrimeFaces. */
html.fm-legacy-dialog-open,
html.fm-legacy-dialog-open body.fm-responsive-legacy,
body.fm-responsive-legacy.fm-legacy-dialog-open {
  overflow-y: auto !important;
}

body.fm-responsive-legacy .ui-dialog,
body.fm-responsive-legacy .p-dialog,
body.fm-responsive-legacy .modal-dialog,
body.fm-responsive-legacy .modal-content,
body.fm-responsive-legacy [role=dialog],
body.fm-responsive-legacy [aria-modal=true],
body.fm-responsive-legacy .fm-legacy-responsive-dialog {
  max-width: calc(var(--fm-legacy-visual-width, 100dvw) - 16px) !important;
  max-height: calc(var(--fm-legacy-visual-height, 100dvh) - 16px) !important;
  box-sizing: border-box !important;
}

body.fm-responsive-legacy .fm-legacy-responsive-dialog-overlay {
  max-width: var(--fm-legacy-visual-width, 100dvw) !important;
  max-height: var(--fm-legacy-visual-height, 100dvh) !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain !important;
}

body.fm-responsive-legacy .ui-dialog-content,
body.fm-responsive-legacy .p-dialog-content,
body.fm-responsive-legacy .modal-body,
body.fm-responsive-legacy .fm-legacy-responsive-dialog-scroll {
  min-width: 0 !important;
  min-height: 0 !important;
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

body.fm-responsive-legacy.modal-open,
body.fm-responsive-legacy.fm-legacy-dialog-open {
  overflow-y: auto !important;
  padding-right: 0 !important;
}

/* Gestion de Operadores: sólo BUSCAR/LIMPIAR reciben la apariencia FM. */
body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-search,
body.fm-responsive-legacy.fm-legacy-native-controls input.fm-legacy-action-search,
body.fm-responsive-legacy.fm-legacy-native-controls button.fm-legacy-action-search {
  width: auto !important;
  min-width: 80px !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  padding: 0 14px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 18px !important;
  background: #00a9bd !important;
  background-image: none !important;
  color: #fff !important;
  font-family: inherit !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  line-height: 32px !important;
  text-align: center !important;
  text-shadow: none !important;
  box-shadow: none !important;
  vertical-align: middle !important;
}

body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-clear,
body.fm-responsive-legacy.fm-legacy-native-controls input.fm-legacy-action-clear,
body.fm-responsive-legacy.fm-legacy-native-controls button.fm-legacy-action-clear {
  width: auto !important;
  min-width: 78px !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  padding: 0 14px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 18px !important;
  background: #fff !important;
  background-image: none !important;
  color: #00a0b4 !important;
  font-family: inherit !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 32px !important;
  text-align: center !important;
  text-shadow: none !important;
  box-shadow: none !important;
  vertical-align: middle !important;
}

body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-search:hover,
body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-search:focus {
  border-color: #008fa1 !important;
  background: #008fa1 !important;
  color: #fff !important;
}

body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-clear:hover,
body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-clear:focus {
  border-color: #008fa1 !important;
  background: #f2fcfe !important;
  color: #008fa1 !important;
}

/* Sólo dispositivos que NO fueron detectados como notebook reciben reflow movil. */
@media (max-width: 768px) {
  body.fm-responsive-legacy:not(.fm-legacy-notebook) {
    padding-right: 4px !important;
    padding-left: 4px !important;
  }

  body.fm-responsive-legacy:not(.fm-legacy-notebook) .row,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .form-row,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=form-grid],
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=filter-grid] {
    width: 100% !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 9px !important;
  }

  body.fm-responsive-legacy:not(.fm-legacy-notebook) .row > *,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .form-row > *,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=form-grid] > *,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=filter-grid] > * {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
}

@media (max-width: 600px) {
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .row,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .form-row,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=form-grid],
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=filter-grid] {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  body.fm-responsive-legacy:not(.fm-legacy-notebook) .btn-toolbar,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .button-bar,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .actions,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .form-actions,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) .toolbar,
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=action-bar],
  body.fm-responsive-legacy:not(.fm-legacy-notebook) [class*=button-bar] {
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  body.fm-responsive-legacy *,
  body.fm-responsive-legacy *::before,
  body.fm-responsive-legacy *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
/* ===== FIN: fm-legacy-responsive.css ===== */
'@

$before = $content.Substring(0, $startIndex)
$after = $content.Substring($endIndex + $legacyEnd.Length)
$content = $before + $newLegacy + $after

# Elimina overrides exteriores de intentos anteriores.
$oldBlocks = @(
  @('/* --- INICIO: fm-detail-iframe-full-viewport-v2 --- */', '/* --- FIN: fm-detail-iframe-full-viewport-v2 --- */'),
  @('/* --- INICIO: fm-iframe-shell-responsive-final --- */', '/* --- FIN: fm-iframe-shell-responsive-final --- */')
)

foreach ($markers in $oldBlocks) {
  $startEscaped = [regex]::Escape($markers[0])
  $endEscaped = [regex]::Escape($markers[1])
  $content = [regex]::Replace($content, "(?s)\s*$startEscaped.*?$endEscaped\s*", "`r`n")
}

$outerCss = @'
/* --- INICIO: fm-iframe-shell-responsive-final --- */
/* El iframe normal participa del flex del layout: nunca se posiciona fixed sobre el menu. */
html body #app .main-layout > .legacy-iframe-stage,
html body #app .legacy-iframe-stage:not(.legacy-iframe-stage--detail) {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  overflow: hidden !important;
}

html body #app .legacy-iframe-stage:not(.legacy-iframe-stage--detail) > .legacy-iframe {
  position: static !important;
  inset: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  display: block !important;
  flex: 1 1 auto !important;
  border: 0 !important;
}

/* Detalle Acta abre sin menu y por eso utiliza el viewport completo. */
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
  display: block !important;
  border: 0 !important;
}
/* --- FIN: fm-iframe-shell-responsive-final --- */
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $outerCss + "`r`n"

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host 'Responsive FINAL de iframes legacy aplicado.'
Write-Host 'Grilla principal: segundo acordeon hasta el final del viewport.'
Write-Host 'Acordeones: geometria legacy preservada.'
Write-Host 'Zoom notebook: 100/125/150/175/200% sin reflow movil.'
Write-Host 'Dialogs: limitados al visualViewport con scroll interno.'
Write-Host 'Iframe normal: mantiene visible el menu principal.'
Write-Host "Archivo modificado: $path"
