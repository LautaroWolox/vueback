export interface ColumnDef {
  field: string
  header: string
  width: string
  hidden?: boolean
  exportable?: boolean
  filter?: boolean
  sort?: boolean
}

/** Columnas de la grilla principal de Jobtype-Contrato */
export const JOBTYPE_CONTRATO_COLUMNS: ColumnDef[] = [
  { field: 'tareaContratoId', header: '',                    width: '0',      hidden: true,  exportable: false, filter: false, sort: false },
  { field: 'tareaId',         header: '',                    width: '0',      hidden: true,  exportable: false, filter: false, sort: false },
  { field: 'contratoTipoId',  header: '',                    width: '0',      hidden: true,  exportable: false, filter: false, sort: false },
  { field: 'tareaCodigo',     header: 'CODIGO_TAREA',        width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'tareaNombre',     header: 'TAREA',               width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'contratoNombre',  header: 'NOMBRE_CONTRATO',     width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'legajoModificacion', header: 'USUARIO_MODIFICACION', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'fechaModificacion',  header: 'FECHA_MODIFICACION',  width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'activo',          header: 'ACTIVO',              width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'pais',            header: 'PAIS',                width: '14.28%', exportable: true, filter: true, sort: true }
]

/** Columnas del grid de preview en el dialog de alta */
export const ALTA_PREVIEW_COLUMNS: ColumnDef[] = [
  { field: 'relCodigoTarea', header: 'CODIGO_TAREA',    width: '20%' },
  { field: 'relTarea',       header: 'TAREA',           width: '25%' },
  { field: 'relContrato',    header: 'NOMBRE_CONTRATO', width: '30%' },
  { field: 'paisLabel',      header: 'PAIS',            width: '25%' }
]

export const PAIS_OPTIONS = [
  { label: '',       value: '' },
  { label: 'ARG/UY', value: '1' },
  { label: 'PY',     value: '2' }
] as const

export const ROWS_OPTIONS = [100, 250, 500] as const
export const ALTA_ROWS_OPTIONS = [10] as const
