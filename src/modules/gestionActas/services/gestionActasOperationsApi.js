const JSON_CONTENT = /application\/json/i

const ensureOk = async (response, label) => {
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`)
  return response
}

const readFlexible = async (response, label) => {
  await ensureOk(response, label)
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  if (!text.trim()) return null

  if (JSON_CONTENT.test(contentType) || /^[\[{]/.test(text.trim())) {
    try { return JSON.parse(text) } catch {}
  }
  return text
}

const formBody = (values) => {
  const params = new URLSearchParams()
  Object.entries(values || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    params.set(key, typeof value === 'string' ? value : String(value))
  })
  return params
}

const formRequest = (url, values, label, method = 'POST') => fetch(url, {
  method,
  credentials: 'include',
  cache: 'no-store',
  headers: {
    Accept: 'application/json,text/plain,*/*',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  body: formBody(values),
}).then((response) => readFlexible(response, label))

const jsonRequest = (url, body, label, method = 'POST') => fetch(url, {
  method,
  credentials: 'include',
  cache: 'no-store',
  headers: {
    Accept: 'application/json,text/plain,*/*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
}).then((response) => readFlexible(response, label))

export const loadActaExportRows = async (nroActa) => {
  const params = new URLSearchParams({ nroActa: String(nroActa ?? '').trim() })
  const response = await fetch(`/pc/detalleActa/getOtsDetalleByNroActa_ActivitiesView.html?${params.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  const payload = await readFlexible(response, `Exportación del Acta ${nroActa}`)
  return Array.isArray(payload) ? payload : []
}

export const validateOtRules = (nroOts) => formRequest(
  '/pc/detalleActa/validarReglas.html',
  { nroOrdenTrabajoList: JSON.stringify(nroOts || []) },
  'Validación de reglas',
)

export const executeDomicileRules = (nroOrdenTrabajo) => formRequest(
  '/pc/monitoreoEjecucionreglas/domicilio/ejecutarReglas.html',
  { nroOrdenTrabajo },
  `Ejecución de reglas de la OT ${nroOrdenTrabajo}`,
)

export const loadMotivos = async () => {
  const response = await fetch('/pc/detalleActa/getAllMotivos.html', {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  const payload = await readFlexible(response, 'Carga de motivos')
  return Array.isArray(payload) ? payload : []
}

export const excludeOts = ({ nroOts, nota = '', modificarHistorico = false, motivoNombreCorto = '' }) => jsonRequest(
  '/pc/detalleActa/excluirOTMultiple.html',
  { nroOts, nota, modificarHistorico, motivoNombreCorto },
  'Exclusión de OTs',
  'PUT',
)

export const includeOt = ({ nroOT, nota = '', motivoNombreCorto = '', modificarHistorico = false, reseteo = false }) => formRequest(
  '/pc/detalleActa/incluirOtActaExcluida.html',
  { nroOT, nota, motivoNombreCorto, modificarHistorico, reseteo },
  `Inclusión de la OT ${nroOT}`,
)

export const validateTransfer = (nroOts) => jsonRequest(
  '/pc/detalleActa/validarGestionarTraspasoOt.html',
  { nroOts },
  'Validación de traspaso',
)

export const loadTransferOptions = () => jsonRequest(
  '/pc/detalleActa/getDetalleTraspasoOt.html',
  {},
  'Carga de datos para traspaso',
)

export const loadSubregions = ({ nombre, codigo }) => jsonRequest(
  '/pc/detalleActa/subregiones.html',
  { nombre, codigo },
  'Carga de subregiones y bases',
)

export const checkEventosContract = (tipoContrato) => jsonRequest(
  '/pc/detalleActa/esTipoContratoEventos.html',
  tipoContrato,
  'Validación del tipo de contrato',
)

export const executeTransfer = (payload) => jsonRequest(
  '/pc/detalleActa/ejecutarTraspasoOt.html',
  payload,
  'Traspaso de OTs',
)

export const rateActa = ({ nroActa, calificacion }) => formRequest(
  '/pc/detalleActa/calificarActa.html',
  { nroActa, calificacion },
  `Calificación del Acta ${nroActa}`,
)

export const checkFailedOts = async (nroActa) => {
  const params = new URLSearchParams({ nroActa: String(nroActa ?? '').trim() })
  const response = await fetch(`/pc/detalleActa/hayOTFallidas.html?${params.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'text/plain,application/json' },
  })
  return readFlexible(response, `Validación de OTs fallidas del Acta ${nroActa}`)
}

export const certifyActa = (nroActa) => jsonRequest(
  '/pc/detalleActa/certificarActa.html',
  { nroActa },
  `Certificación del Acta ${nroActa}`,
)

export const saveResultingActivities = ({ nroOT, actividadesResultantes, reset = false }) => jsonRequest(
  '/pc/consultarActas/updateActividadesResultantes.html',
  { nroOT, reset, actividadesResultantes, esNC: false, esActa: true },
  `Guardado de actividades de la OT ${nroOT}`,
)

export const modifyRedActivities = ({ nroOT, actividadesModificadas }) => jsonRequest(
  '/pc/consultarActas/modificarActividadRed.html',
  { nroOT, actividadesModificadas, esActa: true },
  `Modificación de actividades RED de la OT ${nroOT}`,
)

export const createActivity = ({ nroOt, codActividad, descripcion = '', motivo = '', modificarHistorico = false }) => formRequest(
  '/pc/consultarActas/nuevaActividad.html',
  { nroOt, codActividad, descripcion, motivo, modificarHistorico },
  `Alta de actividad en la OT ${nroOt}`,
)

export const deleteActivity = ({ nroActa, nroOt, codActividad, descripcion = '', motivo = '', modificarHistorico = false }) => formRequest(
  '/pc/consultarActas/eliminarActividad.html',
  {
    nroActa,
    nroOt,
    codActividad: JSON.stringify(Array.isArray(codActividad) ? codActividad : [codActividad]),
    descripcion,
    motivo,
    modificarHistorico,
  },
  `Baja de actividad en la OT ${nroOt}`,
)

export const searchActivityCodes = async (phrase) => {
  const value = encodeURIComponent(String(phrase ?? '').trim())
  if (value.length < 4) return []
  const response = await fetch(`/pc/consultarActas/getCodigoActividad/${value}.html`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  const payload = await readFlexible(response, 'Búsqueda de códigos de actividad')
  return Array.isArray(payload) ? payload : []
}
