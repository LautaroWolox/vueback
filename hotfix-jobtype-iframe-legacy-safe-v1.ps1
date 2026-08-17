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
  'src/composables/useLegacyIframeLayout.js',
  'src/components/shared/FmTypingLoader.vue',
  'src/modules/buscadorOts/store/buscadorOtsStore.ts',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue',
  'src/modules/reporteSas/components/Tabla.vue',
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
Write-Host 'FM - JOBTYPE CONTRATO + CMO POR IFRAME LEGACY' -ForegroundColor Cyan
Write-Host '---------------------------------------------' -ForegroundColor Cyan
Write-Host 'Restaura JOCO y CMOA como pantallas legacy dentro de IframeView.' -ForegroundColor Yellow
Write-Host 'NO toca Buscador OTs, Stepper, mocks, grillas, menu visual, responsive ni spinners.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

# ----------------------------------------------------------------------
# 1) ROUTER: ambas parametrizaciones deben usar IframeView.
# ----------------------------------------------------------------------
$router = (Read-Utf8 $routerPath).Replace("`r`n", "`n")

$jobtypeBlock = @'
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
'@

$cmoBlock = @'
      {
        path: 'configuraCmoActividad.html',
        name: 'CMOA',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/configuraCmoActividad.html',
          titleParam: 'configuracion cmo-actividad'
        }
      },
'@

# Reemplaza JOCO sin importar si hoy apunta a Vue o a iframe.
$jobtypePattern = "(?s)\s*\{\s*path:\s*'jobtypeContrato\.html',\s*name:\s*'JOCO',.*?\n\s*\},"
if (-not [regex]::IsMatch($router, $jobtypePattern)) {
  throw 'No se encontro la ruta JOCO esperada.'
}
$router = [regex]::Replace($router, $jobtypePattern, "`n" + $jobtypeBlock.TrimEnd(), 1)

# Elimina cualquier variante migrada JOCM/jobtypeCMO o CMOA existente.
$cmoPatterns = @(
  "(?s)\s*\{\s*path:\s*'jobtypeCMO\.html',\s*name:\s*'JOCM',.*?\n\s*\},",
  "(?s)\s*\{\s*path:\s*'configuraCmoActividad\.html',\s*name:\s*'CMOA',.*?\n\s*\},"
)
foreach ($pattern in $cmoPatterns) {
  $router = [regex]::Replace($router, $pattern, '', 1)
}

# Inserta CMOA inmediatamente despues de JOCO.
$jobtypeLiteral = $jobtypeBlock.TrimEnd()
if (-not $router.Contains($jobtypeLiteral)) {
  throw 'JOCO no quedo normalizado para insertar CMOA.'
}
$router = $router.Replace($jobtypeLiteral, $jobtypeLiteral + "`n" + $cmoBlock.TrimEnd())

# Limpia solamente los bypass de permisos que se agregaron para la migracion JOCM/ABMM.
$router = $router.Replace(" || (to.name === 'JOCM' && rutasPermitidas.includes('JOCO'))", '')
$router = $router.Replace(" ||`n    (to.name === 'JOCM' && rutasPermitidas.includes('JOCO'))", '')
$router = $router.Replace(" ||`n    (to.name === 'ABMM' && import.meta.env.DEV)", '')

$requiredRouter = @(
  "path: 'jobtypeContrato.html'",
  "name: 'JOCO'",
  "urlParam: '/jobtypeContrato.html'",
  "path: 'configuraCmoActividad.html'",
  "name: 'CMOA'",
  "urlParam: '/configuraCmoActividad.html'"
)
foreach ($marker in $requiredRouter) {
  if (-not $router.Contains($marker)) { throw "Falta en router: $marker" }
}
if ($router.Contains("import('../modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue')")) {
  throw 'JOCO sigue apuntando al componente Vue.'
}
if ($router.Contains("import('../modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue')")) {
  throw 'CMO sigue apuntando al componente Vue.'
}
Write-Utf8 $routerPath ($router.Replace("`n", "`r`n"))
Write-Host 'OK router: JOCO y CMOA vuelven a IframeView.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 2) MENU: CMO debe navegar al codigo legacy CMOA.
#    ABM Materiales permanece fuera; no se reintroduce.
# ----------------------------------------------------------------------
$rutas = (Read-Utf8 $rutasPath).Replace("`r`n", "`n")

$rutas = [regex]::Replace(
  $rutas,
  "(?s)(label:\s*'Configuración CMO-Actividad',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*)'[^']+'(\s*\}\);\s*\},\s*visible:\s*)[^\n]+",
  '$1''CMOA''$2hasMenu(''CMOA'')',
  1
)

if (-not $rutas.Contains("router.push({ name: 'CMOA' });")) {
  throw 'No se pudo restaurar la navegacion CMOA en rutas.ts.'
}
if (-not $rutas.Contains("visible: hasMenu('CMOA')")) {
  throw 'No se pudo restaurar el permiso CMOA en rutas.ts.'
}

# No permitir que este hotfix reintroduzca ABM Materiales si ya habia sido retirado.
# Si el item aun existe por un estado anterior, se elimina ahora de forma aislada.
$rutas = [regex]::Replace(
  $rutas,
  "(?s)\s*\{\s*label:\s*'ABM MATERIALES',\s*command:\s*\(\)\s*=>\s*\{\s*router\.push\(\{\s*name:\s*'ABMM'\s*\}\);\s*\},\s*visible:.*?\n\s*\},",
  '',
  1
)

Write-Utf8 $rutasPath ($rutas.Replace("`n", "`r`n"))
Write-Host 'OK menu: Configuracion CMO-Actividad navega a CMOA legacy.' -ForegroundColor Green
Write-Host 'OK menu: ABM Materiales no se reintroduce.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 3) SEGURIDAD: todo lo demas queda byte a byte igual.
# ----------------------------------------------------------------------
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: se modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'HOTFIX JOBTYPE IFRAME APLICADO. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Archivos modificados solamente:' -ForegroundColor Yellow
Write-Host "  $routerPath"
Write-Host "  $rutasPath"
Write-Host ''
Write-Host 'Verificar:' -ForegroundColor Yellow
Write-Host '  git grep -n "jobtypeContrato.html" -- src/router/index.js'
Write-Host '  git grep -n "configuraCmoActividad.html" -- src/router/index.js'
Write-Host '  git grep -n "CMOA" -- src/components/rutas.ts'
Write-Host '  npm run build'
