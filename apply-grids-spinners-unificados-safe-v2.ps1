$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$globalCss = 'src/assets/css/fm-global.css'
$buscadorTable = 'src/modules/buscadorOts/components/Tabla.vue'
$buscadorStore = 'src/modules/buscadorOts/store/buscadorOtsStore.ts'
$jobtypeTable = 'src/modules/parametrizaciones/jobtypeContrato/components/Tabla.vue'
$abmTable = 'src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue'
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$emulacionView = 'src/modules/emulacion/views/Emulacion.vue'
$emulacionStore = 'src/modules/emulacion/store/emulacionStore.js'
$emulacionDialog = 'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue'

$targets = @(
  $globalCss,
  $buscadorTable,
  $buscadorStore,
  $loaderPath,
  $emulacionView,
  $emulacionStore,
  $emulacionDialog
)

# Estos cuatro archivos NO pertenecen a este cambio. Se toman hashes para
# garantizar que el parche no vuelva a romper el menu ni el responsive legacy.
$criticalFiles = @(
  'src/components/CustomMenu.vue',
  'src/views/IframeView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/plugins/responsiveIframes.js'
)

Write-Host ''
Write-Host 'FM - GRILLAS OTF + SPINNERS UNIFICADOS SAFE V2' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host 'No reemplaza fm-global.css: agrega solo un bloque acotado.' -ForegroundColor Yellow
Write-Host 'No modifica menu, IframeView ni responsive legacy.' -ForegroundColor Yellow
Write-Host ''

foreach ($path in ($targets + $criticalFiles)) {
  if (-not (Test-Path $path)) { throw "Falta archivo requerido: $path" }
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
  if (-not $Content.Contains($Old)) { throw "No se encontro el bloque esperado: $Label" }
  return $Content.Replace($Old, $New)
}

# ======================================================================
# 1) BUSCADOR DE OTs - filtros SIEMPRE visibles, igual a OTs Fallidas.
# ======================================================================
$buscador = Read-Utf8 $buscadorTable
$buscador = Replace-Required $buscador ':filter-display="store.showColumnFilters ? ''row'' : undefined"' 'filter-display="row"' 'Buscador filterDisplay'
$buscador = Replace-Required $buscador ':filter="store.showColumnFilters"' 'filter' 'Buscador columnas filtrables'
$buscador = Replace-Required $buscador '<div v-if="store.showColumnFilters" class="busqueda-ots-column-filter">' '<div class="fm-filter-cell busqueda-ots-column-filter">' 'Buscador fila de filtros'
$buscador = Replace-Required $buscador 'class="busqueda-ots-column-filter__prefix"' 'class="fm-filter-prefix busqueda-ots-column-filter__prefix"' 'Buscador prefijo de filtro'
$buscador = Replace-Required $buscador 'class="busqueda-ots-column-filter__input"' 'class="fm-column-filter busqueda-ots-column-filter__input"' 'Buscador input de filtro'
Write-Utf8 $buscadorTable $buscador

$store = Read-Utf8 $buscadorStore
$store = $store.Replace('const showColumnFilters = ref(false)', 'const showColumnFilters = ref(true)')
$store = $store.Replace('showColumnFilters.value = false', 'showColumnFilters.value = true')
Write-Utf8 $buscadorStore $store

# Jobtype/ABM ya existen como módulos Vue aunque hoy algunas rutas sigan legacy.
# Solo se normaliza la clase visual para que, al usarse migradas, hereden el mismo contrato.
if (Test-Path $jobtypeTable) {
  $jobtype = Read-Utf8 $jobtypeTable
  $jobtype = $jobtype.Replace(
    'class="jobtype-main-grid jobtype-contrato-main-grid"',
    'class="jobtype-main-grid fm-pass-grid jobtype-contrato-main-grid"'
  )
  $jobtype = $jobtype.Replace('class="jobtype-filter-cell"', 'class="fm-filter-cell jobtype-filter-cell"')
  $jobtype = $jobtype.Replace('class="jobtype-filter-symbol"', 'class="fm-filter-prefix jobtype-filter-symbol"')
  $jobtype = $jobtype.Replace('class="jobtype-filter-input"', 'class="fm-column-filter jobtype-filter-input"')
  Write-Utf8 $jobtypeTable $jobtype
}

if (Test-Path $abmTable) {
  $abm = Read-Utf8 $abmTable
  $abm = $abm.Replace('class="abm-materiales-filter-symbol"', 'class="fm-filter-prefix abm-materiales-filter-symbol"')
  $abm = $abm.Replace('class="abm-materiales-filter-input"', 'class="fm-column-filter abm-materiales-filter-input"')
  Write-Utf8 $abmTable $abm
}

