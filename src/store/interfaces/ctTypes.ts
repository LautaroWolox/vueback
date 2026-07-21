export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface Contratista {
    empresaId: number
	codigo: string
	nombre: string
	tipo: string
	activo: string
}

export interface ActividadMotivo {
    id: number
	nombre: string
	nombreCorto: string
	activo: string
}


export interface StoreState {
    contratistas: Contratista[] | null
    motivos: ActividadMotivo[] | null
    status: {
        contratistas: LoadStatus
        motivos: LoadStatus
    }
}