export interface JobTypeContratoRow {
  tareaContratoId: number
  tareaCodigo: string
  tareaNombre: string
  contratoNombre: string
  origen?: string
  legajoModificacion: string
  fechaModificacion: string
  activo: string
  pais: string
  tareaId: number
  contratoTipoId: number
}

export interface JobTypeContratoError {
  tareaCodigo: string
  mensaje: string
}

export interface NuevaRelacion {
  relCodigoTarea: string
  relTarea: string
  relContratoId: number
  relContrato: string
  origen: string
  pais: string
}

export interface AutocompleteItem {
  id: number
  codigo: string
  nombre: string
  valor?: string
}

export interface ContratoItem {
  contratoId: number
  nombre: string
  valor?: string
}
