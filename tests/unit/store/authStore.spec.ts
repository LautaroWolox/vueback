import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  useFetch: vi.fn(),
  storageGet: vi.fn(),
  storageSet: vi.fn(),
}))

vi.mock('encrypt-storage', () => ({
  EncryptStorageNoble: class {
    getItem(key: string) { return mocks.storageGet(key) }
    setItem(key: string, value: unknown) { return mocks.storageSet(key, value) }
  },
}))

vi.mock('@vueuse/core', () => ({
  useFetch: mocks.useFetch,
}))

import { useAuthStore } from '@/store/auth'

const fetchChain = ({ data = null, error = null, status = 200 } = {}) => ({
  get() {
    return {
      async json() {
        return {
          data: { value: data },
          error: { value: error },
          response: { value: { status } },
        }
      },
    }
  },
})

describe('authStore - perfil mostrado en el menú', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.useFetch.mockReset()
    mocks.storageGet.mockReset()
    mocks.storageSet.mockReset()
  })

  it('prioriza un nombre completo explícito', () => {
    const store = useAuthStore()

    store.setPerfil({
      autenticado: true,
      rutas: ['EMUL'],
      legajo: 'z002456',
      nombreCompleto: 'Lautaro Buson',
      email: 'lautaro.buson@example.com',
    })

    expect(store.nombre).toBe('Lautaro Buson')
    expect(store.legajo).toBe('z002456')
    expect(store.usuario).toEqual(expect.objectContaining({
      nombre: 'Lautaro Buson',
      legajo: 'z002456',
    }))
  })

  it('combina nombres y apellidos cuando vienen separados', () => {
    const store = useAuthStore()

    store.setPerfil({
      autenticado: true,
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Gómez',
      legajo: 'Z100',
    })

    expect(store.nombre).toBe('Juan Carlos Pérez Gómez')
    expect(store.apellido).toBe('Pérez Gómez')
  })

  it('no usa el legajo como nombre si puede resolverlo desde el email', () => {
    const store = useAuthStore()

    store.setPerfil({
      autenticado: true,
      nombre: 'z002456',
      legajo: 'z002456',
      email: 'lautaro.buson@example.com',
    })

    expect(store.nombre).toBe('Lautaro Buson')
  })

  it('conserva el legajo como fallback final cuando no hay otro dato humano', () => {
    const store = useAuthStore()

    store.setPerfil({ autenticado: true, legajo: 'Z999' })

    expect(store.nombre).toBe('Z999')
  })

  it('fetchUserData no autentica respuestas 401/403 o perfiles no autenticados', async () => {
    const store = useAuthStore()

    mocks.useFetch.mockReturnValueOnce(fetchChain({ status: 403, data: { autenticado: true } }))
    await expect(store.fetchUserData()).resolves.toBeNull()
    expect(store.autenticado).toBe(false)

    mocks.useFetch.mockReturnValueOnce(fetchChain({ status: 200, data: { autenticado: false } }))
    await expect(store.fetchUserData()).resolves.toBeNull()
    expect(store.autenticado).toBe(false)
  })

  it('fetchUserData actualiza el perfil cuando el backend devuelve una sesión válida', async () => {
    const store = useAuthStore()
    mocks.useFetch.mockReturnValue(fetchChain({
      data: {
        autenticado: true,
        rutas: ['EMUL', 'EXDA', 'ROTF'],
        nombre: 'Ana',
        apellido: 'Pérez',
        legajo: 'A100',
        email: 'ana.perez@example.com',
      },
    }))

    const response = await store.fetchUserData()

    expect(response?.autenticado).toBe(true)
    expect(store.autenticado).toBe(true)
    expect(store.rutas).toEqual(['EMUL', 'EXDA', 'ROTF'])
    expect(store.nombre).toBe('Ana Pérez')
  })

  it('logout limpia todos los datos visibles del perfil', () => {
    const store = useAuthStore()
    store.setPerfil({
      autenticado: true,
      rutas: ['EMUL'],
      nombre: 'Ana',
      apellido: 'Pérez',
      legajo: 'A100',
      email: 'ana@example.com',
    })

    store.logout()

    expect(store.autenticado).toBe(false)
    expect(store.rutas).toEqual([])
    expect(store.nombre).toBe('')
    expect(store.apellido).toBe('')
    expect(store.legajo).toBe('')
    expect(store.email).toBe('')
    expect(store.usuario).toBeNull()
  })
})
