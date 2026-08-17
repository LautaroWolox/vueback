$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$sourceV1 = 'github-origen/consolidacion-main-final-safe-v1'
$scriptV1 = 'apply-consolidacion-main-final-safe-v1.ps1'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

Write-Host ''
Write-Host 'FM - CONSOLIDACION MAIN FINAL SAFE V2' -ForegroundColor Cyan
Write-Host '-------------------------------------' -ForegroundColor Cyan
Write-Host 'V2 = V1 + contrato visual canonico fm-grid-otf + comentarios de mantenimiento.' -ForegroundColor Yellow
Write-Host 'No hace commit ni push. Primero se valida visualmente.' -ForegroundColor Yellow
Write-Host ''

$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'No se pudo leer git status.' }
if ($dirty.Count -gt 0) {
  Write-Host 'El working tree no esta limpio:' -ForegroundColor Red
  $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Guarda/stash los cambios antes de aplicar la consolidacion V2.'
}

git rev-parse --verify "$sourceV1^{commit}" *> $null
if ($LASTEXITCODE -ne 0) {
  throw "No existe $sourceV1. Ejecuta primero: git fetch github-origen"
}

$lines = @(git show "$sourceV1`:$scriptV1")
if ($LASTEXITCODE -ne 0 -or $lines.Count -eq 0) {
  throw "No se pudo leer $scriptV1 desde $sourceV1"
}

# Primero aplica toda la consolidacion ya validada: Buscador + Stepper,
# responsive legacy, menu/submenu, sticky global, spinners y emulacion.
Invoke-Expression ($lines -join "`r`n")

function Read-Utf8([string]$Path) {
  return [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

function Ensure-GridContract {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$ClassAnchor,
    [Parameter(Mandatory=$true)][string]$CommentText
  )

  if (-not (Test-Path $Path)) { throw "Falta grilla migrada: $Path" }
  $content = Read-Utf8 $Path

  if (-not $content.Contains('<!-- FM Global: fm-grid-otf')) {
    $dataTableIndex = $content.IndexOf('<DataTable')
    if ($dataTableIndex -lt 0) { throw "No se encontro DataTable en $Path" }
    $content = $content.Insert($dataTableIndex, "<!-- FM Global: fm-grid-otf | $CommentText -->`r`n    ")
  }

  if (-not $content.Contains('fm-grid-otf')) {
    throw "No se pudo agregar/documentar fm-grid-otf en $Path"
  }

  if (-not $content.Contains('class="fm-grid-otf')) {
    if (-not $content.Contains($ClassAnchor)) {
      throw "No se encontro el class anchor esperado en $Path : $ClassAnchor"
    }
    $content = $content.Replace($ClassAnchor, $ClassAnchor.Replace('class="', 'class="fm-grid-otf '))
  }

  Write-Utf8 $Path $content
}

# ----------------------------------------------------------------------
# 1) ESTILO CANONICO DE GRILLA.
#    Nombre oficial para mantenimiento: fm-grid-otf
#    Fuente visual: Registro OTs Fallidas.
# ----------------------------------------------------------------------
$globalPath = 'src/assets/css/fm-global.css'
$global = Read-Utf8 $globalPath
$markerStart = '/* --- INICIO: FM STYLE fm-grid-otf CANONICAL --- */'
$markerEnd = '/* --- FIN: FM STYLE fm-grid-otf CANONICAL --- */'
$global = [regex]::Replace(
  $global,
  '(?s)\s*' + [regex]::Escape($markerStart) + '.*?' + [regex]::Escape($markerEnd) + '\s*',
  "`r`n"
)

$canonicalGridCss = @'
/* --- INICIO: FM STYLE fm-grid-otf CANONICAL --- */
/*
 * ESTILO OFICIAL: fm-grid-otf
 * PATRON VISUAL: Registro OTs Fallidas / Reproceso.
 * USAR EN: toda DataTable de pantalla Vue migrada.
 * RESPONSABILIDAD: cabecera, fila de filtros, celdas, seleccion, sticky y opacidad.
 * NO crear variantes visuales de cabecera/filtros dentro de una pantalla puntual.
 */
html body #app .fm-grid-otf.p-datatable {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 0 !important;
  background: #fff !important;
}

