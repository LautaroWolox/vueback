$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$remote = 'github-origen'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8([string]$Path) {
    if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
    return [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
    $fullPath = if (Test-Path $Path) { (Resolve-Path $Path).Path } else { Join-Path (Get-Location) $Path }
    $directory = Split-Path -Parent $fullPath
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }
    [System.IO.File]::WriteAllText($fullPath, $Content, $utf8NoBom)
}

function Assert-Ref([string]$Ref) {
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

    $directory = Split-Path -Parent $DestinationPath
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
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
        [Parameter(Mandatory=$true)][string]$SourcePath
    )

    $tempFile = Join-Path $env:TEMP ("fm-" + [guid]::NewGuid().ToString('N') + '.ps1')
    try {
        Copy-GitFileRaw -Ref $Ref -SourcePath $SourcePath -DestinationPath $tempFile
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $tempFile
        if ($LASTEXITCODE -ne 0) {
            throw "Fallo $SourcePath desde $Ref"
        }
    }
    finally {
        Remove-Item -Force $tempFile -ErrorAction SilentlyContinue
    }
}

Write-Host ''
Write-Host 'FM - MERGE FINAL ULTIMOS CAMBIOS V3' -ForegroundColor Cyan
Write-Host '-----------------------------------' -ForegroundColor Cyan
Write-Host 'Menu final + spinners contextuales + Reporte SAS final + merge previo.' -ForegroundColor Yellow
Write-Host 'ABM Materiales queda afuera.' -ForegroundColor Yellow
Write-Host ''

$baseRef = "$remote/merge-final-sin-abm-menu-global"
$menuRef = "$remote/fix-menu-video-real-v2"
$mainRef = "$remote/main"

Assert-Ref $baseRef
Assert-Ref $menuRef
Assert-Ref $mainRef

# 1) Merge previo: Emulacion, logout, routing legacy, menu logico, ABM afuera.
Write-Host '[1/5] Merge base...' -ForegroundColor Cyan
Invoke-GitScript -Ref $baseRef -SourcePath 'apply-merge-final-sin-abm-menu-global.ps1'

# 2) Menu FINAL posterior al fix-menu-como-video-final.
Write-Host '[2/5] Menu final del video...' -ForegroundColor Cyan
$menuPluginPath = 'src/plugins/menuSubmenuBehavior.js'
Copy-GitFileRaw -Ref $menuRef -SourcePath $menuPluginPath -DestinationPath $menuPluginPath

# Extraer el CSS exacto del menu final y dejarlo tambien dentro de fm-global.css.
$pluginText = (Read-Utf8 $menuPluginPath).Replace("`r`n", "`n")
$cssMatch = [regex]::Match($pluginText, '(?s)const MENU_VIDEO_CSS = `\n(.*?)\n`')
if (-not $cssMatch.Success) {
    throw 'No se pudo extraer MENU_VIDEO_CSS del menu final.'
}
$menuCss = $cssMatch.Groups[1].Value.Trim()

$globalPath = 'src/assets/css/fm-global.css'
$globalText = (Read-Utf8 $globalPath).Replace("`r`n", "`n")
$oldBlock = '(?s)\s*/\* ===== INICIO: fm-menu-video\.css \(integrado en fm-global\.css\) ===== \*/.*?/\* ===== FIN: fm-menu-video\.css \(integrado en fm-global\.css\) ===== \*/\s*'
$newBlock = '(?s)\s*/\* ===== INICIO: menu-video-real-v2 \(integrado en fm-global\.css\) ===== \*/.*?/\* ===== FIN: menu-video-real-v2 \(integrado en fm-global\.css\) ===== \*/\s*'
$globalText = [regex]::Replace($globalText, $oldBlock, "`n")
$globalText = [regex]::Replace($globalText, $newBlock, "`n")
$menuBlock = "/* ===== INICIO: menu-video-real-v2 (integrado en fm-global.css) ===== */`n$menuCss`n/* ===== FIN: menu-video-real-v2 (integrado en fm-global.css) ===== */"
$globalText = $globalText.TrimEnd() + "`n`n" + $menuBlock + "`n"
Write-Utf8 $globalPath ($globalText.Replace("`n", "`r`n"))

if (Test-Path 'src/assets/css/fm-menu-video.css') {
    Remove-Item -Force 'src/assets/css/fm-menu-video.css'
}

# Asegurar import/instalacion del comportamiento del menu y eliminar import CSS separado.
$mainPath = 'src/main.js'
$mainText = (Read-Utf8 $mainPath).Replace("`r`n", "`n")
$mainText = $mainText.Replace("import './assets/css/fm-menu-video.css'`n", '')
$mainText = $mainText.Replace('import "./assets/css/fm-menu-video.css"' + "`n", '')

$menuImport = "import { installMenuSubmenuBehavior } from './plugins/menuSubmenuBehavior.js'"
if (-not $mainText.Contains($menuImport)) {
    $anchor = "import { installReportSasAutoHeight } from './plugins/reportSasAutoHeight.js'"
    if (-not $mainText.Contains($anchor)) {
        throw 'No se encontro el punto de import para menuSubmenuBehavior en main.js'
    }
    $mainText = $mainText.Replace($anchor, $anchor + "`n" + $menuImport)
}

