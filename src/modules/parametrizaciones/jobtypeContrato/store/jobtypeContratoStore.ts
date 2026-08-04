import { defineStore } from 'pinia'
import { ref } from 'vue'

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

const DEFAULT_ERROR = 'Error de conexión. Contacte al administrador'

export const useJobtypeContratoStore = defineStore('jobtypeContrato', () => {
  const relaciones = ref<JobTypeContratoRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const clearError = () => { error.value = null }

  const withLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      return await operation()
    } catch (exception: unknown) {
      error.value = exception instanceof Error ? exception.message : DEFAULT_ERROR
      throw exception
    } finally {
      loading.value = false
    }
  }

  const fetchRelaciones = (): Promise<void> => withLoading(async () => {
    const response = await fetch('/pc/jobtypeContrato/getJobTypes.html')
    if (!response.ok) throw new Error(DEFAULT_ERROR)
    relaciones.value = await response.json()
  })

  const crearRelaciones = (nuevas: NuevaRelacion[]): Promise<JobTypeContratoError[]> => withLoading(async () => {
    const response = await fetch('/pc/jobtypeContrato/nuevaRelJobtypeContrato.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ nuevasRelaciones: JSON.stringify(nuevas) })
    })
    if (!response.ok) throw new Error(DEFAULT_ERROR)
    return await response.json()
  })

  const actualizarRelacion = (
    tareaContratoId: number,
    tipoContratoId: number,
    origen: string
  ): Promise<JobTypeContratoRow> => withLoading(async () => {
    const params = new URLSearchParams({
      tareaContratoId: String(tareaContratoId),
      tipoContratoId: String(tipoContratoId),
      origen
    })
    const response = await fetch(`/pc/jobtypeContrato/actualizarJobtype.html?${params}`)
    if (!response.ok) throw new Error(DEFAULT_ERROR)
    return await response.json()
  })

  const desactivarRelacion = (idRelacion: number): Promise<JobTypeContratoRow> => withLoading(async () => {
    const response = await fetch('/pc/jobtypeContrato/desactivarRelJobContrato.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ idRelacion: String(idRelacion) })
    })
    if (!response.ok) throw new Error(DEFAULT_ERROR)
    return await response.json()
  })

  const buscarJobtypes = async (phrase: string, pais: string): Promise<AutocompleteItem[]> => {
    if (phrase.length <= 3) return []
    try {
      const response = await fetch(`/pc/jobtypeContrato/getJobTypeTarea/${encodeURIComponent(phrase)}/${encodeURIComponent(pais)}.html`)
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  const buscarContratos = async (phrase: string): Promise<ContratoItem[]> => {
    if (phrase.length <= 3) return []
    try {
      const response = await fetch(`/pc/jobtypeContrato/getContrato/${encodeURIComponent(phrase)}.html`)
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  return {
    relaciones,
    loading,
    error,
    clearError,
    fetchRelaciones,
    crearRelaciones,
    actualizarRelacion,
    desactivarRelacion,
    buscarJobtypes,
    buscarContratos
  }
})
