import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface JobTypeContratoRow {
  tareaContratoId: number
  tareaCodigo: string
  tareaNombre: string
  contratoNombre: string
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

export const useJobtypeContratoStore = defineStore('jobtypeContrato', () => {
  const relaciones = ref<JobTypeContratoRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRelaciones = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/pc/jobtypeContrato/getJobTypes.html')

      if (!response.ok) throw new Error('Error de conexión. Contacte al administrador')

      const data: JobTypeContratoRow[] = await response.json()
      relaciones.value = data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error de conexión. Contacte al administrador'
      throw e
    } finally {
      loading.value = false
    }
  }

  const crearRelaciones = async (nuevas: NuevaRelacion[]): Promise<JobTypeContratoError[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/pc/jobtypeContrato/nuevaRelJobtypeContrato.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ nuevasRelaciones: JSON.stringify(nuevas) })
      })

      if (!response.ok) throw new Error('Error de conexión. Contacte al administrador')

      const errores: JobTypeContratoError[] = await response.json()
      return errores
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error de conexión. Contacte al administrador'
      throw e
    } finally {
      loading.value = false
    }
  }

  const actualizarRelacion = async (
    tareaContratoId: number,
    tipoContratoId: number
  ): Promise<JobTypeContratoRow> => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        tareaContratoId: String(tareaContratoId),
        tipoContratoId: String(tipoContratoId)
      })

      const response = await fetch(`/pc/jobtypeContrato/actualizarJobtype.html?${params}`)

      if (!response.ok) throw new Error('Error de conexión. Contacte al administrador')

      const data: JobTypeContratoRow = await response.json()
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error de conexión. Contacte al administrador'
      throw e
    } finally {
      loading.value = false
    }
  }

  const desactivarRelacion = async (idRelacion: number): Promise<JobTypeContratoRow> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/pc/jobtypeContrato/desactivarRelJobContrato.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ idRelacion: String(idRelacion) })
      })

      if (!response.ok) throw new Error('Error de conexión. Contacte al administrador')

      const data: JobTypeContratoRow = await response.json()
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error de conexión. Contacte al administrador'
      throw e
    } finally {
      loading.value = false
    }
  }

  const buscarJobtypes = async (phrase: string, pais: string): Promise<AutocompleteItem[]> => {
    if (phrase.length <= 3) return []

    try {
      const response = await fetch(`/pc/jobtypeContrato/getJobTypeTarea/${encodeURIComponent(phrase)}/${encodeURIComponent(pais)}.html`)

      if (!response.ok) return []

      return await response.json()
    } catch {
      return []
    }
  }

  const buscarContratos = async (phrase: string): Promise<ContratoItem[]> => {
    if (phrase.length <= 3) return []

    try {
      const response = await fetch(`/pc/jobtypeContrato/getContrato/${encodeURIComponent(phrase)}.html`)

      if (!response.ok) return []

      return await response.json()
    } catch {
      return []
    }
  }

  return {
    relaciones,
    loading,
    error,
    fetchRelaciones,
    crearRelaciones,
    actualizarRelacion,
    desactivarRelacion,
    buscarJobtypes,
    buscarContratos
  }
})
