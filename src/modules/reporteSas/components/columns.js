import { FilterMatchMode } from '@primevue/core/api'

/**
 * Contrato visual fijo de Reporte SAS.
 *
 * La grilla no debe crear, ocultar ni reordenar columnas según las claves
 * devueltas por el backend. Las 22 columnas se muestran siempre y en este
 * orden.
 */
export const reporteSasColumns = Object.freeze([
  { field: 'nroOT', header: 'N° OT', width: '125px', exportable: true , exportHeader: "NRO_OT"},
  { field: 'estadoOT', header: 'Estado', width: '110px', exportable: true , exportHeader: "ESTADO_OT"},
  { field: 'gestionada', header: 'Gestionada', width: '105px', exportable: true , exportHeader: "GESTIONADA"},
  { field: 'codTarea', header: 'Código Tarea', width: '120px', exportable: true , exportHeader: "CODIGO_TAREA"},
  { field: 'localidad', header: 'Localidad', width: '145px', exportable: true , exportHeader: "LOCALIDAD"},
  { field: 'codPostal', header: 'Código Postal', width: '115px', exportable: true , exportHeader: "CODIGO_POSTAL"},
  {
    field: 'legajoOperadorDescarga',
    header: 'Legajo Operador Descarga',
    width: '165px',
    exportable: true,
   exportHeader: "LEGAJO_OPERADOR_DESCARGA"
  },
  {
    field: 'nomApeOperadorDescarga',
    header: 'Nombre Operador Descarga',
    width: '210px',
    exportable: true,
    exportHeader: "NOMBRE_APELLIDO_OPERADOR_DESCA"
  },
  { field: 'fechaDescarga', header: 'Fecha Descarga', width: '155px', exportable: true , exportHeader: "FECHA_DESCARGA"},
  { field: 'legajoCierreOT', header: 'Legajo Cierre OT', width: '145px', exportable: true , exportHeader: "LEGAJO_CIERRE_OT"},
  {
    field: 'nomApeCierreOT',
    header: 'Nombre Operador Cierre OT',
    width: '205px',
    exportable: true,
    exportHeader: "NOMBRE_APELLIDO_CIERRE_OT"
  },
  {
    field: 'legajoNOLDAP',
    header: 'Legajo NOLDAP',
    width: '260px',
    exportable: true,
    type: 'legajoList',
    exportHeader: "LEGAJO_NOLDAP"
  },
  { field: 'fechaCierreOT', header: 'Fecha Cierre OT', width: '155px', exportable: true , exportHeader: "FECHA_CIERRE_OT"},
  { field: 'centro', header: 'Centro', width: '100px', exportable: true , exportHeader: "CENTRO"},
  { field: 'almacen', header: 'Almacén', width: '105px', exportable: true , exportHeader: "ALMACEN"},
  {
    field: 'serialCodMaterial',
    header: 'Serial Material',
    width: '175px',
    exportable: true,
    exportHeader: "SERIAL_COD_MATERIAL"
  },
  { field: 'descMaterial', header: 'Material', width: '220px', exportable: true , exportHeader: "DESC_MATERIAL"},
  { field: 'cantidadMaterial', header: 'Cantidad', width: '105px', exportable: true , exportHeader: "CANTIDAD_MATERIAL"},
  { field: 'tipoDescarga', header: 'Tipo Descarga', width: '130px', exportable: true , exportHeader: "TIPO_DESCARGA"},
  { field: 'mensajeSAP', header: 'Mensaje SAP', width: '240px', exportable: true , exportHeader: "MENSAJE_SAP"},
  {
    field: 'fechaNotificacionSAP',
    header: 'Fecha Notificación SAP',
    width: '175px',
    exportable: true,
    exportHeader: "FECHA_NOTIFICACION_SAP"
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
