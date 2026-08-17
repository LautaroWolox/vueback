$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$path = 'src/plugins/responsiveIframes.js'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText((Resolve-Path $path), [System.Text.Encoding]::UTF8)
$content = $content.Replace("`r`n", "`n")

Write-Host ''
Write-Host 'FM - ROLLBACK SEGURO HOTFIX V4' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor Cyan
Write-Host 'Revierte SOLO las inyecciones V4 de responsiveIframes.js.' -ForegroundColor Yellow
Write-Host 'No toca menu, FM Global, router, loaders, Buscador, Stepper ni grillas.' -ForegroundColor Yellow
Write-Host ''

# 1) Quitar helper CSS runtime agregado por V4. Es el bloque mas riesgoso porque
#    vive a nivel de modulo y un error de parseo deja toda la aplicacion en blanco.
$helperPattern = '(?s)const DETAIL_DIALOG_CSS_PATTERN = .*?const getDetailLegacyResponsiveCss = \(\) => \(.*?\)\s*\n\n'
$content = [regex]::Replace($content, $helperPattern, '', 1)

# 2) Quitar el early-return especial de Detalle agregado por V4.
$detailEarlyPattern = @'
(?s)\n\s*if \(isDetailIframe\(iframe\)\) \{\s*// Detalle tiene varias grillas dentro del popup\..*?setDocumentScroll\(document, detailCompact && detailSurfaces\.length > 0\)\s*return\s*\}\s*\n
'@
$content = [regex]::Replace($content, $detailEarlyPattern.Trim(), "`n", 1)

# 3) Quitar variables/clases runtime exclusivas de V4.
$content = [regex]::Replace($content, "(?m)^\s*const detailIframe = isDetailIframe\(iframe\)\s*$\n?", '')
$content = [regex]::Replace($content, "(?m)^\s*document\.body\.classList\.toggle\('fm-legacy-detail-native-dialog', detailIframe\)\s*$\n?", '')

# 4) Restaurar la inyeccion normal de CSS legacy.
$content = $content.Replace(
  '    style.textContent = detailIframe ? getDetailLegacyResponsiveCss() : legacyResponsiveCss',
  '    style.textContent = legacyResponsiveCss'
)

# Limpieza defensiva si algun fragmento del helper quedo por diferencias LF/CRLF.
if ($content.Contains('const DETAIL_DIALOG_CSS_PATTERN')) {
  $start = $content.IndexOf('const DETAIL_DIALOG_CSS_PATTERN')
  $end = $content.IndexOf("const STYLE_ID = 'fm-legacy-responsive-styles'", $start)
  if ($start -ge 0 -and $end -gt $start) {
    $content = $content.Substring(0, $start) + $content.Substring($end)
  }
}

$forbidden = @(
  'DETAIL_DIALOG_CSS_PATTERN',
  'DETAIL_NATIVE_DIALOG_CSS',
  'getDetailLegacyResponsiveCss',
  'fm-legacy-detail-native-dialog',
  'detailIframe ? getDetailLegacyResponsiveCss()'
)
foreach ($marker in $forbidden) {
  if ($content.Contains($marker)) { throw "Rollback incompleto. Quedo marcador V4: $marker" }
}

# Verificaciones de infraestructura que NO deben desaparecer.
foreach ($required in @(
  "import globalCss from '@/assets/css/fm-global.css?raw'",
  'const applyResponsiveDialogLayout = (iframe, document) => {',
  'const applyResponsiveStyles = (iframe) => {',
  'style.textContent = legacyResponsiveCss'
)) {
  if (-not $content.Contains($required)) { throw "Falta bloque base despues del rollback: $required" }
}

[System.IO.File]::WriteAllText((Resolve-Path $path), $content.Replace("`n", "`r`n"), $utf8NoBom)

Write-Host 'ROLLBACK V4 COMPLETADO.' -ForegroundColor Green
Write-Host 'Unico archivo modificado por este rollback:' -ForegroundColor Yellow
Write-Host "  $path"
Write-Host ''
Write-Host 'Ejecutar AHORA:' -ForegroundColor Yellow
Write-Host '  npm run build'
Write-Host 'Si build termina OK:'
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'No hacer commit ni push.' -ForegroundColor Yellow
