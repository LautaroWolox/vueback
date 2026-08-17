$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$sourceRef = 'github-origen/unificar-grids-spinners-safe-v1'
$baseScript = 'apply-grids-spinners-unificados-safe-v4.ps1'

$criticalFiles = @(
  'src/components/CustomMenu.vue',
  'src/views/IframeView.vue',
  'src/composables/useLegacyIframeLayout.js',
  'src/plugins/responsiveIframes.js'
)

$criticalHashes = @{}
foreach ($path in $criticalFiles) {
  if (-not (Test-Path $path)) { throw "Falta archivo crítico: $path" }
  $criticalHashes[$path] = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
}

Write-Host ''
Write-Host 'FM - UNIFICACIÓN FINAL SAFE V5' -ForegroundColor Cyan
Write-Host '-------------------------------' -ForegroundColor Cyan

$lines = @(git show "$sourceRef`:$baseScript")
if ($LASTEXITCODE -ne 0 -or $lines.Count -eq 0) {
  throw "No se pudo leer $baseScript desde $sourceRef. Ejecuta primero: git fetch github-origen"
}

Invoke-Expression ($lines -join "`r`n")

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Jobtype-Contrato: adopta el contrato fm-pass-grid y las clases de filtro FM.
$jobtypePath = 'src/modules/parametrizaciones/jobtypeContrato/components/Tabla.vue'
if (Test-Path $jobtypePath) {
  $jobtype = [System.IO.File]::ReadAllText((Resolve-Path $jobtypePath), [System.Text.Encoding]::UTF8)
  $jobtype = $jobtype.Replace('class="jobtype-main-grid jobtype-contrato-main-grid"', 'class="jobtype-main-grid fm-pass-grid jobtype-contrato-main-grid"')
  $jobtype = $jobtype.Replace('class="jobtype-filter-cell"', 'class="fm-filter-cell jobtype-filter-cell"')
  $jobtype = $jobtype.Replace('class="jobtype-filter-symbol"', 'class="fm-filter-prefix jobtype-filter-symbol"')
  $jobtype = $jobtype.Replace('class="jobtype-filter-input"', 'class="fm-column-filter jobtype-filter-input"')
  [System.IO.File]::WriteAllText((Resolve-Path $jobtypePath), $jobtype, $utf8NoBom)
}

# ABM Materiales: ya usa fm-pass-grid; se alinean prefijo/input al patrón OTF.
$abmPath = 'src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue'
if (Test-Path $abmPath) {
  $abm = [System.IO.File]::ReadAllText((Resolve-Path $abmPath), [System.Text.Encoding]::UTF8)
  $abm = $abm.Replace('class="abm-materiales-filter-symbol"', 'class="fm-filter-prefix abm-materiales-filter-symbol"')
  $abm = $abm.Replace('class="abm-materiales-filter-input"', 'class="fm-column-filter abm-materiales-filter-input"')
  [System.IO.File]::WriteAllText((Resolve-Path $abmPath), $abm, $utf8NoBom)
}

foreach ($path in $criticalFiles) {
  $afterHash = (Get-FileHash -Algorithm SHA256 -Path $path).Hash
  if ($afterHash -ne $criticalHashes[$path]) {
    throw "SEGURIDAD: se modificó un archivo crítico: $path"
  }
}

Write-Host ''
Write-Host 'V5 COMPLETADO' -ForegroundColor Green
Write-Host '- OTs Fallidas sigue siendo la grilla patrón y no se altera.' -ForegroundColor Green
Write-Host '- Buscador, Reporte SAS y DataTables Vue migradas heredan el mismo visual/sticky.' -ForegroundColor Green
Write-Host '- Jobtype/ABM quedan preparados con el mismo contrato visual.' -ForegroundColor Green
Write-Host '- Spinner normal: Cargando Información.' -ForegroundColor Green
Write-Host '- Emulación al aceptar: Emulación + perfil/operador.' -ForegroundColor Green
Write-Host '- Menu e iframes responsive: intactos.' -ForegroundColor Green
