import { defineStore } from 'pinia'
import {
  buscarDocumentos,
  buscarPeriodos,
  fetchLegacyCatalogs
} from '../api/certificacionApi'
import {
  DOCUMENT_TYPE_CONFIG,
  EMPTY_DOCUMENT_FILTERS
} from '../config/documentos'

const cloneFilters = () => ({ ...EMPTY_DOCUMENT_FILTERS })

export const useConsultaDocumentosStore = defineStore('certificacionConsultaDocumentos', {
  state: () => ({
    type: 'ACTA',
    filters: cloneFilters(),
    catalogs: {
      provincia: [],
      region: [],
      contratista: [],
      sociedad: [],
      tipoContrato: [],
      periodoAnio: [],
      periodoNombre: [],
      estadoActa: []
    },
    rows: [],
    selectedRow: null,
    loading: false,
    catalogsLoading: false,
    searched: false,
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 20,
    error: ''
  }),

  getters: {
    config: (state) => DOCUMENT_TYPE_CONFIG[state.type] ?? DOCUMENT_TYPE_CONFIG.ACTA,
    first: (state) => state.page * state.size,
    last: (state) => Math.min((state.page + 1) * state.size, state.totalElements)
  },

  actions: {
    configure(type) {
      if (!DOCUMENT_TYPE_CONFIG[type]) throw new Error(`Tipo de documento no soportado: ${type}`)
      if (this.type !== type) {
        this.type = type
        this.resetResults()
        this.filters = cloneFilters()
      }
    },

    async loadCatalogs() {
      this.catalogsLoading = true
      this.error = ''
      try {
        const catalogs = await fetchLegacyCatalogs(this.config.legacyPage)
        this.catalogs = { ...this.catalogs, ...catalogs }
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : 'No fue posible cargar los filtros.'
      } finally {
        this.catalogsLoading = false
      }
    },

    async loadPeriods(year) {
      this.filters.periodoNombre = ''
      if (!year) {
        this.catalogs.periodoNombre = []
        return
      }

      try {
        const periods = await buscarPeriodos(this.config, year)
        if (Array.isArray(periods) && periods.length) {
          this.catalogs.periodoNombre = periods.map((period) => ({
            label: period.descripcion ?? period.nombre ?? period.valor ?? String(period),
            value: period.nombreCorto ?? period.codigo ?? period.valor ?? String(period)
          }))
        }
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : 'No fue posible cargar los períodos.'
      }
    },

    async search({ page = 0, size = this.size } = {}) {
      this.loading = true
      this.error = ''
      this.selectedRow = null
      this.page = page
      this.size = size

      try {
        const response = await buscarDocumentos(this.config, {
          ...this.filters,
          page,
          size
        })
        this.rows = response.rows
        this.totalElements = response.totalElements
        this.totalPages = response.totalPages || Math.ceil(response.totalElements / Math.max(size, 1))
        this.page = response.page
        this.size = response.size || size
        this.searched = true
      } catch (cause) {
        this.rows = []
        this.totalElements = 0
        this.totalPages = 0
        this.searched = true
        this.error = cause instanceof Error ? cause.message : 'No fue posible consultar los documentos.'
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      const currentSize = this.size
      this.filters = { ...cloneFilters(), size: currentSize }
      this.catalogs.periodoNombre = this.catalogs.periodoNombre.filter((item) => !item.dynamic)
      this.resetResults()
    },

    select(row) {
      this.selectedRow = row ?? null
    },

    changeRows(rows) {
      return this.search({ page: 0, size: rows })
    },

    changePage(page) {
      return this.search({ page, size: this.size })
    },

    resetResults() {
      this.rows = []
      this.selectedRow = null
      this.searched = false
      this.totalElements = 0
      this.totalPages = 0
      this.page = 0
      this.error = ''
    },

    reset() {
      this.filters = cloneFilters()
      this.resetResults()
    }
  }
})
