import { defineStore } from 'pinia'

/**
 * Gestión de Actas - única puerta de acceso HTTP del frontend.
 *
 * Contratos backend relevados contra los tags vigentes:
 * - FM: FM-VUE-0.4.1
 * - CT/GCC: CT-VUE-0.1.0
 * - GM: GM-2.7.0-4
 *
 * El navegador consume siempre la fachada /pc de FM. El frontend Vue no
 * consume CT/GCC ni GM de forma directa.
 */
export const GESTION_ACTAS_BACKEND_TAGS = Object.freeze({
  FM: 'FM-VUE-0.4.1',
  CT: 'CT-VUE-0.1.0',
  GM: 'GM-2.7.0-4',
})

export const DOCUMENT_TYPES = Object.freeze({
  ACTA: 'ACTA',
  NOTA_DEBITO: 'NODE',
  NOTA_CREDITO: 'NOCR',
  OT_SIN_ACTA: 'OT_SIN_ACTA',
})

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'
type GenericRecord = Record<string, any>

type CatalogOption = {
  label: string
  value: string
  year?: string
}

type ActasCatalogs = {
  provincia: CatalogOption[]
  contratista: CatalogOption[]
  sociedad: CatalogOption[]
  tipoContrato: CatalogOption[]
  periodoAnio: CatalogOption[]
  periodoNombre: CatalogOption[]
  estadoActa: CatalogOption[]
}

type OtsSinActaCatalogs = {
  region: CatalogOption[]
  contratista: CatalogOption[]
  sociedad: CatalogOption[]
  tipoContrato: CatalogOption[]
}

const emptyActasCatalogs = (): ActasCatalogs => ({
  provincia: [],
  contratista: [],
  sociedad: [],
  tipoContrato: [],
  periodoAnio: [],
  periodoNombre: [],
  estadoActa: [],
})

const emptyOtsSinActaCatalogs = (): OtsSinActaCatalogs => ({
  region: [],
  contratista: [],
  sociedad: [],
  tipoContrato: [],
})

const HTML_CONTENT = /text\/html/i
const JSON_CONTENT = /application\/json/i

const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error)

const ensureOk = async (response: Response, label: string) => {
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`)
  return response
}

const readJsonResponse = async (response: Response, label: string) => {
  await ensureOk(response, label)
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()

  if (HTML_CONTENT.test(contentType) || /^\s*</.test(text)) {
    throw new Error(`${label}: el backend devolvió HTML en lugar de JSON. Verificá que la sesión de FM siga activa.`)
  }

  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`${label}: la respuesta no es JSON válido.`)
  }
}

const readFlexible = async (response: Response, label: string) => {
  await ensureOk(response, label)
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  if (!text.trim()) return null

  if (JSON_CONTENT.test(contentType) || /^[\[{]/.test(text.trim())) {
    try { return JSON.parse(text) } catch {}
  }
  return text
}

const formBody = (values: GenericRecord = {}) => {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.set(key, typeof value === 'string' ? value : String(value))
  })
  return params
}

const formRequest = (url: string, values: GenericRecord, label: string, method = 'POST') => fetch(url, {
  method,
  credentials: 'include',
  cache: 'no-store',
  headers: {
    Accept: 'application/json,text/plain,*/*',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  body: formBody(values),
}).then((response) => readFlexible(response, label))

const jsonRequest = (url: string, body: any, label: string, method = 'POST') => fetch(url, {
  method,
  credentials: 'include',
  cache: 'no-store',
  headers: {
    Accept: 'application/json,text/plain,*/*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
}).then((response) => readFlexible(response, label))

const appendIfPresent = (params: URLSearchParams, key: string, value: any) => {
  const normalized = String(value ?? '').trim()
  if (normalized) params.set(key, normalized)
}

const normalizeOption = (option: HTMLOptionElement): CatalogOption => ({
  label: String(option.textContent || '').replace(/\s+/g, ' ').trim(),
  value: String(option.value || '').trim(),
  year: String(option.dataset?.code || '').trim(),
})

const extractOptions = (document: Document, selector: string): CatalogOption[] => {
  const select = document.querySelector(selector)
  if (!select) return []

  const seen = new Set<string>()
  return [...select.querySelectorAll('option')]
    .map((option) => normalizeOption(option as HTMLOptionElement))
    .filter((option) => option.value && option.label)
    .filter((option) => {
      const key = `${option.value}__${option.label}__${option.year || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

const fetchLegacyDocument = async (url: string, label: string) => {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'text/html,application/xhtml+xml' },
  })
  await ensureOk(response, label)
  return new DOMParser().parseFromString(await response.text(), 'text/html')
}

