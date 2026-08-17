$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$stableRef = 'github-origen/main'

$globalCss = 'src/assets/css/fm-global.css'
$buscadorTable = 'src/modules/buscadorOts/components/Tabla.vue'
$buscadorStore = 'src/modules/buscadorOts/store/buscadorOtsStore.ts'
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$emulacionView = 'src/modules/emulacion/views/Emulacion.vue'
$emulacionStore = 'src/modules/emulacion/store/emulacionStore.js'
$emulacionDialog = 'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue'

$requiredFiles = @(
  $globalCss,
  $buscadorTable,
  $buscadorStore,
  $loaderPath,
  $emulacionView,
  $emulacionStore,
  $emulacionDialog,
  'src/modules/reporteSas/components/Tabla.vue'
)

$criticalFiles = @(
  'src/components/CustomMenu.vue',
  'src/views/IframeView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/plugins/responsiveIframes.js'
)

Write-Host ''
Write-Host 'FM - GRILLAS OTF + SPINNERS SAFE V3' -ForegroundColor Cyan
Write-Host '------------------------------------' -ForegroundColor Cyan
Write-Host 'Usa la grilla Registro OTs Fallidas como patrón.' -ForegroundColor Yellow
Write-Host 'No reemplaza FM Global ni toca menu/iframes.' -ForegroundColor Yellow
Write-Host ''

foreach ($path in ($requiredFiles + $criticalFiles)) {
  if (-not (Test-Path $path)) { throw "Falta archivo requerido: $path" }
}

git rev-parse --verify "$stableRef^{commit}" *> $null
if ($LASTEXITCODE -ne 0) {
  throw "No existe $stableRef. Ejecuta primero: git fetch github-origen"
}

$criticalHashes = @{}
foreach ($path in $criticalFiles) {
  $criticalHashes[$path] = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
}

