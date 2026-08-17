$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$rutasPath = 'src/components/rutas.ts'
$routerPath = 'src/router/index.js'
$abmTablePath = 'src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue'
$buscadorStorePath = 'src/modules/buscadorOts/store/buscadorOtsStore.ts'

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/plugins/responsiveIframes.js',
  'src/views/IframeView.vue',
  'src/views/DetalleView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/components/shared/FmTypingLoader.vue',
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/otFallidasCT/components/Table.vue',
  'src/modules/buscadorOts/components/Tabla.vue',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue'
)

function Read-Utf8([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
  return [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

function Hash-File([string]$Path) {
  if (-not (Test-Path $Path)) { return '<missing>' }
  return (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
}

Write-Host ''
Write-Host 'FM - HOTFIX ABM / JOBTYPE CMO / BUOT MOCK SYNC' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host '1) Saca ABM MATERIALES del menu y de la normalizacion visual fm-grid-otf.' -ForegroundColor Yellow
Write-Host '2) JOCM abre el modulo Vue migrado (no iframe) y acepta permiso JOCO/CMOA.' -ForegroundColor Yellow
Write-Host '3) Los cambios mock del Stepper quedan reflejados en la grilla principal y al volver a buscar.' -ForegroundColor Yellow
Write-Host 'NO toca menu CSS, responsive iframe, Detalle, Reporte SAS, OTs Fallidas ni spinner.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

# ----------------------------------------------------------------------
# 1) ABM MATERIALES: quitarlo del menu sin borrar la ruta legacy.
#    La ruta queda como fallback tecnico/directo, pero ya no se publica en el menu.
# ----------------------------------------------------------------------
$rutas = (Read-Utf8 $rutasPath).Replace("`r`n", "`n")

$abmMenuPattern = @'
(?s)\n\s*\{\s*label:\s*'ABM MATERIALES',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*'ABMM'\s*\}\);\s*\},\s*visible:\s*[^\n]+\n\s*\},?
'@
$rutas2 = [regex]::Replace($rutas, $abmMenuPattern.Trim(), '', 1)
if ($rutas2 -eq $rutas -and $rutas.Contains("label: 'ABM MATERIALES'")) {
  throw 'No se pudo quitar ABM MATERIALES de rutas.ts.'
}
$rutas = $rutas2

# CMO puede venir autorizado con el codigo nuevo JOCM, el padre JOCO o el codigo legacy CMOA.
$rutas = [regex]::Replace(
  $rutas,
  "visible:\s*hasMenu\('JOCM'\)(?:\s*\|\|\s*hasMenu\('JOCO'\))?(?:\s*\|\|\s*hasMenu\('CMOA'\))?",
  "visible: hasMenu('JOCM') || hasMenu('JOCO') || hasMenu('CMOA')",
  1
)
Write-Utf8 $rutasPath ($rutas.Replace("`n", "`r`n"))
Write-Host 'OK - ABM MATERIALES removido del menu.' -ForegroundColor Green

# Quitar solamente la marca visual que esta consolidacion habia agregado a ABM.
$abmTable = (Read-Utf8 $abmTablePath).Replace("`r`n", "`n")
$abmTable = [regex]::Replace(
  $abmTable,
  "(?m)^\s*<!-- FM Global: fm-grid-otf \| calco visual de Registro OTs Fallidas -->\s*\n?",
  ''
)
$abmTable = $abmTable.Replace('class="fm-grid-otf fm-pass-grid ', 'class="fm-pass-grid ')
$abmTable = $abmTable.Replace('class="fm-grid-otf ', 'class="')
Write-Utf8 $abmTablePath ($abmTable.Replace("`n", "`r`n"))
Write-Host 'OK - ABM queda fuera del contrato visual de grillas migradas.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 2) JOBTYPE CMO: evitar el iframe que termina en Forbidden.
#    Se usa el modulo Vue ya existente, como en fix/cmo-iframe-forbidden.
# ----------------------------------------------------------------------
$router = (Read-Utf8 $routerPath).Replace("`r`n", "`n")

# Eliminar bypass DEV de ABMM si hubiera quedado de una rama anterior.
$router = [regex]::Replace(
  $router,
  "(?m)^\s*\|\|\s*\(to\.name === 'ABMM' && import\.meta\.env\.DEV\)\s*$\n?",
  ''
)

# Permisos JOCM: soportar JOCO y CMOA sin alterar las demas rutas.
$router = $router.Replace(
  "(to.name === 'JOCM' && rutasPermitidas.includes('JOCO'))",
  "(to.name === 'JOCM' && (rutasPermitidas.includes('JOCO') || rutasPermitidas.includes('CMOA')))"
)

# Si ya habia una clausula con JOCO+CMOA, no duplicarla.
$router = $router.Replace(
  "(to.name === 'JOCM' && ((rutasPermitidas.includes('JOCO') || rutasPermitidas.includes('CMOA'))))",
  "(to.name === 'JOCM' && (rutasPermitidas.includes('JOCO') || rutasPermitidas.includes('CMOA')))"
)

$jocmPattern = @'
(?s)\{\s*path:\s*'jobtypeCMO\.html',\s*name:\s*'JOCM',\s*beforeEnter:\s*allowed,\s*component:\s*\(\)\s*=>\s*import\('[^']+'\)(?:,\s*props:\s*\{.*?\})?\s*\}
'@
$jocmReplacement = @'
{
        path: 'jobtypeCMO.html',
        alias: ['configuraCmoActividad.html'],
        name: 'JOCM',
        beforeEnter: allowed,
        component: () => import('../modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue')
      }
'@
$router2 = [regex]::Replace($router, $jocmPattern.Trim(), $jocmReplacement.Trim(), 1)
if ($router2 -eq $router -and -not $router.Contains("../modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue")) {
  throw 'No se pudo cambiar JOCM al modulo Vue migrado.'
}
$router = $router2
Write-Utf8 $routerPath ($router.Replace("`n", "`r`n"))
Write-Host 'OK - JOCM usa JobtypeCMO.vue y deja de abrir el iframe legacy.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 3) BUSCADOR OTs MOCK: conservar cambios del Stepper en la grilla principal.
#    - actualizacion reactiva en memoria (Object.assign)
#    - override por OT para que una nueva BUSQUEDA en la misma pantalla no lo pierda
# ----------------------------------------------------------------------
$store = (Read-Utf8 $buscadorStorePath).Replace("`r`n", "`n")

if (-not $store.Contains('const mockReprocessOverrides = ref<Record<string, Partial<BuscadorOtRow>>>({})')) {
  $anchor = '  const resetToken = ref(0)'
  if (-not $store.Contains($anchor)) { throw 'Buscador store: no se encontro resetToken.' }
  $helpers = @'
  const mockReprocessOverrides = ref<Record<string, Partial<BuscadorOtRow>>>({})

  const getRowKey = (row: BuscadorOtRow) => String(row?.id ?? row?.nroOt ?? '')

  const applyStoredMockOverride = (row: BuscadorOtRow): BuscadorOtRow => {
    const override = mockReprocessOverrides.value[getRowKey(row)]
    return override ? { ...row, ...override } : row
  }
'@
  $store = $store.Replace($anchor, $anchor + "`n" + $helpers)
}

$store = $store.Replace(
  '        rows.value = buildMockSearchRows(parsedOtNumbers.value)',
  '        rows.value = buildMockSearchRows(parsedOtNumbers.value).map(applyStoredMockOverride)'
)

$applyStart = '  const applyMockReprocess = (selectedRows: BuscadorOtRow[], technician: MockTechnician) => {'
$clearStart = '  const clearSearch = () => {'
$startIndex = $store.IndexOf($applyStart)
$clearIndex = $store.IndexOf($clearStart)
if ($startIndex -lt 0 -or $clearIndex -le $startIndex) {
  throw 'Buscador store: no se pudo delimitar applyMockReprocess.'
}

$newApply = @'
  const applyMockReprocess = (selectedRows: BuscadorOtRow[], technician: MockTechnician) => {
    const selectedIds = new Set(
      selectedRows.map((row) => getRowKey(row))
    )

    const technicianPatch: Partial<BuscadorOtRow> = {
      nroTech: technician.techId,
      nombreTech: technician.nombre,
      empresaContratista: technician.empresaContratista,
      baseTecnica: technician.baseTecnica,
      provincia: technician.provincia
    }

    // Guardar el cambio mock por OT. Asi, si el usuario vuelve a BUSCAR durante
    // esta misma visita a la pantalla, el resultado conserva el tecnico cambiado.
    selectedIds.forEach((rowId) => {
      if (!rowId) return
      mockReprocessOverrides.value[rowId] = {
        ...(mockReprocessOverrides.value[rowId] ?? {}),
        ...technicianPatch
      }
    })

    // Mutacion reactiva sobre los objetos ya mostrados. Evita caches del DataTable
    // y hace que la grilla principal vea el cambio apenas se cierra el Stepper.
    rows.value.forEach((row) => {
      if (!selectedIds.has(getRowKey(row))) return
      Object.assign(row, technicianPatch)
    })

    if (selectedRow.value) {
      const selectedId = getRowKey(selectedRow.value)
      selectedRow.value = rows.value.find((row) => getRowKey(row) === selectedId) ?? null
    }
  }

'@
$store = $store.Substring(0, $startIndex) + $newApply + $store.Substring($clearIndex)

# Los overrides se mantienen al LIMPIAR/BUSCAR en la misma pantalla, pero se eliminan al salir.
$resetStoreOld = @'
  const resetStore = () => {
    clearSearch()
    pageRows.value = 500
  }
'@
$resetStoreNew = @'
  const resetStore = () => {
    clearSearch()
    mockReprocessOverrides.value = {}
    pageRows.value = 500
  }
'@
if ($store.Contains($resetStoreOld.Trim())) {
  $store = $store.Replace($resetStoreOld.Trim(), $resetStoreNew.Trim())
} elseif (-not $store.Contains('mockReprocessOverrides.value = {}')) {
  throw 'Buscador store: no se pudo agregar limpieza de overrides al salir.'
}

foreach ($required in @(
  'buildMockSearchRows(parsedOtNumbers.value).map(applyStoredMockOverride)',
  'Object.assign(row, technicianPatch)',
  'mockReprocessOverrides.value[rowId]',
  'mockReprocessOverrides.value = {}'
)) {
  if (-not $store.Contains($required)) { throw "Buscador store incompleto: $required" }
}

Write-Utf8 $buscadorStorePath ($store.Replace("`n", "`r`n"))
Write-Host 'OK - los cambios mock de tecnico quedan sincronizados con la grilla principal.' -ForegroundColor Green

# ----------------------------------------------------------------------
# Seguridad: nada fuera de los cuatro targets puede variar por este hotfix.
# ----------------------------------------------------------------------
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: el hotfix modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Archivos tocados:' -ForegroundColor Yellow
Write-Host "  $rutasPath"
Write-Host "  $routerPath"
Write-Host "  $abmTablePath"
Write-Host "  $buscadorStorePath"
Write-Host ''
Write-Host 'Probar:' -ForegroundColor Yellow
Write-Host '  1) ABM MATERIALES ya no aparece en el menu.'
Write-Host '  2) Parametrizaciones -> CMO-Actividad abre Vue, sin Forbidden.'
Write-Host '  3) BUOT: AA00070643 -> filtro -> Stepper -> 21SAD041 -> ejecutar.'
Write-Host '     Al volver, Nro Tech / Nombre Tech deben estar actualizados.'
Write-Host '     Si BUSCAR se ejecuta otra vez en la misma pantalla, debe conservar el cambio mock.'
Write-Host ''
Write-Host 'Ejecutar:' -ForegroundColor Yellow
Write-Host '  npm run build'
Write-Host '  npm run dev'