if (-not $mainText.Contains('installMenuSubmenuBehavior()')) {
    $anchor = "app.mount('#app')"
    if (-not $mainText.Contains($anchor)) {
        throw 'No se encontro app.mount en main.js'
    }
    $mainText = $mainText.Replace($anchor, $anchor + "`n`ninstallMenuSubmenuBehavior()")
}
Write-Utf8 $mainPath ($mainText.Replace("`n", "`r`n"))

# 3) Spinners contextuales finales.
Write-Host '[3/5] Spinners contextuales...' -ForegroundColor Cyan
Copy-GitFileRaw -Ref $mainRef -SourcePath 'src/components/shared/FmTypingLoader.vue' -DestinationPath 'src/components/shared/FmTypingLoader.vue'
Copy-GitFileRaw -Ref $mainRef -SourcePath 'src/components/shared/fmLoaderProfiles.js' -DestinationPath 'src/components/shared/fmLoaderProfiles.js'

# ABM no debe reaparecer ni siquiera como perfil de loader.
$profilesPath = 'src/components/shared/fmLoaderProfiles.js'
$profilesText = (Read-Utf8 $profilesPath).Replace("`r`n", "`n")
$profilesText = [regex]::Replace($profilesText, '(?ms)^\s*ABMM:\s*\{.*?^\s*\},\s*\n', '')
Write-Utf8 $profilesPath ($profilesText.Replace("`n", "`r`n"))

# 4) Reporte SAS: secuencia final aprobada.
Write-Host '[4/5] Grilla final Reporte SAS...' -ForegroundColor Cyan
Invoke-GitScript -Ref $mainRef -SourcePath 'apply-reporte-sas-exact-otf-grid.ps1'
Invoke-GitScript -Ref $mainRef -SourcePath 'apply-reporte-sas-white-filters-fullscreen.ps1'
Invoke-GitScript -Ref $mainRef -SourcePath 'apply-reporte-sas-filter-row-white-absolute.ps1'

# 5) Verificaciones finales y exclusiones.
Write-Host '[5/5] Verificando...' -ForegroundColor Cyan
if (Test-Path 'src/modules/gestionMateriales/abmMateriales') {
    Remove-Item -Recurse -Force 'src/modules/gestionMateriales/abmMateriales'
}
if (Test-Path 'src/assets/css/fm-menu-video.css') {
    Remove-Item -Force 'src/assets/css/fm-menu-video.css'
}

$globalCheck = Read-Utf8 'src/assets/css/fm-global.css'
$mainCheck = Read-Utf8 'src/main.js'
$loaderCheck = Read-Utf8 'src/components/shared/FmTypingLoader.vue'
$profilesCheck = Read-Utf8 'src/components/shared/fmLoaderProfiles.js'
$reportPageCheck = Read-Utf8 'src/modules/reporteSas/ReporteSAS.vue'
$reportTableCheck = Read-Utf8 'src/modules/reporteSas/components/Tabla.vue'
$routerCheck = Read-Utf8 'src/router/index.js'
$rutasCheck = Read-Utf8 'src/components/rutas.ts'

$requiredChecks = @(
    @{ Name = 'menu final en fm-global'; Text = $globalCheck; Token = 'menu-video-real-v2' },
    @{ Name = 'plugin menu'; Text = $mainCheck; Token = 'installMenuSubmenuBehavior' },
    @{ Name = 'spinners contextuales'; Text = $loaderCheck; Token = 'getLoaderProfile' },
    @{ Name = 'perfiles spinner'; Text = $profilesCheck; Token = 'GENERIC_LOADER' },
    @{ Name = 'Reporte SAS OTF'; Text = $globalCheck; Token = 'fm-global-exact-otf-grid' },
    @{ Name = 'Reporte SAS fullscreen'; Text = $reportPageCheck; Token = 'reporte-sas-white-filters-fullscreen' },
    @{ Name = 'Reporte SAS filtros blancos'; Text = $reportTableCheck; Token = 'reporte-sas-filter-row-white-absolute' }
)

foreach ($check in $requiredChecks) {
    if (-not $check.Text.Contains($check.Token)) {
        throw "Falta $($check.Name): $($check.Token)"
    }
}

$joinedRouting = $routerCheck + "`n" + $rutasCheck + "`n" + $profilesCheck + "`n" + $mainCheck
$forbidden = @(
    "name: 'ABMM'",
    "label: 'ABM MATERIALES'",
    'gestionMateriales/abmMateriales',
    "import './assets/css/fm-menu-video.css'",
    'import "./assets/css/fm-menu-video.css"'
)
foreach ($token in $forbidden) {
    if ($joinedRouting.Contains($token)) {
        throw "Quedo algo que debia estar afuera: $token"
    }
}

Write-Host ''
Write-Host 'LISTO. ESTE ES EL MERGE FINAL COMPLETO.' -ForegroundColor Green
Write-Host 'Incluye:' -ForegroundColor Green
Write-Host '  - menu final fix-menu-video-real-v2' -ForegroundColor Cyan
Write-Host '  - CSS del menu dentro de fm-global.css' -ForegroundColor Cyan
Write-Host '  - spinners contextuales por pantalla' -ForegroundColor Cyan
Write-Host '  - Reporte SAS igualado a OTs Fallidas + sticky + fullscreen + filtros blancos' -ForegroundColor Cyan
Write-Host '  - Emulacion, logout, routing legacy y cambios del merge previo' -ForegroundColor Cyan
Write-Host '  - ABM Materiales fuera' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Valida ahora con:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
