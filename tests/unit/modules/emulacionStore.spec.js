import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  useFetch: vi.fn(),
  setPerfil: vi.fn(),
}))

vi.mock('@vueuse/core', () => ({
  useFetch: mocks.useFetch,
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: () => ({ setPerfil: mocks.setPerfil }),
}))

import useEmulacionStore from '@/modules/emulacion/store/emulacionStore.js'

const fetchResponse = ({ data = null, error = null, status = 200 } = {}) => ({
  data: { value: data },
  error: { value: error },
  response: { value: { status } },
})

describe('emulacionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.useFetch.mockReset()
    mocks.setPerfil.mockReset()
  })

  it('normaliza el legajo y mantiene un estado inicial predecible', () => {
    const store = useEmulacionStore()

    store.$setlegajoSelected('  z002456  ')
    expect(store.legajoSelected).toBe('z002456')

    store.$requestConfirmation({ legajo: ' z009999 ', nombre: 'Operador' })
    expect(store.selectedOperator?.nombre).toBe('Operador')
    expect(store.legajoSelected).toBe('z009999')
    expect(store.confirmationVersion).toBe(1)

    store.$resetFilters()
    expect(store.legajoSelected).toBe('')
    expect(store.data).toEqual([])
    expect(store.selectedOperator).toBeNull()
    expect(store.activeTab).toEqual(['0'])
  })

  it('no llama al backend cuando el legajo está vacío', async () => {
    const store = useEmulacionStore()

    await store.$fetchData()

    expect(mocks.useFetch).not.toHaveBeenCalled()
    expect(store.error_code).toBe(400)
    expect(store.error_message).toBe('Ingrese un legajo')
    expect(store.toggleLoader).toBe(false)
  })

  it.each([
    ['arreglo directo', [{ legajo: 'A1', nombre: 'Uno' }]],
    ['propiedad data', { data: [{ legajo: 'A2', nombre: 'Dos' }] }],
    ['propiedad resultados', { resultados: [{ legajo: 'A3', nombre: 'Tres' }] }],
  ])('acepta la respuesta de búsqueda en formato %s', async (_label, payload) => {
    const store = useEmulacionStore()
    store.$setlegajoSelected('A1')
    mocks.useFetch.mockResolvedValue(fetchResponse({ data: payload }))

    await store.$fetchData()

    expect(mocks.useFetch).toHaveBeenCalledOnce()
    expect(mocks.useFetch.mock.calls[0][0]).toContain('/pc/emulacion/buscar.html?legajo=A1')
    expect(store.data).toHaveLength(1)
    expect(store.selectedOperator).toEqual(store.data[0])
    expect(store.activeTab).toEqual(['0'])
    expect(store.toggleLoader).toBe(false)
  })

  it('acepta una respuesta JSON serializada', async () => {
    const store = useEmulacionStore()
    store.$setlegajoSelected('A 1')
    mocks.useFetch.mockResolvedValue(fetchResponse({
      data: JSON.stringify([{ legajo: 'A 1', nombre: 'Operador JSON' }]),
    }))

    await store.$fetchData()

    expect(mocks.useFetch.mock.calls[0][0]).toContain('legajo=A%201')
    expect(store.data[0].nombre).toBe('Operador JSON')
  })

  it('informa 404 cuando la búsqueda no devuelve operadores', async () => {
    const store = useEmulacionStore()
    store.$setlegajoSelected('SINRESULTADO')
    mocks.useFetch.mockResolvedValue(fetchResponse({ data: [] }))

    await store.$fetchData()

    expect(store.data).toEqual([])
    expect(store.error_code).toBe(404)
    expect(store.error_message).toBe('No se encontraron operadores')
    expect(store.toggleLoader).toBe(false)
  })

  it('propaga el estado HTTP del backend en una búsqueda fallida', async () => {
    const store = useEmulacionStore()
    store.$setlegajoSelected('A1')
    mocks.useFetch.mockResolvedValue(fetchResponse({ error: 'Forbidden', status: 403 }))

    await store.$fetchData()

    expect(store.error_code).toBe(403)
    expect(store.error_message).toBe('Forbidden')
    expect(store.toggleLoader).toBe(false)
  })

  it('recupera el estado del loader aun cuando la respuesta trae JSON inválido', async () => {
    const store = useEmulacionStore()
    store.$setlegajoSelected('A1')
    mocks.useFetch.mockResolvedValue(fetchResponse({ data: '{json-invalido' }))

    await store.$fetchData()

    expect(store.error_code).toBe(500)
    expect(store.toggleLoader).toBe(false)
    expect(store.data).toEqual([])
  })

  it('no permite emular sin un operador seleccionado', async () => {
    const store = useEmulacionStore()

    await store.$emulate()

    expect(mocks.useFetch).not.toHaveBeenCalled()
    expect(mocks.setPerfil).not.toHaveBeenCalled()
    expect(store.error_code).toBe(400)
  })

  it('actualiza el perfil autenticado usando la respuesta y fallbacks del operador', async () => {
    const store = useEmulacionStore()
    store.$requestConfirmation({
      legajo: 'Z100',
      nombre: 'Nombre local',
      apellido: 'Apellido local',
      email: 'local@fm.test',
    })
    mocks.useFetch.mockResolvedValue(fetchResponse({
      data: JSON.stringify({
        autenticado: true,
        rutas: ['EMUL', 'ROTF'],
        nombre: 'Nombre backend',
      }),
    }))

    await store.$emulate()

    expect(mocks.useFetch.mock.calls[0][0]).toContain('/pc/emulacion/cambiarUsuario.html?legajo=Z100')
    expect(mocks.setPerfil).toHaveBeenCalledWith(expect.objectContaining({
      autenticado: true,
      rutas: ['EMUL', 'ROTF'],
      nombre: 'Nombre backend',
      apellido: 'Apellido local',
      email: 'local@fm.test',
      legajo: 'Z100',
    }))
  })

  it('no modifica el perfil cuando la respuesta de emulación está vacía', async () => {
    const store = useEmulacionStore()
    store.$setlegajoSelected('Z100')
    mocks.useFetch.mockResolvedValue(fetchResponse({ data: '' }))

    await store.$emulate()

    expect(mocks.setPerfil).not.toHaveBeenCalled()
    expect(store.error_code).toBe(500)
    expect(store.error_message).toBe('La respuesta de emulación está vacía')
  })
})
