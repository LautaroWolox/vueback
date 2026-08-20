$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$remote = 'github-origen'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
  [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  $full = if (Test-Path $Path) { (Resolve-Path $Path).Path } else { Join-Path (Get-Location) $Path }
  $dir = Split-Path -Parent $full
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
}

function Assert-GitRef([string]$Ref) {
  git rev-parse --verify "$Ref^{commit}" *> $null
  if ($LASTEXITCODE -ne 0) {
    throw "No existe $Ref. Ejecuta primero: git fetch github-origen"
  }
}

function Copy-GitFileRaw {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$DestinationPath
  )

  $dir = Split-Path -Parent $DestinationPath
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $command = "git show $Ref`:$SourcePath > `"$DestinationPath`""
  cmd.exe /d /s /c $command
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo copiar $SourcePath desde $Ref"
  }
}

function Invoke-GitScript {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$Path
  )

  $temp = Join-Path $env:TEMP ("fm-" + [guid]::NewGuid().ToString('N') + '.ps1')
  try {
    Copy-GitFileRaw -Ref $Ref -SourcePath $Path -DestinationPath $temp
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $temp
    if ($LASTEXITCODE -ne 0) {
      throw "Fallo el aplicador $Path desde $Ref"
    }
  }
  finally {
    Remove-Item -Force $temp -ErrorAction SilentlyContinue
  }
}

Write-Host ''
Write-Host 'FM - MERGE FINAL ULTIMOS CAMBIOS V2' -ForegroundColor Cyan
Write-Host '-----------------------------------' -ForegroundColor Cyan
Write-Host 'Incluye: merge previo + menu video real v2 + spinners contextuales + grilla final Reporte SAS.' -ForegroundColor Yellow
Write-Host 'ABM Materiales permanece fuera.' -ForegroundColor Yellow
Write-Host ''

$refs = @(
  "$remote/merge-final-sin-abm-menu-global",
  "$remote/fix-menu-video-real-v2",
  "$remote/main"
)
$refs | ForEach-Object { Assert-GitRef $_ }

# -----------------------------------------------------------------------------
# 1) Base consolidada anterior: rutas, Emulacion, logout, menu logico, ABM fuera.
# -----------------------------------------------------------------------------
Write-Host '[1/5] Aplicando merge base consolidado...' -ForegroundColor Cyan
Invoke-GitScript -Ref "$remote/merge-final-sin-abm-menu-global" -Path 'apply-merge-final-sin-abm-menu-global.ps1'

# -----------------------------------------------------------------------------
# 2) MENU FINAL: toma la version posterior fix-menu-video-real-v2.
#    El CSS exacto tambien queda dentro de fm-global.css, como se pidio.
#    El plugin se conserva porque cierra submenus al hacer click dentro de iframes
#    y refuerza la prioridad visual despues del mount.
# -----------------------------------------------------------------------------
Write-Host '[2/5] Aplicando menu final del video...' -ForegroundColor Cyan
$menuRef = "$remote/fix-menu-video-real-v2"
$menuPluginPath = 'src/plugins/menuSubmenuBehavior.js'
Copy-GitFileRaw -Ref $menuRef -SourcePath $menuPluginPath -DestinationPath $menuPluginPath

$menuPlugin = (Read-Utf8 $menuPluginPath).Replace("`r`n", "`n")
$menuCssMatch = [regex]::Match($menuPlugin, '(?s)const MENU_VIDEO_CSS = `\n(.*?)\n`')
if (-not $menuCssMatch.Success) {
  throw 'No se pudo extraer el CSS del menu final desde menuSubmenuBehavior.js'
}
$latestMenuCss = $menuCssMatch.Groups[1].Value.Trim()

$globalPath = 'src/assets/css/fm-global.css'
$global = (Read-Utf8 $globalPath).Replace("`r`n", "`n")
$oldMenuPattern = '(?s)\s*/\* ===== INICIO: fm-menu-video\.css \(integrado en fm-global\.css\) ===== \*/.*?/\* ===== FIN: fm-menu-video\.css \(integrado en fm-global\.css\) ===== \*/\s*'
$newMenuPattern = '(?s)\s*/\* ===== INICIO: menu-video-real-v2 \(integrado en fm-global\.css\) ===== \*/.*?/\* ===== FIN: menu-video-real-v2 \(integrado en fm-global\.css\) ===== \*/\s*'
$global = [regex]::Replace($global, $oldMenuPattern, "`n")
$global = [regex]::Replace($global, $newMenuPattern, "`n")
$menuBlock = @"
/* ===== INICIO: menu-video-real-v2 (integrado en fm-global.css) ===== */
$latestMenuCss
/* ===== FIN: menu-video-real-v2 (integrado en fm-global.css) ===== */
"@
$global = $global.TrimEnd() + "`n`n" + $menuBlock.Trim() + "`n"
Write-Utf8 $globalPath ($global.Replace("`n", "`r`n"))

if (Test-Path 'src/assets/css/fm-menu-video.css') {
  Remove-Item -Force 'src/assets/css/fm-menu-video.css'
}

