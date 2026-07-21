import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'

const endpoints = {
  search: import.meta.env.VITE_JOBTYPE_CONTRATO_SEARCH_URL || '/pc/jobtypeContrato/search.html',
  create: import.meta.env.VITE_JOBTYPE_CONTRATO_CREATE_URL || '/pc/jobtypeContrato/relacionar.html',
  update: import.meta.env.VITE_JOBTYPE_CONTRATO_UPDATE_URL || '/pc/jobtypeContrato/actualizar.html',
  deactivate: import.meta.env.VITE_JOBTYPE_CONTRATO_DEACTIVATE_URL || '/pc/jobtypeContrato/desactivar.html'
}

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.rows)) return payload.rows
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.resultados)) return payload.resultados
  if (Array.isArray(payload?.resultado)) return payload.resultado
  return []
}

const normalizeRow = (row, index) => ({
  ...row,
  id: row?.id ?? row?.idRelacion ?? row?.codigoTarea ?? `${index}-${row?.tarea ?? ''}`,
  codigoTarea: row?.codigoTarea ?? row?.codigo_tarea ?? row?.jobtype ?? '',
  tarea: row?.tarea ?? row?.descripcionTarea ?? row?.descripcion ?? '',
  origen: row?.origen ?? '',
  nombreContrato: row?.nombreContrato ?? row?.nombre_contrato ?? row?.contrato ?? '',
  usuarioModificacion: row?.usuarioModificacion ?? row?.usuario_modificacion ?? '',
  fechaModificacion: row?.fechaModificacion ?? row?.fecha_modificacion ?? '',
  activo: row?.activo ?? '',
  pais: row?.pais ?? ''
})

const postJson = async (url, payload) => {
  const { data, error, response } = await useFetch(url).post(payload).json()

  if (error.value) {
    throw new Error(String(error.value))
  }

  if (response.value && !response.value.ok) {
    throw new Error(`Error ${response.value.status}`)
  }

  return data.value
}

export const useJobtypeContratoStore = defineStore('jobtypeContrato', {
  state: () => ({
    loading: false,
    searched: false,
    rows: [],
    selectedRow: null,
    errorMessage: ''
  }),

  getters: {
    hasSelection: (state) => Boolean(state.selectedRow)
  },

  actions: {
    async search() {
      this.loading = true
      this.searched = true
      this.selectedRow = null
      this.errorMessage = ''

      try {
        const payload = await postJson(endpoints.search, {})
        this.rows = extractRows(payload).map(normalizeRow)
        return this.rows
      } catch (error) {
        this.rows = []
        this.errorMessage = error?.message || 'No se pudieron consultar las relaciones Jobtype-Contrato.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRelations(relations) {
      this.loading = true
      this.errorMessage = ''

      try {
        return await postJson(endpoints.create, relations)
      } catch (error) {
        this.errorMessage = error?.message || 'No se pudieron crear las relaciones Jobtype-Contrato.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRelation(payload) {
      this.loading = true
      this.errorMessage = ''

      try {
        return await postJson(endpoints.update, payload)
      } catch (error) {
        this.errorMessage = error?.message || 'No se pudo actualizar la relación Jobtype-Contrato.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deactivateRelation(payload) {
      this.loading = true
      this.errorMessage = ''

      try {
        return await postJson(endpoints.deactivate, payload)
      } catch (error) {
        this.errorMessage = error?.message || 'No se pudo desactivar la relación Jobtype-Contrato.'
        throw error
      } finally {
        this.loading = false
      }
    },

    setSelectedRow(row) {
      this.selectedRow = row || null
    },

    clearSelection() {
      this.selectedRow = null
    },

    clearError() {
      this.errorMessage = ''
    }
  }
})
