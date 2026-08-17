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
Write-Host 'FM - HOTFIX V3: SPINNER + DETALLE ACTA' -ForegroundColor Cyan
Write-Host '--------------------------------------' -ForegroundColor Cyan
Write-Host 'Solo toca FmTypingLoader, perfiles de loader, DetalleView y responsiveIframes.' -ForegroundColor Yellow
Write-Host 'NO toca FM Global, menu, router, Buscador OTs, Stepper, Reporte SAS ni OTs Fallidas.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

# ----------------------------------------------------------------------
# 1) Spinner: titulo unico, escrito con escape JS ASCII para evitar mojibake
#    cuando el script se ejecuta por PowerShell 5 / consola Windows.
# ----------------------------------------------------------------------
$loader = (Read-Utf8 $loaderPath).Replace("`r`n", "`n")

$loader = [regex]::Replace(
  $loader,
  "(?m)^\s*title:\s*\{\s*type:\s*String,\s*default:\s*'[^']*'\s*\},\s*$",
  "  title: { type: String, default: 'Cargando Informaci\u00f3n' },",
  1
)

if (-not $loader.Contains('contextTitle:')) {
  $titleLine = "  title: { type: String, default: 'Cargando Informaci\u00f3n' },"
  if (-not $loader.Contains($titleLine)) { throw 'No se encontro la prop title en FmTypingLoader.' }
  $loader = $loader.Replace(
    $titleLine,
    $titleLine + "`n  contextTitle: { type: String, default: '' },"
  )
}

$displayPattern = '(?s)const displayTitle = computed\(\(\) => \(.*?\)\)'
$displayReplacement = @'
const displayTitle = computed(() => (
  String(props.contextTitle ?? '').trim() || 'Cargando Informaci\u00f3n'
))
'@
$updatedLoader = [regex]::Replace($loader, $displayPattern, $displayReplacement.Trim(), 1)
if (-not $updatedLoader.Contains("'Cargando Informaci\u00f3n'")) {
  throw 'No se pudo fijar el titulo unico del spinner.'
}
Write-Utf8 $loaderPath ($updatedLoader.Replace("`n", "`r`n"))

$profiles = (Read-Utf8 $profilesPath).Replace("`r`n", "`n")
$profiles = [regex]::Replace(
  $profiles,
  "title:\s*'[^']*'",
  "title: 'Cargando Informaci\u00f3n'"
)
Write-Utf8 $profilesPath ($profiles.Replace("`n", "`r`n"))
Write-Host 'OK spinner: Cargando Informacion con acento Unicode seguro.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 2) Detalle Acta: NO usar el algoritmo que estira una unica grilla principal.
#    Detalle posee varias grillas legacy; dejarlas con su geometria nativa evita
#    que una grilla absorba el alto/scroll de las demas.
# ----------------------------------------------------------------------
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
  throw 'DetalleView aun contiene el estirado de grilla principal.'
}

if (-not $detail.Contains('Detalle Acta conserva sus grillas legacy nativas')) {
  $detail = $detail.Replace(
    "  if (loadedHref === 'about:blank') return`n",
    "  if (loadedHref === 'about:blank') return`n`n  // Detalle Acta conserva sus grillas legacy nativas; responsiveIframes gestiona viewport y dialogs.`n"
  )
}
Write-Utf8 $detailPath ($detail.Replace("`n", "`r`n"))
Write-Host 'OK Detalle Acta: grillas internas vuelven a comportamiento nativo.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 3) Popup de Detalle: centrar SOLO el iframe de Detalle Acta.
#    Los demas iframes conservan exactamente el responsive V3.
# ----------------------------------------------------------------------
$plugin = (Read-Utf8 $pluginPath).Replace("`r`n", "`n")

if (-not $plugin.Contains('const DIALOG_MANAGED_PROPERTIES')) {
  throw 'responsiveIframes no tiene el bloque reversible esperado de V3.'
}

