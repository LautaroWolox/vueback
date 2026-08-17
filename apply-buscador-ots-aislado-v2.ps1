$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$sourceRef = 'github-origen/integracion-buscador-ots-aislado-v2'
$stableRef = 'github-origen/main'
$moduleRoot = 'src/modules/buscadorOts'
$routerPath = 'src/router/index.js'
$globalCss = 'src/assets/css/fm-global.css'
$cssPatch = 'patches/buscador-ots-stepper.fm-global.css'
$cssMarker = '/* === INICIO BUSCADOR OTS - STEPPER REPROCESO === */'
$criticalLegacy = @(
  'src/views/IframeView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/plugins/responsiveIframes.js'
)

Write-Host ''
Write-Host 'BUSCADOR OTs - INTEGRACION AISLADA V2' -ForegroundColor Cyan
Write-Host '-------------------------------------' -ForegroundColor Cyan
Write-Host 'El Buscador migrado NO se monta dentro de IframeView.' -ForegroundColor Yellow
Write-Host 'Los iframes legacy y el menu quedan en la version exacta de main.' -ForegroundColor Yellow
Write-Host ''

$dirty = @(git status --porcelain -- $moduleRoot $routerPath $globalCss $criticalLegacy)
if ($LASTEXITCODE -ne 0) { throw 'No se pudo verificar git status.' }
if ($dirty.Count -gt 0) {
  Write-Host 'Hay cambios locales en archivos que esta integracion necesita tocar:' -ForegroundColor Red
  $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Abortado para no pisar cambios locales. Usa una rama limpia desde github-origen/main.'
}

foreach ($ref in @($sourceRef, $stableRef)) {
  git rev-parse --verify "$ref^{commit}" *> $null
  if ($LASTEXITCODE -ne 0) { throw "No existe $ref. Ejecuta: git fetch github-origen" }
}

function Copy-GitFileRaw {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$DestinationPath
  )

  $dir = Split-Path -Parent $DestinationPath
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $command = "git show $Ref`:$SourcePath > `"$DestinationPath`""
  cmd.exe /d /s /c $command
  if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar $SourcePath desde $Ref" }
}

# 1) Restaurar primero la infraestructura critica desde main.
foreach ($path in $criticalLegacy) {
  Copy-GitFileRaw -Ref $stableRef -SourcePath $path -DestinationPath $path
  Write-Host "OK estable  $path" -ForegroundColor Green
}
Copy-GitFileRaw -Ref $stableRef -SourcePath $globalCss -DestinationPath $globalCss
Write-Host "OK estable  $globalCss" -ForegroundColor Green

# 2) Copiar exclusivamente el modulo del Buscador migrado.
$moduleFiles = @(git ls-tree -r --name-only $sourceRef -- $moduleRoot)
if ($LASTEXITCODE -ne 0 -or $moduleFiles.Count -eq 0) {
  throw 'No se pudieron listar los archivos del Buscador de OTs.'
}
foreach ($path in $moduleFiles) {
  Copy-GitFileRaw -Ref $sourceRef -SourcePath $path -DestinationPath $path
  Write-Host "OK buscador $path" -ForegroundColor Green
}

# 3) El Stepper usa FM Global, pero el bloque esta totalmente acotado al flujo del Buscador.
$cssContent = [System.IO.File]::ReadAllText((Resolve-Path $globalCss), [System.Text.Encoding]::UTF8)
if (-not $cssContent.Contains($cssMarker)) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::AppendAllText((Resolve-Path $globalCss), [Environment]::NewLine + [Environment]::NewLine, $utf8NoBom)
  $appendCommand = "git show $sourceRef`:$cssPatch >> `"$globalCss`""
  cmd.exe /d /s /c $appendCommand
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo agregar el bloque del Stepper a FM Global.' }
  Write-Host 'OK FM Global: bloque aislado del Stepper agregado.' -ForegroundColor Green
}

# 4) BUOT deja de reutilizar IframeView en DEV. Usa un entry propio.
#    El entry vuelve al iframe legacy fuera de DEV, por lo que no cambia produccion.
$router = [System.IO.File]::ReadAllText((Resolve-Path $routerPath), [System.Text.Encoding]::UTF8)
if (-not $router.Contains("../modules/buscadorOts/BuscadorOtsEntry.vue")) {
  $pattern = "(?s)\{\s*path:\s*'busquedaOtsGcc\.html',\s*name:\s*'BUOT',\s*beforeEnter:\s*allowed,\s*component:\s*\(\)\s*=>\s*import\('\.\./views/IframeView\.vue'\),\s*props:\s*\{.*?urlParam:\s*'/busquedaOtsGcc\.html'.*?\}\s*\}"
  $replacement = @'
{
        path: 'busquedaOtsGcc.html',
        name: 'BUOT',
        beforeEnter: allowed,
        component: () => import('../modules/buscadorOts/BuscadorOtsEntry.vue')
      }
'@
  $updatedRouter = [regex]::Replace($router, $pattern, $replacement, 1)
  if ($updatedRouter -eq $router) {
    throw 'No se encontro el bloque BUOT esperado en src/router/index.js.'
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Resolve-Path $routerPath), $updatedRouter, $utf8NoBom)
  Write-Host 'OK router: solo BUOT usa el entry aislado.' -ForegroundColor Green
}

# 5) Verificacion fuerte: infraestructura iframe debe ser IDENTICA a main.
foreach ($path in $criticalLegacy) {
  git diff --quiet $stableRef -- $path
  if ($LASTEXITCODE -ne 0) {
    throw "SEGURIDAD: $path difiere de main. Se detiene la integracion."
  }
}

Write-Host ''
Write-Host 'INTEGRACION V2 APLICADA' -ForegroundColor Green
Write-Host 'IframeView, useLegacyIframeLayout y responsiveIframes quedaron identicos a main.' -ForegroundColor Green
Write-Host 'El menu no fue modificado.' -ForegroundColor Green
Write-Host 'BUOT usa el Buscador Vue solamente en DEV; fuera de DEV conserva el iframe legacy.' -ForegroundColor Green
Write-Host ''
Write-Host 'Ejecuta ahora:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
