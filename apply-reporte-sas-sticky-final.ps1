$ErrorActionPreference = 'Stop'

$path = 'src/modules/reporteSas/components/Tabla.vue'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$markerStart = '/* --- INICIO: reporte-sas-sticky-final --- */'
$markerEnd = '/* --- FIN: reporte-sas-sticky-final --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)

$content = [regex]::Replace(
  $content,
  "(?s)\s*$startEscaped.*?$endEscaped\s*",
  "`r`n"
)

$css = @'
/* --- INICIO: reporte-sas-sticky-final --- */
/*
 * Reporte SAS: mismo comportamiento visual que Registro OTs Fallidas.
 * Titulos + filtros permanecen fijos y opacos. La fila de titulos NO usa
 * pseudo-capa para evitar que el overlay tape el texto de los encabezados.
 */
.reporte-sas-main-grid :deep(.p-datatable-table-container),
.reporte-sas-main-grid :deep(.p-datatable-wrapper),
.reporte-sas-main-grid :deep([data-pc-section='tablecontainer']) {
  position: relative !important;
  overflow: auto !important;
  isolation: isolate !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-table) {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead) {
  position: relative !important;
  z-index: 100 !important;
}

/* Nombres de columnas */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child > th) {
  position: sticky !important;
  top: 0 !important;
  z-index: 122 !important;
  height: 32px !important;
  min-height: 32px !important;
  background: #f1f1f1 !important;
  background-color: #f1f1f1 !important;
  background-clip: border-box !important;
  opacity: 1 !important;
  color: #242424 !important;
  visibility: visible !important;
  box-shadow: inset 0 -1px 0 #bcbcbc !important;
}

/*
 * IMPORTANTE: no colocar ::before sobre la fila de titulos.
 * El fondo solido del TH ya evita transparencia y asi PrimeVue conserva
 * visibles title + icono de ordenamiento + resizer.
 */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child > th::before) {
  content: none !important;
  display: none !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-column-header-content),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-datatable-column-title),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-column-title),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child [data-pc-section='columntitle']) {
  position: relative !important;
  z-index: 5 !important;
  display: flex !important;
  align-items: center !important;
  min-width: 0 !important;
  color: #242424 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-datatable-column-title),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-column-title),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child [data-pc-section='columntitle']) {
  display: block !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1.1 !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-sortable-column-icon),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child .p-sortable-column-badge),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:first-child [data-pc-section='sorticon']) {
  position: relative !important;
  z-index: 6 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Filtros: exactamente debajo de los nombres de columnas */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:nth-child(2) > th) {
  position: sticky !important;
  top: 32px !important;
  z-index: 121 !important;
  height: 35px !important;
  min-height: 35px !important;
  background: #fff !important;
  background-color: #fff !important;
  background-clip: border-box !important;
  opacity: 1 !important;
  overflow: visible !important;
  box-shadow: inset 0 -1px 0 #c9d3da !important;
}

/* Capa opaca SOLO para filtros: evita texto del tbody por detras. */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th::before),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th::before),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:nth-child(2) > th::before) {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
}

/* El contenido de filtros queda por encima de la capa opaca. */
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row .fm-filter-cell),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row .fm-filter-cell),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr:nth-child(2) .fm-filter-cell),
.reporte-sas-main-grid :deep(.p-datatable-thead .p-column-filter) {
  position: relative !important;
  z-index: 3 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead .p-inputtext),
.reporte-sas-main-grid :deep(.p-datatable-thead .fm-column-filter) {
  position: relative !important;
  z-index: 4 !important;
  background: #fff !important;
  background-color: #fff !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* El cuerpo nunca compite en la misma capa que cabecera/filtros. */
.reporte-sas-main-grid :deep(.p-datatable-tbody),
.reporte-sas-main-grid :deep(.p-datatable-tbody > tr),
.reporte-sas-main-grid :deep(.p-datatable-tbody > tr > td) {
  position: relative !important;
  z-index: 1 !important;
}
/* --- FIN: reporte-sas-sticky-final --- */
'@

$styleCloseIndex = $content.LastIndexOf('</style>')
if ($styleCloseIndex -lt 0) {
  throw 'No se encontro </style> en Tabla.vue de Reporte SAS.'
}

$content = $content.Insert($styleCloseIndex, "`r`n" + $css.Trim() + "`r`n")
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Reporte SAS: nombres de columnas restaurados y visibles.'
Write-Host 'Cabecera y filtros permanecen sticky/opacos durante el scroll.'
Write-Host 'Los registros quedan completamente por debajo.'
Write-Host "Archivo modificado: $path"
