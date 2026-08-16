$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$sourceRef = 'github-origen/buscador-ots-stepper-reproceso'
$componentTargets = @(
  'src/modules/buscadorOts/BuscadorOts.vue',
  'src/modules/buscadorOts/components/ReprocesoStepper.vue'
)
$globalCss = 'src/assets/css/fm-global.css'
$cssPatchPath = 'patches/buscador-ots-stepper.fm-global.css'
$cssMarker = '/* === INICIO BUSCADOR OTS - STEPPER REPROCESO === */'
$allTargets = @($componentTargets + $globalCss)

Write-Host ''
Write-Host 'BUSCADOR OTs - STEPPER REPROCESO' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor Cyan
Write-Host 'Convierte el flujo del icono filtro en un Stepper embebido.' -ForegroundColor Yellow
Write-Host 'No modifica Tabla.vue, store, mocks, router, menu ni otros modulos.' -ForegroundColor Yellow
Write-Host ''

if (-not (Test-Path 'src/modules/buscadorOts/BuscadorOts.vue')) {
  throw 'No existe src/modules/buscadorOts/BuscadorOts.vue. Debes partir de la rama buscador-de-ots.'
}

$dirtyTargets = @(git status --porcelain -- $allTargets)
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo verificar git status.'
}

if ($dirtyTargets.Count -gt 0) {
  Write-Host 'Hay cambios locales en archivos que este parche necesita tocar:' -ForegroundColor Red
  $dirtyTargets | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Abortado para no pisar cambios locales. Commit/stash primero.'
}

git rev-parse --verify "$sourceRef^{commit}" *> $null
if ($LASTEXITCODE -ne 0) {
  throw "No existe $sourceRef. Ejecuta primero: git fetch github-origen"
}

function Copy-GitFileRaw {
  param(
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$DestinationPath
  )

  $dir = Split-Path -Parent $DestinationPath
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $command = "git show $sourceRef`:$SourcePath > `"$DestinationPath`""
  cmd.exe /d /s /c $command
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo copiar $SourcePath"
  }

  Write-Host "OK  $DestinationPath" -ForegroundColor Green
}

foreach ($path in $componentTargets) {
  Copy-GitFileRaw -SourcePath $path -DestinationPath $path
}

$cssContent = [System.IO.File]::ReadAllText((Resolve-Path $globalCss))
if ($cssContent.Contains($cssMarker)) {
  Write-Host "SKIP  $globalCss (el bloque del Stepper ya existe)" -ForegroundColor DarkYellow
}
else {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::AppendAllText((Resolve-Path $globalCss), [Environment]::NewLine + [Environment]::NewLine, $utf8NoBom)

  $appendCommand = "git show $sourceRef`:$cssPatchPath >> `"$globalCss`""
  cmd.exe /d /s /c $appendCommand
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo anexar el bloque del Stepper a $globalCss"
  }

  Write-Host "OK  $globalCss (estilos del Stepper anexados al FM Global)" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Parche aplicado.' -ForegroundColor Green
Write-Host 'Archivos esperados:' -ForegroundColor Yellow
Write-Host '  M  src/modules/buscadorOts/BuscadorOts.vue'
Write-Host '  ?? src/modules/buscadorOts/components/ReprocesoStepper.vue'
Write-Host '  M  src/assets/css/fm-global.css'
Write-Host ''
Write-Host 'Valida ahora con:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
