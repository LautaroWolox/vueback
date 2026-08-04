/**
 * Definición de columnas para la grilla principal de CMO-Actividad.
 * Las columnas corresponden a los campos de RelCmoActividad del backend.
 */

export const mainColumns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '14.285%' },
  { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '14.285%' },
  { field: 'codigoS4', header: 'CODIGO_S4', width: '14.285%' },
  { field: 'cmo', header: 'CMO', width: '14.285%' },
  { field: 'usuarioModificacion', header: 'USUARIO_MODIFICACION', width: '14.285%' },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '14.285%' },
  { field: 'activo', header: 'ACTIVO', width: '14.29%' },
] as const

/**
 * Columnas de la grilla preview dentro del Dialog de Alta.
 */
export const altaPreviewColumns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '25%' },
  { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '25%' },
  { field: 'codigoS4', header: 'CODIGO_S4', width: '25%' },
  { field: 'cmo', header: 'CMO', width: '25%' },
] as const
