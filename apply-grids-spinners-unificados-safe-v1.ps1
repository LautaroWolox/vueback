$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$globalCss = 'src/assets/css/fm-global.css'
$buscadorTable = 'src/modules/buscadorOts/components/Tabla.vue'
$buscadorStore = 'src/modules/buscadorOts/store/buscadorOtsStore.ts'
$jobtypeTable = 'src/modules/parametrizaciones/jobtypeContrato/components/Tabla.vue'
$abmTable = 'src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue'
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$profilesPath = 'src/components/shared/fmLoaderProfiles.js'
$emulacionView = 'src/modules/emulacion/views/Emulacion.vue'
$emulacionStore = 'src/modules/emulacion/store/emulacionStore.js'
$emulacionDialog = 'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue'

$targets = @(
  $globalCss,
  $buscadorTable,
  $buscadorStore,
  $jobtypeTable,
  $abmTable,
  $loaderPath,
  $profilesPath,
  $emulacionView,
  $emulacionStore,
  $emulacionDialog
)

$criticalFiles = @(
  'src/components/CustomMenu.vue',
  'src/views/IframeView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/plugins/responsiveIframes.js'
)

Write-Host ''
Write-Host 'FM - GRILLAS + SPINNERS UNIFICADOS SAFE V1' -ForegroundColor Cyan
Write-Host '------------------------------------------' -ForegroundColor Cyan
Write-Host 'Replica el visual de Registro OTs Fallidas en grillas Vue migradas.' -ForegroundColor Yellow
Write-Host 'Mantiene menu e infraestructura responsive de iframes sin cambios.' -ForegroundColor Yellow
Write-Host ''

