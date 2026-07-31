import type {
  AutocompleteItem,
  ContratoItem,
  JobTypeContratoError,
  JobTypeContratoRow,
  NuevaRelacion
} from '../models/types'

const BASE = '/pc/jobtypeContrato'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error('Error de conexión. Contacte al administrador')
  return response.json() as Promise<T>
}

export async function apiGetRelaciones(): Promise<JobTypeContratoRow[]> {
  const response = await fetch(`${BASE}/getJobTypes.html`)
  return handleResponse<JobTypeContratoRow[]>(response)
}

export async function apiCrearRelaciones(
  nuevas: NuevaRelacion[]
): Promise<JobTypeContratoError[]> {
  const response = await fetch(`${BASE}/nuevaRelJobtypeContrato.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ nuevasRelaciones: JSON.stringify(nuevas) })
  })
  return handleResponse<JobTypeContratoError[]>(response)
}

export async function apiActualizarRelacion(
  tareaContratoId: number,
  tipoContratoId: number
): Promise<JobTypeContratoRow> {
  const params = new URLSearchParams({
    tareaContratoId: String(tareaContratoId),
    tipoContratoId:  String(tipoContratoId)
  })
  const response = await fetch(`${BASE}/actualizarJobtype.html?${params}`)
  return handleResponse<JobTypeContratoRow>(response)
}

export async function apiDesactivarRelacion(
  idRelacion: number
): Promise<JobTypeContratoRow> {
  const response = await fetch(`${BASE}/desactivarRelJobContrato.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ idRelacion: String(idRelacion) })
  })
  return handleResponse<JobTypeContratoRow>(response)
}

export async function apiBuscarJobtypes(
  phrase: string,
  pais: string
): Promise<AutocompleteItem[]> {
  if (phrase.length <= 3) return []
  try {
    const response = await fetch(
      `${BASE}/getJobTypeTarea/${encodeURIComponent(phrase)}/${encodeURIComponent(pais)}.html`
    )
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export async function apiBuscarContratos(
  phrase: string
): Promise<ContratoItem[]> {
  if (phrase.length <= 3) return []
  try {
    const response = await fetch(
      `${BASE}/getContrato/${encodeURIComponent(phrase)}.html`
    )
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}