if (-not $plugin.Contains('const isDetailIframe =')) {
  $anchor = 'const isNotebookEnvironment = (view) => {'
  if (-not $plugin.Contains($anchor)) { throw 'No se encontro isNotebookEnvironment.' }
  $detailHelper = @'
const isDetailIframe = (iframe) => Boolean(
  iframe?.closest?.('.legacy-iframe-stage--detail')
)

'@
  $plugin = $plugin.Replace($anchor, $detailHelper + $anchor)
}

$plugin = $plugin.Replace(
  'const applyDialogSurfaceLayout = (surface, document, view, viewport) => {',
  'const applyDialogSurfaceLayout = (surface, document, view, viewport, forceCenter = false) => {'
)

$plugin = $plugin.Replace(
  '  if (!compactNotebook || (!outsideViewport && !oversize)) return false',
  '  if (!forceCenter && (!compactNotebook || (!outsideViewport && !oversize))) return false'
)

$plugin = $plugin.Replace(
  "  surface.style.setProperty('top', `${viewport.offsetTop + margin}px`, 'important')",
  "  surface.style.setProperty('top', `${forceCenter ? viewport.offsetTop + viewport.height / 2 : viewport.offsetTop + margin}px`, 'important')"
)
$plugin = $plugin.Replace(
  "  surface.style.setProperty('transform', 'translateX(-50%)', 'important')",
  "  surface.style.setProperty('transform', forceCenter ? 'translate(-50%, -50%)' : 'translateX(-50%)', 'important')"
)

$compactAnchor = "  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')`n  let adapted = false"
if ($plugin.Contains($compactAnchor)) {
  $plugin = $plugin.Replace(
    $compactAnchor,
    "  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')`n  const forceCenter = isDetailIframe(iframe)`n  let adapted = false"
  )
} elseif (-not $plugin.Contains('const forceCenter = isDetailIframe(iframe)')) {
  throw 'No se pudo agregar la deteccion de Detalle al layout de dialogs.'
}

$plugin = $plugin.Replace(
  '    adapted = applyDialogSurfaceLayout(surface, document, view, viewport) || adapted',
  '    adapted = applyDialogSurfaceLayout(surface, document, view, viewport, forceCenter) || adapted'
)

$requiredPluginMarkers = @(
  "iframe?.closest?.('.legacy-iframe-stage--detail')",
  'forceCenter = false',
  'const forceCenter = isDetailIframe(iframe)',
  "forceCenter ? 'translate(-50%, -50%)' : 'translateX(-50%)'",
  'applyDialogSurfaceLayout(surface, document, view, viewport, forceCenter)'
)
foreach ($marker in $requiredPluginMarkers) {
  if (-not $plugin.Contains($marker)) { throw "Falta verificacion de popup Detalle: $marker" }
}

Write-Utf8 $pluginPath ($plugin.Replace("`n", "`r`n"))
Write-Host 'OK popup Detalle: centrado aislado al iframe de Detalle Acta.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 4) Seguridad: nada fuera de los cuatro targets puede cambiar por este hotfix.
# ----------------------------------------------------------------------
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: el hotfix modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX V3 APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Archivos tocados:' -ForegroundColor Yellow
Write-Host "  $loaderPath"
Write-Host "  $profilesPath"
Write-Host "  $detailPath"
Write-Host "  $pluginPath"
Write-Host ''
Write-Host 'Verificar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'Pruebas:' -ForegroundColor Yellow
Write-Host '  1) Spinner normal: Cargando Informacion (con acento correcto en UI).'
Write-Host '  2) Emulacion ACEPTAR: mantiene Emulando perfil/perfiles.'
Write-Host '  3) Consulta Actas -> Detalle: grillas internas operativas.'
Write-Host '  4) Popup Detalle: centrado.'
Write-Host '  5) Iframe comun 100 -> 400 -> 100: sin regresion.'
