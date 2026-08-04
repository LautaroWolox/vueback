import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCmoActividadStore } from '../store/cmoActividadStore'
import type { RelCmoActividad } from '../store/types'

// Mock useFetch de @vueuse/core
const mockUseFetch = vi.fn()
vi.mock('@vueuse/core', () => ({
  useFetch: (...args: any[]) => mockUseFetch(...args),
}))

// Helper para simular respuesta exitosa de useFetch
function mockFetchSuccess(data: any) {
  mockUseFetch.mockReturnValue({
    json: () => Promise.resolve({ data: { value: data }, error: { value: null } }),
    post: () => ({ json: () => Promise.resolve({ data: { value: data }, error: { value: null } }) }),
  })
}

// Helper para simular error de useFetch
function mockFetchError(errorMsg: string) {
  mockUseFetch.mockReturnValue({
    json: () => Promise.resolve({ data: { value: null }, error: { value: new Error(errorMsg) } }),
    post: () => ({ json: () => Promise.resolve({ data: { value: null }, error: { value: new Error(errorMsg) } }) }),
  })
}

const mockRows: RelCmoActividad[] = [
  {
    actividadManoObraId: 1,
    codigoActividad: 'ACT001',
    descActividad: 'Instalación HFC',
    codigoS4: 'S4001',
    cmo: 'S4001 - CMO Norte',
    usuarioModificacion: 'usuario1',
    fechaModificacion: '01/01/2025 10:00:00',
    activo: 'S',
  },
  {
    actividadManoObraId: 2,
    codigoActividad: 'ACT002',
    descActividad: 'Reparación FTTH',
    codigoS4: 'S4002',
    cmo: 'S4002 - CMO Sur',
    usuarioModificacion: 'usuario2',
    fechaModificacion: '02/01/2025 11:00:00',
    activo: 'N',
  },
]