html body #app .fm-grid-otf.p-datatable :is(.p-datatable-table-container, .p-datatable-wrapper, [data-pc-section='tablecontainer']) {
  position: relative !important;
  min-width: 0 !important;
  min-height: 0 !important;
  overflow: auto !important;
  isolation: isolate !important;
  border: 1px solid #d1d1d1 !important;
  background: #fff !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 220 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  isolation: isolate !important;
  transform: translateZ(0) !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr:first-child > th {
  position: relative !important;
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  overflow: visible !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #f4f7f9 !important;
  background-color: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  opacity: 1 !important;
  background-clip: border-box !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-filter-row,
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  position: relative !important;
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  overflow: visible !important;
  border-top: 0 !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #fff !important;
  background-color: #fff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
  background-clip: border-box !important;
}

/* Capa opaca: las filas nunca se transparentan por detras del filtro sticky. */
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th::before,
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-filter-row > th::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th > *,
html body #app .fm-grid-otf.p-datatable .p-datatable-thead > tr.p-filter-row > th > * {
  position: relative !important;
  z-index: 2 !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-tbody {
  position: relative !important;
  z-index: 1 !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-tbody > tr > td {
  position: relative !important;
  z-index: 1 !important;
  height: 35px !important;
  min-height: 35px !important;
  padding: 5px 8px !important;
  overflow: hidden !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 12px !important;
  vertical-align: middle !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

html body #app .fm-grid-otf.p-datatable .p-datatable-tbody > tr:hover > td {
  background: #edfafd !important;
}

html body #app .fm-grid-otf.p-datatable :is(.fm-selected-row, .p-datatable-row-selected, .p-highlight) > td {
  background: #9eeff7 !important;
  color: #263238 !important;
}

html body #app .fm-grid-otf.p-datatable .fm-disabled-row > td {
  background: #fff !important;
  color: #8b8b8b !important;
}

html body #app .fm-grid-otf.p-datatable .fm-filter-cell {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  background: #fff !important;
}

html body #app .fm-grid-otf.p-datatable :is(.fm-filter-prefix, .fm-filter-more) {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}

html body #app .fm-grid-otf.p-datatable .fm-column-filter,
html body #app .fm-grid-otf.p-datatable .p-datatable-filter-row .p-inputtext,
html body #app .fm-grid-otf.p-datatable .p-filter-row .p-inputtext {
  width: 100% !important;
  min-width: 20px !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 3px 5px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  background: #fff !important;
  color: #111 !important;
  font-size: 11px !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

html body #app .fm-grid-otf.p-datatable .fm-column-filter:focus,
html body #app .fm-grid-otf.p-datatable .p-datatable-filter-row .p-inputtext:focus,
html body #app .fm-grid-otf.p-datatable .p-filter-row .p-inputtext:focus {
  outline: none !important;
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, .14) !important;
}

html body #app .fm-grid-otf.p-datatable .fm-cell-text {
  width: 100% !important;
  min-width: 0 !important;
  display: block !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

html body #app .fm-grid-otf.p-datatable :is(.p-datatable-empty-message > td, .p-datatable-emptymessage > td),
html body #app .fm-grid-otf.p-datatable .fm-grid-empty {
  min-height: 110px !important;
  background: #eafcff !important;
  color: #407080 !important;
  text-align: center !important;
}

html body #app .fm-grid-otf.p-datatable .p-paginator {
  min-height: 38px !important;
  padding: 0 !important;
  border: 1px solid #d1d1d1 !important;
  border-top: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
}
/* --- FIN: FM STYLE fm-grid-otf CANONICAL --- */
'@

$global = $global.TrimEnd() + "`r`n`r`n" + $canonicalGridCss.Trim() + "`r`n"
Write-Utf8 $globalPath $global

