$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$routerPath = 'src/router/index.js'
$rutasPath = 'src/components/rutas.ts'
$paramDir = 'src/modules/parametrizaciones'
$abmDir = 'src/modules/gestionMateriales/abmMateriales'
$gestionMaterialesDir = 'src/modules/gestionMateriales'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/plugins/responsiveIframes.js',
  'src/views/IframeView.vue',
  'src/views/DetalleView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  'src/modules/buscadorOts/BuscadorOts.vue',
  'src/modules/buscadorOts/components/Tabla.vue',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue',
  'src/modules/buscadorOts/store/buscadorOtsStore.ts',
  'src/modules/reporteSas/ReporteSAS.vue',
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/otFallidasCT/OtFallidasCT.vue',
  'src/modules/otFallidasCT/components/Table.vue'
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
Write-Host 'FM - LIMPIEZA LEGACY PARAMETRIZACIONES + ABM' -ForegroundColor Cyan
Write-Host '--------------------------------------------' -ForegroundColor Cyan
Write-Host 'Elimina los modulos Vue de Parametrizaciones y ABM Materiales.' -ForegroundColor Yellow
Write-Host 'Jobtype-Contrato y CMO-Actividad quedan SOLO por iframe legacy.' -ForegroundColor Yellow
Write-Host 'NO toca estilos, menu visual, responsive, Buscador OTs, Stepper, Reporte SAS ni spinners.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

# ----------------------------------------------------------------------
# 1) Eliminar fisicamente los modulos que ya no deben existir.
# ----------------------------------------------------------------------
if (Test-Path $paramDir) {
  Remove-Item -Recurse -Force $paramDir
  Write-Host "OK eliminado: $paramDir" -ForegroundColor Green
} else {
  Write-Host "Ya no existe: $paramDir" -ForegroundColor DarkGray
}

if (Test-Path $abmDir) {
  Remove-Item -Recurse -Force $abmDir
  Write-Host "OK eliminado: $abmDir" -ForegroundColor Green
} else {
  Write-Host "Ya no existe: $abmDir" -ForegroundColor DarkGray
}

# Si gestionMateriales queda vacio, quitar tambien la carpeta vacia.
if (Test-Path $gestionMaterialesDir) {
  $remaining = @(Get-ChildItem -Force $gestionMaterialesDir)
  if ($remaining.Count -eq 0) {
    Remove-Item -Force $gestionMaterialesDir
    Write-Host "OK eliminado directorio vacio: $gestionMaterialesDir" -ForegroundColor Green
  }
}

# ----------------------------------------------------------------------
# 2) ROUTER: restaurar una funcion allowed limpia y rutas legacy canonicas.
# ----------------------------------------------------------------------
$router = (Read-Utf8 $routerPath).Replace("`r`n", "`n")

$allowedStart = $router.IndexOf('const allowed = (to, from, next) => {')
$routesStart = $router.IndexOf('const routes = [')
if ($allowedStart -lt 0 -or $routesStart -le $allowedStart) {
  throw 'No se pudo ubicar allowed/routes en router.'
}

$allowedCanonical = @'
const allowed = (to, from, next) => {
  const authStore = useAuthStore()
  const autenticado = authStore.autenticado;
  const rutas = authStore.rutas;
  let rutasPermitidas = rutas !== null ? rutas : [];
  if (!autenticado && rutasLibres.includes(to.name)) {
    next();
    return;
  } else if (!autenticado && !rutasLibres.includes(to.name)) {
    next({ name: '401' });
    return;
  } else if (autenticado && rutasPermitidas.includes(to.name)) {
    next();
    return;
  } else {
    next({ name: '401' });
    return;
  }
}

'@
$router = $router.Substring(0, $allowedStart) + $allowedCanonical + $router.Substring($routesStart)

# Quitar variantes existentes de JOCO/JOCM/CMOA y ABMM.
$routePatterns = @(
  "(?s)\s*\{\s*path:\s*'jobtypeContrato\.html'.*?\n\s*\},",
  "(?s)\s*\{\s*path:\s*'jobtypeCMO\.html'.*?\n\s*\},",
  "(?s)\s*\{\s*path:\s*'configuraCmoActividad\.html'.*?\n\s*\},",
  "(?s)\s*\{\s*path:\s*'abmMateriales[^']*'.*?\n\s*\},",
  "(?s)\s*\{\s*path:\s*'[^']*'.*?name:\s*'ABMM'.*?\n\s*\},"
)
foreach ($pattern in $routePatterns) {
  $router = [regex]::Replace($router, $pattern, '', 1)
}

