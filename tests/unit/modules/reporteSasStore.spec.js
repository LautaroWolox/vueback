import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReporteSasStore } from '@/modules/reporteSas/store/reporteSasStore.js'

const okResponse = (payload) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue(payload),
})

describe('reporteSasStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  it.each([
    ['arreglo directo', [{ id: 1, nroOt: 'OT-1' }]],
    ['propiedad data', { data: [{ id: 2, numeroOT: 'OT-2' }] }],
    ['propiedad rows', { rows: [{ id: 3, numeroOt: 'OT-3' }] }],
  ])('acepta payload en formato %s', async (_label, payload) => {
    fetch.mockResolvedValue(okResponse(payload))
    const store = useReporteSasStore()

    await store.fetchRows()

    expect(fetch).toHaveBeenCalledWith(
      '/pc/extraccionDatosGM/searchMatDescargados.html',
      { headers: { Accept: 'application/json' } },
    )
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0].nroOT).toMatch(/^OT-/)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.hasRows).toBe(true)
  })

  it('normaliza aliases del backend y genera una clave estable', async () => {
    fetch.mockResolvedValue(okResponse([
      {
        materialDescargadoId: 77,
        numeroOT: 'OT-77',
        estado: 'CERRADA',
        codigoTarea: 'TAREA',
        codigoPostal: '1000',
        legajoDescarga: 'Z1',
        nombreOperadorDescarga: 'Operador Uno',
        legajoCierreOt: 'Z2',
        nombreOperadorCierreOt: 'Operador Dos',
        legajosNOLDAP: [' A ', '', 'B'],
        codigoMaterial: 'MAT-1',
        descripcionMaterial: 'Material',
        cantidad: 2,
        mensajeSap: 'OK',
      },
    ]))
    const store = useReporteSasStore()

    await store.fetchRows()

    expect(store.rows[0]).toEqual(expect.objectContaining({
      _rowKey: 77,
      nroOT: 'OT-77',
      estadoOT: 'CERRADA',
      codTarea: 'TAREA',
      codPostal: '1000',
      legajoOperadorDescarga: 'Z1',
      nomApeOperadorDescarga: 'Operador Uno',
      legajoCierreOT: 'Z2',
      nomApeCierreOT: 'Operador Dos',
      legajoNOLDAP: 'A,B',
      codMaterial: 'MAT-1',
      descMaterial: 'Material',
      cantidadMaterial: 2,
      mensajeSAP: 'OK',
    }))
  })

  it('normaliza legajos NOLDAP separados por coma', async () => {
    fetch.mockResolvedValue(okResponse([
      { nroOT: 'OT-1', legajoNoldap: ' A, B ,, C ' },
    ]))
    const store = useReporteSasStore()

    await store.fetchRows()

    expect(store.rows[0].legajoNOLDAP).toBe('A,B,C')
  })

  it('usa una clave de respaldo cuando el backend no envía identificador', async () => {
    fetch.mockResolvedValue(okResponse([
      { nroOT: 'OT-X' },
      { nroOt: 'OT-Y' },
    ]))
    const store = useReporteSasStore()

    await store.fetchRows()

    expect(store.rows[0]._rowKey).toBe('OT-X-0')
    expect(store.rows[1]._rowKey).toBe('OT-Y-1')
  })

  it('maneja un payload sin filas como una grilla vacía válida', async () => {
    fetch.mockResolvedValue(okResponse({ inesperado: true }))
    const store = useReporteSasStore()

    await store.fetchRows()

    expect(store.rows).toEqual([])
    expect(store.hasRows).toBe(false)
    expect(store.error).toBeNull()
  })

  it('limpia filas, registra el error HTTP y vuelve a liberar loading', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 })
    const store = useReporteSasStore()
    store.rows = [{ _rowKey: 'viejo' }]

    await expect(store.fetchRows()).rejects.toThrow('No se pudo cargar Reporte SAS (503)')

    expect(store.rows).toEqual([])
    expect(store.error).toBe('No se pudo cargar Reporte SAS (503)')
    expect(store.loading).toBe(false)
  })

  it('evita solicitudes duplicadas mientras ya está cargando', async () => {
    const store = useReporteSasStore()
    store.loading = true

    await store.fetchRows()

    expect(fetch).not.toHaveBeenCalled()
  })

  it('clearStore elimina datos, error y loading', () => {
    const store = useReporteSasStore()
    store.rows = [{ _rowKey: 1 }]
    store.error = 'Error'
    store.loading = true

    store.clearStore()

    expect(store.rows).toEqual([])
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })
})
