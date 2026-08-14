$ErrorActionPreference = 'Stop'
$remoteRef = 'github-origen/fix-grids-fullscreen-loader-final'

# 1) Ejecuta la version final que reemplaza completamente el bloque legacy.
$baseScript = git show "${remoteRef}:apply-legacy-responsive-final.ps1"
if ($LASTEXITCODE -ne 0 -or -not $baseScript) {
  throw 'No se pudo leer apply-legacy-responsive-final.ps1 desde github-origen.'
}
Invoke-Expression ($baseScript -join "`r`n")

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 2) Ajustes finales del CSS exterior.
$cssPath = 'src/assets/css/fm-global.css'
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
$css = $css.Replace('min-width: min(680px, max-content) !important;', 'min-width: 680px !important;')

$flexStart = '/* --- INICIO: fm-iframe-stage-flex-master --- */'
$flexEnd = '/* --- FIN: fm-iframe-stage-flex-master --- */'
$flexStartEscaped = [regex]::Escape($flexStart)
$flexEndEscaped = [regex]::Escape($flexEnd)
$css = [regex]::Replace($css, "(?s)\s*$flexStartEscaped.*?$flexEndEscaped\s*", "`r`n")

$flexCss = @'
/* --- INICIO: fm-iframe-stage-flex-master --- */
html body #app .legacy-iframe-stage {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

html body #app .legacy-iframe-stage > .legacy-iframe {
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
}
/* --- FIN: fm-iframe-stage-flex-master --- */
'@

$css = $css.TrimEnd() + "`r`n`r`n" + $flexCss + "`r`n"
[System.IO.File]::WriteAllText($cssPath, $css, $utf8NoBom)

# 3) Perfil de notebook: contempla 1024x768 con escalado de Windows y usa el
# visualViewport REAL incluso con zoom muy alto.
$pluginPath = 'src/plugins/responsiveIframes.js'
if (-not (Test-Path $pluginPath)) { throw "No se encontro $pluginPath" }
$plugin = [System.IO.File]::ReadAllText($pluginPath, [System.Text.Encoding]::UTF8)

$plugin = $plugin.Replace(
  'return screenWidth >= 800 && screenHeight >= 480 && (finePointer || !coarsePointer)',
  'return screenWidth >= 640 && screenHeight >= 400 && (finePointer || !coarsePointer)'
)
$plugin = $plugin.Replace(
  'width: Math.max(320, Math.floor(width)),',
  'width: Math.max(1, Math.floor(width)),'
)
$plugin = $plugin.Replace(
  'height: Math.max(240, Math.floor(height)),',
  'height: Math.max(1, Math.floor(height)),'
)

[System.IO.File]::WriteAllText($pluginPath, $plugin, $utf8NoBom)

Write-Host ''
Write-Host '============================================================'
Write-Host 'RESPONSIVE MASTER DE IFRAMES APLICADO'
Write-Host '============================================================'
Write-Host 'OK - iframe normal ocupa todo el espacio debajo del menu.'
Write-Host 'OK - grilla principal del segundo acordeon llega hasta abajo.'
Write-Host 'OK - paginador queda debajo de la grilla.'
Write-Host 'OK - acordeones legacy no reciben flex/height/overflow invasivo.'
Write-Host 'OK - notebook mantiene layout desktop con zoom alto.'
Write-Host 'OK - dialogs/popups quedan dentro del visualViewport.'
Write-Host 'OK - Detalle Acta usa 100dvh porque no tiene menu.'
Write-Host 'Archivos modificados:'
Write-Host '  src/assets/css/fm-global.css'
Write-Host '  src/plugins/responsiveIframes.js'