# ======================================================================
# 2) FM GLOBAL - calco visual OTF para todas las DataTable migradas.
#    El #tabla de OTs Fallidas es el patrón y queda EXCLUIDO.
# ======================================================================
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
 * CALCO VISUAL de la grilla principal de Registro OTs Fallidas para DataTable Vue.
 * El patrón original #tabla queda intacto.
 * THEAD completo sticky: cabecera + filtros viajan juntos y son 100% opacos.
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

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr > th {
  position: relative !important;
  top: auto !important;
  z-index: auto !important;
  background-clip: border-box !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr:first-child > th {
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  overflow: visible !important;
  border-top: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #d3d3d3 !important;
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  background-image: none !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  box-shadow: none !important;
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

/* La capa blanca evita que se vean líneas/celdas del tbody detrás de los filtros. */
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
  background-image: none !important;
  opacity: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-thead > tr.p-filter-row > th > * {
  position: relative !important;
  z-index: 2 !important;
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

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr,
html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
}

html body #app .fm-pass-grid.p-datatable:not(#tabla) .p-datatable-tbody > tr > td,
html body #app .fm-pt-datatable.p-datatable:not(#tabla) .p-datatable-tbody > tr > td {
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
/* --- FIN: fm-migrated-grid-otf-clone-final --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $gridCss.Trim() + "`r`n"
Write-Utf8 $globalCss $global

# ======================================================================
# 3) SPINNER CENTRAL - todos: Cargando Información.
#    Solo contextTitle puede reemplazarlo (se usa exclusivamente al ACEPTAR emulación).
# ======================================================================
$loader = Read-Utf8 $loaderPath
if (-not $loader.Contains('contextTitle:')) {
  $loader = Replace-Required \
    $loader \
    "  title: { type: String, default: 'Cargando Información' }," \
    "  title: { type: String, default: 'Cargando Información' },`r`n  contextTitle: { type: String, default: '' }," \
    'FmTypingLoader contextTitle'
}

$displayPattern = '(?s)const displayTitle = computed\(\(\) => \(.*?\)\)'
$displayReplacement = @'
const displayTitle = computed(() => (
  String(props.contextTitle ?? '').trim() || 'Cargando Información'
))
'@
if ($loader -notmatch "String\(props\.contextTitle") {
  $updatedLoader = [regex]::Replace($loader, $displayPattern, $displayReplacement.Trim(), 1)
  if ($updatedLoader -eq $loader) { throw 'No se pudo centralizar el título de FmTypingLoader.' }
  $loader = $updatedLoader
}
Write-Utf8 $loaderPath $loader

# ======================================================================
# 4) EMULACIÓN - búsqueda genérica; ACEPTAR muestra perfil/operador.
# ======================================================================
$emuStore = Read-Utf8 $emulacionStore
if (-not $emuStore.Contains('loaderContextTitle:')) {
  $emuStore = $emuStore.Replace(
    '        toggleLoader: false,',
    "        toggleLoader: false,`r`n        loaderContextTitle: '',`r`n        loaderMessage: 'Consultando la información del legajo',"
  )
}

if (-not $emuStore.Contains('$setLoaderContext(title')) {
  $actionPattern = '(?s)(\$setActiveTab\(\)\s*\{\s*this\.activeTab\s*=\s*\[''0''\]\s*\},)'
  $actionReplacement = @'
$1

        $setLoaderContext(title = '', message = '') {
            this.loaderContextTitle = String(title ?? '').trim()
            this.loaderMessage = String(message ?? '').trim() || 'Preparando pantalla'
        },
'@
  $updatedStore = [regex]::Replace($emuStore, $actionPattern, $actionReplacement.TrimEnd(), 1)
  if ($updatedStore -eq $emuStore) { throw 'No se pudo agregar $setLoaderContext al store de Emulación.' }
  $emuStore = $updatedStore
}

if (-not $emuStore.Contains("this.`$setLoaderContext('', 'Consultando la información del legajo')")) {
  $togglePattern = '(?s)(async \$fetchData\(\)\s*\{.*?)(\s{12}this\.toggleLoader = true)'
  $toggleReplacement = '$1' + "`r`n            this.`$setLoaderContext('', 'Consultando la información del legajo')" + '$2'
  $updatedStore = [regex]::Replace($emuStore, $togglePattern, $toggleReplacement, 1)
  if ($updatedStore -eq $emuStore) { throw 'No se pudo inicializar el contexto del loader de búsqueda.' }
  $emuStore = $updatedStore
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
if (-not $emuDialog.Contains("'Emulación',")) {
  $dialogPattern = '(?s)(store\.\$setlegajoSelected\(operator\.legajo\)\s*showPopup\.value = false\s*)(store\.toggleLoader = true)'
  $dialogReplacement = @'
$1
  const profileLabel = selectedProfiles.value[0] || ''
  const targetLabel = profileLabel || selectedFullName.value || selectedLegajo.value
  store.$setLoaderContext(
    'Emulación',
    profileLabel ? `Aplicando perfil ${profileLabel}` : `Emulando a ${targetLabel}`
  )
  $2
'@
  $updatedDialog = [regex]::Replace($emuDialog, $dialogPattern, $dialogReplacement.TrimEnd(), 1)
  if ($updatedDialog -eq $emuDialog) { throw 'No se pudo agregar el contexto al ACEPTAR Emulación.' }
  $emuDialog = $updatedDialog
}
Write-Utf8 $emulacionDialog $emuDialog

# ======================================================================
# 5) VERIFICACIÓN DE SEGURIDAD.
# ======================================================================
foreach ($path in $criticalFiles) {
  $afterHash = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
  if ($afterHash -ne $criticalHashes[$path]) {
    throw "SEGURIDAD: el parche tocó un archivo crítico: $path"
  }
}

Write-Host ''
Write-Host 'CAMBIOS APLICADOS CORRECTAMENTE' -ForegroundColor Green
Write-Host '- Buscador OTs: cabecera + segunda fila de filtros siempre visibles.' -ForegroundColor Green
Write-Host '- Grillas migradas: calco OTs Fallidas + THEAD sticky opaco.' -ForegroundColor Green
Write-Host '- Spinner normal: Cargando Información.' -ForegroundColor Green
Write-Host '- Emulación al ACEPTAR: Emulación + nombre del perfil/operador.' -ForegroundColor Green
Write-Host '- Menu e iframes responsive: no fueron modificados.' -ForegroundColor Green
Write-Host ''
Write-Host 'Ejecuta:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
