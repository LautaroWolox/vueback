$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$mainRef = 'github-origen/main'
$buscadorRef = 'github-origen/integracion-buscador-ots-aislado-v2'
$responsiveDependencyRef = 'github-origen/fix-grids-fullscreen-loader-final'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host ''
Write-Host 'FM - CONSOLIDACION FINAL SAFE V3' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor Cyan
Write-Host 'Aplicacion deterministica desde MAIN limpio.' -ForegroundColor Yellow
Write-Host 'Integra Buscador OTs migrado + Stepper, grillas OTF, spinner unico, Emulacion contextual, menu y responsive legacy.' -ForegroundColor Yellow
Write-Host 'NO hace commit ni push.' -ForegroundColor Yellow
Write-Host ''

$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'No se pudo leer git status.' }
if ($dirty.Count -gt 0) {
  Write-Host 'El working tree no esta limpio:' -ForegroundColor Red
  $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Abortado. Crear/probar V3 desde una rama limpia basada en github-origen/main.'
}

foreach ($ref in @($mainRef, $buscadorRef, $responsiveDependencyRef)) {
  git rev-parse --verify "$ref^{commit}" *> $null
  if ($LASTEXITCODE -ne 0) { throw "No existe $ref. Ejecuta primero: git fetch github-origen" }
}

