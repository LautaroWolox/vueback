import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  useFetch: vi.fn(),
}))

vi.mock('@vueuse/core', () => ({
  useFetch: mocks.useFetch,
}))

import { useFallidasCtStore } from '@/modules/otFallidasCT/store/CtFallidaStore'
import type { Row } from '@/modules/otFallidasCT/store/types'

const makeRow = (overrides: Partial<Row> = {}): Row => ({
  id: 1,
  nroOrdenTrabajo: 'OT-1',
  fechaCierre: '2026-08-18',
  tareaCodigo: 'T1',
  direccion: 'Calle 1',
  ciudad: 'CABA',
  provincia: 'Buenos Aires',
  region: 'AMBA',
  pais: 'AR',
  contratista: 'CONTRATISTA',
  tecnicoCierre: 'TEC1',
  actividades: 'SI',
  sistemaOrigen: 'FM',
  errorDescripcion: 'Error de prueba',
  excluida: 'N',
  motivoExclusion: '',
  nota: '',
  tieneNota: 'N',
  incluirExp: '',
  incluir: '',
  ...overrides,
})

const createFetchChain = ({ data = null, error = null } = {}) => {
  const result = { data: { value: data }, error: { value: error } }
  const chain: any = {
    post: vi.fn(),
    json: vi.fn(),
    then(resolve: any, reject: any) {
      return Promise.resolve(result).then(resolve, reject)
    },
  }
  chain.post.mockImplementation(() => chain)
  chain.json.mockImplementation(async () => result)
  return chain
}

