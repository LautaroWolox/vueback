$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$profilesPath = 'src/components/shared/fmLoaderProfiles.js'
$detailPath = 'src/views/DetalleView.vue'
$pluginPath = 'src/plugins/responsiveIframes.js'

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/router/index.js',
  'src/composables/useLegacyIframeLayout.js',
  'src/modules/buscadorOts/BuscadorOts.vue',
  'src/modules/buscadorOts/components/Tabla.vue',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue',
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/otFallidasCT/components/Table.vue',
  'src/modules/otFallidasCT/components/otf-table.css'
)

function Read-Utf8([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
  [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}
function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}
function Hash-File([string]$Path) {
  if (-not (Test-Path $Path)) { return '<missing>' }
  (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
}

Write-Host ''
Write-Host 'FM - HOTFIX V3 SAFE V2: SPINNER + DETALLE ACTA' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Solo modifica cuatro archivos puntuales.' -ForegroundColor Yellow
Write-Host 'No toca FM Global, menu, router, Buscador, Stepper, Reporte SAS ni OTs Fallidas.' -ForegroundColor Yellow
Write-Host ''

$before = @{}
foreach ($path in $protectedPaths) { $before[$path] = Hash-File $path }

# 1) Spinner unico. Se usa escape JS \u00f3 para evitar Informaci??n en Windows/PowerShell.
$loader = (Read-Utf8 $loaderPath).Replace("`r`n", "`n")
$loader = [regex]::Replace(
  $loader,
  "(?m)^\s*title:\s*\{\s*type:\s*String,\s*default:\s*'[^']*'\s*\},\s*$",
  "  title: { type: String, default: 'Cargando Informaci\u00f3n' },",
  1
)
if (-not $loader.Contains('contextTitle:')) {
  $anchor = "  title: { type: String, default: 'Cargando Informaci\u00f3n' },"
  if (-not $loader.Contains($anchor)) { throw 'No se encontro title en FmTypingLoader.' }
  $loader = $loader.Replace($anchor, $anchor + "`n  contextTitle: { type: String, default: '' },")
}
$displayReplacement = @'
const displayTitle = computed(() => (
  String(props.contextTitle ?? '').trim() || 'Cargando Informaci\u00f3n'
))
'@
$loader = [regex]::Replace(
  $loader,
  '(?s)const displayTitle = computed\(\(\) => \(.*?\)\)',
  $displayReplacement.Trim(),
  1
)
if (-not $loader.Contains("String(props.contextTitle ?? '').trim() || 'Cargando Informaci\u00f3n'")) {
  throw 'No se pudo fijar el titulo de FmTypingLoader.'
}
Write-Utf8 $loaderPath ($loader.Replace("`n", "`r`n"))

$profiles = (Read-Utf8 $profilesPath).Replace("`r`n", "`n")
$profiles = [regex]::Replace($profiles, "title:\s*'[^']*'", "title: 'Cargando Informaci\u00f3n'")
Write-Utf8 $profilesPath ($profiles.Replace("`n", "`r`n"))
Write-Host 'OK spinner: titulo Unicode seguro.' -ForegroundColor Green

# 2) Detalle Acta: no aplicar useLegacyIframeLayout porque esta vista contiene varias grillas.
# responsiveIframes sigue activo y conserva el responsive general del iframe.
$detail = (Read-Utf8 $detailPath).Replace("`r`n", "`n")
$detail = [regex]::Replace(
  $detail,
  "(?m)^import \{ useLegacyIframeLayout \} from '@/composables/useLegacyIframeLayout'\s*\n",
  ''
)
$detail = [regex]::Replace(
  $detail,
  "(?m)^const \{ onIframeLoad: applyLegacyLayout \} = useLegacyIframeLayout\(iframeRef\)\s*\n",
  ''
)
$detail = [regex]::Replace(
  $detail,
  "(?s)\n\s*try \{\s*applyLegacyLayout\(\)\s*\} catch \(error\) \{\s*console\.error\('Error aplicando layout al detalle legacy:', error\)\s*\}\s*\n",
  "`n"
)
if ($detail.Contains('useLegacyIframeLayout') -or $detail.Contains('applyLegacyLayout')) {
  throw 'DetalleView aun usa el estirado de grilla principal.'
}
if (-not $detail.Contains('Detalle Acta conserva sus grillas legacy nativas')) {
  $detail = $detail.Replace(
    "  if (loadedHref === 'about:blank') return`n",
    "  if (loadedHref === 'about:blank') return`n`n  // Detalle Acta conserva sus grillas legacy nativas; responsiveIframes gestiona viewport y dialogs.`n"
  )
}
Write-Utf8 $detailPath ($detail.Replace("`n", "`r`n"))
Write-Host 'OK Detalle Acta: grillas nativas sin estirado de grilla unica.' -ForegroundColor Green

# 3) Centrado del popup SOLO para Detalle Acta.
$plugin = (Read-Utf8 $pluginPath).Replace("`r`n", "`n")
if (-not $plugin.Contains('const DIALOG_MANAGED_PROPERTIES')) {
  throw 'El responsive actual no corresponde al V3 reversible esperado.'
}

if (-not $plugin.Contains('const isDetailIframe =')) {
  $anchor = 'const isNotebookEnvironment = (view) => {'
  if (-not $plugin.Contains($anchor)) { throw 'No se encontro isNotebookEnvironment.' }
  $helper = @'
const isDetailIframe = (iframe) => Boolean(
  iframe?.closest?.('.legacy-iframe-stage--detail')
)

'@
  $plugin = $plugin.Replace($anchor, $helper + $anchor)
}

$plugin = $plugin.Replace(
  'const applyDialogSurfaceLayout = (surface, document, view, viewport) => {',
  'const applyDialogSurfaceLayout = (surface, document, view, viewport, forceCenter = false) => {'
)
$plugin = $plugin.Replace(
  '  if (!compactNotebook || (!outsideViewport && !oversize)) return false',
  '  if (!forceCenter && (!compactNotebook || (!outsideViewport && !oversize))) return false'
)

$oldTop = @'
  surface.style.setProperty('top', `${viewport.offsetTop + margin}px`, 'important')
'@
$newTop = @'
  surface.style.setProperty('top', `${forceCenter ? viewport.offsetTop + viewport.height / 2 : viewport.offsetTop + margin}px`, 'important')
'@
if ($plugin.Contains($oldTop.Trim())) {
  $plugin = $plugin.Replace($oldTop.Trim(), $newTop.Trim())
}

$plugin = $plugin.Replace(
  "  surface.style.setProperty('transform', 'translateX(-50%)', 'important')",
  "  surface.style.setProperty('transform', forceCenter ? 'translate(-50%, -50%)' : 'translateX(-50%)', 'important')"
)

$compactBlock = @'
  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')
  let adapted = false
'@
$compactWithDetail = @'
  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')
  const forceCenter = isDetailIframe(iframe)
  let adapted = false
'@
if ($plugin.Contains($compactBlock.Trim())) {
  $plugin = $plugin.Replace($compactBlock.Trim(), $compactWithDetail.Trim())
} elseif (-not $plugin.Contains('const forceCenter = isDetailIframe(iframe)')) {
  throw 'No se pudo agregar forceCenter para Detalle.'
}

$plugin = $plugin.Replace(
  '    adapted = applyDialogSurfaceLayout(surface, document, view, viewport) || adapted',
  '    adapted = applyDialogSurfaceLayout(surface, document, view, viewport, forceCenter) || adapted'
)

$markers = @(
  "iframe?.closest?.('.legacy-iframe-stage--detail')",
  'forceCenter = false',
  'const forceCenter = isDetailIframe(iframe)',
  'viewport.offsetTop + viewport.height / 2',
  "forceCenter ? 'translate(-50%, -50%)' : 'translateX(-50%)'",
  'applyDialogSurfaceLayout(surface, document, view, viewport, forceCenter)'
)
foreach ($marker in $markers) {
  if (-not $plugin.Contains($marker)) { throw "Falta marcador de seguridad Detalle: $marker" }
}
Write-Utf8 $pluginPath ($plugin.Replace("`n", "`r`n"))
Write-Host 'OK popup Detalle: centrado solo en legacy-iframe-stage--detail.' -ForegroundColor Green

# 4) No se permite modificar nada fuera de los cuatro targets.
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $before[$path]) {
    throw "SEGURIDAD: se modifico archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX V3 SAFE V2 APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Modificados:' -ForegroundColor Yellow
Write-Host "  $loaderPath"
Write-Host "  $profilesPath"
Write-Host "  $detailPath"
Write-Host "  $pluginPath"
Write-Host ''
Write-Host 'Ahora:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
