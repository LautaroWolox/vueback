import type {
  AutocompleteItem,
  ContratoItem,
  JobTypeContratoError,
  JobTypeContratoRow,
  NuevaRelacion
} from '../models/types'

const BASE = '/pc/jobtypeContrato'
const DEFAULT_ERROR = 'Error de conexión. Contacte al administrador'

async function readError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return data?.error || data?.message || data?.mensaje || DEFAULT_ERROR
    }
    const text = (await response.text()).trim()
    return text || DEFAULT_ERROR
  } catch {
    return DEFAULT_ERROR
  }
}

async function handleJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await readError(response))

  try {
    return await response.json() as T
  } catch {
    throw new Error(DEFAULT_ERROR)
  }
}

export async function apiGetRelaciones(): Promise<JobTypeContratoRow[]> {
  const response = await fetch(`${BASE}/getJobTypes.html`)
  const data = await handleJson<JobTypeContratoRow[]>(response)
  return Array.isArray(data) ? data : []
}

export async function apiCrearRelaciones(
  nuevas: NuevaRelacion[]
): Promise<JobTypeContratoError[]> {
  const response = await fetch(`${BASE}/nuevaRelJobtypeContrato.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ nuevasRelaciones: JSON.stringify(nuevas) })
  })
  const data = await handleJson<JobTypeContratoError[]>(response)
  return Array.isArray(data) ? data : []
}

export async function apiActualizarRelacion(
  tareaContratoId: number,
  tipoContratoId: number,
  origen: string
): Promise<JobTypeContratoRow> {
  const params = new URLSearchParams({
    tareaContratoId: String(tareaContratoId),
    tipoContratoId: String(tipoContratoId),
    origen
  })

  const response = await fetch(`${BASE}/actualizarJobtype.html?${params.toString()}`)
  const data = await handleJson<JobTypeContratoRow & { error?: string }>(response)
  if (data?.error) throw new Error(data.error)
  return data
}

export async function apiDesactivarRelacion(
  idRelacion: number
): Promise<JobTypeContratoRow> {
  const response = await fetch(`${BASE}/desactivarRelJobContrato.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ idRelacion: String(idRelacion) })
  })
  return handleJson<JobTypeContratoRow>(response)
}

export async function apiBuscarJobtypes(
  phrase: string,
  pais: string
): Promise<AutocompleteItem[]> {
  if (phrase.trim().length <= 3 || !pais) return []
  try {
    const response = await fetch(
      `${BASE}/getJobTypeTarea/${encodeURIComponent(phrase.trim())}/${encodeURIComponent(pais)}.html`
    )
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function apiBuscarContratos(
  phrase: string
): Promise<ContratoItem[]> {
  if (phrase.trim().length <= 3) return []
  try {
    const response = await fetch(
      `${BASE}/getContrato/${encodeURIComponent(phrase.trim())}.html`
    )
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
