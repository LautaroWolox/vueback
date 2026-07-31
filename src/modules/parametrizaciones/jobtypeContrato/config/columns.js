/** Columnas de la grilla principal de Jobtype-Contrato */
export const JOBTYPE_CONTRATO_COLUMNS = [
  { field: 'tareaContratoId',    header: '',                     width: '0',     hidden: true,  exportable: false, filter: false, sort: false },
  { field: 'tareaId',            header: '',                     width: '0',     hidden: true,  exportable: false, filter: false, sort: false },
  { field: 'contratoTipoId',     header: '',                     width: '0',     hidden: true,  exportable: false, filter: false, sort: false },
  { field: 'tareaCodigo',        header: 'CODIGO_TAREA',         width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'tareaNombre',        header: 'TAREA',                width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'origen',             header: 'ORIGEN',               width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'contratoNombre',     header: 'NOMBRE_CONTRATO',      width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'legajoModificacion', header: 'USUARIO_MODIFICACION', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'fechaModificacion',  header: 'FECHA_MODIFICACION',   width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'activo',             header: 'ACTIVO',               width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'pais',               header: 'PAIS',                 width: '12.5%', exportable: true, filter: true, sort: true }
]

export const PAIS_OPTIONS = [
  { label: '',       value: '' },
  { label: 'ARG/UY', value: '1' },
  { label: 'PY',     value: '2' }
]

export const ROWS_OPTIONS = [100, 250, 500]
export const ALTA_ROWS_OPTIONS = [10]
