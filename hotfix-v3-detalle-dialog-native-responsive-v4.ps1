$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$pluginPath = 'src/plugins/responsiveIframes.js'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/router/index.js',
  'src/views/DetalleView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  'src/modules/buscadorOts/BuscadorOts.vue',
  'src/modules/buscadorOts/components/Tabla.vue',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue',
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/otFallidasCT/components/Table.vue',
  'src/modules/otFallidasCT/components/otf-table.css'
)

function Read-Utf8([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
  return [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

function Hash-File([string]$Path) {
  if (-not (Test-Path $Path)) { return '<missing>' }
  return (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
}

Write-Host ''
Write-Host 'FM - HOTFIX V4 DETALLE: POPUP NATIVO + RESPONSIVE' -ForegroundColor Cyan
Write-Host '-------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Objetivo: NO redimensionar ni convertir grillas del popup en scroll del dialog.' -ForegroundColor Yellow
Write-Host 'Solo se mantiene responsive del iframe y centrado horizontal inmediato del popup.' -ForegroundColor Yellow
Write-Host 'NO toca FM Global, menu, Buscador, Stepper, Reporte SAS, loaders ni DetalleView.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

$plugin = (Read-Utf8 $pluginPath).Replace("`r`n", "`n")

# Debe ser la base reversible que ya se venia usando.
foreach ($required in @('const resetManagedDialogs = (document) => {', 'const applyResponsiveDialogLayout = (iframe, document) => {', 'const applyResponsiveStyles = (iframe) => {')) {
  if (-not $plugin.Contains($required)) { throw "No se encontro bloque esperado en responsiveIframes.js: $required" }
}

# 1) Helper estable para reconocer exclusivamente Detalle de Acta.
if (-not $plugin.Contains('const isDetailIframe = (iframe) =>')) {
  $anchor = 'const isNotebookEnvironment = (view) => {'
  if (-not $plugin.Contains($anchor)) { throw 'No se encontro isNotebookEnvironment.' }
  $helper = @'
const isDetailIframe = (iframe) => Boolean(
  iframe?.closest?.('.legacy-iframe-stage--detail')
)

'@
  $plugin = $plugin.Replace($anchor, $helper + $anchor)
}

# 2) Eliminar cualquier forceCenter previo: Detalle no debe recibir top/left/max-height
#    calculados por JS ni debe elegir una de sus grillas como scrollArea del popup.
$plugin = $plugin.Replace(', forceCenter = false', '')
$plugin = [regex]::Replace($plugin, "(?m)^\s*const forceCenter = isDetailIframe\(iframe\)\s*\n", '')
$plugin = $plugin.Replace(', forceCenter)', ')')
$plugin = $plugin.Replace('if (!forceCenter && (!compactNotebook || (!outsideViewport && !oversize))) return false', 'if (!compactNotebook || (!outsideViewport && !oversize)) return false')
$plugin = $plugin.Replace("`${forceCenter ? viewport.offsetTop + viewport.height / 2 : viewport.offsetTop + margin}px", "`${viewport.offsetTop + margin}px")
$plugin = $plugin.Replace("forceCenter ? 'translate(-50%, -50%)' : 'translateX(-50%)'", "'translateX(-50%)'")

# 3) En Detalle: restaurar cualquier inline administrado y NO adaptar el dialog.
#    A zoom compacto solo liberamos scroll del documento para poder alcanzar todo el popup.
$dialogStart = 'const applyResponsiveDialogLayout = (iframe, document) => {'
$dialogEnd = 'const applyViewportProfile = (iframe, document) => {'
$start = $plugin.IndexOf($dialogStart)
$end = $plugin.IndexOf($dialogEnd)
if ($start -lt 0 -or $end -le $start) { throw 'No se pudo delimitar applyResponsiveDialogLayout.' }

$dialogBlock = $plugin.Substring($start, $end - $start)

# Quitar hotfixes anteriores del mismo early-return si existieran.
$dialogBlock = [regex]::Replace(
  $dialogBlock,
  "(?s)\n\s*if \(isDetailIframe\(iframe\)\) \{.*?\n\s*\}\s*\n",
  "`n"
)

$viewGuard = "  if (!document?.body || !view) return`n"
if (-not $dialogBlock.Contains($viewGuard)) { throw 'No se encontro guard de dialog responsive.' }

$detailEarlyReturn = @'

  if (isDetailIframe(iframe)) {
    // Detalle tiene varias grillas dentro del popup. Se conserva 100% la geometria
    // y el comportamiento nativo del dialog/grillas. Solo se habilita scroll del
    // documento cuando el zoom reduce mucho el viewport.
    resetManagedDialogs(document)
    const detailCompact = document.body.classList.contains('fm-legacy-notebook-compact')
    const detailViewport = getVisualViewportSize(view, document)
    const detailSurfaces = findVisibleDialogSurfaces(document, view, detailViewport)
    setDocumentScroll(document, detailCompact && detailSurfaces.length > 0)
    return
  }
'@
$dialogBlock = $dialogBlock.Replace($viewGuard, $viewGuard + $detailEarlyReturn)
$plugin = $plugin.Substring(0, $start) + $dialogBlock + $plugin.Substring($end)

# 4) El CSS responsive que se inyecta en Detalle no debe aplicar las reglas genericas
#    de dialog. Se reescriben SOLO en memoria para ese iframe; fm-global.css no cambia.
if (-not $plugin.Contains('const getDetailLegacyResponsiveCss = () =>')) {
  $anchor = "const STYLE_ID = 'fm-legacy-responsive-styles'"
  if (-not $plugin.Contains($anchor)) { throw 'No se encontro STYLE_ID.' }
  $detailCssHelper = @'
const DETAIL_DIALOG_CSS_PATTERN = /body\.fm-responsive-legacy(?=[^{]*(?:\.ui-dialog|\.p-dialog|\.modal-dialog|\.modal-content|\[role=["']?dialog["']?\]|\[aria-modal=["']?true["']?\]|\.fm-legacy-responsive-dialog))/g

const DETAIL_NATIVE_DIALOG_CSS = `
/* Detalle Acta: popup nativo. Solo centrado horizontal inmediato; sin tocar ancho,
 * alto, overflow ni descendientes/grillas. */
body.fm-responsive-legacy.fm-legacy-detail-native-dialog .ui-dialog {
  left: 50% !important;
  right: auto !important;
  margin-left: 0 !important;
  transform: translateX(-50%) !important;
}
body.fm-responsive-legacy.fm-legacy-detail-native-dialog .modal-dialog {
  margin-left: auto !important;
  margin-right: auto !important;
}
`

const getDetailLegacyResponsiveCss = () => (
  legacyResponsiveCss
    .replace(DETAIL_DIALOG_CSS_PATTERN, 'body.fm-responsive-legacy:not(.fm-legacy-detail-native-dialog)')
    .concat('\n', DETAIL_NATIVE_DIALOG_CSS)
)

'@
  $plugin = $plugin.Replace($anchor, $detailCssHelper + $anchor)
}

# 5) En applyResponsiveStyles marcar Detalle antes de inyectar CSS y usar variante nativa.
$usesLine = '    const usesNativeControls = NATIVE_CONTROLS_PATHS.has(getIframePathname(iframe))'
if (-not $plugin.Contains($usesLine)) { throw 'No se encontro usesNativeControls.' }
if (-not $plugin.Contains('const detailIframe = isDetailIframe(iframe)')) {
  $plugin = $plugin.Replace($usesLine, $usesLine + "`n    const detailIframe = isDetailIframe(iframe)")
}

$bodyToggleAnchor = "    document.body.classList.toggle('fm-legacy-native-controls', usesNativeControls)"
if (-not $plugin.Contains($bodyToggleAnchor)) { throw 'No se encontro body class native controls.' }
if (-not $plugin.Contains("fm-legacy-detail-native-dialog', detailIframe")) {
  $plugin = $plugin.Replace(
    $bodyToggleAnchor,
    $bodyToggleAnchor + "`n    document.body.classList.toggle('fm-legacy-detail-native-dialog', detailIframe)"
  )
}

$plugin = $plugin.Replace(
  '    style.textContent = legacyResponsiveCss',
  '    style.textContent = detailIframe ? getDetailLegacyResponsiveCss() : legacyResponsiveCss'
)

# Verificaciones duras.
$requiredMarkers = @(
  "iframe?.closest?.('.legacy-iframe-stage--detail')",
  'if (isDetailIframe(iframe)) {',
  'resetManagedDialogs(document)',
  'detailCompact && detailSurfaces.length > 0',
  "fm-legacy-detail-native-dialog', detailIframe",
  'style.textContent = detailIframe ? getDetailLegacyResponsiveCss() : legacyResponsiveCss',
  'Detalle Acta: popup nativo',
  'left: 50% !important',
  'transform: translateX(-50%) !important'
)
foreach ($marker in $requiredMarkers) {
  if (-not $plugin.Contains($marker)) { throw "Falta marcador V4: $marker" }
}

if ($plugin.Contains('forceCenter')) {
  throw 'Quedo una referencia forceCenter; se aborta para no mezclar estrategias.'
}

Write-Utf8 $pluginPath ($plugin.Replace("`n", "`r`n"))

# Seguridad: este hotfix SOLO puede tocar responsiveIframes.js.
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: V4 modifico archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX V4 APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Unico archivo tocado por V4:' -ForegroundColor Yellow
Write-Host "  $pluginPath"
Write-Host ''
Write-Host 'Resultado esperado:' -ForegroundColor Yellow
Write-Host '  - Detalle 100%: popup nativo, sin salto lateral -> centro.'
Write-Host '  - Grillas del popup: no reciben max-height/overflow del adaptador de dialogs.'
Write-Host '  - Zoom alto: iframe sigue responsive; si hace falta, scrollea el documento.'
Write-Host '  - Popup se mantiene centrado horizontalmente por CSS desde que aparece.'
Write-Host '  - Otros iframes: comportamiento V3 sin cambios.'
Write-Host ''
Write-Host 'Ejecutar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
