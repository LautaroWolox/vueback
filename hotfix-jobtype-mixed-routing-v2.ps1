$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$routerPath = 'src/router/index.js'
$rutasPath = 'src/components/rutas.ts'
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
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/otFallidasCT/components/Table.vue',
  'src/modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue',
  'src/modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue'
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
Write-Host 'FM - JOBTYPE MIXTO: CONTRATO VUE / CMO LEGACY' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host 'JOCO = pantalla migrada Vue.' -ForegroundColor Yellow
Write-Host 'CMOA/JOCM URL = iframe legacy /configuraCmoActividad.html.' -ForegroundColor Yellow
Write-Host 'NO toca estilos, responsive, Buscador OTs, Stepper, mocks, loaders ni grillas.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

$router = (Read-Utf8 $routerPath).Replace("`r`n", "`n")

# ----------------------------------------------------------------------
# 1) JOCO: SIEMPRE migrado Vue.
# ----------------------------------------------------------------------
$jobtypePattern = "(?s)\s*\{\s*path:\s*'jobtypeContrato\.html',\s*name:\s*'JOCO',.*?\n\s*\},"
if (-not [regex]::IsMatch($router, $jobtypePattern)) {
  throw 'No se encontro la ruta JOCO.'
}

$jobtypeVueBlock = @'
      {
        path: 'jobtypeContrato.html',
        name: 'JOCO',
        beforeEnter: allowed,
        component: () => import('../modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue')
      },
'@
$router = [regex]::Replace($router, $jobtypePattern, "`n" + $jobtypeVueBlock.TrimEnd(), 1)

# ----------------------------------------------------------------------
# 2) CMO: SIEMPRE legacy iframe. Se eliminan variantes JOCM Vue y CMOA previas.
#    Alias jobtypeCMO.html evita que una URL vieja vuelva a abrir la migrada.
# ----------------------------------------------------------------------
$cmoPatterns = @(
  "(?s)\s*\{\s*path:\s*'jobtypeCMO\.html',.*?\n\s*\},",
  "(?s)\s*\{\s*path:\s*'configuraCmoActividad\.html',.*?\n\s*\},"
)
foreach ($pattern in $cmoPatterns) {
  $router = [regex]::Replace($router, $pattern, '', 1)
}

$cmoLegacyBlock = @'
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

$jobtypeLiteral = $jobtypeVueBlock.TrimEnd()
if (-not $router.Contains($jobtypeLiteral)) {
  throw 'JOCO migrado no quedo normalizado para insertar CMO.'
}
$router = $router.Replace($jobtypeLiteral, $jobtypeLiteral + "`n" + $cmoLegacyBlock.TrimEnd())

# ----------------------------------------------------------------------
# 3) Permisos: CMOA acepta su codigo legacy y tambien permisos que quedaron
#    de la migracion (JOCM/JOCO), sin alterar otras rutas.
# ----------------------------------------------------------------------
$router = [regex]::Replace(
  $router,
  "(?m)^\s*\|\|\s*\(to\.name === 'JOCM'.*?\)\s*$\n?",
  ''
)

$allowedNeedle = "} else if (autenticado && rutasPermitidas.includes(to.name)) {"
if ($router.Contains($allowedNeedle)) {
  $allowedReplacement = @'
} else if (autenticado && (
    rutasPermitidas.includes(to.name) ||
    (to.name === 'CMOA' && (
      rutasPermitidas.includes('JOCM') ||
      rutasPermitidas.includes('JOCO')
    ))
  )) {
'@
  $router = $router.Replace($allowedNeedle, $allowedReplacement.TrimEnd())
} elseif (-not $router.Contains("to.name === 'CMOA'")) {
  # Si el allowed ya era multilinea, insertar CMOA antes del cierre del bloque de permisos.
  $pattern = "(?s)(else if \(autenticado && \(.*?rutasPermitidas\.includes\(to\.name\).*?)(\)\) \{)"
  if (-not [regex]::IsMatch($router, $pattern)) {
    throw 'No se pudo reconocer el bloque allowed para permisos CMOA.'
  }
  $router = [regex]::Replace(
    $router,
    $pattern,
    '$1 ||`n    (to.name === ''CMOA'' && (rutasPermitidas.includes(''JOCM'') || rutasPermitidas.includes(''JOCO'')))$2',
    1
  )
}

# Verificaciones duras de router.
foreach ($required in @(
  "path: 'jobtypeContrato.html'",
  "component: () => import('../modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue')",
  "path: 'configuraCmoActividad.html'",
  "alias: ['jobtypeCMO.html']",
  "name: 'CMOA'",
  "component: () => import('../views/IframeView.vue')",
  "urlParam: '/configuraCmoActividad.html'"
)) {
  if (-not $router.Contains($required)) { throw "Router incompleto: $required" }
}
if ($router.Contains("import('../modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue')")) {
  throw 'CMO sigue apuntando al componente Vue; se aborta.'
}

Write-Utf8 $routerPath ($router.Replace("`n", "`r`n"))
Write-Host 'OK router: JOCO migrado / CMO legacy iframe.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 4) MENU: JOCO mantiene JOCO; CMO navega a CMOA legacy.
#    ABM Materiales permanece fuera si ya fue retirado.
# ----------------------------------------------------------------------
$rutas = (Read-Utf8 $rutasPath).Replace("`r`n", "`n")

# Jobtype Contrato -> JOCO.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)(label:\s*'Configuración Jobtype-Contrato',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*)'[^']+'(\s*\}\);\s*\},\s*visible:\s*)[^\n]+",
  '$1''JOCO''$2hasMenu(''JOCO'')',
  1
)

# CMO -> CMOA, visible con cualquiera de los codigos que pudo recibir el usuario.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)(label:\s*'Configuración CMO-Actividad',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*)'[^']+'(\s*\}\);\s*\},\s*visible:\s*)[^\n]+",
  '$1''CMOA''$2hasMenu(''CMOA'') || hasMenu(''JOCM'') || hasMenu(''JOCO'')',
  1
)

# ABM no debe volver a aparecer.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)\s*\{\s*label:\s*'ABM MATERIALES',\s*command:.*?\n\s*\},",
  '',
  1
)

foreach ($required in @(
  "router.push({ name: 'JOCO' });",
  "router.push({ name: 'CMOA' });"
)) {
  if (-not $rutas.Contains($required)) { throw "Menu incompleto: $required" }
}

Write-Utf8 $rutasPath ($rutas.Replace("`n", "`r`n"))
Write-Host 'OK menu: Jobtype Contrato -> JOCO Vue; CMO -> CMOA legacy.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 5) SEGURIDAD: nada fuera de router/rutas puede cambiar.
# ----------------------------------------------------------------------
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: se modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX MIXTO APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Solo se modificaron:' -ForegroundColor Yellow
Write-Host "  $routerPath"
Write-Host "  $rutasPath"
Write-Host ''
Write-Host 'Probar:' -ForegroundColor Yellow
Write-Host '  1) Parametrizaciones -> Jobtype-Contrato: Vue migrado.'
Write-Host '  2) Parametrizaciones -> CMO-Actividad: iframe legacy /configuraCmoActividad.html.'
Write-Host '  3) URL directa /FM/jobtypeCMO.html: tambien debe caer en el iframe legacy.'
Write-Host '  4) npm run build'