function Read-Utf8([string]$Path) {
  return [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

function Replace-Required {
  param(
    [Parameter(Mandatory=$true)][string]$Content,
    [Parameter(Mandatory=$true)][string]$Old,
    [Parameter(Mandatory=$true)][string]$New,
    [Parameter(Mandatory=$true)][string]$Label
  )

  if ($Content.Contains($New)) { return $Content }
  if (-not $Content.Contains($Old)) { throw "No se encontró el bloque esperado: $Label" }
  return $Content.Replace($Old, $New)
}

function Invoke-GitScript {
  param([Parameter(Mandatory=$true)][string]$Path)

  $lines = @(git show "$stableRef`:$Path")
  if ($LASTEXITCODE -ne 0 -or $lines.Count -eq 0) {
    throw "No se pudo leer $Path desde $stableRef"
  }

  Invoke-Expression ($lines -join "`r`n")
}

# ======================================================================
# 1) Sticky probado: THEAD completo + filtros blancos opacos.
#    Estos scripts SOLO agregan/reemplazan sus bloques propios en FM Global.
# ======================================================================
Invoke-GitScript 'apply-global-sticky-grids.ps1'
Invoke-GitScript 'apply-global-sticky-grids-visual-final.ps1'

# ======================================================================
# 2) Calco visual OTF: medidas/celdas/filtros iguales al patrón #tabla.
# ======================================================================
$global = Read-Utf8 $globalCss
$markerStart = '/* --- INICIO: fm-migrated-grid-otf-clone-v3 --- */'
$markerEnd = '/* --- FIN: fm-migrated-grid-otf-clone-v3 --- */'
$global = [regex]::Replace(
  $global,
  '(?s)\s*' + [regex]::Escape($markerStart) + '.*?' + [regex]::Escape($markerEnd) + '\s*',
  "`r`n"
)

$cloneCss = @'
/* --- INICIO: fm-migrated-grid-otf-clone-v3 --- */
/* Visual de Registro OTs Fallidas aplicado a las demás DataTable migradas. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th {
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  box-shadow: none !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th {
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  border-top: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr > td {
  height: 35px !important;
  min-height: 35px !important;
  padding: 5px 8px !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 12px !important;
  vertical-align: middle !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-filter-cell, .busqueda-ots-column-filter),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead .fm-filter-cell {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-filter-prefix, .busqueda-ots-column-filter__prefix),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead .fm-filter-prefix {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-column-filter, .busqueda-ots-column-filter__input, .p-inputtext),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-column-filter, .p-inputtext) {
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

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr:hover > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr:hover > td {
  background: #edfafd !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) :is(.fm-selected-row, .p-datatable-row-selected, .p-highlight) > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) :is(.fm-selected-row, .p-datatable-row-selected, .p-highlight) > td {
  background: #9eeff7 !important;
  color: #263238 !important;
}
/* --- FIN: fm-migrated-grid-otf-clone-v3 --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $cloneCss.Trim() + "`r`n"
Write-Utf8 $globalCss $global

# ======================================================================
# 3) Buscador OTs: segunda fila de filtros SIEMPRE presente.
# ======================================================================
$buscador = Read-Utf8 $buscadorTable
$buscador = Replace-Required $buscador ':filter-display="store.showColumnFilters ? ''row'' : undefined"' 'filter-display="row"' 'Buscador filterDisplay=row'
$buscador = Replace-Required $buscador ':filter="store.showColumnFilters"' 'filter' 'Buscador filtros de columna'
$buscador = Replace-Required $buscador '<div v-if="store.showColumnFilters" class="busqueda-ots-column-filter">' '<div class="fm-filter-cell busqueda-ots-column-filter">' 'Buscador fila de filtros'
$buscador = Replace-Required $buscador 'class="busqueda-ots-column-filter__prefix"' 'class="fm-filter-prefix busqueda-ots-column-filter__prefix"' 'Buscador prefijo'
$buscador = Replace-Required $buscador 'class="busqueda-ots-column-filter__input"' 'class="fm-column-filter busqueda-ots-column-filter__input"' 'Buscador input'
Write-Utf8 $buscadorTable $buscador

$store = Read-Utf8 $buscadorStore
$store = $store.Replace('const showColumnFilters = ref(false)', 'const showColumnFilters = ref(true)')
$store = $store.Replace('showColumnFilters.value = false', 'showColumnFilters.value = true')
Write-Utf8 $buscadorStore $store

# ======================================================================
# 4) Spinner central: título único "Cargando Información".
#    contextTitle queda reservado para la excepción explícita de Emulación.
# ======================================================================
$loader = Read-Utf8 $loaderPath
if (-not $loader.Contains('contextTitle:')) {
  $oldProp = "  title: { type: String, default: 'Cargando Información' },"
  $newProp = "  title: { type: String, default: 'Cargando Información' },`r`n  contextTitle: { type: String, default: '' },"
  $loader = Replace-Required $loader $oldProp $newProp 'FmTypingLoader contextTitle'
}

if (-not $loader.Contains("String(props.contextTitle ?? '').trim()")) {
  $pattern = '(?s)const displayTitle = computed\(\(\) => \(.*?\)\)'
  $replacement = "const displayTitle = computed(() => (`r`n  String(props.contextTitle ?? '').trim() || 'Cargando Información'`r`n))"
  $updated = [regex]::Replace($loader, $pattern, $replacement, 1)
  if ($updated -eq $loader) { throw 'No se pudo centralizar el título de FmTypingLoader.' }
  $loader = $updated
}
Write-Utf8 $loaderPath $loader

# ======================================================================
# 5) Emulación: búsqueda genérica; ACEPTAR => Emulación + perfil/operador.
# ======================================================================
$emuStore = Read-Utf8 $emulacionStore
if (-not $emuStore.Contains('loaderContextTitle:')) {
  $emuStore = $emuStore.Replace(
    '        toggleLoader: false,',
    "        toggleLoader: false,`r`n        loaderContextTitle: '',`r`n        loaderMessage: 'Consultando la información del legajo',"
  )
}

if (-not $emuStore.Contains('$setLoaderContext(title')) {
  $oldAction = @'
        $setActiveTab() {
            this.activeTab = ['0']
        },
'@
  $newAction = @'
        $setActiveTab() {
            this.activeTab = ['0']
        },

        $setLoaderContext(title = '', message = '') {
            this.loaderContextTitle = String(title ?? '').trim()
            this.loaderMessage = String(message ?? '').trim() || 'Preparando pantalla'
        },
'@
  $normalizedStore = $emuStore.Replace("`r`n", "`n")
  if (-not $normalizedStore.Contains($oldAction.Replace("`r`n", "`n"))) {
    throw 'No se encontró $setActiveTab para agregar contexto de loader.'
  }
  $normalizedStore = $normalizedStore.Replace(
    $oldAction.Replace("`r`n", "`n"),
    $newAction.Replace("`r`n", "`n")
  )
  $emuStore = $normalizedStore.Replace("`n", "`r`n")
}

if (-not $emuStore.Contains("this.`$setLoaderContext('', 'Consultando la información del legajo')")) {
  $fetchMarker = '            this.toggleLoader = true'
  $fetchReplacement = "            this.`$setLoaderContext('', 'Consultando la información del legajo')`r`n            this.toggleLoader = true"
  $markerIndex = $emuStore.IndexOf($fetchMarker)
  if ($markerIndex -lt 0) { throw 'No se encontró el inicio del loader en $fetchData.' }
  $emuStore = $emuStore.Remove($markerIndex, $fetchMarker.Length).Insert($markerIndex, $fetchReplacement)
}
Write-Utf8 $emulacionStore $emuStore

$emuView = Read-Utf8 $emulacionView
$emuView = $emuView.Replace('      title="Buscando operador"', '      :context-title="store.loaderContextTitle"')
$emuView = $emuView.Replace('      message="Consultando la información del legajo"', '      :message="store.loaderMessage"')
if (-not $emuView.Contains('      variant="emulation"')) {
  $emuView = $emuView.Replace(
    '      :message="store.loaderMessage"',
    "      :message=`"store.loaderMessage`"`r`n      variant=`"emulation`""
  )
}
Write-Utf8 $emulacionView $emuView

$emuDialog = Read-Utf8 $emulacionDialog
if (-not $emuDialog.Contains("profileLabel ? `Aplicando perfil")) {
  $pattern = '(?s)(store\.\$setlegajoSelected\(operator\.legajo\)\s*showPopup\.value = false\s*)(store\.toggleLoader = true)'
  $replacement = @'
$1
  const profileLabel = selectedProfiles.value[0] || ''
  const targetLabel = profileLabel || selectedFullName.value || selectedLegajo.value
  store.$setLoaderContext(
    'Emulación',
    profileLabel ? `Aplicando perfil ${profileLabel}` : `Emulando a ${targetLabel}`
  )
  $2
'@
  $updated = [regex]::Replace($emuDialog, $pattern, $replacement.TrimEnd(), 1)
  if ($updated -eq $emuDialog) { throw 'No se pudo agregar el contexto al ACEPTAR Emulación.' }
  $emuDialog = $updated
}
Write-Utf8 $emulacionDialog $emuDialog

# ======================================================================
# 6) Garantía: menu + iframe responsive deben quedar byte-a-byte igual.
# ======================================================================
foreach ($path in $criticalFiles) {
  $afterHash = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
  if ($afterHash -ne $criticalHashes[$path]) {
    throw "SEGURIDAD: se modificó un archivo crítico: $path"
  }
}

Write-Host ''
Write-Host 'APLICADO CORRECTAMENTE' -ForegroundColor Green
Write-Host '- Buscador OTs: segunda fila de filtros siempre visible.' -ForegroundColor Green
Write-Host '- Grillas migradas: calco OTF + THEAD sticky y opaco.' -ForegroundColor Green
Write-Host '- Spinner normal: Cargando Información.' -ForegroundColor Green
Write-Host '- ACEPTAR Emulación: Emulación + perfil/operador.' -ForegroundColor Green
Write-Host '- Menu e iframes responsive: NO modificados.' -ForegroundColor Green
Write-Host ''
Write-Host 'Ahora valida:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
