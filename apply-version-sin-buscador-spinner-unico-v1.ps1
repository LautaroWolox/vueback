$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$routerPath = 'src/router/index.js'
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$buscadorDir = 'src/modules/buscadorOts'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$protectedPaths = @(
  'src/assets/css/fm-global.css',
  'src/components/CustomMenu.vue',
  'src/plugins/responsiveIframes.js',
  'src/views/IframeView.vue',
  'src/views/DetalleView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/modules/reporteSas/ReporteSAS.vue',
  'src/modules/reporteSas/components/Tabla.vue',
  'src/modules/otFallidasCT/OtFallidasCT.vue',
  'src/modules/otFallidasCT/components/Table.vue',
  'src/modules/emulacion/views/Emulacion.vue'
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
Write-Host 'FM - VERSION SIN BUSCADOR OTs MIGRADO + SPINNER UNICO' -ForegroundColor Cyan
Write-Host '------------------------------------------------------' -ForegroundColor Cyan
Write-Host '1) BUOT vuelve a iframe legacy /busquedaOtsGcc.html.' -ForegroundColor Yellow
Write-Host '2) Se elimina src/modules/buscadorOts completo.' -ForegroundColor Yellow
Write-Host '3) Todos los FmTypingLoader muestran exactamente:' -ForegroundColor Yellow
Write-Host '   Cargando Informacion / Preparando Grilla' -ForegroundColor Yellow
Write-Host '   (en UI se renderiza Cargando Información mediante escape Unicode).' -ForegroundColor DarkGray
Write-Host 'NO toca menu visual, responsive iframe, Reporte SAS, OTs Fallidas ni FM Global.' -ForegroundColor Yellow
Write-Host ''

$dirty = @(git status --porcelain -- $routerPath $loaderPath $buscadorDir)
if ($LASTEXITCODE -ne 0) { throw 'No se pudo verificar git status.' }
if ($dirty.Count -gt 0) {
  Write-Host 'Hay cambios locales en archivos objetivo:' -ForegroundColor Red
  $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Abortado para no pisar trabajo local. Ejecutar sobre la rama nueva limpia.'
}

$beforeHashes = @{}
foreach ($path in $protectedPaths) { $beforeHashes[$path] = Hash-File $path }

# ----------------------------------------------------------------------
# 1) ROUTER: BUOT deja el componente migrado y vuelve al iframe legacy.
# ----------------------------------------------------------------------
$router = (Read-Utf8 $routerPath).Replace("`r`n", "`n")

$buotPattern = "(?s)\{\s*path:\s*'busquedaOtsGcc\.html',\s*name:\s*'BUOT',\s*beforeEnter:\s*allowed,\s*component:\s*\(\)\s*=>\s*import\('[^']+'\)(?:,\s*props:\s*\{.*?\})?\s*\}"
if (-not [regex]::IsMatch($router, $buotPattern)) {
  throw 'No se encontro el bloque BUOT esperado en router/index.js.'
}

$buotLegacy = @'
{
        path: 'busquedaOtsGcc.html',
        name: 'BUOT',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/busquedaOtsGcc.html',
          titleParam: 'Búsqueda de OTs'
        }
      }
'@

$router = [regex]::Replace($router, $buotPattern, $buotLegacy.Trim(), 1)

if ($router.Contains('../modules/buscadorOts/')) {
  throw 'El router todavia referencia el Buscador de OTs migrado.'
}
foreach ($required in @(
  "path: 'busquedaOtsGcc.html'",
  "name: 'BUOT'",
  "component: () => import('../views/IframeView.vue')",
  "urlParam: '/busquedaOtsGcc.html'"
)) {
  if (-not $router.Contains($required)) { throw "Router BUOT incompleto: $required" }
}

Write-Utf8 $routerPath ($router.Replace("`n", "`r`n"))
Write-Host 'OK - BUOT vuelve al iframe legacy.' -ForegroundColor Green

# ----------------------------------------------------------------------
# 2) BUSCADOR OTs: eliminar completamente el modulo migrado.
# ----------------------------------------------------------------------
if (Test-Path $buscadorDir) {
  Remove-Item -Recurse -Force $buscadorDir
  Write-Host "OK - eliminado: $buscadorDir" -ForegroundColor Green
} else {
  Write-Host "Ya no existe: $buscadorDir" -ForegroundColor DarkGray
}

# Verificacion: no pueden quedar imports al modulo eliminado en src.
$badRefs = @()
Get-ChildItem -Path 'src' -Recurse -File -Include *.js,*.ts,*.vue | ForEach-Object {
  $text = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
  if ($text.Contains('modules/buscadorOts/')) {
    $badRefs += $_.FullName
  }
}
if ($badRefs.Count -gt 0) {
  Write-Host 'Quedaron referencias al modulo Buscador de OTs:' -ForegroundColor Red
  $badRefs | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Limpieza incompleta del Buscador de OTs.'
}

