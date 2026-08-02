import { FilterMatchMode } from '@primevue/core/api'

/**
 * Contrato visual fijo de Reporte SAS.
 *
 * La grilla no debe crear, ocultar ni reordenar columnas según las claves
 * devueltas por el backend. Las 22 columnas se muestran siempre y en este
 * orden.
 */
export const reporteSasColumns = Object.freeze([
  { field: 'nroOT', header: 'N° OT', width: '125px', exportable: true },
  { field: 'estadoOT', header: 'Estado', width: '110px', exportable: true },
  { field: 'gestionada', header: 'Gestionada', width: '105px', exportable: true },
  { field: 'codTarea', header: 'Código Tarea', width: '120px', exportable: true },
  { field: 'localidad', header: 'Localidad', width: '145px', exportable: true },
  { field: 'codPostal', header: 'Código Postal', width: '115px', exportable: true },
  {
    field: 'legajoOperadorDescarga',
    header: 'Legajo Operador Descarga',
    width: '165px',
    exportable: true,
  },
  {
    field: 'nomApeOperadorDescarga',
    header: 'Nombre Operador Descarga',
    width: '210px',
    exportable: true,
  },
  { field: 'fechaDescarga', header: 'Fecha Descarga', width: '155px', exportable: true },
  { field: 'legajoCierreOT', header: 'Legajo Cierre OT', width: '145px', exportable: true },
  {
    field: 'nomApeCierreOT',
    header: 'Nombre Operador Cierre OT',
    width: '205px',
    exportable: true,
  },
  {
    field: 'legajoNOLDAP',
    header: 'Legajo NOLDAP',
    width: '260px',
    exportable: false,
    type: 'legajoList',
  },
  { field: 'fechaCierreOT', header: 'Fecha Cierre OT', width: '155px', exportable: true },
  { field: 'centro', header: 'Centro', width: '100px', exportable: true },
  { field: 'almacen', header: 'Almacén', width: '105px', exportable: true },
  {
    field: 'serialCodMaterial',
    header: 'Serial Material',
    width: '175px',
    exportable: true,
  },
  { field: 'codMaterial', header: 'Código Material', width: '145px', exportable: true },
  { field: 'descMaterial', header: 'Material', width: '220px', exportable: true },
  { field: 'cantidadMaterial', header: 'Cantidad', width: '105px', exportable: true },
  { field: 'tipoDescarga', header: 'Tipo Descarga', width: '130px', exportable: true },
  { field: 'mensajeSAP', header: 'Mensaje SAP', width: '240px', exportable: true },
  {
    field: 'fechaNotificacionSAP',
    header: 'Fecha Notificación SAP',
    width: '175px',
    exportable: true,
  },
])

export const reporteSasRowsOptions = Object.freeze([100, 250, 500])

export const createReporteSasFilters = () =>
  Object.fromEntries(
    reporteSasColumns.map(({ field }) => [
      field,
      { value: null, matchMode: FilterMatchMode.CONTAINS },
    ])
  )

const totalWidth = reporteSasColumns.reduce(
  (total, column) => total + Number.parseInt(column.width, 10),
  0
)

export const reporteSasTableStyle = Object.freeze({
  width: `${totalWidth}px`,
  minWidth: `${totalWidth}px`,
  tableLayout: 'fixed',
})