$legacyBlocks = @'
      {
        path: 'jobtypeContrato.html',
        name: 'JOCO',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/jobtypeContrato.html',
          titleParam: 'configuracion jobtype-contrato'
        }
      },
      {
        path: 'configuraCmoActividad.html',
        alias: ['jobtypeCMO.html'],
        name: 'CMOA',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/configuraCmoActividad.html',
          titleParam: 'configuracion cmo-actividad'
        }
      },
'@

$anchor = "      {`n        path: 'consultarActas.html',"
if (-not $router.Contains($anchor)) {
  throw 'No se encontro el ancla consultarActas.html para insertar rutas legacy.'
}
$router = $router.Replace($anchor, $legacyBlocks.TrimEnd() + "`n" + $anchor)

# Asegurar que no queden imports hacia modulos eliminados.
$forbiddenRouterMarkers = @(
  '../modules/parametrizaciones/',
  'JobtypeContrato.vue',
  'JobtypeCMO.vue',
  "name: 'JOCM'",
  "name: 'ABMM'"
)
foreach ($marker in $forbiddenRouterMarkers) {
  if ($router.Contains($marker)) { throw "Router todavia referencia modulo eliminado: $marker" }
}

foreach ($required in @(
  "path: 'jobtypeContrato.html'",
  "name: 'JOCO'",
  "urlParam: '/jobtypeContrato.html'",
  "path: 'configuraCmoActividad.html'",
  "alias: ['jobtypeCMO.html']",
  "name: 'CMOA'",
  "urlParam: '/configuraCmoActividad.html'"
)) {
  if (-not $router.Contains($required)) { throw "Falta ruta legacy requerida: $required" }
}

Write-Utf8 $routerPath ($router.Replace("`n", "`r`n"))
Write-Host 'OK router: JOCO y CMOA quedan por IframeView legacy.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 3) MENU LOGICO: conservar Parametrizaciones como categoria de menu,
#    pero ambos items navegan a las rutas legacy. Quitar ABM Materiales.
# ----------------------------------------------------------------------
$rutas = (Read-Utf8 $rutasPath).Replace("`r`n", "`n")

# Eliminar ABM MATERIALES si existe.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)\s*\{\s*label:\s*'ABM MATERIALES'.*?\n\s*\},",
  '',
  1
)

# Normalizar Jobtype-Contrato -> JOCO.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)(label:\s*'Configuración Jobtype-Contrato',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*)'[^']+'(\s*\}\);\s*\},\s*visible:\s*)[^\n]+",
  '$1''JOCO''$2hasMenu(''JOCO'')',
  1
)

# Normalizar CMO-Actividad -> CMOA.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)(label:\s*'Configuración CMO-Actividad',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*)'[^']+'(\s*\}\);\s*\},\s*visible:\s*)[^\n]+",
  '$1''CMOA''$2hasMenu(''CMOA'')',
  1
)

if ($rutas.Contains("label: 'ABM MATERIALES'")) { throw 'ABM MATERIALES sigue en rutas.ts.' }
if (-not $rutas.Contains("router.push({ name: 'JOCO' });")) { throw 'Falta JOCO en menu.' }
if (-not $rutas.Contains("router.push({ name: 'CMOA' });")) { throw 'Falta CMOA en menu.' }

Write-Utf8 $rutasPath ($rutas.Replace("`n", "`r`n"))
Write-Host 'OK menu: se conserva Parametrizaciones, pero solo como acceso a legacy.' -ForegroundColor Green
Write-Host 'OK menu: ABM Materiales eliminado.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 4) Verificacion de referencias en src. No debe quedar ningun import/ruta
#    hacia los modulos fisicamente eliminados.
# ----------------------------------------------------------------------
$badRefs = @()
$sourceFiles = Get-ChildItem -Path 'src' -Recurse -File -Include *.js,*.ts,*.vue
foreach ($file in $sourceFiles) {
  $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  if ($text.Contains('modules/parametrizaciones/') -or $text.Contains('gestionMateriales/abmMateriales')) {
    $badRefs += $file.FullName
  }
}
if ($badRefs.Count -gt 0) {
  Write-Host 'Quedaron referencias a modulos eliminados:' -ForegroundColor Red
  $badRefs | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Limpieza incompleta: hay referencias residuales.'
}

# ----------------------------------------------------------------------
# 5) Seguridad: nada de lo que ya funciona debe cambiar.
# ----------------------------------------------------------------------
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: se modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'LIMPIEZA APLICADA. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Se eliminaron:' -ForegroundColor Yellow
Write-Host "  $paramDir"
Write-Host "  $abmDir"
Write-Host 'Se modificaron solamente:' -ForegroundColor Yellow
Write-Host "  $routerPath"
Write-Host "  $rutasPath"
Write-Host ''
Write-Host 'Ahora ejecutar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host 'Si build termina OK:'
Write-Host '  npm run dev'