describe('cmoActividadStore', () => {
  let store: ReturnType<typeof useCmoActividadStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCmoActividadStore()
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('tiene rows vacío, sin selección, sin loading, sin error', () => {
      expect(store.rows).toEqual([])
      expect(store.selectedRow).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchData', () => {
    it('carga las filas correctamente del backend', async () => {
      mockFetchSuccess(mockRows)

      await store.fetchData()

      expect(store.rows).toEqual(mockRows)
      expect(store.rows).toHaveLength(2)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('setea loading durante la carga', async () => {
      mockFetchSuccess(mockRows)

      const promise = store.fetchData()
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })

    it('maneja errores de red correctamente', async () => {
      mockFetchError('Network Error')

      await store.fetchData()

      expect(store.rows).toEqual([])
      expect(store.error).toBe('Network Error')
      expect(store.loading).toBe(false)
    })

    it('no ejecuta fetchData si ya está loading (guard doble-click)', async () => {
      mockFetchSuccess(mockRows)

      store.loading = true
      await store.fetchData()

      expect(mockUseFetch).not.toHaveBeenCalled()
    })

    it('maneja response null como array vacío', async () => {
      mockFetchSuccess(null)

      await store.fetchData()

      expect(store.rows).toEqual([])
      expect(store.error).toBeNull()
    })
  })

  describe('searchActividad', () => {
    it('retorna sugerencias de actividades sin mutar state', async () => {
      const mockActividades = [
        { id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación' },
      ]
      mockUseFetch.mockReturnValue({
        json: () => Promise.resolve({ data: { value: mockActividades }, error: { value: null } }),
      })

      const result = await store.searchActividad('ACT')

      expect(result).toEqual(mockActividades)
      expect(store.rows).toEqual([]) // No muta el state
    })

    it('lanza error si el fetch falla', async () => {
      mockFetchError('Server Error')

      await expect(store.searchActividad('ACT')).rejects.toThrow('Server Error')
    })
  })

  describe('searchCmo', () => {
    it('retorna sugerencias de CMO sin mutar state', async () => {
      const mockCmos = [
        { id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte' },
      ]
      mockUseFetch.mockReturnValue({
        json: () => Promise.resolve({ data: { value: mockCmos }, error: { value: null } }),
      })

      const result = await store.searchCmo('CMO')

      expect(result).toEqual(mockCmos)
      expect(store.rows).toEqual([])
    })
  })

  describe('crearRelaciones', () => {
    it('refresca la grilla tras éxito (response vacío)', async () => {
      // Primera llamada: crearRelaciones (retorna array vacío = éxito)
      // Segunda llamada: fetchData (refrescar grilla)
      let callCount = 0
      mockUseFetch.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // crearRelaciones → éxito
          return { json: () => Promise.resolve({ data: { value: [] }, error: { value: null } }) }
        }
        // fetchData → datos
        return { json: () => Promise.resolve({ data: { value: mockRows }, error: { value: null } }) }
      })

      const relaciones = [
        { idActividad: 1, idCmo: 10, codigoActividad: 'ACT001', descActividad: 'Test', codigoS4: 'S4001', cmo: 'S4001 - CMO' },
      ]
      const result = await store.crearRelaciones(relaciones)

      expect(result).toEqual([])
      expect(store.rows).toEqual(mockRows) // Se refrescó la grilla
    })

    it('retorna errores de negocio sin refrescar grilla', async () => {
      const errorResponses = [
        { mensaje: 'Relación duplicada', actividadId: 1, manoObraId: 10, actividadNombre: null, manoObraNombre: null, actividadCodigo: null, manoObraCodigo: null },
      ]
      mockUseFetch.mockReturnValue({
        json: () => Promise.resolve({ data: { value: errorResponses }, error: { value: null } }),
      })

      const relaciones = [
        { idActividad: 1, idCmo: 10, codigoActividad: 'ACT001', descActividad: 'Test', codigoS4: 'S4001', cmo: 'S4001 - CMO' },
      ]
      const result = await store.crearRelaciones(relaciones)

      expect(result).toEqual(errorResponses)
      expect(store.rows).toEqual([]) // No se refrescó
    })
  })

  describe('modificarRelacion', () => {
    it('refresca la grilla si la respuesta no tiene mensaje de error', async () => {
      let callCount = 0
      mockUseFetch.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { json: () => Promise.resolve({ data: { value: null }, error: { value: null } }) }
        }
        return { json: () => Promise.resolve({ data: { value: mockRows }, error: { value: null } }) }
      })

      const result = await store.modificarRelacion(1, 20)

      expect(result).toBeNull()
      expect(store.rows).toEqual(mockRows) // Se refrescó
    })

    it('retorna el error de negocio sin refrescar', async () => {
      const errorResponse = { mensaje: 'Relación repetida', actividadId: 1, manoObraId: 10, actividadNombre: null, manoObraNombre: null, actividadCodigo: null, manoObraCodigo: null }
      mockUseFetch.mockReturnValue({
        json: () => Promise.resolve({ data: { value: errorResponse }, error: { value: null } }),
      })

      const result = await store.modificarRelacion(1, 10)

      expect(result).toEqual(errorResponse)
      expect(store.rows).toEqual([]) // No se refrescó
    })
  })

  describe('desactivarRelacion', () => {
    it('refresca la grilla tras desactivar', async () => {
      let callCount = 0
      mockUseFetch.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { json: () => Promise.resolve({ data: { value: null }, error: { value: null } }) }
        }
        return { json: () => Promise.resolve({ data: { value: mockRows }, error: { value: null } }) }
      })

      await store.desactivarRelacion(1)

      expect(store.rows).toEqual(mockRows) // Se refrescó
    })

    it('lanza error si el fetch falla', async () => {
      mockFetchError('Server Error')

      await expect(store.desactivarRelacion(1)).rejects.toThrow('Server Error')
    })
  })

  describe('setSelectedRow', () => {
    it('selecciona una fila', () => {
      store.setSelectedRow(mockRows[0])
      expect(store.selectedRow).toEqual(mockRows[0])
    })

    it('limpia la selección con null', () => {
      store.setSelectedRow(mockRows[0])
      store.setSelectedRow(null)
      expect(store.selectedRow).toBeNull()
    })
  })

  describe('clearStore', () => {
    it('resetea todo el estado a valores iniciales', async () => {
      // Simular estado cargado
      store.rows = mockRows
      store.selectedRow = mockRows[0]
      store.loading = false
      store.error = 'algo'

      store.clearStore()

      expect(store.rows).toEqual([])
      expect(store.selectedRow).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })
})
