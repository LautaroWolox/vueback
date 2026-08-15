$ErrorActionPreference = 'Stop'

$sourceRef = 'github-origen/fix-grids-fullscreen-loader-final'
$utf8 = [System.Text.Encoding]::UTF8
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Copy-GitBlobRaw {
  param(
    [Parameter(Mandatory = $true)][string]$Ref,
    [Parameter(Mandatory = $true)][string]$File
  )

  $target = Join-Path (Get-Location) $File
  $dir = Split-Path $target -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $tempFile = Join-Path $env:TEMP ('fm-raw-' + [guid]::NewGuid().ToString('N'))
  $spec = "$Ref`:$File"
  $command = 'git show "' + $spec + '" > "' + $tempFile + '"'

  try {
    & cmd.exe /d /c $command
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $tempFile)) {
      throw "No se pudo copiar $File desde $Ref"
    }

    [System.IO.File]::WriteAllBytes(
      $target,
      [System.IO.File]::ReadAllBytes($tempFile)
    )
  }
  finally {
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
  }
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' REPARAR TEXTOS VISIBLES UTF-8' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host 'Restaura byte a byte solo los archivos con textos visibles afectados.' -ForegroundColor Gray
Write-Host 'No toca responsive iframe, Reporte SAS, OTs Fallidas ni la grilla.' -ForegroundColor Gray
Write-Host ''

$rawFiles = @(
  'src/components/CustomMenu.vue',
  'src/components/shared/FmTypingLoader.vue',
  'src/components/shared/fmLoaderProfiles.js',
  'src/modules/shared/components/LoadingOverlay.vue'
)

foreach ($file in $rawFiles) {
  Copy-GitBlobRaw -Ref $sourceRef -File $file
  Write-Host "OK UTF-8  $file" -ForegroundColor Green
}

# Reaplica SOLO la geometria aprobada del submenu sobre el CustomMenu limpio.
$menuPath = 'src/components/CustomMenu.vue'
$menu = [System.IO.File]::ReadAllText($menuPath, $utf8)

$basePattern = '(?s):deep\(\.p-menubar-submenu\),\s*:deep\(\.p-submenu-list\)\s*\{.*?\}'
$baseReplacement = @'
:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 238px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 !important;
  border: 1px solid #d7e0e5 !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-sizing: content-box !important;
  box-shadow: 0 5px 14px rgba(18, 45, 57, .16) !important;
  overflow: visible !important;
  z-index: 3000 !important;
}
'@

$nestedPattern = '(?s):deep\(\.p-menubar-submenu \.p-menubar-submenu\),\s*:deep\(\.p-submenu-list \.p-submenu-list\)\s*\{.*?\}'
$nestedReplacement = @'
:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 276px !important;
  margin-top: -3px !important;
  margin-left: 6px !important;
  transform: none !important;
}
'@

if ($menu -notmatch $basePattern) { throw 'No se encontro el bloque base del submenu.' }
if ($menu -notmatch $nestedPattern) { throw 'No se encontro el bloque del submenu de segundo nivel.' }

$menu = [regex]::Replace($menu, $basePattern, $baseReplacement, 1)
$menu = [regex]::Replace($menu, $nestedPattern, $nestedReplacement, 1)
[System.IO.File]::WriteAllText($menuPath, $menu, $utf8NoBom)

Write-Host ''
Write-Host 'OK - Cerrar sesion vuelve a quedar como Cerrar sesión.' -ForegroundColor Green
Write-Host 'OK - Obteniendo informacion del perfil vuelve a quedar como Obteniendo información del perfil.' -ForegroundColor Green
Write-Host 'OK - se conserva la geometria del submenu aprobada.' -ForegroundColor Green
Write-Host 'No se modificaron responsiveIframes.js, fm-global.css ni Tabla.vue de Reporte SAS.' -ForegroundColor Cyan
