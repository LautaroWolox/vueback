$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$path = 'src/modules/buscadorOts/store/buscadorOtsStore.ts'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText((Resolve-Path $path), [System.Text.Encoding]::UTF8)
$content = $content.Replace("`r`n", "`n")

Write-Host ''
Write-Host 'FM - REPARACION SINTAXIS BUSCADOR OTs' -ForegroundColor Cyan
Write-Host '-------------------------------------' -ForegroundColor Cyan
Write-Host 'Solo corrige la union accidental entre applyMockReprocess y clearSearch.' -ForegroundColor Yellow
Write-Host 'No toca router, Jobtype, menu, responsive, spinners ni grillas.' -ForegroundColor Yellow
Write-Host ''

$before = $content

# Caso observado en build: cierre de applyMockReprocess pegado a const clearSearch.
$content = [regex]::Replace(
  $content,
  "(?m)^\s*}\s*const clearSearch = \(\) => \{$",
  "  }`n`n  const clearSearch = () => {",
  1
)

# Variante defensiva si quedaron espacios/saltos parciales.
$content = [regex]::Replace(
  $content,
  "}\s+const clearSearch = \(\) => \{",
  "}`n`n  const clearSearch = () => {",
  1
)

if ($content -eq $before) {
  if ($content.Contains('} const clearSearch = () => {')) {
    throw 'No se pudo separar applyMockReprocess de clearSearch.'
  }
  Write-Host 'La union rota ya no estaba presente; se valida estructura.' -ForegroundColor DarkYellow
}

foreach ($required in @(
  'const applyMockReprocess = (selectedRows: BuscadorOtRow[], technician: MockTechnician) => {',
  'const clearSearch = () => {',
  'Object.assign(row, technicianPatch)',
  'mockReprocessOverrides.value[rowId]'
)) {
  if (-not $content.Contains($required)) { throw "Falta bloque esperado: $required" }
}

if ($content.Contains('} const clearSearch = () => {')) {
  throw 'La sintaxis sigue pegada; abortado.'
}

[System.IO.File]::WriteAllText((Resolve-Path $path), $content.Replace("`n", "`r`n"), $utf8NoBom)

Write-Host 'SINTAXIS DEL STORE REPARADA.' -ForegroundColor Green
Write-Host 'Unico archivo tocado:' -ForegroundColor Yellow
Write-Host "  $path"
Write-Host ''
Write-Host 'Ejecutar ahora:' -ForegroundColor Yellow
Write-Host '  Get-Content src/modules/buscadorOts/store/buscadorOtsStore.ts | Select-Object -Skip 124 -First 18'
Write-Host '  npm run build'
Write-Host ''
Write-Host 'No hacer commit ni push todavia.' -ForegroundColor Yellow
