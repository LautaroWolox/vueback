$ErrorActionPreference = 'Stop'

$path = 'src/modules/reporteSas/components/Tabla.vue'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$markerStart = '/* --- INICIO: reporte-sas-filter-row-white-absolute --- */'
$markerEnd = '/* --- FIN: reporte-sas-filter-row-white-absolute --- */'
$startEscaped = [regex]::Escape($markerStart)
$endEscaped = [regex]::Escape($markerEnd)

# Elimina una ejecucion previa de este mismo parche.
$content = [regex]::Replace(
  $content,
  "(?s)\s*<style>\s*$startEscaped.*?$endEscaped\s*</style>\s*",
  "`r`n"
)

$style = @'
<style>
/* --- INICIO: reporte-sas-filter-row-white-absolute --- */
/*
 * Reporte SAS - override final deliberadamente especifico.
 * PrimeVue y los estilos compartidos pintan todos los TH del THEAD con el
 * color de cabecera. La fila de filtros es la segunda fila del THEAD; por eso
 * se fuerza tambien por nth-child(2), no solo por las clases de PrimeVue.
 */
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2),
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) > th,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr.p-datatable-filter-row,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr.p-filter-row,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  border-top: 0 !important;
  border-bottom: 1px solid #dce3e8 !important;
}

/* Neutraliza cualquier pseudo-capa que estuviera heredando el gris. */
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) > th::before,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th::before,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr.p-filter-row > th::before {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: none !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* Todo lo que PrimeVue genera dentro de la celda de filtro queda blanco. */
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) > th > *,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .p-column-filter,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .p-datatable-column-filter,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .p-column-filter-element,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .fm-filter-cell,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .fm-column-filter,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .p-inputtext,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) input,
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) button {
  background-color: #ffffff !important;
  background-image: none !important;
}

/* La X sigue siendo un boton transparente visualmente, pero sobre base blanca. */
#tabla-reporte-sas.p-datatable .p-datatable-thead > tr:nth-child(2) .fm-icon-button {
  background: transparent !important;
}
/* --- FIN: reporte-sas-filter-row-white-absolute --- */
</style>
'@

$content = $content.TrimEnd() + "`r`n`r`n" + $style + "`r`n"
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host ''
Write-Host 'Reporte SAS: fila de filtros forzada a blanco puro por ID + segunda fila.' -ForegroundColor Green
Write-Host 'No se modifica la altura fullscreen ni Registro OTs Fallidas.' -ForegroundColor Cyan
Write-Host "Archivo modificado: $path"