# ----------------------------------------------------------------------
# 2) APLICAR + DOCUMENTAR EL CONTRATO EN TODAS LAS GRILLAS VUE MIGRADAS.
#    Los estilos estructurales propios de cada pantalla pueden seguir locales;
#    la apariencia compartida de grilla se gobierna SOLO desde fm-global.css.
# ----------------------------------------------------------------------
$gridTargets = @(
  @{ Path='src/modules/reporteSas/components/Tabla.vue'; Anchor='class="fm-pass-grid reporte-sas-main-grid"'; Comment='calco de Registro OTs Fallidas' },
  @{ Path='src/modules/buscadorOts/components/Tabla.vue'; Anchor='class="fm-pass-grid busqueda-ots-grid"'; Comment='calco de Registro OTs Fallidas; filtros + sticky' },
  @{ Path='src/modules/emulacion/components/TablaEmulacion.vue'; Anchor='class="fm-pass-grid emulation-grid"'; Comment='calco de Registro OTs Fallidas' },
  @{ Path='src/modules/parametrizaciones/jobtypeContrato/components/Tabla.vue'; Anchor='class="jobtype-main-grid fm-pass-grid jobtype-contrato-main-grid"'; Comment='calco de Registro OTs Fallidas' },
  @{ Path='src/modules/parametrizaciones/jobtypeCMO/components/Tabla.vue'; Anchor='class="jobtype-main-grid fm-pass-grid cmo-main-grid"'; Comment='calco de Registro OTs Fallidas' },
  @{ Path='src/modules/gestionMateriales/abmMateriales/components/TablaMateriales.vue'; Anchor='class="abm-materiales-grid fm-pass-grid fm-pt-datatable"'; Comment='calco de Registro OTs Fallidas' }
)

foreach ($target in $gridTargets) {
  Ensure-GridContract -Path $target.Path -ClassAnchor $target.Anchor -CommentText $target.Comment
  Write-Host "OK fm-grid-otf: $($target.Path)" -ForegroundColor Green
}

# La grilla patron recibe solo documentacion; no se le aplica el selector nuevo
# para no modificar el visual aprobado que estamos copiando.
$otfPath = 'src/modules/otFallidasCT/components/Table.vue'
$otf = Read-Utf8 $otfPath
if (-not $otf.Contains('<!-- FM Global: fm-grid-otf')) {
  $idx = $otf.IndexOf('<DataTable')
  if ($idx -lt 0) { throw 'No se encontro DataTable de Registro OTs Fallidas.' }
  $otf = $otf.Insert($idx, "<!-- FM Global: fm-grid-otf | PATRON visual de todas las grillas migradas -->`r`n    ")
  Write-Utf8 $otfPath $otf
}

# ----------------------------------------------------------------------
# 3) COMENTARIOS CORTOS EN LAS PANTALLAS MIGRADAS ACTIVAS.
# ----------------------------------------------------------------------
$screenComments = @(
  @{ Path='src/modules/reporteSas/ReporteSAS.vue'; Needle='<template>'; Text='<!-- FM Global: fm-grid-otf para la grilla principal -->' },
  @{ Path='src/modules/buscadorOts/BuscadorOts.vue'; Needle='<template>'; Text='<!-- FM Global: fm-grid-otf para la grilla principal; Stepper conserva el mismo lenguaje FM -->' },
  @{ Path='src/modules/emulacion/views/Emulacion.vue'; Needle='<template>'; Text='<!-- FM Global: fm-grid-otf para resultados; fm-loader unificado para cargas -->' },
  @{ Path='src/modules/otFallidasCT/OtFallidasCT.vue'; Needle='<template>'; Text='<!-- FM Global: fm-grid-otf toma esta pantalla como patron visual -->' }
)

foreach ($item in $screenComments) {
  if (-not (Test-Path $item.Path)) { throw "Falta pantalla migrada: $($item.Path)" }
  $content = Read-Utf8 $item.Path
  if (-not $content.Contains($item.Text)) {
    $content = $content.Replace($item.Needle, "$($item.Needle)`r`n  $($item.Text)")
    Write-Utf8 $item.Path $content
  }
}

# ----------------------------------------------------------------------
# 4) VERIFICACIONES EXPLICITAS DE LO PEDIDO.
# ----------------------------------------------------------------------
$globalFinal = Read-Utf8 $globalPath
$buscadorFinal = Read-Utf8 'src/modules/buscadorOts/components/Tabla.vue'
$buscadorPageFinal = Read-Utf8 'src/modules/buscadorOts/BuscadorOts.vue'
$stepperFinal = Read-Utf8 'src/modules/buscadorOts/components/ReprocesoStepper.vue'
$loaderFinal = Read-Utf8 'src/components/shared/FmTypingLoader.vue'
$emulationDialogFinal = Read-Utf8 'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue'
$menuFinal = Read-Utf8 'src/components/CustomMenu.vue'
$pluginFinal = Read-Utf8 'src/plugins/responsiveIframes.js'
$routerFinal = Read-Utf8 'src/router/index.js'

