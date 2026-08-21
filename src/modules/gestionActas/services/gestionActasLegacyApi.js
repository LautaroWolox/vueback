const HTML_CONTENT = /text\/html/i

const ensureOk = async (response, label) => {
  if (!response.ok) {
    const message = `${label}: HTTP ${response.status}`
    throw new Error(message)
  }
  return response
}

const readJsonResponse = async (response, label) => {
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

const normalizeOption = (option) => ({
  label: String(option.textContent || '').replace(/\s+/g, ' ').trim(),
  value: String(option.value || '').trim(),
  year: String(option.dataset?.code || '').trim(),
})

const extractOptions = (document, selector) => {
  const select = document.querySelector(selector)
  if (!select) return []

  const seen = new Set()
  return [...select.querySelectorAll('option')]
    .map(normalizeOption)
    .filter((option) => option.value && option.label)
    .filter((option) => {
      const key = `${option.value}__${option.label}__${option.year}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export const loadActasCatalogs = async () => {
  const response = await fetch('/pc/consultarActas.html', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
  })

  await ensureOk(response, 'Carga de filtros de Actas')
  const html = await response.text()
  const document = new DOMParser().parseFromString(html, 'text/html')

  const catalogs = {
    provincia: extractOptions(document, '#provinciaInputID'),
    contratista: extractOptions(document, '#contratistaInputID'),
    sociedad: extractOptions(document, '#sociedadInputID'),
    tipoContrato: extractOptions(document, '#tipoContratoInputID'),
    periodoAnio: extractOptions(document, '#periodoAnioInputID'),
    periodoNombre: extractOptions(document, '#periodoNombreInputID'),
    estadoActa: extractOptions(document, '#actaEstadoID'),
  }

  const required = ['provincia', 'contratista', 'sociedad', 'tipoContrato', 'periodoAnio', 'estadoActa']
  const missing = required.filter((key) => catalogs[key].length === 0)

  if (missing.length === required.length) {
    throw new Error('No se pudieron leer los combos reales de Consultar Actas. Verificá que el backend de FM y la sesión estén disponibles.')
  }

  return catalogs
}

const appendIfPresent = (params, key, value) => {
  const normalized = String(value ?? '').trim()
  if (normalized) params.set(key, normalized)
}

export const searchActas = async (filters, { page = 0, size = 500 } = {}) => {
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
  params.set('page', String(page))
  params.set('size', String(size))

  const response = await fetch(`/pc/consultarActas/buscarActas.html?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await readJsonResponse(response, 'Búsqueda de Actas')

  return {
    elements: Array.isArray(payload?.elements) ? payload.elements : [],
    totalElements: Number(payload?.totalElements ?? 0),
  }
}

export const loadActaDetail = async (nroActa) => {
  const params = new URLSearchParams({ nroActa: String(nroActa ?? '').trim() })
  const response = await fetch(`/pc/detalleActa/getOtsAndActaDetallebynroActa.html?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await readJsonResponse(response, `Detalle del Acta ${nroActa}`)
  return {
    actaDetalleAdapter: payload?.actaDetalleAdapter ?? null,
    listaOt: Array.isArray(payload?.listaOt) ? payload.listaOt : [],
  }
}

export const loadOtDetail = async ({ nroActa, nroOt }) => {
  const params = new URLSearchParams({
    nroActa: String(nroActa ?? '').trim(),
    nroOt: String(nroOt ?? '').trim(),
  })
  const response = await fetch(`/pc/consultarActas/obtenerDetalleActividades.html?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  return readJsonResponse(response, `Detalle de la OT ${nroOt}`)
}

export const loadOtMaterials = async (nroOt) => {
  const body = new URLSearchParams({ nroOt: String(nroOt ?? '').trim() })
  const response = await fetch('/pc/consultarActas/buscarMateriales.html', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body,
  })

  const payload = await readJsonResponse(response, `Materiales de la OT ${nroOt}`)
  return Array.isArray(payload) ? payload : []
}
