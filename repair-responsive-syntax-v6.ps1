$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$path = 'src/plugins/responsiveIframes.js'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines((Resolve-Path $path), [System.Text.Encoding]::UTF8)

$detailIndex = -1
$notebookIndex = -1

for ($i = 0; $i -lt $lines.Length; $i++) {
  if ($detailIndex -lt 0 -and $lines[$i] -match '^\s*const\s+isDetailIframe\s*=') {
    $detailIndex = $i
  }
  if ($lines[$i] -match 'const\s+isNotebookEnvironment\s*=') {
    $notebookIndex = $i
    break
  }
}

if ($detailIndex -lt 0) { throw 'No se encontro const isDetailIframe.' }
if ($notebookIndex -lt 0) { throw 'No se encontro const isNotebookEnvironment.' }
if ($notebookIndex -lt $detailIndex) { throw 'Orden inesperado entre isDetailIframe e isNotebookEnvironment.' }

$fixedBlock = @(
  'const isDetailIframe = (iframe) => Boolean(',
  "  iframe?.closest?.('.legacy-iframe-stage--detail')",
  ');',
  '',
  'const isNotebookEnvironment = (view) => {'
)

$before = if ($detailIndex -gt 0) { $lines[0..($detailIndex - 1)] } else { @() }
$afterStart = $notebookIndex + 1
$after = if ($afterStart -lt $lines.Length) { $lines[$afterStart..($lines.Length - 1)] } else { @() }

$newLines = @($before) + $fixedBlock + @($after)
$content = [string]::Join("`r`n", $newLines) + "`r`n"

if ($content -match '\)\s*const\s+isNotebookEnvironment') {
  throw 'La reparacion dejo isNotebookEnvironment pegado al cierre anterior.'
}
if (-not $content.Contains('const isDetailIframe = (iframe) => Boolean(')) {
  throw 'No quedo el helper isDetailIframe.'
}
if (-not $content.Contains('const isNotebookEnvironment = (view) => {')) {
  throw 'No quedo isNotebookEnvironment.'
}

[System.IO.File]::WriteAllText((Resolve-Path $path), $content, $utf8NoBom)

Write-Host ''
Write-Host 'SINTAXIS DE responsiveIframes.js REPARADA.' -ForegroundColor Green
Write-Host 'Solo se reescribio el bloque entre isDetailIframe e isNotebookEnvironment.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Verificar:' -ForegroundColor Yellow
Write-Host '  Get-Content src/plugins/responsiveIframes.js | Select-Object -Skip 74 -First 15'
Write-Host '  npm run build'
Write-Host ''
Write-Host 'No hacer commit ni push todavia.' -ForegroundColor Yellow
