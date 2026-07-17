export interface Filters {
    nroOT: string
    fechaCierreOTDesde: Date | null
    fechaCierreOTHasta: Date | null
    contratista: string
    descripcionError: string
    excluida: string
    pais: string
}
export interface Row {
    id: number
    nroOrdenTrabajo: string
    fechaCierre: string
    tareaCodigo: string
    direccion: string
    ciudad: string
    provincia: string
    region: string
    pais: string
    contratista: string
    tecnicoCierre: string
    actividades: string
    sistemaOrigen: string
    errorDescripcion: string
    excluida: string
    motivoExclusion: string
    nota: string
    tieneNota: string
    incluirExp: string
    incluir: string
}

export interface StoreState {
  activeTab: string[]  
  filters: Filters
  rows: Row[]
  selectedRows: number[]
  rowId: number | null
  loading: boolean
}
export interface ActionResponse {
    status: boolean
    respuesta: string
}

export const emptyFilters = (): Filters => ({
  nroOT: '',
  fechaCierreOTDesde: null,
  fechaCierreOTHasta: null,
  contratista: '',
  descripcionError: '',
  excluida: '',
  pais: '',
})

export interface ExcluirRequest {
  idOts: string[]
	nota: string | null
	motivoNombreCorto: string
}
