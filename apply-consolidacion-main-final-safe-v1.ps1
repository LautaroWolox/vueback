$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host ''
Write-Host 'FM - CONSOLIDACION MAIN FINAL SAFE V1' -ForegroundColor Cyan
Write-Host '-------------------------------------' -ForegroundColor Cyan
Write-Host 'Integra Buscador OTs + Stepper, grillas OTF, spinners, responsive iframe y menu final.' -ForegroundColor Yellow
Write-Host 'No hace commit ni push. Primero se prueba visualmente.' -ForegroundColor Yellow
Write-Host ''

$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'No se pudo leer git status.' }
if ($dirty.Count -gt 0) {
  Write-Host 'El working tree no esta limpio:' -ForegroundColor Red
  $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Guarda/stash los cambios antes de aplicar la consolidacion.'
}

$refs = @(
  'github-origen/main',
  'github-origen/integracion-buscador-ots-aislado-v2',
  'github-origen/fix-menu-iframe-regression-buscador-v3',
  'github-origen/unificar-grids-spinners-safe-v1',
  'github-origen/fix-submenu-margin-final-safe-v2'
)

foreach ($ref in $refs) {
  git rev-parse --verify "$ref^{commit}" *> $null
  if ($LASTEXITCODE -ne 0) {
    throw "No existe $ref. Ejecuta primero: git fetch github-origen"
  }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Run-GitScript {
  param(
    [Parameter(Mandatory=$true)][string]$Ref,
    [Parameter(Mandatory=$true)][string]$Path
  )

  Write-Host ''
  Write-Host "Aplicando $Path desde $Ref" -ForegroundColor DarkCyan
  $lines = @(git show "$Ref`:$Path")
  if ($LASTEXITCODE -ne 0 -or $lines.Count -eq 0) {
    throw "No se pudo leer $Path desde $Ref"
  }
  Invoke-Expression ($lines -join "`r`n")
}

# Hashes de referencia: estas piezas no deben ser reemplazadas por la integracion del Buscador.
$otfTable = 'src/modules/otFallidasCT/components/Table.vue'
$otfCss = 'src/modules/otFallidasCT/components/otf-table.css'
$otfTableHash = (Get-FileHash -Algorithm SHA256 -Path $otfTable).Hash
$otfCssHash = (Get-FileHash -Algorithm SHA256 -Path $otfCss).Hash

# ======================================================================
# 1) BUSCADOR DE OTs COMPLETO + STEPPER.
#    Primero se incorpora el modulo aislado. Este script puede restaurar
#    archivos legacy desde main; por eso el responsive/menu final se aplica
#    DESPUES en los pasos 2 y 5.
# ======================================================================
Run-GitScript -Ref 'github-origen/integracion-buscador-ots-aislado-v2' -Path 'apply-buscador-ots-aislado-v2.ps1'

# El Buscador migrado debe funcionar tambien en build/produccion, no solo DEV.
$entryPath = 'src/modules/buscadorOts/BuscadorOtsEntry.vue'
$entryContent = @'
<template>
  <BuscadorOtsView />
</template>

<script setup>
import BuscadorOtsView from './BuscadorOtsView.vue'
</script>
'@
[System.IO.File]::WriteAllText((Resolve-Path $entryPath), $entryContent, $utf8NoBom)
Write-Host 'OK BuscadorOtsEntry: migrado activo en DEV y build.' -ForegroundColor Green

# ======================================================================
# 2) RESPONSIVE IFRAME + MENU FINAL APROBADO.
#    Recupera zoom 400% -> 100%, centrado y geometria del submenu.
# ======================================================================
Run-GitScript -Ref 'github-origen/fix-menu-iframe-regression-buscador-v3' -Path 'fix-regresiones-menu-iframe-buscador-v3.ps1'

# ======================================================================
# 3) GRILLAS + SPINNERS.
#    - Registro OTs Fallidas queda como patron.
#    - Buscador, Reporte SAS y DataTables migradas heredan el mismo visual.
#    - THEAD completo sticky y filtros blancos opacos.
#    - Spinner general: Cargando Informacion.
# ======================================================================
Run-GitScript -Ref 'github-origen/unificar-grids-spinners-safe-v1' -Path 'apply-grids-spinners-unificados-safe-v5.ps1'

# ======================================================================
# 4) EMULACION: unica excepcion del titulo generico.
#    Al ACEPTAR muestra Emulando perfil/perfiles + nombres reales.
# ======================================================================
$dialogPath = 'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue'
$dialog = [System.IO.File]::ReadAllText((Resolve-Path $dialogPath), [System.Text.Encoding]::UTF8)

$oldBlock = @'
  const profileLabel = selectedProfiles.value[0] || ''
  const targetLabel = profileLabel || selectedFullName.value || selectedLegajo.value
  store.$setLoaderContext(
    'Emulación',
    profileLabel ? `Aplicando perfil ${profileLabel}` : `Emulando a ${targetLabel}`
  )
'@

$newBlock = @'
  const profiles = selectedProfiles.value
  const profileNames = profiles.join(', ')
  const fallbackTarget = selectedFullName.value || selectedLegajo.value
  const multipleProfiles = profiles.length > 1

  store.$setLoaderContext(
    multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil',
    profiles.length
      ? `${multipleProfiles ? 'Perfiles' : 'Perfil'}: ${profileNames}`
      : `Operador: ${fallbackTarget}`
  )
'@

if ($dialog.Contains($oldBlock)) {
  $dialog = $dialog.Replace($oldBlock, $newBlock)
} elseif (-not $dialog.Contains("multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil'")) {
  throw 'No se encontro el bloque de loader de emulacion esperado.'
}
[System.IO.File]::WriteAllText((Resolve-Path $dialogPath), $dialog, $utf8NoBom)
Write-Host 'OK Emulacion: spinner contextual con perfil/perfiles.' -ForegroundColor Green

# ======================================================================
# 5) REFUERZO FINAL DE SUBMENUS.
#    Debe ejecutarse al final para que nadie vuelva a comer el gutter blanco.
# ======================================================================
Run-GitScript -Ref 'github-origen/fix-submenu-margin-final-safe-v2' -Path 'fix-submenu-margin-final-safe-v2.ps1'

# ======================================================================
# 6) VERIFICACIONES FUERTES.
# ======================================================================
$pluginPath = 'src/plugins/responsiveIframes.js'
$globalPath = 'src/assets/css/fm-global.css'
$menuPath = 'src/components/CustomMenu.vue'
$routerPath = 'src/router/index.js'
$buscadorTablePath = 'src/modules/buscadorOts/components/Tabla.vue'
$loaderPath = 'src/components/shared/FmTypingLoader.vue'
$stepperPath = 'src/modules/buscadorOts/components/ReprocesoStepper.vue'

$plugin = [System.IO.File]::ReadAllText((Resolve-Path $pluginPath), [System.Text.Encoding]::UTF8)
$global = [System.IO.File]::ReadAllText((Resolve-Path $globalPath), [System.Text.Encoding]::UTF8)
$menu = [System.IO.File]::ReadAllText((Resolve-Path $menuPath), [System.Text.Encoding]::UTF8)
$router = [System.IO.File]::ReadAllText((Resolve-Path $routerPath), [System.Text.Encoding]::UTF8)
$buscadorTableContent = [System.IO.File]::ReadAllText((Resolve-Path $buscadorTablePath), [System.Text.Encoding]::UTF8)
$loader = [System.IO.File]::ReadAllText((Resolve-Path $loaderPath), [System.Text.Encoding]::UTF8)
$entry = [System.IO.File]::ReadAllText((Resolve-Path $entryPath), [System.Text.Encoding]::UTF8)
$dialogFinal = [System.IO.File]::ReadAllText((Resolve-Path $dialogPath), [System.Text.Encoding]::UTF8)

$checks = @(
  @{ Ok = (Test-Path $stepperPath); Message = 'Stepper del Buscador existe' },
  @{ Ok = $router.Contains('../modules/buscadorOts/BuscadorOtsEntry.vue'); Message = 'BUOT apunta al Buscador migrado aislado' },
  @{ Ok = $entry.Contains('<BuscadorOtsView />') -and -not $entry.Contains('import.meta.env.DEV'); Message = 'Buscador migrado activo tambien fuera de DEV' },
  @{ Ok = $buscadorTableContent.Contains('filter-display="row"'); Message = 'Buscador tiene segunda fila de filtros permanente' },
  @{ Ok = -not $buscadorTableContent.Contains(':filter="store.showColumnFilters"'); Message = 'Filtros del Buscador no dependen de toggle' },
  @{ Ok = $global.Contains('fm-global-sticky-grid-header-filters'); Message = 'Sticky THEAD global presente' },
  @{ Ok = $global.Contains('fm-migrated-grid-otf-clone'); Message = 'Visual OTF aplicado a grillas migradas' },
  @{ Ok = $plugin.Contains('return screenWidth >= 640 && screenHeight >= 400'); Message = 'Responsive notebook final 640x400' },
  @{ Ok = $plugin.Contains('width: Math.max(1, Math.floor(width)),'); Message = 'Zoom alto sin minimo falso de 320px' },
  @{ Ok = $plugin.Contains('height: Math.max(1, Math.floor(height)),'); Message = 'Zoom alto sin minimo falso de 240px' },
  @{ Ok = $global.Contains('fm-iframe-stage-flex-master'); Message = 'Flex master exterior iframe presente' },
  @{ Ok = $menu.Contains('box-sizing: content-box !important;'); Message = 'Submenu padre conserva geometria' },
  @{ Ok = $menu.Contains('margin-left: 6px !important;'); Message = 'Separacion blanca de 6px entre niveles' },
  @{ Ok = $global.Contains('padding-bottom: 10px !important;'); Message = 'Margen blanco inferior de submenu 10px' },
  @{ Ok = $loader.Contains("String(props.contextTitle ?? '').trim() || 'Cargando Información'"); Message = 'Spinner general usa Cargando Informacion' },
  @{ Ok = $dialogFinal.Contains("multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil'"); Message = 'Emulacion muestra perfil/perfiles al aceptar' },
  @{ Ok = $dialogFinal.Contains("const profileNames = profiles.join(', ')"); Message = 'Emulacion lista todos los perfiles seleccionados' }
)

foreach ($check in $checks) {
  if (-not $check.Ok) { throw "FALLO VERIFICACION: $($check.Message)" }
  Write-Host "OK  $($check.Message)" -ForegroundColor Green
}

# La grilla patron NO se modifica.
if ((Get-FileHash -Algorithm SHA256 -Path $otfTable).Hash -ne $otfTableHash) {
  throw 'SEGURIDAD: se modifico Table.vue de Registro OTs Fallidas.'
}
if ((Get-FileHash -Algorithm SHA256 -Path $otfCss).Hash -ne $otfCssHash) {
  throw 'SEGURIDAD: se modifico otf-table.css de Registro OTs Fallidas.'
}
Write-Host 'OK  Registro OTs Fallidas permanece intacto como patron.' -ForegroundColor Green

Write-Host ''
Write-Host 'CONSOLIDACION APLICADA SIN COMMIT NI PUSH' -ForegroundColor Green
Write-Host 'Ahora ejecuta:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'Pruebas obligatorias antes de guardar:' -ForegroundColor Yellow
Write-Host '  1) Menu y submenus: margen inferior + gutter 6px.'
Write-Host '  2) Iframe: 100% -> 400% -> 100%, centrado y recuperacion.'
Write-Host '  3) Registro OTs Fallidas: sin regresiones.'
Write-Host '  4) Reporte SAS: calco OTF + filtros + sticky opaco.'
Write-Host '  5) Buscador OTs: grilla OTF + filtros + Stepper completo.'
Write-Host '  6) Spinners: Cargando Informacion en general.'
Write-Host '  7) Emulacion ACEPTAR: Emulando perfil/perfiles + nombres.'