foreach ($path in ($targets + $criticalFiles)) {
  if (-not (Test-Path $path)) {
    throw "Falta archivo requerido: $path"
  }
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

function Replace-Exact {
  param(
    [Parameter(Mandatory=$true)][string]$Content,
    [Parameter(Mandatory=$true)][string]$Old,
    [Parameter(Mandatory=$true)][string]$New,
    [Parameter(Mandatory=$true)][string]$Label,
    [switch]$AllowAlreadyApplied
  )

  if ($Content.Contains($Old)) {
    return $Content.Replace($Old, $New)
  }

  if ($AllowAlreadyApplied -and $Content.Contains($New)) {
    return $Content
  }

  throw "No se encontro el bloque esperado para: $Label"
}

# ----------------------------------------------------------------------
# 1) BÚSQUEDA DE OTs: la fila de filtros queda SIEMPRE visible.
# ----------------------------------------------------------------------
$buscador = Read-Utf8 $buscadorTable
$buscador = Replace-Exact $buscador ':filter-display="store.showColumnFilters ? ''row'' : undefined"' 'filter-display="row"' 'Buscador filterDisplay=row' -AllowAlreadyApplied
$buscador = Replace-Exact $buscador ':filter="store.showColumnFilters"' 'filter' 'Buscador columnas filtrables' -AllowAlreadyApplied
$buscador = Replace-Exact $buscador '<div v-if="store.showColumnFilters" class="busqueda-ots-column-filter">' '<div class="fm-filter-cell busqueda-ots-column-filter">' 'Buscador filtro siempre visible' -AllowAlreadyApplied
$buscador = Replace-Exact $buscador 'class="busqueda-ots-column-filter__prefix"' 'class="fm-filter-prefix busqueda-ots-column-filter__prefix"' 'Buscador prefijo FM' -AllowAlreadyApplied
$buscador = Replace-Exact $buscador 'class="busqueda-ots-column-filter__input"' 'class="fm-column-filter busqueda-ots-column-filter__input"' 'Buscador input FM' -AllowAlreadyApplied
Write-Utf8 $buscadorTable $buscador

$store = Read-Utf8 $buscadorStore
$store = $store.Replace('const showColumnFilters = ref(false)', 'const showColumnFilters = ref(true)')
$store = $store.Replace('showColumnFilters.value = false', 'showColumnFilters.value = true')
Write-Utf8 $buscadorStore $store

# ----------------------------------------------------------------------
# 2) Todas las grillas principales migradas usan el contrato fm-pass-grid.
#    CMO, Reporte SAS y ABM ya lo tenían. Se completa Jobtype-Contrato y
#    se normalizan clases de filtros de ABM/Jobtype para heredar el calco OTF.
# ----------------------------------------------------------------------
$jobtype = Read-Utf8 $jobtypeTable
$jobtype = Replace-Exact $jobtype 'class="jobtype-main-grid jobtype-contrato-main-grid"' 'class="jobtype-main-grid fm-pass-grid jobtype-contrato-main-grid"' 'Jobtype fm-pass-grid' -AllowAlreadyApplied
$jobtype = $jobtype.Replace('class="jobtype-filter-cell"', 'class="fm-filter-cell jobtype-filter-cell"')
$jobtype = $jobtype.Replace('class="jobtype-filter-symbol"', 'class="fm-filter-prefix jobtype-filter-symbol"')
$jobtype = $jobtype.Replace('class="jobtype-filter-input"', 'class="fm-column-filter jobtype-filter-input"')
Write-Utf8 $jobtypeTable $jobtype

$abm = Read-Utf8 $abmTable
$abm = $abm.Replace('class="abm-materiales-filter-symbol"', 'class="fm-filter-prefix abm-materiales-filter-symbol"')
$abm = $abm.Replace('class="abm-materiales-filter-input"', 'class="fm-column-filter abm-materiales-filter-input"')
Write-Utf8 $abmTable $abm

# ----------------------------------------------------------------------
# 3) FM GLOBAL: calco visual de OTs Fallidas para las demás grillas migradas.
#    Sticky sobre THEAD completo + filtros blancos opacos + tbody por debajo.
# ----------------------------------------------------------------------
$global = Read-Utf8 $globalCss
$markerStart = '/* --- INICIO: fm-migrated-grid-otf-clone-final --- */'
$markerEnd = '/* --- FIN: fm-migrated-grid-otf-clone-final --- */'
$global = [regex]::Replace(
  $global,
  '(?s)\s*' + [regex]::Escape($markerStart) + '.*?' + [regex]::Escape($markerEnd) + '\s*',
  "`r`n"
)

$gridCss = @'
/* --- INICIO: fm-migrated-grid-otf-clone-final --- */
/*
 * Grillas Vue migradas: replica final del aspecto aprobado de Registro OTs Fallidas.
 * #tabla es la grilla patrón y queda excluida para no alterar su implementación.
 */
html body #app .fm-pass-grid.p-datatable:not(#tabla),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) {
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) :is(.p-datatable-table-container, .p-datatable-wrapper, [data-pc-section='tablecontainer']),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) :is(.p-datatable-table-container, .p-datatable-wrapper, [data-pc-section='tablecontainer']) {
  position: relative !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  isolation: isolate !important;
  border: 1px solid #d1d1d1 !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-table,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

/* Cabecera + filtros se comportan como UNA sola pieza sticky. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 140 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th {
  position: relative !important;
  top: auto !important;
  z-index: auto !important;
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  overflow: visible !important;
  border-top: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  opacity: 1 !important;
  box-shadow: none !important;
  background-clip: border-box !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th {
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  overflow: visible !important;
  border-top: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* Fondo opaco: nunca se ven filas/celdas pasando por detrás de los filtros. */
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > * {
  position: relative !important;
  z-index: 2 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
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

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr:hover > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr:hover > td {
  background: #edfafd !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) :is(.fm-selected-row, .p-datatable-row-selected, .p-highlight) > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) :is(.fm-selected-row, .p-datatable-row-selected, .p-highlight) > td {
  background: #9eeff7 !important;
  color: #263238 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-filter-cell, .busqueda-ots-column-filter, .jobtype-filter-cell, .abm-materiales-filter-cell),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-filter-cell, .busqueda-ots-column-filter, .jobtype-filter-cell, .abm-materiales-filter-cell) {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  background: #fff !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-filter-prefix, .busqueda-ots-column-filter__prefix, .jobtype-filter-symbol, .abm-materiales-filter-symbol),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-filter-prefix, .busqueda-ots-column-filter__prefix, .jobtype-filter-symbol, .abm-materiales-filter-symbol) {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-column-filter, .busqueda-ots-column-filter__input, .jobtype-filter-input, .abm-materiales-filter-input, .p-inputtext),
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-column-filter, .busqueda-ots-column-filter__input, .jobtype-filter-input, .abm-materiales-filter-input, .p-inputtext) {
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
  box-sizing: border-box !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-column-filter, .busqueda-ots-column-filter__input, .jobtype-filter-input, .abm-materiales-filter-input, .p-inputtext):focus,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead :is(.fm-column-filter, .busqueda-ots-column-filter__input, .jobtype-filter-input, .abm-materiales-filter-input, .p-inputtext):focus {
  outline: none !important;
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, .14) !important;
}
/* --- FIN: fm-migrated-grid-otf-clone-final --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $gridCss.Trim() + "`r`n"
Write-Utf8 $globalCss $global

# ----------------------------------------------------------------------
# 4) SPINNERS: todos muestran el título "Cargando Información".
#    Única excepción intencional: contexto explícito, usado al ACEPTAR emulación.
# ----------------------------------------------------------------------
$loader = Read-Utf8 $loaderPath
if (-not $loader.Contains('contextTitle:')) {
  $loader = Replace-Exact $loader "  title: { type: String, default: 'Cargando Información' }," "  title: { type: String, default: 'Cargando Información' },`r`n  contextTitle: { type: String, default: '' }," 'FmTypingLoader contextTitle'
}

$oldDisplayTitle = @'
const displayTitle = computed(() => (
  hasCustomTitle.value ? props.title : routeProfile.value.title
))
'@
$newDisplayTitle = @'
const displayTitle = computed(() => (
  String(props.contextTitle ?? '').trim() || 'Cargando Información'
))
'@
$loader = Replace-Exact $loader $oldDisplayTitle $newDisplayTitle 'FmTypingLoader título global' -AllowAlreadyApplied
Write-Utf8 $loaderPath $loader

$profiles = Read-Utf8 $profilesPath
$profiles = [regex]::Replace(
  $profiles,
  "(?m)^(\s*)title:\s*'[^']*',",
  '$1title: ''Cargando Información'','
)
Write-Utf8 $profilesPath $profiles

# ----------------------------------------------------------------------
# 5) EMULACIÓN: búsqueda => Cargando Información.
#    ACEPTAR => título Emulación + nombre del perfil (o del operador si no hay perfil).
# ----------------------------------------------------------------------
$emuStore = Read-Utf8 $emulacionStore
if (-not $emuStore.Contains("loaderContextTitle:")) {
  $emuStore = $emuStore.Replace(
    '        toggleLoader: false,',
    "        toggleLoader: false,`r`n        loaderContextTitle: '',`r`n        loaderMessage: 'Consultando la información del legajo',"
  )
}

if (-not $emuStore.Contains('$setLoaderContext(')) {
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
  $emuStore = Replace-Exact $emuStore $anchor $replacement 'Emulación acción loader'
}

$emuStore = $emuStore.Replace(
  '            this.toggleLoader = true',
  "            this.`$setLoaderContext('', 'Consultando la información del legajo')`r`n            this.toggleLoader = true"
)
Write-Utf8 $emulacionStore $emuStore

$emuView = Read-Utf8 $emulacionView
$oldLoaderMarkup = @'
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      title="Buscando operador"
      message="Consultando la información del legajo"
    />
'@
$newLoaderMarkup = @'
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      :context-title="store.loaderContextTitle"
      :message="store.loaderMessage"
      variant="emulation"
    />
'@
$emuView = Replace-Exact $emuView $oldLoaderMarkup $newLoaderMarkup 'Emulación loader contextual' -AllowAlreadyApplied
Write-Utf8 $emulacionView $emuView

$emuDialog = Read-Utf8 $emulacionDialog
$oldAccept = @'
  store.$setlegajoSelected(operator.legajo)
  showPopup.value = false
  store.toggleLoader = true

  await store.$emulate()
'@
$newAccept = @'
  store.$setlegajoSelected(operator.legajo)
  showPopup.value = false

  const profileLabel = selectedProfiles.value[0] || ''
  const targetLabel = profileLabel || selectedFullName.value || selectedLegajo.value
  store.$setLoaderContext(
    'Emulación',
    profileLabel ? `Aplicando perfil ${profileLabel}` : `Emulando a ${targetLabel}`
  )
  store.toggleLoader = true

  await store.$emulate()
'@
$emuDialog = Replace-Exact $emuDialog $oldAccept $newAccept 'Emulación perfil en spinner' -AllowAlreadyApplied
Write-Utf8 $emulacionDialog $emuDialog

# ----------------------------------------------------------------------
# 6) Seguridad: menu + iframes no se tocan.
# ----------------------------------------------------------------------
foreach ($path in $criticalFiles) {
  $afterHash = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
  if ($afterHash -ne $criticalHashes[$path]) {
    throw "SEGURIDAD: se modifico un archivo critico que no debia tocarse: $path"
  }
}

Write-Host ''
Write-Host 'CAMBIOS APLICADOS' -ForegroundColor Green
Write-Host '- Buscador OTs: fila de filtros siempre visible.' -ForegroundColor Green
Write-Host '- Grillas migradas: estilo OTs Fallidas + THEAD sticky opaco.' -ForegroundColor Green
Write-Host '- Spinner general: Cargando Información.' -ForegroundColor Green
Write-Host '- Emulación al ACEPTAR: Emulación + perfil/operador.' -ForegroundColor Green
Write-Host '- Menu e iframes responsive: NO modificados.' -ForegroundColor Green
Write-Host ''
Write-Host 'Valida ahora:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
