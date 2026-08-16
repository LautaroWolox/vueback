$ErrorActionPreference = 'Stop'

$sourceRef = 'github-origen/patch-spinners-safe-only-v2'
$targets = @(
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  'src/modules/shared/components/LoadingOverlay.vue'
)

Write-Host ''
Write-Host 'SPINNERS SAFE-ONLY' -ForegroundColor Cyan
Write-Host '------------------' -ForegroundColor Cyan
Write-Host 'Este parche NO toca menu, grillas, responsive, router ni IframeView.' -ForegroundColor Yellow
Write-Host ''

# Seguridad: no pisar trabajo local sin commitear en los archivos objetivo.
$dirtyTargets = @(git status --porcelain -- $targets)
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo verificar git status.'
}

if ($dirtyTargets.Count -gt 0) {
  Write-Host 'Hay cambios locales en archivos del loader:' -ForegroundColor Red
  $dirtyTargets | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Abortado para no pisar cambios locales. Commit/stash primero.'
}

# Verifica que la referencia remota exista.
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

  # cmd.exe hace la redireccion como bytes de git show y evita recodificar UTF-8.
  $command = "git show $sourceRef`:$SourcePath > `"$DestinationPath`""
  cmd.exe /d /s /c $command
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo copiar $SourcePath"
  }

  Write-Host "OK  $DestinationPath" -ForegroundColor Green
}

foreach ($path in $targets) {
  Copy-GitFileRaw -SourcePath $path -DestinationPath $path
}

Write-Host ''
Write-Host 'Aplicado correctamente.' -ForegroundColor Green
Write-Host 'Solo se actualizaron los 3 archivos del sistema de loaders.' -ForegroundColor Green
Write-Host ''
Write-Host 'Revisa con:' -ForegroundColor Yellow
Write-Host '  git status'
Write-Host '  git diff -- src/components/shared/FmTypingLoader.vue src/components/shared/fmLoaderProfiles.js src/modules/shared/components/LoadingOverlay.vue'
Write-Host ''
Write-Host 'Luego valida con:' -ForegroundColor Yellow
Write-Host '  npm run build'