$checks = @(
  @{ Ok=$globalFinal.Contains('FM STYLE fm-grid-otf CANONICAL'); Message='fm-global contiene el estilo canonico fm-grid-otf' },
  @{ Ok=$buscadorFinal.Contains('class="fm-grid-otf fm-pass-grid busqueda-ots-grid"'); Message='Buscador usa fm-grid-otf' },
  @{ Ok=$buscadorFinal.Contains('filter-display="row"'); Message='Buscador muestra siempre la fila FILTRAR' },
  @{ Ok=(-not $buscadorFinal.Contains(':filter="store.showColumnFilters"')); Message='Filtros de Buscador no dependen de toggle' },
  @{ Ok=$stepperFinal.Contains('Stepper'); Message='Stepper del filtro permanece presente' },
  @{ Ok=$buscadorPageFinal.Contains('open-reprocess="openReprocessFlow"'); Message='Icono filtro abre el Stepper, no el popup viejo' },
  @{ Ok=$globalFinal.Contains('Capa opaca: las filas nunca se transparentan'); Message='Sticky opaco evita celdas por detras' },
  @{ Ok=$loaderFinal.Contains("String(props.contextTitle ?? '').trim() || 'Cargando Información'"); Message='Todos los loaders normales dicen Cargando Informacion' },
  @{ Ok=$emulationDialogFinal.Contains("multipleProfiles ? 'Emulando perfiles' : 'Emulando perfil'"); Message='Emulacion es la unica excepcion contextual' },
  @{ Ok=$emulationDialogFinal.Contains("const profileNames = profiles.join(', ')"); Message='Emulacion muestra todos los perfiles' },
  @{ Ok=$pluginFinal.Contains('return screenWidth >= 640 && screenHeight >= 400'); Message='Responsive iframe final conservado' },
  @{ Ok=$pluginFinal.Contains('width: Math.max(1, Math.floor(width)),'); Message='Zoom 400 sin minimo falso horizontal' },
  @{ Ok=$pluginFinal.Contains('height: Math.max(1, Math.floor(height)),'); Message='Zoom 400 sin minimo falso vertical' },
  @{ Ok=$menuFinal.Contains('box-sizing: content-box !important;'); Message='Menu/submenu conserva geometria' },
  @{ Ok=$menuFinal.Contains('margin-left: 6px !important;'); Message='Submenu conserva gutter de 6px' },
  @{ Ok=$globalFinal.Contains('padding-bottom: 10px !important;'); Message='Submenu conserva margen blanco inferior de 10px' },
  @{ Ok=$routerFinal.Contains("../modules/buscadorOts/BuscadorOtsEntry.vue"); Message='BUOT usa la pantalla migrada' }
)

foreach ($check in $checks) {
  if (-not $check.Ok) { throw "FALLO VERIFICACION V2: $($check.Message)" }
  Write-Host "OK  $($check.Message)" -ForegroundColor Green
}

# Verificar que todas las grillas objetivo quedaron documentadas y con clase canonica.
foreach ($target in $gridTargets) {
  $content = Read-Utf8 $target.Path
  if (-not $content.Contains('<!-- FM Global: fm-grid-otf')) {
    throw "Falta comentario fm-grid-otf en $($target.Path)"
  }
  if (-not $content.Contains('fm-grid-otf')) {
    throw "Falta clase fm-grid-otf en $($target.Path)"
  }
}

Write-Host ''
Write-Host 'CONSOLIDACION V2 APLICADA SIN COMMIT NI PUSH' -ForegroundColor Green
Write-Host 'Nombre oficial del estilo compartido de grillas: fm-grid-otf' -ForegroundColor Green
Write-Host 'Visual compartido de grillas: centralizado en src/assets/css/fm-global.css' -ForegroundColor Green
Write-Host 'Los estilos locales que quedan son solo estructura/comportamiento propio de cada pantalla.' -ForegroundColor Green
Write-Host ''
Write-Host 'Ahora ejecuta:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'Pruebas obligatorias:' -ForegroundColor Yellow
Write-Host '  1) Registro OTs Fallidas: patron sin cambio visual.'
Write-Host '  2) Reporte SAS: calco OTF, filtros y sticky opaco.'
Write-Host '  3) Buscador OTs: calco OTF + fila filtrar + Stepper del icono filtro.'
Write-Host '  4) Emulacion: grilla OTF; loader normal Cargando Informacion; aceptar = Emulando perfil/perfiles.'
Write-Host '  5) Menu/submenus: margen inferior 10px + separacion 6px.'
Write-Host '  6) Iframe: 100% -> 400% -> 100%, centrado y recuperacion.'
