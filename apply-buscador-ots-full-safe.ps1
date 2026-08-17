$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$sourceRef = 'github-origen/integracion-buscador-ots-full-safe'
$moduleRoot = 'src/modules/buscadorOts'
$iframeView = 'src/views/IframeView.vue'
$globalCss = 'src/assets/css/fm-global.css'
$cssPatch = 'patches/buscador-ots-stepper.fm-global.css'
$cssMarker = '/* === INICIO BUSCADOR OTS - STEPPER REPROCESO === */'

Write-Host ''
Write-Host 'INTEGRACION BUSCADOR OTs - FULL SAFE' -ForegroundColor Cyan
Write-Host '-----------------------------------' -ForegroundColor Cyan
Write-Host 'Parte de la base estable con spinners, grids e iframes responsive.' -ForegroundColor Yellow
Write-Host 'Agrega la migracion completa del Buscador de OTs + Stepper.' -ForegroundColor Yellow
Write-Host 'No modifica router, menu, useLegacyIframeLayout ni otros modulos.' -ForegroundColor Yellow
Write-Host ''

$requiredFiles = @(
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  $iframeView,
  $globalCss
)

foreach ($required in $requiredFiles) {
  if (-not (Test-Path $required)) {
    throw "Falta archivo requerido de la base estable: $required"
  }
}

$dirtyTargets = @(git status --porcelain -- $moduleRoot $iframeView $globalCss)
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo verificar git status.'
}

if ($dirtyTargets.Count -gt 0) {
  Write-Host 'Hay cambios locales en archivos que esta integracion necesita tocar:' -ForegroundColor Red
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
}

$moduleFiles = @(git ls-tree -r --name-only $sourceRef -- $moduleRoot)
if ($LASTEXITCODE -ne 0 -or $moduleFiles.Count -eq 0) {
  throw 'No se pudieron listar los archivos del Buscador de OTs.'
}

foreach ($path in $moduleFiles) {
  Copy-GitFileRaw -SourcePath $path -DestinationPath $path
  Write-Host "OK  $path" -ForegroundColor Green
}

Copy-GitFileRaw -SourcePath $iframeView -DestinationPath $iframeView
Write-Host "OK  $iframeView" -ForegroundColor Green

$cssContent = [System.IO.File]::ReadAllText((Resolve-Path $globalCss))
if ($cssContent.Contains($cssMarker)) {
  Write-Host "SKIP  $globalCss (bloque Stepper ya presente)" -ForegroundColor DarkYellow
}
else {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::AppendAllText((Resolve-Path $globalCss), [Environment]::NewLine + [Environment]::NewLine, $utf8NoBom)

  $appendCommand = "git show $sourceRef`:$cssPatch >> `"$globalCss`""
  cmd.exe /d /s /c $appendCommand
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo anexar $cssPatch a $globalCss"
  }

  Write-Host "OK  $globalCss (estilos Stepper anexados a FM Global)" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Integracion aplicada.' -ForegroundColor Green
Write-Host 'Se conservaron los spinners globales, responsive de iframes y fixes de grids de la base.' -ForegroundColor Green
Write-Host ''
Write-Host 'Valida con:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
