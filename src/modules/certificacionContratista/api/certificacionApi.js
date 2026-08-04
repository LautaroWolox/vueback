const BASE = '/pc'

const toQuery = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0')
      const month = String(value.getMonth() + 1).padStart(2, '0')
      query.set(key, `${day}/${month}/${value.getFullYear()}`)
      return
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, String(entry)))
      return
    }
    query.set(key, String(value))
  })

  return query.toString()
}

const normalizeError = async (response) => {
  let message = `Error ${response.status}`
  try {
    const body = await response.clone().json()
    message = body?.respuesta || body?.message || body?.errorMessage || body?.mensaje || message
  } catch {
    try {
      const text = await response.text()
      if (text?.trim()) message = text.trim()
    } catch {
      // Conserva el mensaje HTTP.
    }
  }
  return new Error(message)
}

const parseBody = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (response.status === 204) return null
  if (contentType.includes('application/json')) return response.json()
  const text = await response.text()
  const trimmed = text.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    return trimmed
  }
}

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json, text/plain, */*',
      ...(options.headers || {})
    }
  })

  if (!response.ok) throw await normalizeError(response)
  return parseBody(response)
}


const ensureBusinessSuccess = (payload) => {
  if (typeof payload === 'string' && payload.trim().toUpperCase() === 'NOK') {
    throw new Error('La operación no pudo completarse.')
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload

  const failed = payload.status === false || payload.success === false || Number(payload.statusCode ?? 200) >= 400
  if (!failed) return payload

  throw new Error(
    payload.respuesta || payload.message || payload.errorMessage || payload.mensaje || 'La operación no pudo completarse.'
  )
}

export const getJson = (url, params) => {
  const query = toQuery(params)
  return request(query ? `${url}?${query}` : url)
}

export const postJson = (url, body) => request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body ?? {})
})

export const putJson = (url, body) => request(url, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body ?? {})
})

export const postForm = (url, body = {}) => request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: toQuery(body)
})

const optionFromElement = (option) => ({
  label: (option.textContent || '').replace(/\s+/g, ' ').trim(),
  value: option.value || '',
  code: option.dataset?.code || '',
  disabled: option.disabled
})

const parseSelect = (document, selector) => Array.from(document.querySelectorAll(`${selector} option`))
  .map(optionFromElement)
  .filter((option, index, list) => (
    index === list.findIndex((entry) => entry.value === option.value && entry.label === option.label)
  ))

export const fetchLegacyCatalogs = async (legacyPage) => {
  const response = await fetch(legacyPage, {
    credentials: 'include',
    headers: { Accept: 'text/html' }
  })
  if (!response.ok) throw await normalizeError(response)
  const html = await response.text()
  const document = new DOMParser().parseFromString(html, 'text/html')

  return {
    provincia: parseSelect(document, '#provinciaInputID'),
    region: parseSelect(document, '#regionInputID'),
    contratista: parseSelect(document, '#contratistaInputID'),
    sociedad: parseSelect(document, '#sociedadInputID'),
    tipoContrato: parseSelect(document, '#tipoContratoInputID'),
    periodoAnio: parseSelect(document, '#periodoAnioInputID'),
    periodoNombre: parseSelect(document, '#periodoNombreInputID'),
    estadoActa: parseSelect(document, '#actaEstadoID')
  }
}

export const buscarDocumentos = async (config, filters) => {
  const response = await getJson(config.searchEndpoint, filters)

  if (Array.isArray(response)) {
    return {
      rows: response,
      totalElements: response.length,
      totalPages: response.length ? 1 : 0,
      page: 0,
      size: response.length
    }
  }

  const elements = response?.elements ?? response?.content ?? response?.data ?? []
  return {
    rows: Array.isArray(elements) ? elements : [],
    totalElements: Number(response?.totalElements ?? elements?.length ?? 0),
    totalPages: Number(response?.totalPages ?? 0),
    page: Number(response?.page ?? response?.number ?? filters.page ?? 0),
    size: Number(response?.size ?? filters.size ?? 20)
  }
}

export const buscarPeriodos = (config, year) => {
  if (!config.periodEndpoint || !year) return Promise.resolve([])
  return getJson(`${config.periodEndpoint}/${encodeURIComponent(year)}.html`)
}

export const buscarOtsSinActa = (filters) => getJson(`${BASE}/consultarOtSinACTA/buscarOrdenes.html`, filters)

export const cargarDetalleDocumento = (config, numero) => getJson(config.detailEndpoint, { nroActa: numero })

export const filtrarOtsActa = (config, payload) => {
  if (config.documentType === 'ACTA') return postJson(config.filterEndpoint, payload)
  return postJson(config.filterEndpoint, {
    nroNota: payload.nroActa,
    nroOt: payload.nroOt
  })
}

export const cargarMotivos = (config) => getJson(config.reasonsEndpoint)

export const excluirOts = (config, payload) => putJson(config.excludeEndpoint, payload).then(ensureBusinessSuccess)

export const incluirOt = (config, payload) => postForm(config.includeEndpoint, payload).then(ensureBusinessSuccess)

export const validarReglas = (config, numerosOt, numeroDocumento) => {
  if (config.documentType === 'ACTA') {
    return postForm(config.validateRulesEndpoint, {
      nroOrdenTrabajoList: JSON.stringify(numerosOt)
    }).then(ensureBusinessSuccess)
  }

  return postForm(config.validateRulesEndpoint, {
    otsActa: JSON.stringify(numerosOt),
    nroActaDC: numeroDocumento
  }).then(ensureBusinessSuccess)
}

export const validarActividadesNota = (config, numeroDocumento, numerosOt) => {
  if (!config.validateActivitiesEndpoint) return Promise.resolve(null)
  return postForm(config.validateActivitiesEndpoint, {
    otsActa: JSON.stringify({
      nroActaDC: numeroDocumento,
      ots: numerosOt
    })
  }).then(ensureBusinessSuccess)
}

export const cerrarNota = (config, numeroDocumento) => {
  if (!config.closeEndpoint) return Promise.resolve(null)
  const key = config.documentType === 'NOTA_DEBITO' ? 'nroNotaDebito' : 'nroNotaCredito'
  return postForm(config.closeEndpoint, { [key]: numeroDocumento }).then(ensureBusinessSuccess)
}

export const calificarActa = (config, nroActa, calificacion) => getJson(config.qualifyEndpoint, {
  nroActa,
  calificacion
}).then(ensureBusinessSuccess)

export const certificarActa = (config, nroActa) => postJson(config.certifyEndpoint, { nroActa }).then(ensureBusinessSuccess)

export const buscarOtsFallidas = (config, nroActa) => getJson(config.failedOtsEndpoint, { nroActa })

export const validarCalificarCertificar = (nroActa) => postForm(`${BASE}/consultarActas/validaCalificarCertificar.html`, { nroActa })

export const verificarOtRedNotaDebito = (nroOrdenTrabajo, nroNotaDebito) => postJson(
  `${BASE}/consultarNotaDebito/verificado.html`,
  { nrOT: nroOrdenTrabajo, nrActaDebito: nroNotaDebito }
).then(ensureBusinessSuccess)


export const cargarDetalleOt = (documentType, numeroDocumento, nroOt) => {
  if (documentType === 'ACTA') {
    return getJson(`${BASE}/consultarActas/obtenerDetalleActividades.html`, { nroActa: numeroDocumento, nroOt })
  }
  return getJson(`${BASE}/consultarNotaDebito/obtenerDetalleActividades.html`, { nroNotaDebito: numeroDocumento, nroOt })
}

export const cargarHistorialDomicilio = (nroOt) => getJson(`${BASE}/consultarActas/obtenerHistorialDomicilio.html`, { nroOt })

export const guardarActividadesResultantes = (documentType, payload) => {
  const prefix = documentType === 'ACTA' ? 'consultarActas' : 'consultarNotaDebito'
  return postJson(`${BASE}/${prefix}/updateActividadesResultantes.html`, payload).then(ensureBusinessSuccess)
}

export const modificarActividadesRed = (documentType, payload) => {
  const prefix = documentType === 'ACTA' ? 'consultarActas' : 'consultarNotaDebito'
  return postJson(`${BASE}/${prefix}/modificarActividadRed.html`, payload).then(ensureBusinessSuccess)
}

export const buscarActividades = (phrase) => getJson(`${BASE}/consultarActas/getCodigoActividad/${encodeURIComponent(phrase)}.html`)

export const crearActividad = (documentType, payload) => {
  const prefix = documentType === 'ACTA' ? 'consultarActas' : 'consultarNotaDebito'
  const body = documentType === 'ACTA'
    ? payload
    : { ...payload, nroActaDC: payload.nroActaDC ?? payload.nroActa }
  return postForm(`${BASE}/${prefix}/nuevaActividad.html`, body).then(ensureBusinessSuccess)
}

export const eliminarActividad = (documentType, payload) => {
  const prefix = documentType === 'ACTA' ? 'consultarActas' : 'consultarNotaDebito'
  return postForm(`${BASE}/${prefix}/eliminarActividad.html`, payload).then(ensureBusinessSuccess)
}

export const buscarMaterialesOt = (documentType, nroOt) => {
  if (documentType === 'ACTA') return postForm(`${BASE}/consultarActas/buscarMateriales.html`, { nroOt })
  return getJson(`${BASE}/consultarNotaDebito/buscarMateriales.html`, { nroOt })
}

export const buscarBaseInstalada = (nroOT) => getJson(`${BASE}/detalleActa/baseInstalada.html`, { nroOT })

export const persistirSiniestros = (documentType, payload) => {
  const endpoint = documentType === 'ACTA'
    ? `${BASE}/detalleActa/persistirSiniestros.html`
    : `${BASE}/detalleActaDebito/persistirSiniestros.html`
  return postJson(endpoint, payload).then(ensureBusinessSuccess)
}

export const cargarDatosTraspaso = () => getJson(`${BASE}/detalleActa/getDetalleTraspasoOt.html`)

export const validarTraspaso = (payload) => postJson(`${BASE}/detalleActa/validarGestionarTraspasoOt.html`, payload).then(ensureBusinessSuccess)

export const cargarSubregiones = (region) => postJson(`${BASE}/detalleActa/subregiones.html`, region)

export const ejecutarTraspaso = (payload) => postJson(`${BASE}/detalleActa/ejecutarTraspasoOt.html`, payload).then(ensureBusinessSuccess)

export const buscarTecnicosActa = (nroActa, phrase) => getJson(
  `${BASE}/detalleActa/getTecnicoOtByActa/${encodeURIComponent(nroActa)}/${encodeURIComponent(phrase)}.html`
)

export const cargarOtsExportacion = (config, numeroDocumento, certificada = false) => {
  const param = config.documentType === 'ACTA'
    ? { nroActa: numeroDocumento, certificada }
    : { nroNotaDC: numeroDocumento }
  return getJson(config.activitiesExportEndpoint, param)
}

export const fetchRuleTypes = async () => {
  const response = await fetch('/pc/consultarReglas.html', { credentials: 'include', headers: { Accept: 'text/html' } })
  if (!response.ok) throw await normalizeError(response)
  const html = await response.text()
  const document = new DOMParser().parseFromString(html, 'text/html')
  return parseSelect(document, '#tipoRegla').filter((option) => option.value)
}

export const buscarReglas = (filters) => getJson(`${BASE}/consultarReglas/buscarReglas.html`, filters)
export const cargarElementosRegla = (reglaTipo) => getJson(`${BASE}/consultarReglas/getAllElementoByReglaTipo.html`, { reglaTipo })
export const buscarTareasRegla = (phrase) => getJson(`${BASE}/consultarReglas/getOrdenTranajoTarea/${encodeURIComponent(phrase)}.html`)
export const crearRegla = (payload) => postForm(`${BASE}/consultarReglas/nuevaRegla.html`, payload).then(ensureBusinessSuccess)

export const cargarMonitoreoReglas = () => getJson(`${BASE}/monitoreoEjecucionreglas/getAllReglaLogProceso.html`)
export const ejecutarReglas = () => postForm(`${BASE}/monitoreoEjecucionreglas/ejecutarReglas.html`).then(ensureBusinessSuccess)
export const ejecutarReglasDomicilio = (nroOrdenTrabajo) => postForm(`${BASE}/monitoreoEjecucionreglas/domicilio/ejecutarReglas.html`, { nroOrdenTrabajo })

export const buscarOtsGcc = (ots) => postJson(`${BASE}/busquedaOtsGcc/buscar.html`, ots)
export const buscarOtsExternas = (otsEncontradas, otsBuscadas) => postJson(`${BASE}/busquedaOtsGcc/getListOrdenesTrabajoExternas.html`, { otsEncontradas, otsBuscadas })
export const buscarOperadorLogistica = (legajo) => getJson(`${BASE}/busquedaOtsGcc/getOperadorLogisticaByLegajoOrLegajoNoLdap.html`, { legajo })
export const cambiarTecnicoOts = (payload) => postJson(`${BASE}/busquedaOtsGcc/cambiarTecnico.html`, payload).then(ensureBusinessSuccess)
