$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$routerPath = 'src/router/index.js'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/components/rutas.ts',
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
  'src/modules/otFallidasCT/components/Table.vue'
)

function Hash-File([string]$Path) {
  if (-not (Test-Path $Path)) { return '<missing>' }
  return (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
}

function Find-RouteBlockRange {
  param(
    [Parameter(Mandatory=$true)][string]$Text,
    [Parameter(Mandatory=$true)][string]$PathValue
  )

  $needle = "path: '$PathValue'"
  $pathIndex = $Text.IndexOf($needle)
  if ($pathIndex -lt 0) { return $null }

  $start = $Text.LastIndexOf('{', $pathIndex)
  if ($start -lt 0) { throw "No se encontro inicio de bloque para $PathValue" }

  $depth = 0
  $inSingle = $false
  $inDouble = $false
  $inTemplate = $false
  $escaped = $false
  $end = -1

  for ($i = $start; $i -lt $Text.Length; $i++) {
    $ch = $Text[$i]

    if ($escaped) {
      $escaped = $false
      continue
    }

    if (($inSingle -or $inDouble -or $inTemplate) -and $ch -eq '\') {
      $escaped = $true
      continue
    }

    if (-not $inDouble -and -not $inTemplate -and $ch -eq "'") {
      $inSingle = -not $inSingle
      continue
    }
    if (-not $inSingle -and -not $inTemplate -and $ch -eq '"') {
      $inDouble = -not $inDouble
      continue
    }
    if (-not $inSingle -and -not $inDouble -and $ch -eq '`') {
      $inTemplate = -not $inTemplate
      continue
    }

    if ($inSingle -or $inDouble -or $inTemplate) { continue }

    if ($ch -eq '{') { $depth++ }
    elseif ($ch -eq '}') {
      $depth--
      if ($depth -eq 0) {
        $end = $i + 1
        while ($end -lt $Text.Length -and [char]::IsWhiteSpace($Text[$end])) { $end++ }
        if ($end -lt $Text.Length -and $Text[$end] -eq ',') { $end++ }
        break
      }
    }
  }

  if ($end -lt 0) { throw "No se encontro fin de bloque para $PathValue" }
  return @{ Start = $start; End = $end }
}

function Remove-RouteBlock {
  param([string]$Text, [string]$PathValue)
  $range = Find-RouteBlockRange -Text $Text -PathValue $PathValue
  if ($null -eq $range) { return $Text }
  return $Text.Substring(0, $range.Start) + $Text.Substring($range.End)
}

function Replace-RouteBlock {
  param([string]$Text, [string]$PathValue, [string]$Replacement)
  $range = Find-RouteBlockRange -Text $Text -PathValue $PathValue
  if ($null -eq $range) { throw "No existe la ruta $PathValue" }
  return $Text.Substring(0, $range.Start) + $Replacement + $Text.Substring($range.End)
}

Write-Host ''
Write-Host 'FM - REPARACION SEGURA ROUTER JOBTYPE MIXTO V3' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Corrige SOLO src/router/index.js.' -ForegroundColor Yellow
Write-Host 'JOCO = Vue migrado. CMOA = iframe legacy.' -ForegroundColor Yellow
Write-Host 'No toca menu, estilos, responsive, Buscador, Stepper, mocks ni grillas.' -ForegroundColor Yellow
Write-Host ''

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

if (-not (Test-Path $routerPath)) { throw "No se encontro $routerPath" }
$router = [System.IO.File]::ReadAllText((Resolve-Path $routerPath), [System.Text.Encoding]::UTF8).Replace("`r`n", "`n")

# 1) Reescribir COMPLETO el guard allowed para eliminar cualquier literal roto
#    introducido por parches previos.
$allowedPattern = '(?s)const allowed = \(to, from, next\) => \{.*?\n\}\s*\n\s*const routes = \['
if (-not [regex]::IsMatch($router, $allowedPattern)) {
  throw 'No se pudo delimitar la funcion allowed del router.'
}

$allowedCanonical = @'
const allowed = (to, from, next) => {
  const authStore = useAuthStore()
  const autenticado = authStore.autenticado;
  const rutas = authStore.rutas;
  const rutasPermitidas = rutas !== null ? rutas : [];

  if (!autenticado && rutasLibres.includes(to.name)) {
    next();
    return;
  } else if (!autenticado && !rutasLibres.includes(to.name)) {
    next({ name: '401' });
    return;
  } else if (autenticado && (
    rutasPermitidas.includes(to.name) ||
    (to.name === 'CMOA' && (
      rutasPermitidas.includes('JOCM') ||
      rutasPermitidas.includes('JOCO')
    ))
  )) {
    next();
    return;
  } else {
    next({ name: '401' });
    return;
  }
}

const routes = [
'@
$router = [regex]::Replace($router, $allowedPattern, $allowedCanonical.TrimEnd(), 1)

# 2) Jobtype-Contrato debe quedar en Vue migrado.
$jobtypeVueBlock = @'
      {
        path: 'jobtypeContrato.html',
        name: 'JOCO',
        beforeEnter: allowed,
        component: () => import('../modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue')
      },
'@
$router = Replace-RouteBlock -Text $router -PathValue 'jobtypeContrato.html' -Replacement $jobtypeVueBlock.TrimEnd()

# 3) CMO debe quedar SOLO como legacy. Eliminar ambas variantes y agregar una canonica.
$router = Remove-RouteBlock -Text $router -PathValue 'jobtypeCMO.html'
$router = Remove-RouteBlock -Text $router -PathValue 'configuraCmoActividad.html'

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
  throw 'No se encontro JOCO canonico para insertar CMOA.'
}
$router = $router.Replace($jobtypeLiteral, $jobtypeLiteral + "`n" + $cmoLegacyBlock.TrimEnd())

# 4) Verificaciones duras antes de escribir.
$required = @(
  "component: () => import('../modules/parametrizaciones/jobtypeContrato/JobtypeContrato.vue')",
  "path: 'configuraCmoActividad.html'",
  "alias: ['jobtypeCMO.html']",
  "name: 'CMOA'",
  "component: () => import('../views/IframeView.vue')",
  "urlParam: '/configuraCmoActividad.html'",
  "to.name === 'CMOA'"
)
foreach ($marker in $required) {
  if (-not $router.Contains($marker)) { throw "Falta marcador esperado: $marker" }
}
if ($router.Contains("import('../modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue')")) {
  throw 'CMO migrado sigue referenciado en el router.'
}
if ($router.Contains('||`n')) {
  throw 'Se detecto nuevamente el literal roto ||`n.'
}

[System.IO.File]::WriteAllText((Resolve-Path $routerPath), $router.Replace("`n", "`r`n"), $utf8NoBom)

# 5) Seguridad: ningun otro archivo puede cambiar por esta reparacion.
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: se modifico archivo protegido: $path"
  }
}

Write-Host 'ROUTER REPARADO.' -ForegroundColor Green
Write-Host 'Unico archivo tocado:' -ForegroundColor Yellow
Write-Host "  $routerPath"
Write-Host ''
Write-Host 'Configuracion final:' -ForegroundColor Yellow
Write-Host '  Jobtype-Contrato -> Vue migrado (JOCO)'
Write-Host '  CMO-Actividad     -> iframe legacy (CMOA)'
Write-Host ''
Write-Host 'Ahora ejecutar:' -ForegroundColor Yellow
Write-Host '  npm run build'
Write-Host 'Si build da OK:'
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'NO hacer commit ni push todavia.' -ForegroundColor Yellow
