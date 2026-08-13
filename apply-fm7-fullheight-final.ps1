$ErrorActionPreference = 'Stop'

$remoteRef = 'github-origen/fix-grids-fullscreen-loader-final'
$patches = @(
  'fm7-v3-global.patch',
  'fm7-v3-legacy-layout.patch',
  'fm7-v3-ot-fallidas-screen.patch',
  'fm7-v3-ot-fallidas-table.patch',
  'fm7-v3-ot-fallidas-css.patch',
  'fm7-v3-reporte-sas.patch',
  'fm7-v3-detalle-loader.patch',
  'fm7-v3-iframe-loader.patch'
)

Write-Host 'Verificando cambios contra la base limpia...'
foreach ($patch in $patches) {
  git show "$remoteRef`:$patch" | git apply --check --ignore-space-change -
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo validar $patch. No se aplico ningun cambio."
  }
}

Write-Host 'Aplicando cambios...'
foreach ($patch in $patches) {
  git show "$remoteRef`:$patch" | git apply --ignore-space-change -
  if ($LASTEXITCODE -ne 0) {
    throw "Fallo al aplicar $patch."
  }
}

Write-Host ''
Write-Host 'Cambios aplicados correctamente.'
Write-Host 'Archivos modificados:'
git diff --name-only
