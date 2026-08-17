$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$menuRef = 'github-origen/main'
$responsiveRef = 'github-origen/main'

$iframeView = 'src/views/IframeView.vue'
$legacyLayout = 'src/composables/useLegacyIframeLayout.js'
$plugin = 'src/plugins/responsiveIframes.js'
$globalCss = 'src/assets/css/fm-global.css'
$menu = 'src/components/CustomMenu.vue'

Write-Host ''
Write-Host 'REPARACION REGRESIONES MENU + IFRAME V3' -ForegroundColor Cyan
Write-Host '---------------------------------------' -ForegroundColor Cyan
Write-Host 'Restaura exactamente los ajustes finales ya aprobados.' -ForegroundColor Yellow
Write-Host 'No toca el modulo BuscadorOts, sus mocks, store, tabla ni stepper.' -ForegroundColor Yellow
Write-Host ''

foreach ($path in @($iframeView, $legacyLayout, $plugin, $globalCss, $menu)) {
  if (-not (Test-Path $path)) { throw "No se encontro $path" }
}

foreach ($ref in @($menuRef, $responsiveRef, 'github-origen/fix-grids-fullscreen-loader-final')) {
  git rev-parse --verify "$ref^{commit}" *> $null
  if ($LASTEXITCODE -ne 0) { throw "No existe $ref. Ejecuta primero: git fetch github-origen" }
}

# Guardamos hashes de los dos archivos que esta reparacion NO debe tocar.
$iframeHashBefore = (Get-FileHash $iframeView -Algorithm SHA256).Hash
$layoutHashBefore = (Get-FileHash $legacyLayout -Algorithm SHA256).Hash

function Run-GitScript {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$Path
  )

  Write-Host "Aplicando $Path desde $Ref ..." -ForegroundColor DarkCyan
  $script = git show "$Ref`:$Path"
  if ($LASTEXITCODE -ne 0 -or -not $script) {
    throw "No se pudo leer $Path desde $Ref"
  }
  Invoke-Expression ($script -join "`r`n")
}

# 1) Responsive legacy FINAL: repone el bloque CSS definitivo y el perfil de zoom alto.
Run-GitScript -Ref $responsiveRef -Path 'apply-legacy-responsive-master.ps1'

# 2) Menu FINAL: repone margen blanco inferior + separacion real de 6px en segundo nivel.
Run-GitScript -Ref $menuRef -Path 'apply-submenu-final.ps1'

# 3) Verificaciones de responsive que fueron las que se perdieron.
$pluginContent = [System.IO.File]::ReadAllText((Resolve-Path $plugin), [System.Text.Encoding]::UTF8)
$cssContent = [System.IO.File]::ReadAllText((Resolve-Path $globalCss), [System.Text.Encoding]::UTF8)
$menuContent = [System.IO.File]::ReadAllText((Resolve-Path $menu), [System.Text.Encoding]::UTF8)

$checks = @(
  @{ Ok = $pluginContent.Contains('return screenWidth >= 640 && screenHeight >= 400'); Message = 'perfil notebook 640x400' },
  @{ Ok = $pluginContent.Contains('width: Math.max(1, Math.floor(width)),'); Message = 'visualViewport sin minimo artificial de 320px' },
  @{ Ok = $pluginContent.Contains('height: Math.max(1, Math.floor(height)),'); Message = 'visualViewport sin minimo artificial de 240px' },
  @{ Ok = $cssContent.Contains('/* --- INICIO: fm-iframe-stage-flex-master --- */'); Message = 'flex master exterior del iframe' },
  @{ Ok = $cssContent.Contains('padding-bottom: 10px !important;'); Message = 'margen blanco inferior de submenu' },
  @{ Ok = $menuContent.Contains('margin-left: 6px !important;'); Message = 'gutter blanco entre niveles del menu' },
  @{ Ok = $menuContent.Contains('box-sizing: content-box !important;'); Message = 'geometria original del submenu padre' }
)

foreach ($check in $checks) {
  if (-not $check.Ok) { throw "Fallo verificacion: $($check.Message)" }
  Write-Host "OK  $($check.Message)" -ForegroundColor Green
}

# 4) Garantia: no modificar IframeView ni useLegacyIframeLayout.
$iframeHashAfter = (Get-FileHash $iframeView -Algorithm SHA256).Hash
$layoutHashAfter = (Get-FileHash $legacyLayout -Algorithm SHA256).Hash
if ($iframeHashBefore -ne $iframeHashAfter) { throw 'SEGURIDAD: IframeView.vue fue modificado inesperadamente.' }
if ($layoutHashBefore -ne $layoutHashAfter) { throw 'SEGURIDAD: useLegacyIframeLayout.js fue modificado inesperadamente.' }

Write-Host ''
Write-Host 'REPARACION APLICADA' -ForegroundColor Green
Write-Host 'Se corrigio el zoom 400% -> 100% y se restauraron los margenes blancos del menu.' -ForegroundColor Green
Write-Host 'BuscadorOts no fue modificado por esta reparacion.' -ForegroundColor Green
Write-Host ''
Write-Host 'Archivos esperados de ESTA reparacion:' -ForegroundColor Yellow
Write-Host '  src/assets/css/fm-global.css'
Write-Host '  src/plugins/responsiveIframes.js'
Write-Host '  src/components/CustomMenu.vue'
Write-Host ''
Write-Host 'Valida ahora:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
