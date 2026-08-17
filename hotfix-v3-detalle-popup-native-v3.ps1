$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$pluginPath = 'src/plugins/responsiveIframes.js'
$detailPath = 'src/views/DetalleView.vue'

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/router/index.js',
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
Write-Host 'FM - HOTFIX V3 DETALLE: POPUP NATIVO + GRILLAS' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Corrige SOLO responsiveIframes.js.' -ForegroundColor Yellow
Write-Host 'No toca FM Global, menu, router, loaders, Buscador, Stepper, Reporte SAS ni OTs Fallidas.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

# DetalleView debe conservar la correccion anterior: sin useLegacyIframeLayout,
# porque Detalle de Acta tiene multiples grillas y no una grilla principal unica.
$detail = Read-Utf8 $detailPath
if ($detail.Contains('useLegacyIframeLayout') -or $detail.Contains('applyLegacyLayout')) {
  throw 'DetalleView volvio a usar useLegacyIframeLayout. No se aplica este hotfix encima de ese estado.'
}

$plugin = (Read-Utf8 $pluginPath).Replace("`r`n", "`n")

# Quita el forzado especial de centrado que se agrego solo para Detalle.
# Ese forzado se ejecutaba despues de abrir el popup y por eso primero aparecia
# a un costado y luego saltaba al centro. Ademas podia tomar una grilla interna
# como area de scroll del dialog y alterar su comportamiento.
$plugin = [regex]::Replace(
  $plugin,
  "(?s)const isDetailIframe = \(iframe\) => Boolean\(\s*iframe\?\.closest\?\.\('\.legacy-iframe-stage--detail'\)\s*\)\s*\n\n",
  ''
)

$plugin = $plugin.Replace(
  'const applyDialogSurfaceLayout = (surface, document, view, viewport, forceCenter = false) => {',
  'const applyDialogSurfaceLayout = (surface, document, view, viewport) => {'
)

$plugin = $plugin.Replace(
  '  if (!forceCenter && (!compactNotebook || (!outsideViewport && !oversize))) return false',
  '  if (!compactNotebook || (!outsideViewport && !oversize)) return false'
)

$plugin = $plugin.Replace(
  "  surface.style.setProperty('top', `${forceCenter ? viewport.offsetTop + viewport.height / 2 : viewport.offsetTop + margin}px`, 'important')",
  "  surface.style.setProperty('top', `${viewport.offsetTop + margin}px`, 'important')"
)

$plugin = $plugin.Replace(
  "  surface.style.setProperty('transform', forceCenter ? 'translate(-50%, -50%)' : 'translateX(-50%)', 'important')",
  "  surface.style.setProperty('transform', 'translateX(-50%)', 'important')"
)

$plugin = [regex]::Replace(
  $plugin,
  "(?m)^\s*const forceCenter = isDetailIframe\(iframe\)\s*\n",
  ''
)

$plugin = $plugin.Replace(
  '    adapted = applyDialogSurfaceLayout(surface, document, view, viewport, forceCenter) || adapted',
  '    adapted = applyDialogSurfaceLayout(surface, document, view, viewport) || adapted'
)

# Garantias: el dialog solo se adapta cuando el viewport esta realmente compacto
# y el popup queda fuera/no entra. A 100% el JSP conserva posicion y grillas nativas.
$requiredMarkers = @(
  'const applyDialogSurfaceLayout = (surface, document, view, viewport) => {',
  'if (!compactNotebook || (!outsideViewport && !oversize)) return false',
  "surface.style.setProperty('top', `${viewport.offsetTop + margin}px`, 'important')",
  "surface.style.setProperty('transform', 'translateX(-50%)', 'important')",
  'adapted = applyDialogSurfaceLayout(surface, document, view, viewport) || adapted',
  'width: Math.max(1, Math.floor(width))',
  'height: Math.max(1, Math.floor(height))'
)
foreach ($marker in $requiredMarkers) {
  if (-not $plugin.Contains($marker)) { throw "Falta verificacion responsive: $marker" }
}

$forbiddenMarkers = @(
  'isDetailIframe',
  'forceCenter = false',
  'const forceCenter = isDetailIframe(iframe)',
  "translate(-50%, -50%)"
)
foreach ($marker in $forbiddenMarkers) {
  if ($plugin.Contains($marker)) { throw "Aun queda centrado forzado de Detalle: $marker" }
}

Write-Utf8 $pluginPath ($plugin.Replace("`n", "`r`n"))

# Seguridad: ningun otro archivo cambia durante este hotfix.
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: el hotfix modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Resultado:' -ForegroundColor Yellow
Write-Host '  - Detalle conserva multiples grillas con comportamiento nativo.'
Write-Host '  - El popup NO se reposiciona despues de abrir a 100%.'
Write-Host '  - responsiveIframes solo adapta el popup con zoom/viewport compacto si realmente no entra.'
Write-Host '  - El responsive general 100 -> 400 -> 100 se conserva.'
Write-Host ''
Write-Host 'Archivo tocado:' -ForegroundColor Yellow
Write-Host "  $pluginPath"
Write-Host ''
Write-Host 'Ejecutar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
