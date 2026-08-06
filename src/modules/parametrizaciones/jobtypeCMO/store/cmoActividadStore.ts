import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import type {
  ActividadAutocomplete,
  ActividadCmoResponse,
  CmoAutocomplete,
  NuevaRelacion,
  RelCmoActividad,
  StoreState,
} from './types'

const apiUrl = (path: string) => `${window.location.origin}${path}`
const requestOptions: RequestInit = { credentials: 'include' }

/**
 * Store del módulo Configuración CMO-Actividad.
 *
 * No usa persistencia (el dataset es grande ~9000+ registros).
 * Se limpia con clearStore() al salir de la pantalla (onUnmounted en la vista raíz).
 */
export const useCmoActividadStore = defineStore('cmoActividad', {
  state: (): StoreState => ({
    rows: [],
    selectedRow: null,
    loading: false,
    error: null,
  }),

  actions: {
    // ─── Consulta principal ──────────────────────────────────────────

    async fetchData(): Promise<void> {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        const { data, error } = await useFetch(
          apiUrl('/pc/configuraCmoActividad/getRelsCmoActividad.html'),
          requestOptions
        ).json<RelCmoActividad[]>()

        if (error.value) throw error.value
        this.rows = data.value ?? []
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Error al obtener relaciones'
        this.rows = []
      } finally {
        this.loading = false
      }
    },

    // ─── Autocomplete ────────────────────────────────────────────────

    async searchActividad(phrase: string): Promise<ActividadAutocomplete[]> {
      const { data, error } = await useFetch(
        apiUrl(`/pc/configuraCmoActividad/getActividad/${encodeURIComponent(phrase)}.html`),
        requestOptions
      ).json<ActividadAutocomplete[]>()

      if (error.value) throw error.value
      return data.value ?? []
    },

    async searchCmo(phrase: string): Promise<CmoAutocomplete[]> {
      const { data, error } = await useFetch(
        apiUrl(`/pc/configuraCmoActividad/getCmo/${encodeURIComponent(phrase)}.html`),
        requestOptions
      ).json<CmoAutocomplete[]>()

      if (error.value) throw error.value
      return data.value ?? []
    },

    // ─── Mutaciones ───────────────────────────────────────────────────

    async crearRelaciones(relaciones: NuevaRelacion[]): Promise<ActividadCmoResponse[]> {
      const body = new URLSearchParams()
      body.append('nuevasRelaciones', JSON.stringify(relaciones))

      const { data, error } = await useFetch(
        apiUrl('/pc/configuraCmoActividad/nuevaRelActividadCmo.html'),
        {
          ...requestOptions,
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }
      ).json<ActividadCmoResponse[]>()

      if (error.value) throw error.value

      const responses = data.value ?? []

      if (responses.length === 0) {
        await this.fetchData()
      }

      return responses
    },

    async modificarRelacion(
      actividadManoObraId: number,
      nuevoIdCmo: number
    ): Promise<ActividadCmoResponse | null> {
      const { data, error } = await useFetch(
        apiUrl(`/pc/configuraCmoActividad/modRelActividadCmo.html?Actividad=${actividadManoObraId}&CMO=${nuevoIdCmo}`),
        requestOptions
      ).json<ActividadCmoResponse>()

      if (error.value) throw error.value

      const response = data.value ?? null

      if (!response?.mensaje) {
        await this.fetchData()
      }

      return response
    },

    async desactivarRelacion(actividadManoObraId: number): Promise<void> {
      const body = new URLSearchParams()
      body.append('idRelacion', String(actividadManoObraId))

      const { error } = await useFetch(
        apiUrl('/pc/configuraCmoActividad/desactivarRelCmoActividad.html'),
        {
          ...requestOptions,
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }
      ).json()

      if (error.value) throw error.value

      await this.fetchData()
    },

    // ─── Selección y limpieza ─────────────────────────────────────────

    setSelectedRow(row: RelCmoActividad | null): void {
      this.selectedRow = row
    },

    clearStore(): void {
      this.$reset()
    },
  },
})
