import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  apiActualizarRelacion,
  apiBuscarContratos,
  apiBuscarJobtypes,
  apiCrearRelaciones,
  apiDesactivarRelacion,
  apiGetRelaciones
} from '../api/jobtypeContratoApi'
import type {
  AutocompleteItem,
  ContratoItem,
  JobTypeContratoError,
  JobTypeContratoRow,
  NuevaRelacion
} from '../models/types'

export const useJobtypeContratoStore = defineStore('jobtypeContrato', () => {
  const relaciones = ref<JobTypeContratoRow[]>([])
  const loading    = ref(false)
  const error      = ref<string | null>(null)

  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true
    error.value   = null
    try {
      return await fn()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error de conexión. Contacte al administrador'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchRelaciones = (): Promise<void> =>
    withLoading(async () => {
      relaciones.value = await apiGetRelaciones()
    })

  const crearRelaciones = (nuevas: NuevaRelacion[]): Promise<JobTypeContratoError[]> =>
    withLoading(() => apiCrearRelaciones(nuevas))

  const actualizarRelacion = (
    tareaContratoId: number,
    tipoContratoId: number
  ): Promise<JobTypeContratoRow> =>
    withLoading(() => apiActualizarRelacion(tareaContratoId, tipoContratoId))

  const desactivarRelacion = (idRelacion: number): Promise<JobTypeContratoRow> =>
    withLoading(() => apiDesactivarRelacion(idRelacion))

  const buscarJobtypes = (phrase: string, pais: string): Promise<AutocompleteItem[]> =>
    apiBuscarJobtypes(phrase, pais)

  const buscarContratos = (phrase: string): Promise<ContratoItem[]> =>
    apiBuscarContratos(phrase)

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
