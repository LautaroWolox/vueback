import { defineStore } from 'pinia'

const waitForLoader = (ms = 450) => new Promise((resolve) => window.setTimeout(resolve, ms))

const endpoints = {
  search: import.meta.env.VITE_JOBTYPE_CONTRATO_SEARCH_URL || '/pc/jobtypeContrato/search.html',
  create: import.meta.env.VITE_JOBTYPE_CONTRATO_CREATE_URL || '/pc/jobtypeContrato/relacionar.html',
  update: import.meta.env.VITE_JOBTYPE_CONTRATO_UPDATE_URL || '/pc/jobtypeContrato/actualizar.html',
  deactivate: import.meta.env.VITE_JOBTYPE_CONTRATO_DEACTIVATE_URL || '/pc/jobtypeContrato/desactivar.html'
}

// La pantalla de referencia front-vue-ocp trabaja con datos simulados.
// Cuando exista una API JSON real, configurar VITE_JOBTYPE_CONTRATO_USE_MOCK=false
// junto con las cuatro URLs VITE_JOBTYPE_CONTRATO_*.
const useMock = import.meta.env.VITE_JOBTYPE_CONTRATO_USE_MOCK !== 'false'

const baseRows = [
  { id: 1, codigoTarea: 'SHDA0', tarea: 'SMB - ALTAS HFC', origen: 'FAN', nombreContrato: 'Materiales', usuarioModificacion: 'z002456', fechaModificacion: '19/06/2026 17:30', activo: 'N', pais: 'ARG/UY' },
  { id: 2, codigoTarea: 'SAMAW', tarea: 'DOM - TRIAL SAM AMAZON WEB SERVICE', origen: 'MXM', nombreContrato: 'Eventos', usuarioModificacion: 'u573795', fechaModificacion: '22/07/2025 11:09', activo: 'S', pais: 'ARG/UY' },
  { id: 3, codigoTarea: 'RTMPI', tarea: 'RED - MPI - Tarea General de MPI', origen: 'FAN', nombreContrato: 'Eventos', usuarioModificacion: 'u573795', fechaModificacion: '22/07/2025 11:09', activo: 'S', pais: 'ARG/UY' },
  { id: 4, codigoTarea: 'RTHFC', tarea: 'RED - HFC - Tarea General de Redes', origen: 'MXM', nombreContrato: 'Eventos', usuarioModificacion: 'u573795', fechaModificacion: '22/07/2025 11:09', activo: 'S', pais: 'ARG/UY' },
  { id: 5, codigoTarea: 'RSRUN', tarea: 'DRC - SRE REPARAR DEGRADACION POR ENCIMA DEL UMBRAL', origen: 'FAN', nombreContrato: 'Materiales', usuarioModificacion: 'z002456', fechaModificacion: '13/12/2024 13:04', activo: 'S', pais: 'ARG/UY' },
  { id: 6, codigoTarea: 'RSRRN', tarea: 'RED - SERVICE REVERSA', origen: 'MXM', nombreContrato: 'Eventos', usuarioModificacion: 'u573795', fechaModificacion: '22/07/2025 11:09', activo: 'S', pais: 'ARG/UY' },
  { id: 7, codigoTarea: 'RSRNN', tarea: 'DRC - SRE REPARAR PROBLEMA DE NIVELES', origen: 'FAN', nombreContrato: 'BBI Siniestros', usuarioModificacion: 'z002456', fechaModificacion: '15/12/2025 14:31', activo: 'S', pais: 'ARG/UY' },
  { id: 8, codigoTarea: 'RSRIN', tarea: 'DRC - SRE REPARAR DEGRADACION DE SENAL INTERMITENTE', origen: 'MXM', nombreContrato: 'BBI Siniestros', usuarioModificacion: 'z002456', fechaModificacion: '15/12/2025 14:31', activo: 'S', pais: 'ARG/UY' },
  { id: 9, codigoTarea: 'RSRCN', tarea: 'RED - SERVICE DE RED CLIENTE', origen: 'FAN', nombreContrato: 'Eventos', usuarioModificacion: 'z002456', fechaModificacion: '22/07/2025 11:09', activo: 'S', pais: 'ARG/UY' },
  { id: 10, codigoTarea: 'RSDRN', tarea: 'RED - SRC DEGRADACION REITERADA', origen: 'MXM', nombreContrato: 'Materiales', usuarioModificacion: 'u573795', fechaModificacion: '22/07/2025 11:09', activo: 'S', pais: 'ARG/UY' },
  { id: 11, codigoTarea: 'BMDES', tarea: 'BAJA MATERIAL DESCARGADO', origen: 'FAN', nombreContrato: 'Materiales', usuarioModificacion: 'z002456', fechaModificacion: '03/03/2026 09:20', activo: 'S', pais: 'PY' },
  { id: 12, codigoTarea: 'EVTCL', tarea: 'EVENTO CLIENTE - CONTROL DE CIERRE', origen: 'MXM', nombreContrato: 'Eventos', usuarioModificacion: 'u573795', fechaModificacion: '12/04/2026 12:45', activo: 'S', pais: 'ARG/UY' }
]

let mockRows = baseRows.map((row) => ({ ...row }))

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

const nowLabel = () => new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(new Date()).replace(',', '')

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload ?? {})
  })

  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const trimmed = text.trim()

  if (!response.ok) {
    throw new Error(`El servicio Jobtype-Contrato respondió HTTP ${response.status}.`)
  }

  if (contentType.includes('text/html') || trimmed.startsWith('<')) {
    throw new Error('El servicio Jobtype-Contrato devolvió una página HTML en lugar de JSON. Revisá la URL o la sesión del backend.')
  }

  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    throw new Error('El servicio Jobtype-Contrato devolvió una respuesta que no es JSON válido.')
  }
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
        if (useMock) {
          await waitForLoader()
          this.rows = mockRows.map((row) => ({ ...row }))
          return this.rows
        }

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
        if (useMock) {
          await waitForLoader(250)
          const createdRows = relations.map((relation, index) => normalizeRow({
            ...relation,
            id: `${Date.now()}-${index}`,
            usuarioModificacion: 'usuario.prueba',
            fechaModificacion: nowLabel(),
            activo: 'S'
          }, mockRows.length + index))

          mockRows = [...mockRows, ...createdRows]
          return { status: true, rows: createdRows }
        }

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
        if (useMock) {
          await waitForLoader(250)
          const rowId = payload?.id
          const codigoTarea = payload?.codigoTarea

          mockRows = mockRows.map((row) => {
            const matches = rowId != null ? row.id === rowId : row.codigoTarea === codigoTarea
            if (!matches) return row

            return {
              ...row,
              nombreContrato: payload?.contratoNuevo || payload?.contratoActual || row.nombreContrato,
              origen: payload?.origen || row.origen,
              pais: payload?.pais || row.pais,
              usuarioModificacion: 'usuario.prueba',
              fechaModificacion: nowLabel()
            }
          })

          return { status: true }
        }

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
        if (useMock) {
          await waitForLoader(250)
          const rowId = payload?.id
          const codigoTarea = payload?.codigoTarea

          mockRows = mockRows.map((row) => {
            const matches = rowId != null ? row.id === rowId : row.codigoTarea === codigoTarea
            return matches
              ? {
                  ...row,
                  activo: 'N',
                  usuarioModificacion: 'usuario.prueba',
                  fechaModificacion: nowLabel()
                }
              : row
          })

          return { status: true }
        }

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