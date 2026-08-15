$ErrorActionPreference = 'Stop'

$sourceRef = 'github-origen/fix-grids-fullscreen-loader-final'
$files = @(
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  'src/modules/shared/components/LoadingOverlay.vue'
)

function Copy-GitBlobRaw {
  param(
    [Parameter(Mandatory = $true)][string]$Ref,
    [Parameter(Mandatory = $true)][string]$File,
    [Parameter(Mandatory = $true)][string]$Target
  )

  $dir = Split-Path $Target -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $tempFile = Join-Path $env:TEMP ('fm-blob-' + [guid]::NewGuid().ToString('N'))
  $spec = "$Ref`:$File"
  $command = 'git show "' + $spec + '" > "' + $tempFile + '"'

  try {
    & cmd.exe /d /c $command
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $tempFile)) {
      throw "No se pudo leer $File desde $Ref"
    }

    [System.IO.File]::WriteAllBytes(
      $Target,
      [System.IO.File]::ReadAllBytes($tempFile)
    )
  }
  finally {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Aplicando SOLO cambios de spinner desde $sourceRef" -ForegroundColor Cyan
Write-Host 'Copia binaria: se preserva UTF-8 sin pasar el contenido por la consola de PowerShell.' -ForegroundColor DarkGray

foreach ($file in $files) {
  $target = Join-Path (Get-Location) $file
  Copy-GitBlobRaw -Ref $sourceRef -File $file -Target $target
  Write-Host "OK  $file" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Listo. No se hizo merge ni pull. Solo se actualizaron los 3 archivos del loader.' -ForegroundColor Green
Write-Host 'Revisar con: git diff -- src/components/shared/FmTypingLoader.vue src/components/shared/fmLoaderProfiles.js src/modules/shared/components/LoadingOverlay.vue' -ForegroundColor Yellow