$mainPath = 'src/main.js'
$main = (Read-Utf8 $mainPath).Replace("`r`n", "`n")
$main = [regex]::Replace($main, "(?m)^import ['\"]\./assets/css/fm-menu-video\.css['\"]\s*;?\s*$\n?", '')
if (-not $main.Contains("import { installMenuSubmenuBehavior } from './plugins/menuSubmenuBehavior.js'")) {
  $needle = "import { installReportSasAutoHeight } from './plugins/reportSasAutoHeight.js'"
  if ($main.Contains($needle)) {
    $main = $main.Replace($needle, $needle + "`nimport { installMenuSubmenuBehavior } from './plugins/menuSubmenuBehavior.js'")
  } else {
    throw 'No se encontro punto seguro para importar menuSubmenuBehavior en main.js'
  }
}
if (-not $main.Contains('installMenuSubmenuBehavior()')) {
  $needle = "app.mount('#app')"
  if ($main.Contains($needle)) {
    $main = $main.Replace($needle, $needle + "`n`ninstallMenuSubmenuBehavior()")
  } else {
    throw 'No se encontro app.mount en main.js'
  }
}
Write-Utf8 $mainPath ($main.Replace("`n", "`r`n"))

# -----------------------------------------------------------------------------
# 3) SPINNERS NUEVOS / CONTEXTUALES.
#    Se toman de la version final integrada en main (misma fuente safe-only v2).
#    No se restaura LoadingOverlay porque el proyecto actual usa FmTypingLoader.
# -----------------------------------------------------------------------------
Write-Host '[3/5] Aplicando spinners contextuales finales...' -ForegroundColor Cyan
Copy-GitFileRaw -Ref "$remote/main" -SourcePath 'src/components/shared/FmTypingLoader.vue' -DestinationPath 'src/components/shared/FmTypingLoader.vue'
Copy-GitFileRaw -Ref "$remote/main" -SourcePath 'src/components/shared/fmLoaderProfiles.js' -DestinationPath 'src/components/shared/fmLoaderProfiles.js'

# ABM Materiales queda fuera tambien de los perfiles del loader.
$profilesPath = 'src/components/shared/fmLoaderProfiles.js'
$profiles = (Read-Utf8 $profilesPath).Replace("`r`n", "`n")
$profiles = [regex]::Replace(
  $profiles,
  "(?ms)^\s*ABMM:\s*\{.*?^\s*\},\s*\n",
  ''
)
Write-Utf8 $profilesPath ($profiles.Replace("`n", "`r`n"))

# -----------------------------------------------------------------------------
# 4) REPORTE SAS FINAL.
#    Orden exacto de los fixes aprobados:
#      a) misma grilla visual/Sticky que OTs Fallidas
#      b) fullscreen + filtros blancos
#      c) override absoluto final de la fila de filtros
# -----------------------------------------------------------------------------
Write-Host '[4/5] Aplicando arreglo final de grilla Reporte SAS...' -ForegroundColor Cyan
Invoke-GitScript -Ref "$remote/main" -Path 'apply-reporte-sas-exact-otf-grid.ps1'
Invoke-GitScript -Ref "$remote/main" -Path 'apply-reporte-sas-white-filters-fullscreen.ps1'
Invoke-GitScript -Ref "$remote/main" -Path 'apply-reporte-sas-filter-row-white-absolute.ps1'

# -----------------------------------------------------------------------------
# 5) GARANTIAS FINALES / EXCLUSIONES.
# -----------------------------------------------------------------------------
Write-Host '[5/5] Verificando merge...' -ForegroundColor Cyan

if (Test-Path 'src/modules/gestionMateriales/abmMateriales') {
  Remove-Item -Recurse -Force 'src/modules/gestionMateriales/abmMateriales'
}
if (Test-Path 'src/assets/css/fm-menu-video.css') {
  Remove-Item -Force 'src/assets/css/fm-menu-video.css'
}

$allSource = Get-ChildItem -Path 'src' -Recurse -File -Include *.vue,*.js,*.ts,*.css |
  ForEach-Object { [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8) }
$joinedSource = $allSource -join "`n"

$required = @(
  'menu-video-real-v2',
  'installMenuSubmenuBehavior',
  'getLoaderProfile',
  'fm-global-exact-otf-grid',
  'reporte-sas-white-filters-fullscreen',
  'reporte-sas-filter-row-white-absolute'
)
foreach ($token in $required) {
  if (-not $joinedSource.Contains($token)) {
    throw "Verificacion incompleta. Falta: $token"
  }
}

$forbidden = @(
  "name: 'ABMM'",
  "label: 'ABM MATERIALES'",
  'gestionMateriales/abmMateriales',
  "import './assets/css/fm-menu-video.css'",
  'import "./assets/css/fm-menu-video.css"'
)
foreach ($token in $forbidden) {
  if ($joinedSource.Contains($token)) {
    throw "Quedo una referencia que debia estar fuera: $token"
  }
}

Write-Host ''
Write-Host 'LISTO - ULTIMOS CAMBIOS APLICADOS.' -ForegroundColor Green
Write-Host 'Incluido:' -ForegroundColor Green
Write-Host '  - menu final fix-menu-video-real-v2' -ForegroundColor Cyan
Write-Host '  - CSS del menu dentro de fm-global.css (sin fm-menu-video.css separado)' -ForegroundColor Cyan
Write-Host '  - spinners contextuales finales por pantalla' -ForegroundColor Cyan
Write-Host '  - Reporte SAS con estilo OTF, sticky, filtros opacos/blancos y fullscreen' -ForegroundColor Cyan
Write-Host '  - merge previo: Emulacion, logout, routing legacy y demas ajustes' -ForegroundColor Cyan
Write-Host '  - ABM Materiales fuera' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Ahora ejecuta:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
