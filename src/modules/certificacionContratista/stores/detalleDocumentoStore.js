import { defineStore } from 'pinia'
import {
  buscarBaseInstalada,
  buscarMaterialesOt,
  buscarOtsFallidas,
  calificarActa,
  cargarDetalleDocumento,
  cargarDetalleOt,
  cargarHistorialDomicilio,
  cargarMotivos,
  cargarOtsExportacion,
  certificarActa,
  cerrarNota,
  crearActividad,
  ejecutarTraspaso,
  excluirOts,
  filtrarOtsActa,
  guardarActividadesResultantes,
  incluirOt,
  modificarActividadesRed,
  persistirSiniestros,
  validarActividadesNota,
  validarCalificarCertificar,
  validarReglas,
  validarTraspaso,
  verificarOtRedNotaDebito
} from '../api/certificacionApi'
import { DETAIL_TYPE_CONFIG } from '../config/documentos'

const normalizeRows = (response) => {
  if (Array.isArray(response)) return response
  return response?.elements ?? response?.content ?? response?.data ?? []
}

export const useDetalleDocumentoStore = defineStore('certificacionDetalleDocumento', {
  state: () => ({
    type: 'acta',
    number: '',
    header: null,
    rows: [],
    selectedRows: [],
    reasons: [],
    loading: false,
    actionLoading: false,
    error: '',
    message: '',
    expanded: {},
    detailByOt: {},
    detailLoadingByOt: {},
    filters: {
      nroOt: '',
      flujoReglas: '',
      excluida: ''
    }
  }),

  getters: {
    config: (state) => DETAIL_TYPE_CONFIG[state.type] ?? DETAIL_TYPE_CONFIG.acta,
    title() {
      return `${this.config.label} N.º ${this.number}`
    },
    selectedOtNumbers: (state) => state.selectedRows
      .map((row) => row.numeroOT ?? row.nroOT)
      .filter(Boolean)
  },

  actions: {
    configure(type, number) {
      if (!DETAIL_TYPE_CONFIG[type]) throw new Error(`Detalle no soportado: ${type}`)
      const changed = this.type !== type || this.number !== String(number ?? '')
      this.type = type
      this.number = String(number ?? '')
      if (changed) this.clearData()
    },

    async load() {
      this.loading = true
      this.error = ''
      try {
        const response = await cargarDetalleDocumento(this.config, this.number)
        this.header = response?.actaDetalleAdapter ?? response?.detalle ?? response?.header ?? null
        this.rows = normalizeRows(response?.listaOt ?? response?.ots ?? response)
        this.selectedRows = []
        await this.loadReasons()
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : 'No fue posible cargar el detalle.'
      } finally {
        this.loading = false
      }
    },

    async loadReasons() {
      try {
        const reasons = await cargarMotivos(this.config)
        this.reasons = Array.isArray(reasons) ? reasons : []
      } catch {
        this.reasons = []
      }
    },

    async filter() {
      this.loading = true
      this.error = ''
      try {
        const response = await filtrarOtsActa(this.config, {
          nroActa: this.number,
          nroOt: this.filters.nroOt,
          flujoReglas: this.filters.flujoReglas,
          excluida: this.filters.excluida,
          page: 0,
          size: 500
        })
        this.rows = normalizeRows(response)
        this.selectedRows = []
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : 'No fue posible filtrar las OTs.'
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      this.filters = { nroOt: '', flujoReglas: '', excluida: '' }
      return this.load()
    },

    async exclude({ note, reason, modifyHistory }) {
      if (!this.selectedOtNumbers.length) throw new Error('Seleccioná al menos una OT.')
      return this.runAction(async () => {
        await excluirOts(this.config, {
          nroOts: this.selectedOtNumbers,
          nota: String(note ?? '').slice(0, 200),
          modificarHistorico: Boolean(modifyHistory),
          motivoNombreCorto: reason
        })
        await this.load()
      }, 'Las OTs fueron excluidas correctamente.')
    },

    async include({ nroOT, note, reason, modifyHistory, reset }) {
      return this.runAction(async () => {
        await incluirOt(this.config, {
          nroOT,
          nota: String(note ?? '').slice(0, 200),
          motivoNombreCorto: reason,
          modificarHistorico: Boolean(modifyHistory),
          reseteo: Boolean(reset)
        })
        await this.load()
      }, 'La OT fue incluida correctamente.')
    },

    async validateRuleNumbers(numbers) {
      const normalized = [...new Set((numbers ?? []).map(String).filter(Boolean))]
      if (!normalized.length) throw new Error('Seleccioná al menos una OT.')
      return this.runAction(async () => {
        await validarReglas(this.config, normalized, this.number)
        await this.load()
      }, 'La validación de reglas finalizó correctamente.')
    },

    validateRules() {
      return this.validateRuleNumbers(this.selectedOtNumbers)
    },

    async validateActivityNumbers(numbers) {
      const normalized = [...new Set((numbers ?? []).map(String).filter(Boolean))]
      if (!normalized.length) throw new Error('Seleccioná al menos una OT.')
      return this.runAction(async () => {
        await validarActividadesNota(this.config, this.number, normalized)
        await this.load()
      }, 'Las actividades fueron validadas correctamente.')
    },

    validateActivities() {
      return this.validateActivityNumbers(this.selectedOtNumbers)
    },

    async verifyNetwork(row) {
      if (this.config.documentType !== 'NOTA_DEBITO') {
        throw new Error('La verificación de redes sólo corresponde a notas de débito.')
      }
      const ot = row?.numeroOT ?? row?.nroOT
      if (!ot) throw new Error('La OT seleccionada no tiene número.')
      return this.runAction(async () => {
        await verificarOtRedNotaDebito(ot, this.number)
        await this.loadOtDetail(row, { force: true })
        await this.load()
      }, `La OT ${ot} fue verificada correctamente.`)
    },

    async closeDocument() {
      return this.runAction(async () => {
        await cerrarNota(this.config, this.number)
        await this.load()
      }, `${this.config.label} cerrada correctamente.`)
    },

    async certify() {
      return this.runAction(async () => {
        const allowed = await validarCalificarCertificar(this.number)
        if (allowed === false || String(allowed).toLowerCase() === 'false') {
          throw new Error('El acta todavía no cumple las condiciones requeridas para certificarse.')
        }
        const failed = await buscarOtsFallidas(this.config, this.number)
        const hasFailed = String(failed ?? '').toLowerCase() === 'true'
        if (hasFailed) throw new Error('El acta posee OTs fallidas pendientes y no puede certificarse.')
        await certificarActa(this.config, this.number)
        await this.load()
      }, 'El acta fue certificada correctamente.')
    },

    async qualify(value) {
      return this.runAction(async () => {
        const allowed = await validarCalificarCertificar(this.number)
        if (allowed === false || String(allowed).toLowerCase() === 'false') {
          throw new Error('El acta todavía no cumple las condiciones requeridas para calificarse.')
        }
        await calificarActa(this.config, this.number, value)
        await this.load()
      }, 'La calificación fue guardada correctamente.')
    },

    async loadOtDetail(row, { force = false } = {}) {
      const ot = row?.numeroOT ?? row?.nroOT
      if (!ot) throw new Error('La OT seleccionada no tiene número.')
      if (!force && this.detailByOt[ot]) return this.detailByOt[ot]

      this.detailLoadingByOt = { ...this.detailLoadingByOt, [ot]: true }
      try {
        const [detail, history, materials, base] = await Promise.allSettled([
          cargarDetalleOt(this.config.documentType, this.number, ot),
          cargarHistorialDomicilio(ot),
          buscarMaterialesOt(this.config.documentType, ot),
          this.config.documentType === 'ACTA' ? buscarBaseInstalada(ot) : Promise.resolve([])
        ])

        const historyValue = history.status === 'fulfilled' ? history.value : null
        const value = {
          ...(detail.status === 'fulfilled' ? detail.value : {}),
          historialDomicilio: Array.isArray(historyValue)
            ? historyValue
            : normalizeRows(historyValue?.historialDomicilio),
          historialDomicilioCompleto: normalizeRows(historyValue?.historialDomicilioCompleto),
          materiales: materials.status === 'fulfilled' ? normalizeRows(materials.value) : [],
          basesInstaladas: base.status === 'fulfilled' ? normalizeRows(base.value) : []
        }
        this.detailByOt = { ...this.detailByOt, [ot]: value }
        return value
      } finally {
        this.detailLoadingByOt = { ...this.detailLoadingByOt, [ot]: false }
      }
    },

    async saveActivities(row, activities) {
      const ot = row?.numeroOT ?? row?.nroOT
      return this.runAction(async () => {
        await guardarActividadesResultantes(this.config.documentType, {
          nroOT: ot,
          reset: false,
          actividadesResultantes: activities,
          esNC: this.config.documentType === 'NOTA_CREDITO',
          esActa: this.config.documentType === 'ACTA'
        })
        await this.loadOtDetail(row, { force: true })
      }, 'Las actividades fueron actualizadas correctamente.')
    },

    async saveRedActivities(row, payload) {
      return this.runAction(async () => {
        await modificarActividadesRed(this.config.documentType, payload)
        await this.loadOtDetail(row, { force: true })
      }, 'Las actividades de red fueron actualizadas correctamente.')
    },

    async createActivity(row, payload) {
      const ot = row?.numeroOT ?? row?.nroOT
      return this.runAction(async () => {
        await crearActividad(this.config.documentType, {
          ...payload,
          nroActa: this.number,
          nroActaDC: this.number,
          nroOt: ot
        })
        await this.loadOtDetail(row, { force: true })
      }, 'La actividad fue agregada correctamente.')
    },

    async saveIncident(row, nroOI, nroEHS) {
      return this.runAction(async () => {
        await persistirSiniestros(this.config.documentType, {
          nroOT: row?.numeroOT ?? row?.nroOT,
          nroOI,
          nroEHS
        })
        await this.load()
      }, 'Los datos de siniestro fueron guardados correctamente.')
    },

    async transfer(payload) {
      return this.runAction(async () => {
        await validarTraspaso(payload)
        await ejecutarTraspaso(payload)
        await this.load()
      }, 'El traspaso fue procesado correctamente.')
    },

    async exportRows(certified = false) {
      return cargarOtsExportacion(this.config, this.number, certified)
    },

    async runAction(callback, successMessage) {
      this.actionLoading = true
      this.error = ''
      this.message = ''
      try {
        const result = await callback()
        this.message = successMessage
        return result
      } catch (cause) {
        this.error = cause instanceof Error ? cause.message : 'La operación no pudo completarse.'
        throw cause
      } finally {
        this.actionLoading = false
      }
    },

    clearData() {
      this.header = null
      this.rows = []
      this.selectedRows = []
      this.expanded = {}
      this.detailByOt = {}
      this.detailLoadingByOt = {}
      this.error = ''
      this.message = ''
      this.filters = { nroOt: '', flujoReglas: '', excluida: '' }
    }
  }
})
