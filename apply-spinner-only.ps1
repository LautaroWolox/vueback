$ErrorActionPreference = 'Stop'

$sourceRef = 'github-origen/fix-grids-fullscreen-loader-final'
$files = @(
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  'src/modules/shared/components/LoadingOverlay.vue'
)

Write-Host "Aplicando SOLO cambios de spinner desde $sourceRef" -ForegroundColor Cyan

foreach ($file in $files) {
  $target = Join-Path (Get-Location) $file
  $dir = Split-Path $target -Parent

  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $content = git show "$sourceRef`:$file"
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo leer $file desde $sourceRef"
  }

  $text = ($content -join "`n") + "`n"
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($target, $text, $utf8NoBom)

  Write-Host "OK  $file" -ForegroundColor Green
}

Write-Host "" 
Write-Host "Listo. No se hizo merge ni pull. Solo se actualizaron los 3 archivos del loader." -ForegroundColor Green
Write-Host "Revisar con: git diff -- src/components/shared/FmTypingLoader.vue src/components/shared/fmLoaderProfiles.js src/modules/shared/components/LoadingOverlay.vue" -ForegroundColor Yellow