describe('CtFallidaStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.useFetch.mockReset()
  })

  it('inicia con filtros limpios y la grilla vacía', () => {
    const store = useFallidasCtStore()

    expect(store.rows).toEqual([])
    expect(store.selectedRows).toEqual([])
    expect(store.filters).toEqual({
      nroOT: '',
      fechaCierreOTDesde: null,
      fechaCierreOTHasta: null,
      contratista: '',
      descripcionError: '',
      excluida: '',
      pais: '',
    })
  })

  it('resetGrid limpia selección y aumenta la versión de la grilla', () => {
    const store = useFallidasCtStore()
    store.rows = [makeRow()]
    store.selectedRows = [1]
    store.nroOT = 'OT-1'
    const previousVersion = store.gridResetVersion

    store.resetGrid()

    expect(store.rows).toEqual([])
    expect(store.selectedRows).toEqual([])
    expect(store.nroOT).toBeNull()
    expect(store.gridResetVersion).toBe(previousVersion + 1)
  })

  it('selectedNotExcludedRows devuelve solo filas seleccionadas no excluidas', () => {
    const store = useFallidasCtStore()
    store.rows = [
      makeRow({ id: 1, excluida: 'N' }),
      makeRow({ id: 2, nroOrdenTrabajo: 'OT-2', excluida: 'S' }),
      makeRow({ id: 3, nroOrdenTrabajo: 'OT-3', excluida: 'N' }),
    ]
    store.selectedRows = [1, 2, 999]

    expect(store.selectedNotExcludedRows.map((row) => row.id)).toEqual([1])
  })

  it('setData normaliza las notas y abre el panel de resultados', async () => {
    const chain = createFetchChain({
      data: [
        makeRow({ id: 1, nota: '<b>&nbsp;</b>', tieneNota: 'S' }),
        makeRow({ id: 2, nota: '<span>Nota real</span>', tieneNota: 'S' }),
        makeRow({ id: 3, nota: 'Texto que no debe contar', tieneNota: 'N' }),
      ],
    })
    mocks.useFetch.mockReturnValue(chain)
    const store = useFallidasCtStore()
    store.setFilter('nroOT', 'OT-1')

    await store.setData()

    expect(mocks.useFetch).toHaveBeenCalledWith('/pc/registroOTFallidasReproceso/searchFallidas.html')
    expect(chain.post).toHaveBeenCalledWith(expect.objectContaining({ nroOT: 'OT-1' }))
    expect(store.activeTab).toEqual(['1'])
    expect(store.rows[0].nota).toBe('')
    expect(store.rows[0].tieneNota).toBe('N')
    expect(store.rows[1].tieneNota).toBe('S')
    expect(store.rows[2].nota).toBe('')
    expect(store.rows[2].tieneNota).toBe('N')
    expect(store.loading).toBe(false)
  })

  it('markIncluded cambia solo la OT indicada', () => {
    const store = useFallidasCtStore()
    store.rows = [
      makeRow({ id: 1, nroOrdenTrabajo: '100', excluida: 'S' }),
      makeRow({ id: 2, nroOrdenTrabajo: '200', excluida: 'S' }),
    ]

    store.markIncluded('100')

    expect(store.rows[0].excluida).toBe('N')
    expect(store.rows[1].excluida).toBe('S')
  })

  it('sendReproceso no llama al backend sin selección', async () => {
    const store = useFallidasCtStore()

    await store.sendReproceso()

    expect(mocks.useFetch).not.toHaveBeenCalled()
  })

  it('sendReproceso envía una copia de los ids seleccionados', async () => {
    const chain = createFetchChain()
    mocks.useFetch.mockReturnValue(chain)
    const store = useFallidasCtStore()
    store.selectedRows = [10, 20]

    await store.sendReproceso()

    expect(mocks.useFetch).toHaveBeenCalledWith('/pc/registroOTFallidasReproceso/reprocesar.html')
    expect(chain.post).toHaveBeenCalledWith([10, 20])
  })

  it('sendReproceso propaga un error del backend', async () => {
    const chain = createFetchChain({ error: 'fallo reproceso' })
    mocks.useFetch.mockReturnValue(chain)
    const store = useFallidasCtStore()
    store.selectedRows = [10]

    await expect(store.sendReproceso()).rejects.toThrow('fallo reproceso')
  })

  it('sendExcluidas arma el payload únicamente con filas válidas', async () => {
    const chain = createFetchChain({ data: { status: true, respuesta: 'OK' } })
    mocks.useFetch.mockReturnValue(chain)
    const store = useFallidasCtStore()
    store.rows = [
      makeRow({ id: 1, excluida: 'N' }),
      makeRow({ id: 2, excluida: 'S' }),
    ]
    store.selectedRows = [1, 2]

    const response = await store.sendExcluidas('ERROR_TECNICO', 'Comentario')

    expect(chain.post).toHaveBeenCalledWith({
      idOts: ['1'],
      nota: 'Comentario',
      motivoNombreCorto: 'ERROR_TECNICO',
    })
    expect(response).toEqual({ status: true, respuesta: 'OK' })
    expect(store.loading).toBe(false)
  })

  it('sendExcluidas normaliza error y respuesta vacía sin dejar loading activo', async () => {
    const errorChain = createFetchChain({ error: 'Forbidden' })
    mocks.useFetch.mockReturnValueOnce(errorChain)
    const store = useFallidasCtStore()

    await expect(store.sendExcluidas('M', 'N')).resolves.toEqual({
      status: false,
      respuesta: 'Forbidden',
    })
    expect(store.loading).toBe(false)

    const emptyChain = createFetchChain({ data: null })
    mocks.useFetch.mockReturnValueOnce(emptyChain)
    await expect(store.sendExcluidas('M', 'N')).resolves.toEqual({
      status: false,
      respuesta: 'Respuesta vacía del servidor',
    })
    expect(store.loading).toBe(false)
  })

  it('sendIncluir utiliza la OT seleccionada en el estado', async () => {
    const chain = createFetchChain({ data: { status: true, respuesta: 'Incluida' } })
    mocks.useFetch.mockReturnValue(chain)
    const store = useFallidasCtStore()
    store.nroOT = 'OT-500'

    const response = await store.sendIncluir('IGNORADO_POR_CONTRATO_ACTUAL', 'MOTIVO', 'Nota')

    expect(chain.post).toHaveBeenCalledWith({
      nroOts: ['OT-500'],
      nota: 'Nota',
      motivoNombreCorto: 'MOTIVO',
    })
    expect(response.status).toBe(true)
  })

  it('clearFilters restaura filtros y grilla', () => {
    const store = useFallidasCtStore()
    store.setFilter('nroOT', 'OT-1')
    store.rows = [makeRow()]
    store.selectedRows = [1]

    store.clearFilters()

    expect(store.filters.nroOT).toBe('')
    expect(store.rows).toEqual([])
    expect(store.selectedRows).toEqual([])
  })
})