const buildCommonDocumentParams = (filters: GenericRecord, page = 0, size = 500) => {
  const params = new URLSearchParams()
  appendIfPresent(params, 'provincia', filters.provincia)
  appendIfPresent(params, 'contratista', filters.contratista)
  appendIfPresent(params, 'sociedad', filters.sociedad)
  appendIfPresent(params, 'tipoContrato', filters.tipoContrato)
  appendIfPresent(params, 'periodoAnio', filters.periodoAnio)
  appendIfPresent(params, 'periodoNombre', filters.periodoNombre)
  appendIfPresent(params, 'estadoActa', filters.estadoActa)
  appendIfPresent(params, 'nroActa', filters.nroActa)
  appendIfPresent(params, 'nroOt', filters.nroOt)
  appendIfPresent(params, 'nroActaAsoc', filters.nroActaAsoc)
  appendIfPresent(params, 'tipoActaDC', filters.tipoActaDC)
  params.set('page', String(page))
  params.set('size', String(size))
  return params
}

export const useGestionActasStore = defineStore('gestionActas', {
  state: () => ({
    backendTags: GESTION_ACTAS_BACKEND_TAGS,
    documentType: DOCUMENT_TYPES.ACTA as string,

    catalogs: emptyActasCatalogs(),
    catalogStatus: 'idle' as LoadStatus,
    catalogError: '',

    otsSinActaCatalogs: emptyOtsSinActaCatalogs(),
    otsSinActaCatalogStatus: 'idle' as LoadStatus,
    otsSinActaCatalogError: '',

    actas: [] as GenericRecord[],
    totalActas: 0,
    selectedActas: [] as GenericRecord[],
    activeActaNumber: '',
    actaDetails: {} as Record<string, GenericRecord>,
    otDetails: {} as Record<string, GenericRecord>,
    materialsByOt: {} as Record<string, GenericRecord[]>,

    notesDebit: [] as GenericRecord[],
    notesCredit: [] as GenericRecord[],
    totalNotesDebit: 0,
    totalNotesCredit: 0,
    noteOts: {} as Record<string, GenericRecord[]>,
    noteOtDetails: {} as Record<string, GenericRecord>,

    otsSinActa: [] as GenericRecord[],
    motivos: [] as GenericRecord[],
    transferOptions: null as GenericRecord | null,

    status: {
      search: 'idle' as LoadStatus,
      detail: 'idle' as LoadStatus,
      ot: 'idle' as LoadStatus,
      materials: 'idle' as LoadStatus,
      notes: 'idle' as LoadStatus,
      noteDetail: 'idle' as LoadStatus,
      sinActa: 'idle' as LoadStatus,
      operation: 'idle' as LoadStatus,
    },
    errors: {} as Record<string, string>,
  }),

  getters: {
    activeActa(state) {
      return state.selectedActas.find((item) => String(item.nroActa) === state.activeActaNumber) || null
    },
    activeActaDetail(state) {
      return state.activeActaNumber ? state.actaDetails[state.activeActaNumber] || null : null
    },
  },

  actions: {
    setDocumentType(type: string) {
      this.documentType = type
    },

    setSelectedActas(rows: GenericRecord[]) {
      this.selectedActas = Array.isArray(rows) ? rows : []
      if (!this.selectedActas.some((row) => String(row.nroActa) === this.activeActaNumber)) {
        this.activeActaNumber = String(this.selectedActas[0]?.nroActa || '')
      }
    },

    setActiveActa(nroActa: string) {
      this.activeActaNumber = String(nroActa || '')
    },

    async loadActasCatalogs(force = false) {
      if (!force && (this.catalogStatus === 'loading' || this.catalogStatus === 'loaded')) return this.catalogs
      this.catalogStatus = 'loading'
      this.catalogError = ''

      try {
        // FM-VUE-0.4.1 todavía entrega estos catálogos al renderizar el JSP.
        // Solo se lee ese HTML para las opciones; búsquedas y detalles son JSON.
        const document = await fetchLegacyDocument('/pc/consultarActas.html', 'Carga de filtros de Gestión de Actas')
        const catalogs: ActasCatalogs = {
          provincia: extractOptions(document, '#provinciaInputID'),
          contratista: extractOptions(document, '#contratistaInputID'),
          sociedad: extractOptions(document, '#sociedadInputID'),
          tipoContrato: extractOptions(document, '#tipoContratoInputID'),
          periodoAnio: extractOptions(document, '#periodoAnioInputID'),
          periodoNombre: extractOptions(document, '#periodoNombreInputID'),
          estadoActa: extractOptions(document, '#actaEstadoID'),
        }

        const required: (keyof ActasCatalogs)[] = ['provincia', 'contratista', 'sociedad', 'tipoContrato', 'periodoAnio', 'estadoActa']
        if (required.every((key) => catalogs[key].length === 0)) {
          throw new Error('No se pudieron leer los combos reales de Gestión de Actas. Verificá backend y sesión de FM.')
        }

        this.catalogs = catalogs
        this.catalogStatus = 'loaded'
        return catalogs
      } catch (error) {
        this.catalogStatus = 'error'
        this.catalogError = errorMessage(error)
        throw error
      }
    },

    async loadOtsSinActaCatalogs(force = false) {
      if (!force && (this.otsSinActaCatalogStatus === 'loading' || this.otsSinActaCatalogStatus === 'loaded')) return this.otsSinActaCatalogs
      this.otsSinActaCatalogStatus = 'loading'
      this.otsSinActaCatalogError = ''

      try {
        const document = await fetchLegacyDocument('/pc/consultarOtSinACTA.html', 'Carga de filtros de OTs sin Acta')
        const catalogs: OtsSinActaCatalogs = {
          region: extractOptions(document, '#regionInputID'),
          contratista: extractOptions(document, '#contratistaInputID'),
          sociedad: extractOptions(document, '#sociedadInputID'),
          tipoContrato: extractOptions(document, '#tipoContratoInputID'),
        }
        this.otsSinActaCatalogs = catalogs
        this.otsSinActaCatalogStatus = 'loaded'
        return catalogs
      } catch (error) {
        this.otsSinActaCatalogStatus = 'error'
        this.otsSinActaCatalogError = errorMessage(error)
        throw error
      }
    },

    async searchActas(filters: GenericRecord, options: { page?: number; size?: number } = {}) {
      this.status.search = 'loading'
      delete this.errors.search
      try {
        const params = buildCommonDocumentParams(filters, options.page ?? 0, options.size ?? 500)
        const response = await fetch(`/pc/consultarActas/buscarActas.html?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const payload = await readJsonResponse(response, 'Búsqueda de Actas')
        const result = {
          elements: Array.isArray(payload?.elements) ? payload.elements : [],
          totalElements: Number(payload?.totalElements ?? 0),
        }
        this.actas = result.elements
        this.totalActas = result.totalElements
        this.status.search = 'loaded'
        return result
      } catch (error) {
        this.status.search = 'error'
        this.errors.search = errorMessage(error)
        throw error
      }
    },

    async loadActaDetail(nroActa: string) {
      const key = String(nroActa ?? '').trim()
      this.status.detail = 'loading'
      delete this.errors.detail
      try {
        const params = new URLSearchParams({ nroActa: key })
        const response = await fetch(`/pc/detalleActa/getOtsAndActaDetallebynroActa.html?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const payload = await readJsonResponse(response, `Detalle del Acta ${key}`)
        const result = {
          actaDetalleAdapter: payload?.actaDetalleAdapter ?? null,
          listaOt: Array.isArray(payload?.listaOt) ? payload.listaOt : [],
        }
        this.actaDetails[key] = result
        this.status.detail = 'loaded'
        return result
      } catch (error) {
        this.status.detail = 'error'
        this.errors.detail = errorMessage(error)
        throw error
      }
    },

    async loadOtDetail({ nroActa, nroOt }: { nroActa: string; nroOt: string }) {
      const acta = String(nroActa ?? '').trim()
      const ot = String(nroOt ?? '').trim()
      this.status.ot = 'loading'
      try {
        const params = new URLSearchParams({ nroActa: acta, nroOt: ot })
        const response = await fetch(`/pc/consultarActas/obtenerDetalleActividades.html?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const result = await readJsonResponse(response, `Detalle de la OT ${ot}`)
        this.otDetails[`${acta}::${ot}`] = result || {}
        this.status.ot = 'loaded'
        return result
      } catch (error) {
        this.status.ot = 'error'
        throw error
      }
    },

    async loadOtMaterials(nroOt: string) {
      const ot = String(nroOt ?? '').trim()
      this.status.materials = 'loading'
      try {
        const response = await fetch('/pc/consultarActas/buscarMateriales.html', {
          method: 'POST', credentials: 'include', cache: 'no-store',
          headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ nroOt: ot }),
        })
        const payload = await readJsonResponse(response, `Materiales de la OT ${ot}`)
        const rows = Array.isArray(payload) ? payload : []
        this.materialsByOt[ot] = rows
        this.status.materials = 'loaded'
        return rows
      } catch (error) {
        this.status.materials = 'error'
        throw error
      }
    },

    async searchNotes(type: 'NODE' | 'NOCR', filters: GenericRecord, options: { page?: number; size?: number } = {}) {
      this.status.notes = 'loading'
      delete this.errors.notes
      const isDebit = type === DOCUMENT_TYPES.NOTA_DEBITO
      const params = buildCommonDocumentParams({ ...filters, tipoActaDC: type }, options.page ?? 0, options.size ?? 500)
      const url = isDebit ? '/pc/consultarNotaDebito/buscarND.html' : '/pc/consultarNotaCredito/buscarNC.html'

      try {
        const response = await fetch(`${url}?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const payload = await readJsonResponse(response, isDebit ? 'Búsqueda de Notas de Débito' : 'Búsqueda de Notas de Crédito')
        const rows = Array.isArray(payload?.elements) ? payload.elements : (Array.isArray(payload) ? payload : [])
        const total = Number(payload?.totalElements ?? rows.length)
        if (isDebit) {
          this.notesDebit = rows
          this.totalNotesDebit = total
        } else {
          this.notesCredit = rows
          this.totalNotesCredit = total
        }
        this.status.notes = 'loaded'
        return { elements: rows, totalElements: total }
      } catch (error) {
        this.status.notes = 'error'
        this.errors.notes = errorMessage(error)
        throw error
      }
    },

    async loadNoteOts(type: 'NODE' | 'NOCR', note: GenericRecord) {
      const isDebit = type === DOCUMENT_TYPES.NOTA_DEBITO
      const nroNota = String(note?.nroActaDC ?? note?.nroNota ?? '').trim()
      const nroActa = String(note?.nroActa ?? '').trim()
      const base = isDebit ? '/pc/detalleActaDebito/buscarActasDebito.html' : '/pc/detalleActaCredito/buscarActasCredito.html'
      const params = new URLSearchParams()
      appendIfPresent(params, 'nroActa', nroActa)
      appendIfPresent(params, 'nroActaDC', nroNota)
      params.set('sinFiltros', 'false')
      this.status.noteDetail = 'loading'

      try {
        const response = await fetch(`${base}?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const payload = await readJsonResponse(response, `OTs de ${isDebit ? 'Nota de Débito' : 'Nota de Crédito'} ${nroNota}`)
        const rows = Array.isArray(payload) ? payload : []
        this.noteOts[`${type}::${nroNota}`] = rows
        this.status.noteDetail = 'loaded'
        return rows
      } catch (error) {
        this.status.noteDetail = 'error'
        throw error
      }
    },

    async loadNoteOtDetail({ type, nroNota, nroOt }: { type: 'NODE' | 'NOCR'; nroNota: string; nroOt: string }) {
      // En FM-VUE-0.4.1 NC reutiliza expresamente el endpoint de detalle de ND.
      const params = new URLSearchParams({
        nroNotaDebito: String(nroNota ?? '').trim(),
        nroOt: String(nroOt ?? '').trim(),
      })
      this.status.ot = 'loading'
      try {
        const response = await fetch(`/pc/consultarNotaDebito/obtenerDetalleActividades.html?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const payload = await readJsonResponse(response, `Detalle de la OT ${nroOt}`)
        const key = `${type}::${nroNota}::${nroOt}`
        this.noteOtDetails[key] = payload || {}
        this.status.ot = 'loaded'
        return payload
      } catch (error) {
        this.status.ot = 'error'
        throw error
      }
    },

    async loadNoteExportRows(nroNota: string) {
      // El backend vigente comparte este servicio para ND y NC.
      const params = new URLSearchParams({ nroNotaDC: String(nroNota ?? '').trim() })
      const response = await fetch(`/pc/detalleActaDebito/getOtsDetalleByNroActa_ActivitiesView.html?${params.toString()}`, {
        method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
      })
      const payload = await readFlexible(response, `Exportación de Nota ${nroNota}`)
      return Array.isArray(payload) ? payload : []
    },

    closeNote(type: 'NODE' | 'NOCR', nroNota: string) {
      const isDebit = type === DOCUMENT_TYPES.NOTA_DEBITO
      const url = isDebit ? '/pc/detalleActaDebito/cerrarActaDebito.html' : '/pc/detalleActaCredito/cerrarActaCredito.html'
      const field = isDebit ? 'nroNotaDebito' : 'nroNotaCredito'
      return formRequest(url, { [field]: nroNota }, `Cierre de ${isDebit ? 'Nota de Débito' : 'Nota de Crédito'} ${nroNota}`)
    },

    async searchOtsSinActa(filters: GenericRecord) {
      this.status.sinActa = 'loading'
      delete this.errors.sinActa
      const params = new URLSearchParams()
      ;['region', 'contratista', 'sociedad', 'tipoContrato', 'fechaCierreDesde', 'fechaCierreHasta'].forEach((key) => appendIfPresent(params, key, filters[key]))
      params.set('sinFiltros', String(Boolean(filters.sinFiltros)))

      try {
        const response = await fetch(`/pc/consultarOtSinACTA/buscarOrdenes.html?${params.toString()}`, {
          method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
        })
        const payload = await readJsonResponse(response, 'Búsqueda de OTs sin Acta')
        const rows = Array.isArray(payload) ? payload : []
        this.otsSinActa = rows
        this.status.sinActa = 'loaded'
        return rows
      } catch (error) {
        this.status.sinActa = 'error'
        this.errors.sinActa = errorMessage(error)
        throw error
      }
    },

    // Operaciones de Acta. Se mantienen en el store para que ningún componente
    // tenga conocimiento directo de URLs de backend.
    async loadActaExportRows(nroActa: string) {
      const params = new URLSearchParams({ nroActa: String(nroActa ?? '').trim() })
      const response = await fetch(`/pc/detalleActa/getOtsDetalleByNroActa_ActivitiesView.html?${params.toString()}`, {
        credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
      })
      const payload = await readFlexible(response, `Exportación del Acta ${nroActa}`)
      return Array.isArray(payload) ? payload : []
    },

    validateOtRules(nroOts: string[]) {
      return formRequest('/pc/detalleActa/validarReglas.html', { nroOrdenTrabajoList: JSON.stringify(nroOts || []) }, 'Validación de reglas')
    },

    executeDomicileRules(nroOrdenTrabajo: string) {
      return formRequest('/pc/monitoreoEjecucionreglas/domicilio/ejecutarReglas.html', { nroOrdenTrabajo }, `Ejecución de reglas de la OT ${nroOrdenTrabajo}`)
    },

    async loadMotivos(force = false) {
      if (!force && this.motivos.length) return this.motivos
      const response = await fetch('/pc/detalleActa/getAllMotivos.html', {
        credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
      })
      const payload = await readFlexible(response, 'Carga de motivos')
      this.motivos = Array.isArray(payload) ? payload : []
      return this.motivos
    },

    excludeOts(payload: GenericRecord) {
      return jsonRequest('/pc/detalleActa/excluirOTMultiple.html', payload, 'Exclusión de OTs', 'PUT')
    },

    includeOt({ nroOT, nota = '', motivoNombreCorto = '', modificarHistorico = false, reseteo = false }: GenericRecord) {
      return formRequest('/pc/detalleActa/incluirOtActaExcluida.html', { nroOT, nota, motivoNombreCorto, modificarHistorico, reseteo }, `Inclusión de la OT ${nroOT}`)
    },

    validateTransfer(nroOts: string[]) {
      return jsonRequest('/pc/detalleActa/validarGestionarTraspasoOt.html', { nroOts }, 'Validación de traspaso')
    },

    async loadTransferOptions() {
      const payload = await jsonRequest('/pc/detalleActa/getDetalleTraspasoOt.html', {}, 'Carga de datos para traspaso')
      this.transferOptions = payload || null
      return payload
    },

    loadSubregions(payload: GenericRecord) {
      return jsonRequest('/pc/detalleActa/subregiones.html', payload, 'Carga de subregiones y bases')
    },

    checkEventosContract(tipoContrato: any) {
      return jsonRequest('/pc/detalleActa/esTipoContratoEventos.html', tipoContrato, 'Validación del tipo de contrato')
    },

    executeTransfer(payload: GenericRecord) {
      return jsonRequest('/pc/detalleActa/ejecutarTraspasoOt.html', payload, 'Traspaso de OTs')
    },

    rateActa({ nroActa, calificacion }: GenericRecord) {
      return formRequest('/pc/detalleActa/calificarActa.html', { nroActa, calificacion }, `Calificación del Acta ${nroActa}`)
    },

    async checkFailedOts(nroActa: string) {
      const params = new URLSearchParams({ nroActa: String(nroActa ?? '').trim() })
      const response = await fetch(`/pc/detalleActa/hayOTFallidas.html?${params.toString()}`, {
        credentials: 'include', cache: 'no-store', headers: { Accept: 'text/plain,application/json' },
      })
      return readFlexible(response, `Validación de OTs fallidas del Acta ${nroActa}`)
    },

    certifyActa(nroActa: string) {
      return jsonRequest('/pc/detalleActa/certificarActa.html', { nroActa }, `Certificación del Acta ${nroActa}`)
    },

    saveResultingActivities({ nroOT, actividadesResultantes, reset = false }: GenericRecord) {
      return jsonRequest('/pc/consultarActas/updateActividadesResultantes.html', { nroOT, reset, actividadesResultantes, esNC: false, esActa: true }, `Guardado de actividades de la OT ${nroOT}`)
    },

    modifyRedActivities({ nroOT, actividadesModificadas }: GenericRecord) {
      return jsonRequest('/pc/consultarActas/modificarActividadRed.html', { nroOT, actividadesModificadas, esActa: true }, `Modificación de actividades RED de la OT ${nroOT}`)
    },

    createActivity({ nroOt, codActividad, descripcion = '', motivo = '', modificarHistorico = false }: GenericRecord) {
      return formRequest('/pc/consultarActas/nuevaActividad.html', { nroOt, codActividad, descripcion, motivo, modificarHistorico }, `Alta de actividad en la OT ${nroOt}`)
    },

    deleteActivity({ nroActa, nroOt, codActividad, descripcion = '', motivo = '', modificarHistorico = false }: GenericRecord) {
      return formRequest('/pc/consultarActas/eliminarActividad.html', {
        nroActa,
        nroOt,
        codActividad: JSON.stringify(Array.isArray(codActividad) ? codActividad : [codActividad]),
        descripcion,
        motivo,
        modificarHistorico,
      }, `Baja de actividad en la OT ${nroOt}`)
    },

    async searchActivityCodes(phrase: string) {
      const value = encodeURIComponent(String(phrase ?? '').trim())
      if (value.length < 4) return []
      const response = await fetch(`/pc/consultarActas/getCodigoActividad/${value}.html`, {
        credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
      })
      const payload = await readFlexible(response, 'Búsqueda de códigos de actividad')
      return Array.isArray(payload) ? payload : []
    },

    resetRuntimeState() {
      this.actas = []
      this.totalActas = 0
      this.selectedActas = []
      this.activeActaNumber = ''
      this.actaDetails = {}
      this.otDetails = {}
      this.materialsByOt = {}
      this.notesDebit = []
      this.notesCredit = []
      this.totalNotesDebit = 0
      this.totalNotesCredit = 0
      this.noteOts = {}
      this.noteOtDetails = {}
      this.otsSinActa = []
      this.errors = {}
    },
  },
})
