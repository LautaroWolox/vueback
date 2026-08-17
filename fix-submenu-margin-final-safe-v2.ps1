$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$menuPath = 'src/components/CustomMenu.vue'
$globalPath = 'src/assets/css/fm-global.css'
$criticalFiles = @(
  'src/views/IframeView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/plugins/responsiveIframes.js'
)

foreach ($path in @($menuPath, $globalPath) + $criticalFiles) {
  if (-not (Test-Path $path)) { throw "Falta archivo requerido: $path" }
}

$criticalHashes = @{}
foreach ($path in $criticalFiles) {
  $criticalHashes[$path] = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8([string]$Path) {
  [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

Write-Host ''
Write-Host 'FM - RESTAURAR MARGEN DE SUBMENUS' -ForegroundColor Cyan
Write-Host '---------------------------------' -ForegroundColor Cyan

# 1) CustomMenu: recuperar exactamente la geometría final aprobada.
$menu = Read-Utf8 $menuPath

$basePattern = '(?s):deep\(\.p-menubar-submenu\),\s*:deep\(\.p-submenu-list\)\s*\{.*?\}'
$baseReplacement = @'
:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 238px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 !important;
  border: 1px solid #d7e0e5 !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-sizing: content-box !important;
  box-shadow: 0 5px 14px rgba(18, 45, 57, .16) !important;
  overflow: visible !important;
  z-index: 3000 !important;
}
'@

if ($menu -notmatch $basePattern) {
  throw 'No se encontró el bloque base de submenú en CustomMenu.vue.'
}
$menu = [regex]::Replace($menu, $basePattern, $baseReplacement, 1)

$nestedPattern = '(?s):deep\(\.p-menubar-submenu \.p-menubar-submenu\),\s*:deep\(\.p-submenu-list \.p-submenu-list\)\s*\{.*?\}'
$nestedReplacement = @'
:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 276px !important;
  margin-top: -3px !important;
  margin-left: 6px !important;
  transform: none !important;
}
'@

if ($menu -notmatch $nestedPattern) {
  throw 'No se encontró el bloque del submenú de segundo nivel en CustomMenu.vue.'
}
$menu = [regex]::Replace($menu, $nestedPattern, $nestedReplacement, 1)
Write-Utf8 $menuPath $menu

# 2) FM Global: margen blanco inferior real, sin alterar ancho/posición horizontal.
$global = Read-Utf8 $globalPath
$markerStart = '/* --- INICIO: fm-submenu-white-gutter-final-v2 --- */'
$markerEnd = '/* --- FIN: fm-submenu-white-gutter-final-v2 --- */'
$global = [regex]::Replace(
  $global,
  '(?s)\s*' + [regex]::Escape($markerStart) + '.*?' + [regex]::Escape($markerEnd) + '\s*',
  "`r`n"
)

$block = @'
/* --- INICIO: fm-submenu-white-gutter-final-v2 --- */
/* Margen blanco final aprobado para primer y segundo nivel del Menubar. */
#app .main-menu .p-menubar-submenu,
#app .main-menu .p-submenu-list,
body > .p-menubar-submenu,
body > .p-submenu-list {
  padding-bottom: 10px !important;
  background: #fff !important;
}

#app .main-menu .p-menubar-submenu .p-menubar-submenu,
#app .main-menu .p-submenu-list .p-submenu-list,
body > .p-menubar-submenu .p-menubar-submenu,
body > .p-submenu-list .p-submenu-list {
  margin-left: 6px !important;
  margin-top: -3px !important;
  transform: none !important;
}
/* --- FIN: fm-submenu-white-gutter-final-v2 --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $block.Trim() + "`r`n"
Write-Utf8 $globalPath $global

# 3) Seguridad: responsive legacy no se toca.
foreach ($path in $criticalFiles) {
  $afterHash = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
  if ($afterHash -ne $criticalHashes[$path]) {
    throw "SEGURIDAD: se modificó un archivo responsive crítico: $path"
  }
}

Write-Host ''
Write-Host 'CORRECCIÓN APLICADA' -ForegroundColor Green
Write-Host '- Margen blanco inferior: 10px.' -ForegroundColor Green
Write-Host '- Separación del segundo nivel: 6px.' -ForegroundColor Green
Write-Host '- Panel padre conserva su ancho (content-box).' -ForegroundColor Green
Write-Host '- Iframes/responsive: sin cambios.' -ForegroundColor Green
Write-Host ''
Write-Host 'Revisá ahora:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