function Read-Utf8([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
  return [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

function Write-Utf8-AllowNew([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Copy-GitFileRaw {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$DestinationPath
  )
  $dir = Split-Path -Parent $DestinationPath
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $command = "git show $Ref`:$SourcePath > `"$DestinationPath`""
  cmd.exe /d /s /c $command
  if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar $SourcePath desde $Ref" }
}

function Run-GitScript {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$Path
  )
  Write-Host "Aplicando $Path desde $Ref" -ForegroundColor DarkCyan
  $lines = @(git show "$Ref`:$Path")
  if ($LASTEXITCODE -ne 0 -or $lines.Count -eq 0) { throw "No se pudo leer $Path desde $Ref" }
  Invoke-Expression ($lines -join "`r`n")
}

function Add-GridCommentAndClass {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (-not (Test-Path $Path)) { return }
  $content = Read-Utf8 $Path
  if (-not $content.Contains('<DataTable')) { return }

  $content = [regex]::Replace(
    $content,
    'class="(?![^"]*\bfm-grid-otf\b)([^"]*\bfm-pass-grid\b[^"]*)"',
    'class="fm-grid-otf $1"'
  )

  if ($content.Contains('class="jobtype-main-grid jobtype-contrato-main-grid"')) {
    $content = $content.Replace(
      'class="jobtype-main-grid jobtype-contrato-main-grid"',
      'class="fm-grid-otf fm-pass-grid jobtype-main-grid jobtype-contrato-main-grid"'
    )
  }

  if ($content.Contains('fm-grid-otf') -and -not $content.Contains('<!-- FM Global: fm-grid-otf')) {
    $idx = $content.IndexOf('<DataTable')
    if ($idx -ge 0) {
      $content = $content.Insert($idx, "<!-- FM Global: fm-grid-otf | calco visual de Registro OTs Fallidas -->`r`n    ")
    }
  }

  Write-Utf8 $Path $content
}

# 0) Proteccion de la grilla patron.
$otfTable = 'src/modules/otFallidasCT/components/Table.vue'
$otfCss = 'src/modules/otFallidasCT/components/otf-table.css'
$otfTableHash = (Get-FileHash -Algorithm SHA256 -Path $otfTable).Hash
$otfCssHash = (Get-FileHash -Algorithm SHA256 -Path $otfCss).Hash

# 1) BUSCADOR DE OTs MIGRADO REAL + STEPPER.
$moduleRoot = 'src/modules/buscadorOts'
$moduleFiles = @(git ls-tree -r --name-only $buscadorRef -- $moduleRoot)
if ($LASTEXITCODE -ne 0 -or $moduleFiles.Count -eq 0) { throw 'No se pudo listar el modulo BuscadorOts.' }
foreach ($path in $moduleFiles) {
  Copy-GitFileRaw -Ref $buscadorRef -SourcePath $path -DestinationPath $path
}

$entryPath = 'src/modules/buscadorOts/BuscadorOtsEntry.vue'
$entryContent = @'
<template>
  <BuscadorOtsView />
</template>

<script setup>
import BuscadorOtsView from './BuscadorOtsView.vue'
</script>
'@
Write-Utf8-AllowNew $entryPath $entryContent

$globalPath = 'src/assets/css/fm-global.css'
$global = Read-Utf8 $globalPath
$stepperMarker = '/* === INICIO BUSCADOR OTS - STEPPER REPROCESO === */'
if (-not $global.Contains($stepperMarker)) {
  $stepperCss = @(git show "$buscadorRef`:patches/buscador-ots-stepper.fm-global.css") -join "`r`n"
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($stepperCss)) { throw 'No se pudo obtener CSS del Stepper.' }
  $global = $global.TrimEnd() + "`r`n`r`n" + $stepperCss.Trim() + "`r`n"
  Write-Utf8 $globalPath $global
}

# BUOT debe quedar apuntando directamente a Vue, nunca a IframeView.
$routerPath = 'src/router/index.js'
$router = Read-Utf8 $routerPath
$buotPattern = "(?s)\{\s*path:\s*'busquedaOtsGcc\.html',\s*name:\s*'BUOT',\s*beforeEnter:\s*allowed,\s*component:\s*\(\)\s*=>\s*import\('[^']+'\)(?:,\s*props:\s*\{.*?\})?\s*\}"
$buotReplacement = @'
{
        path: 'busquedaOtsGcc.html',
        name: 'BUOT',
        beforeEnter: allowed,
        component: () => import('../modules/buscadorOts/BuscadorOtsEntry.vue')
      }
'@
$routerUpdated = [regex]::Replace($router, $buotPattern, $buotReplacement, 1)
if ($routerUpdated -eq $router -and -not $router.Contains("../modules/buscadorOts/BuscadorOtsEntry.vue")) {
  throw 'No se pudo reemplazar la ruta BUOT por el Buscador migrado.'
}
Write-Utf8 $routerPath $routerUpdated

# Grilla principal del Buscador: filtros permanentes y contrato visual OTF.
$buscadorTable = 'src/modules/buscadorOts/components/Tabla.vue'
$bt = Read-Utf8 $buscadorTable
$bt = $bt.Replace(':filter-display="store.showColumnFilters ? ''row'' : undefined"', 'filter-display="row"')
$bt = $bt.Replace(':filter="store.showColumnFilters"', 'filter')
$bt = $bt.Replace('<div v-if="store.showColumnFilters" class="busqueda-ots-column-filter">', '<div class="fm-filter-cell busqueda-ots-column-filter">')
$bt = $bt.Replace('class="busqueda-ots-column-filter__prefix"', 'class="fm-filter-prefix busqueda-ots-column-filter__prefix"')
$bt = $bt.Replace('class="busqueda-ots-column-filter__input"', 'class="fm-column-filter busqueda-ots-column-filter__input"')
$bt = $bt.Replace('class="fm-pass-grid busqueda-ots-grid"', 'class="fm-grid-otf fm-pass-grid busqueda-ots-grid"')
if (-not $bt.Contains('filter-display="row"')) { throw 'Buscador: no quedo filter-display=row.' }
if ($bt.Contains(':filter="store.showColumnFilters"')) { throw 'Buscador: los filtros aun dependen de showColumnFilters.' }
Write-Utf8 $buscadorTable $bt

$buscadorStore = 'src/modules/buscadorOts/store/buscadorOtsStore.ts'
$bs = Read-Utf8 $buscadorStore
$bs = $bs.Replace('const showColumnFilters = ref(false)', 'const showColumnFilters = ref(true)')
$bs = $bs.Replace('showColumnFilters.value = false', 'showColumnFilters.value = true')
Write-Utf8 $buscadorStore $bs

$stepperPath = 'src/modules/buscadorOts/components/ReprocesoStepper.vue'
$step = Read-Utf8 $stepperPath
$step = $step.Replace('class="fm-pass-grid fm-workflow-stepper__grid"', 'class="fm-grid-otf fm-pass-grid fm-workflow-stepper__grid"')
Write-Utf8 $stepperPath $step

# 2) STICKY + CALCO OTF EN FM GLOBAL.
Run-GitScript -Ref $mainRef -Path 'apply-global-sticky-grids.ps1'
Run-GitScript -Ref $mainRef -Path 'apply-global-sticky-grids-visual-final.ps1'

$global = Read-Utf8 $globalPath
$gridStart = '/* --- INICIO: FM STYLE fm-grid-otf CANONICAL V3 --- */'
$gridEnd = '/* --- FIN: FM STYLE fm-grid-otf CANONICAL V3 --- */'
$global = [regex]::Replace($global, '(?s)\s*' + [regex]::Escape($gridStart) + '.*?' + [regex]::Escape($gridEnd) + '\s*', "`r`n")
$gridCss = @'
/* --- INICIO: FM STYLE fm-grid-otf CANONICAL V3 --- */
/* ESTILO FM GLOBAL: fm-grid-otf | PATRON: Registro OTs Fallidas. */
html body #app .fm-grid-otf.p-datatable {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 0 !important;
  background: #fff !important;
}
html body #app .fm-grid-otf.p-datatable :is(.p-datatable-table-container, .p-datatable-wrapper, [data-pc-section='tablecontainer']) {
  position: relative !important;
  min-width: 0 !important;
  min-height: 0 !important;
  overflow: auto !important;
  isolation: isolate !important;
  border: 1px solid #d1d1d1 !important;
  background: #fff !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 220 !important;
  background: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr:first-child > th {
  position: relative !important;
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  opacity: 1 !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr:is(.p-datatable-filter-row, .p-filter-row) > th {
  position: relative !important;
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  border-top: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
  isolation: isolate !important;
}
/* Capa blanca real: ninguna celda pasa visualmente por detras del filtro sticky. */
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr:is(.p-datatable-filter-row, .p-filter-row) > th::before {
  content: '' !important;
  position: absolute !important;
  z-index: 0 !important;
  inset: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  opacity: 1 !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr:is(.p-datatable-filter-row, .p-filter-row) > th > * {
  position: relative !important;
  z-index: 2 !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-tbody > tr > td {
  height: 35px !important;
  min-height: 35px !important;
  padding: 5px 8px !important;
  overflow: hidden !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 12px !important;
  vertical-align: middle !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
html body #app .fm-grid-otf.p-datatable .p-datatable-tbody > tr:hover > td { background: #edfafd !important; }
html body #app .fm-grid-otf.p-datatable :is(.fm-selected-row, .p-datatable-row-selected, .p-highlight) > td {
  background: #9eeff7 !important;
  color: #263238 !important;
}
html body #app .fm-grid-otf.p-datatable .fm-filter-cell {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  background: #fff !important;
}
html body #app .fm-grid-otf.p-datatable .fm-filter-prefix {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}
html body #app .fm-grid-otf.p-datatable .fm-column-filter,
html body #app .fm-grid-otf.p-datatable .fm-filter-cell .p-inputtext {
  width: 100% !important;
  min-width: 20px !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 3px 5px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  background: #fff !important;
  color: #111 !important;
  font-size: 11px !important;
  box-shadow: none !important;
  opacity: 1 !important;
}
/* --- FIN: FM STYLE fm-grid-otf CANONICAL V3 --- */
'@
$global = $global.TrimEnd() + "`r`n`r`n" + $gridCss.Trim() + "`r`n"
Write-Utf8 $globalPath $global

$gridFiles = @(
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/emulacion/components/TablaEmulacion.vue',
  'src/modules/parametrizaciones/jobtypeContrato/components/Tabla.vue',
  'src/modules/parametrizaciones/jobtypeCMO/components/Tabla.vue',
  'src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue'
)
$gridFiles += @(Get-ChildItem -Path 'src/modules/buscadorOts' -Recurse -Filter '*.vue' -File | Select-Object -ExpandProperty FullName)
$gridFiles = $gridFiles | ForEach-Object { $_.Replace((Get-Location).Path + [IO.Path]::DirectorySeparatorChar, '').Replace('\','/') } | Select-Object -Unique
foreach ($path in $gridFiles) { Add-GridCommentAndClass $path }

# 3) SPINNER UNICO: Cargando Información. Solo contextTitle puede cambiarlo.
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$loader = Read-Utf8 $loaderPath
if (-not $loader.Contains('contextTitle:')) {
  $loader = $loader.Replace("  title: { type: String, default: 'Cargando Información' },", "  title: { type: String, default: 'Cargando Información' },`r`n  contextTitle: { type: String, default: '' },")
}
$displayTitlePattern = '(?s)const displayTitle = computed\(\(\) => \(.*?\)\)'
$displayTitleReplacement = @'
const displayTitle = computed(() => (
  String(props.contextTitle ?? '').trim() || 'Cargando Información'
))
'@
$loader2 = [regex]::Replace($loader, $displayTitlePattern, $displayTitleReplacement.Trim(), 1)
if ($loader2 -eq $loader -and -not $loader.Contains("String(props.contextTitle ?? '').trim() || 'Cargando Información'")) { throw 'No se pudo centralizar el titulo del spinner.' }
Write-Utf8 $loaderPath $loader2

$profilesPath = 'src/components/shared/fmLoaderProfiles.js'
$profiles = Read-Utf8 $profilesPath
$profiles = [regex]::Replace($profiles, "title:\s*'[^']*'", "title: 'Cargando Información'")
Write-Utf8 $profilesPath $profiles

# 4) EMULACION: buscar = spinner normal; ACEPTAR = Emulando perfil/perfiles.
$emuStorePath = 'src/modules/emulacion/store/emulacionStore.js'
$emuStore = Read-Utf8 $emuStorePath
if (-not $emuStore.Contains('loaderContextTitle:')) {
  $emuStore = $emuStore.Replace('        toggleLoader: false,', "        toggleLoader: false,`r`n        loaderContextTitle: '',`r`n        loaderMessage: 'Consultando la información del legajo',")
}
if (-not $emuStore.Contains('$setLoaderContext(title')) {
  $anchor = @'
        $setActiveTab() {
            this.activeTab = ['0']
        },
'@
  $replacement = @'
        $setActiveTab() {
            this.activeTab = ['0']
        },

        $setLoaderContext(title = '', message = '') {
            this.loaderContextTitle = String(title ?? '').trim()
            this.loaderMessage = String(message ?? '').trim() || 'Preparando pantalla'
        },
'@
  $normal = $emuStore.Replace("`r`n", "`n")
  $a = $anchor.Replace("`r`n", "`n")
  if (-not $normal.Contains($a)) { throw 'Emulacion store: no se encontro $setActiveTab.' }
  $normal = $normal.Replace($a, $replacement.Replace("`r`n", "`n"))
  $emuStore = $normal.Replace("`n", "`r`n")
}
if (-not $emuStore.Contains("this.`$setLoaderContext('', 'Consultando la información del legajo')")) {
  $emuStore = $emuStore.Replace('            this.toggleLoader = true', "            this.`$setLoaderContext('', 'Consultando la información del legajo')`r`n            this.toggleLoader = true")
}
Write-Utf8 $emuStorePath $emuStore

$emuViewPath = 'src/modules/emulacion/views/Emulacion.vue'
$emuView = Read-Utf8 $emuViewPath
$emuView = $emuView.Replace('      title="Buscando operador"' + "`r`n" + '      message="Consultando la información del legajo"', '      :context-title="store.loaderContextTitle"' + "`r`n" + '      :message="store.loaderMessage"')
$emuView = $emuView.Replace('      title="Buscando operador"' + "`n" + '      message="Consultando la información del legajo"', '      :context-title="store.loaderContextTitle"' + "`n" + '      :message="store.loaderMessage"')
Write-Utf8 $emuViewPath $emuView

$emuDialogPath = 'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue'
$emuDialog = Read-Utf8 $emuDialogPath
if (-not $emuDialog.Contains("multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil'")) {
  $needle = @'
  store.$setlegajoSelected(operator.legajo)
  showPopup.value = false
  store.toggleLoader = true
'@
  $replacement = @'
  store.$setlegajoSelected(operator.legajo)

  const profiles = selectedProfiles.value
  const profileNames = profiles.join(', ')
  const multipleProfiles = profiles.length > 1
  const fallbackTarget = selectedFullName.value || operator.legajo

  store.$setLoaderContext(
    multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil',
    profiles.length
      ? `${multipleProfiles ? 'Perfiles' : 'Perfil'}: ${profileNames}`
      : `Operador: ${fallbackTarget}`
  )

  showPopup.value = false
  store.toggleLoader = true
'@
  $normal = $emuDialog.Replace("`r`n", "`n")
  $n = $needle.Replace("`r`n", "`n")
  if (-not $normal.Contains($n)) { throw 'Emulacion dialog: no se encontro el bloque ACEPTAR esperado.' }
  $normal = $normal.Replace($n, $replacement.Replace("`r`n", "`n"))
  $emuDialog = $normal.Replace("`n", "`r`n")
}
Write-Utf8 $emuDialogPath $emuDialog

# 5) RESPONSIVE LEGACY FINAL, despues de integrar el Buscador.
Run-GitScript -Ref $mainRef -Path 'apply-legacy-responsive-master.ps1'

# 6) MENU/SUBMENU final + refuerzo en FM Global.
Run-GitScript -Ref $mainRef -Path 'apply-submenu-final.ps1'
$menuPath = 'src/components/CustomMenu.vue'
$menu = Read-Utf8 $menuPath
$basePattern = '(?s):deep\(\.p-menubar-submenu\),\s*:deep\(\.p-submenu-list\)\s*\{.*?\}'
$baseReplacement = @'
:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 276px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 0 10px !important;
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
if ($menu -notmatch $basePattern) { throw 'Menu: no se encontro bloque base de submenu.' }
$menu = [regex]::Replace($menu, $basePattern, $baseReplacement, 1)
$nestedPattern = '(?s):deep\(\.p-menubar-submenu \.p-menubar-submenu\),\s*:deep\(\.p-submenu-list \.p-submenu-list\)\s*\{.*?\}'
$nestedReplacement = @'
:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 276px !important;
  width: max-content !important;
  max-width: 360px !important;
  margin-top: -3px !important;
  margin-left: 6px !important;
  transform: none !important;
}
'@
if ($menu -notmatch $nestedPattern) { throw 'Menu: no se encontro bloque de segundo nivel.' }
$menu = [regex]::Replace($menu, $nestedPattern, $nestedReplacement, 1)
Write-Utf8 $menuPath $menu

$global = Read-Utf8 $globalPath
$menuStart = '/* --- INICIO: fm-submenu-geometry-final-v3 --- */'
$menuEnd = '/* --- FIN: fm-submenu-geometry-final-v3 --- */'
$global = [regex]::Replace($global, '(?s)\s*' + [regex]::Escape($menuStart) + '.*?' + [regex]::Escape($menuEnd) + '\s*', "`r`n")
$menuCss = @'
/* --- INICIO: fm-submenu-geometry-final-v3 --- */
/* Submenu estable: no se achica al abrir niveles hijos. */
#app .main-menu .p-menubar-submenu,
#app .main-menu .p-submenu-list,
body > .p-menubar-submenu,
body > .p-submenu-list {
  min-width: 276px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 0 10px !important;
  box-sizing: content-box !important;
  background: #fff !important;
  overflow: visible !important;
}
#app .main-menu .p-menubar-submenu .p-menubar-submenu,
#app .main-menu .p-submenu-list .p-submenu-list,
body > .p-menubar-submenu .p-menubar-submenu,
body > .p-submenu-list .p-submenu-list {
  min-width: 276px !important;
  width: max-content !important;
  max-width: 360px !important;
  margin-left: 6px !important;
  margin-top: -3px !important;
  transform: none !important;
}
/* --- FIN: fm-submenu-geometry-final-v3 --- */
'@
$global = $global.TrimEnd() + "`r`n`r`n" + $menuCss.Trim() + "`r`n"
Write-Utf8 $globalPath $global

# 7) Comentarios de mantenimiento en consumidores migrados.
foreach ($path in @(
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/emulacion/components/TablaEmulacion.vue',
  'src/modules/parametrizaciones/jobtypeContrato/components/Tabla.vue',
  'src/modules/parametrizaciones/jobtypeCMO/components/Tabla.vue',
  'src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue',
  'src/modules/buscadorOts/components/Tabla.vue',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue'
)) { Add-GridCommentAndClass $path }

# 8) VERIFICACIONES FUERTES.
$routerFinal = Read-Utf8 $routerPath
$buscadorFinal = Read-Utf8 $buscadorTable
$buscadorRootFinal = Read-Utf8 'src/modules/buscadorOts/BuscadorOts.vue'
$entryFinal = Read-Utf8 $entryPath
$stepFinal = Read-Utf8 $stepperPath
$loaderFinal = Read-Utf8 $loaderPath
$profilesFinal = Read-Utf8 $profilesPath
$emuViewFinal = Read-Utf8 $emuViewPath
$emuDialogFinal = Read-Utf8 $emuDialogPath
$pluginFinal = Read-Utf8 'src/plugins/responsiveIframes.js'
$globalFinal = Read-Utf8 $globalPath
$menuFinal = Read-Utf8 $menuPath
$rutasFinal = Read-Utf8 'src/components/rutas.ts'

$checks = @(
  @{ Ok = $routerFinal.Contains("component: () => import('../modules/buscadorOts/BuscadorOtsEntry.vue')"); Message = 'BUOT usa componente Vue migrado' },
  @{ Ok = $rutasFinal.Contains("router.push({ name: 'BUOT' })"); Message = 'Menu Búsqueda de OTs navega por Vue Router a BUOT' },
  @{ Ok = $entryFinal.Contains('<BuscadorOtsView />') -and -not $entryFinal.Contains('IframeView') -and -not $entryFinal.Contains('import.meta.env.DEV'); Message = 'Buscador no vuelve al iframe ni depende de DEV' },
  @{ Ok = $buscadorRootFinal.Contains('@open-reprocess="openReprocessFlow"'); Message = 'Icono filtro abre el Stepper' },
  @{ Ok = $buscadorRootFinal.Contains('<ReprocesoStepper'); Message = 'Stepper integrado en pantalla Buscador' },
  @{ Ok = $buscadorFinal.Contains('filter-display="row"'); Message = 'Buscador tiene segunda fila de filtros' },
  @{ Ok = -not $buscadorFinal.Contains(':filter="store.showColumnFilters"'); Message = 'Filtros Buscador siempre activos' },
  @{ Ok = $buscadorFinal.Contains('fm-grid-otf'); Message = 'Grilla Buscador usa calco OTF' },
  @{ Ok = $stepFinal.Contains('fm-grid-otf'); Message = 'Grilla del Stepper usa calco OTF' },
  @{ Ok = $globalFinal.Contains('FM STYLE fm-grid-otf CANONICAL V3'); Message = 'Estilo fm-grid-otf esta en FM Global' },
  @{ Ok = $globalFinal.Contains('Capa blanca real: ninguna celda pasa visualmente por detras'); Message = 'Filtro sticky opaco presente' },
  @{ Ok = $loaderFinal.Contains("String(props.contextTitle ?? '').trim() || 'Cargando Información'"); Message = 'Spinner central dice Cargando Información' },
  @{ Ok = -not $profilesFinal.Contains("title: 'Buscando OTs'") -and -not $profilesFinal.Contains("title: 'Cargando reporte SAS'"); Message = 'Perfiles no cambian titulo del spinner' },
  @{ Ok = $emuViewFinal.Contains(':context-title="store.loaderContextTitle"'); Message = 'Emulacion usa titulo contextual solo al aceptar' },
  @{ Ok = $emuDialogFinal.Contains("multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil'"); Message = 'Emulacion muestra perfil/perfiles' },
  @{ Ok = $emuDialogFinal.Contains("const profileNames = profiles.join(', ')"); Message = 'Emulacion muestra todos los nombres de perfiles' },
  @{ Ok = $pluginFinal.Contains('return screenWidth >= 640 && screenHeight >= 400'); Message = 'Responsive notebook final 640x400' },
  @{ Ok = $pluginFinal.Contains('width: Math.max(1, Math.floor(width)),'); Message = 'Responsive usa visualViewport real en zoom alto' },
  @{ Ok = $pluginFinal.Contains('height: Math.max(1, Math.floor(height)),'); Message = 'Responsive no fuerza altura falsa a 240px' },
  @{ Ok = $globalFinal.Contains('fm-iframe-stage-flex-master'); Message = 'Flex master de iframe presente' },
  @{ Ok = $menuFinal.Contains('min-width: 276px !important;') -and $menuFinal.Contains('box-sizing: content-box !important;'); Message = 'Submenu no se achica' },
  @{ Ok = $menuFinal.Contains('margin-left: 6px !important;'); Message = 'Separacion blanca de 6px entre niveles' },
  @{ Ok = $globalFinal.Contains('fm-submenu-geometry-final-v3') -and $globalFinal.Contains('padding: 0 0 10px !important;'); Message = 'Margen blanco inferior 10px reforzado en FM Global' }
)
foreach ($check in $checks) {
  if (-not $check.Ok) { throw "FALLO VERIFICACION: $($check.Message)" }
  Write-Host "OK  $($check.Message)" -ForegroundColor Green
}

if ((Get-FileHash -Algorithm SHA256 -Path $otfTable).Hash -ne $otfTableHash) { throw 'SEGURIDAD: se modifico Table.vue de Registro OTs Fallidas.' }
if ((Get-FileHash -Algorithm SHA256 -Path $otfCss).Hash -ne $otfCssHash) { throw 'SEGURIDAD: se modifico otf-table.css de Registro OTs Fallidas.' }
Write-Host 'OK  Registro OTs Fallidas intacto como patron.' -ForegroundColor Green

git diff --quiet $mainRef -- src/views/IframeView.vue
if ($LASTEXITCODE -ne 0) { throw 'SEGURIDAD: IframeView.vue difiere de main.' }
git diff --quiet $mainRef -- src/composables/useLegacyIframeLayout.js
if ($LASTEXITCODE -ne 0) { throw 'SEGURIDAD: useLegacyIframeLayout.js difiere de main.' }
Write-Host 'OK  IframeView y useLegacyIframeLayout permanecen intactos.' -ForegroundColor Green

Write-Host ''
Write-Host 'V3 APLICADA. TODAVIA SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Ejecutar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'Pruebas:' -ForegroundColor Yellow
Write-Host '  1) Búsqueda de OTs abre Vue migrado, NO iframe.'
Write-Host '  2) Buscador: grilla OTF + fila filtros + sticky + icono filtro -> Stepper.'
Write-Host '  3) Reporte SAS: conservar visual OTF actual.'
Write-Host '  4) Todos los loaders: Cargando Información.'
Write-Host '  5) Emulación ACEPTAR: Emulando perfil/perfiles + nombres.'
Write-Host '  6) Menu/submenu: no achica, gutter 6px, margen inferior 10px.'
Write-Host '  7) Iframe: 100% -> 400% -> 100%, centrado y recuperable.'