# ----------------------------------------------------------------------
# 3) SPINNER: un unico texto y una unica variante visual para todos.
#    Usamos \u00f3 para no depender de la codificacion de PowerShell.
# ----------------------------------------------------------------------
$loader = (Read-Utf8 $loaderPath).Replace("`r`n", "`n")

# Asegurar titulo visible siempre.
$loader = $loader.Replace('v-if="showTitle && displayTitle"', 'v-if="displayTitle"')

# Quitar dependencias de ruta/perfiles; el spinner pasa a ser realmente unico.
$loader = [regex]::Replace(
  $loader,
  "(?m)^import \{ useRoute \} from 'vue-router'\s*\n",
  ''
)
$loader = [regex]::Replace(
  $loader,
  "(?s)import \{\s*GENERIC_LOADER_MESSAGES,\s*GENERIC_LOADER_TITLES,\s*getLoaderProfile,\s*\} from './fmLoaderProfiles'\s*\n",
  ''
)

# Eliminar route/profile y calculos de custom title/message si existen.
$loader = [regex]::Replace(
  $loader,
  "(?s)\nconst route = useRoute\(\).*?const displayTitle = computed\(\(\) => \(.*?\)\)\s*\n\s*const displayMessage = computed\(\(\) => \(.*?\)\)",
  "`nconst displayTitle = computed(() => 'Cargando Informaci\\u00f3n')`n`nconst displayMessage = computed(() => 'Preparando Grilla')"
)

# Si la estructura anterior no coincidio, normalizar por bloques individuales.
$loader = [regex]::Replace(
  $loader,
  "(?s)const displayTitle = computed\(\(\) => \(.*?\)\)",
  "const displayTitle = computed(() => 'Cargando Informaci\\u00f3n')",
  1
)
$loader = [regex]::Replace(
  $loader,
  "(?s)const displayMessage = computed\(\(\) => \(.*?\)\)",
  "const displayMessage = computed(() => 'Preparando Grilla')",
  1
)

# Todos iguales visualmente: sin variantes de perfil/contexto.
$loader = [regex]::Replace(
  $loader,
  "(?s)const effectiveVariant = computed\(\(\) => \(.*?\)\)",
  "const effectiveVariant = computed(() => 'default')",
  1
)
$loader = [regex]::Replace(
  $loader,
  "(?s)const effectiveShowMessage = computed\(\(\) => \(.*?\)\)",
  "const effectiveShowMessage = computed(() => true)",
  1
)

# Limpiar helpers que podrian quedar si el reemplazo principal no los abarco.
$loader = [regex]::Replace(
  $loader,
  "(?s)\nconst hasCustomTitle = computed\(\(\) => \{.*?\}\)\s*",
  "`n"
)
$loader = [regex]::Replace(
  $loader,
  "(?s)\nconst hasCustomMessage = computed\(\(\) => \{.*?\}\)\s*",
  "`n"
)
$loader = [regex]::Replace(
  $loader,
  "(?m)^const routeProfile = computed\(.*\)\s*$\n?",
  ''
)

# Gris mas claro para el segundo renglon.
$loader = $loader.Replace('--fm-loader-muted: #607887;', '--fm-loader-muted: #8a9aa4;')

foreach ($required in @(
  "computed(() => 'Cargando Informaci\\u00f3n')",
  "computed(() => 'Preparando Grilla')",
  "computed(() => 'default')",
  "computed(() => true)",
  '--fm-loader-muted: #8a9aa4;'
)) {
  if (-not $loader.Contains($required)) { throw "Spinner incompleto: $required" }
}
if ($loader.Contains('useRoute()') -or $loader.Contains('routeProfile.value')) {
  throw 'Spinner todavia depende del perfil de ruta.'
}

Write-Utf8 $loaderPath ($loader.Replace("`n", "`r`n"))
Write-Host 'OK - todos los spinners quedan unificados.' -ForegroundColor Green
Write-Host '     Titulo: Cargando Información' -ForegroundColor Green
Write-Host '     Mensaje: Preparando Grilla' -ForegroundColor DarkGray

# ----------------------------------------------------------------------
# 4) SEGURIDAD: nada fuera de targets debe variar.
# ----------------------------------------------------------------------
foreach ($path in $protectedPaths) {
  $after = Hash-File $path
  if ($after -ne $beforeHashes[$path]) {
    throw "SEGURIDAD: se modifico un archivo protegido: $path"
  }
}

Write-Host ''
Write-Host 'CAMBIOS APLICADOS. SIN COMMIT NI PUSH.' -ForegroundColor Green
Write-Host 'Cambios esperados:' -ForegroundColor Yellow
Write-Host "  M  $routerPath"
Write-Host "  M  $loaderPath"
Write-Host "  D  $buscadorDir/..."
Write-Host ''
Write-Host 'Ahora ejecutar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host 'Si build termina OK:'
Write-Host '  npm run dev'
