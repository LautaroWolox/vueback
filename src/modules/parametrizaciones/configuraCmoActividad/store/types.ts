/**
 * Interfaces del módulo Configuración CMO-Actividad.
 * Corresponden a los DTOs del backend (RelCmoActividadAdapter, ActividadAdapterRel,
 * ManoObraAdapterRel, ActividadCmoResponseAdapter).
 */

export interface RelCmoActividad {
  actividadManoObraId: number
  codigoActividad: string
  descActividad: string
  codigoS4: string
  cmo: string
  usuarioModificacion: string
  fechaModificacion: string
  activo: string
}

export interface StoreState {
  rows: RelCmoActividad[]
  selectedRow: RelCmoActividad | null
  loading: boolean
  error: string | null
}

export interface ActividadAutocomplete {
  id: number
  codigo: string
  nombre: string
  activo: string
  valor: string // "codigo - nombre" (viene del backend)
}

export interface CmoAutocomplete {
  id: number
  codigoS4: string
  nombre: string
  codigoR3: string
  activo: string
  valor?: string // "codigoS4 - nombre" (viene de getValor() en backend)
}

export interface NuevaRelacion {
  idActividad: number
  idCmo: number
  codigoActividad: string
  descActividad: string
  codigoS4: string
  cmo: string // "codigoS4 - nombre"
}

export interface ActividadCmoResponse {
  mensaje: string
  actividadId: number | null
  manoObraId: number | null
  actividadNombre: string | null
  manoObraNombre: string | null
  actividadCodigo: string | null
  manoObraCodigo: string | null
}
