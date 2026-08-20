import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAbmMaterialesStore } from '@/modules/gestionMateriales/abmMateriales/store/abmMaterialesStore.js'

const resolveTimers = async (promise) => {
  await vi.runAllTimersAsync()
  return promise
}

describe('abmMaterialesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('carga los cinco materiales de prueba y finaliza el loading', async () => {
    const store = useAbmMaterialesStore()
    const pending = store.fetchMateriales()

    expect(store.loading).toBe(true)
    await resolveTimers(pending)

    expect(store.materiales).toHaveLength(5)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('no duplica los datos cuando se busca más de una vez', async () => {
    const store = useAbmMaterialesStore()
    await resolveTimers(store.fetchMateriales())
    await resolveTimers(store.fetchMateriales())

    expect(store.materiales).toHaveLength(5)
  })

  it('crea un material activo y lo inserta al comienzo', async () => {
    const store = useAbmMaterialesStore()
    await resolveTimers(store.fetchMateriales())

    const pending = store.crearMaterial({
      codigoMaterial: 'MAT-900',
      descripcionMaterial: 'MATERIAL DE PRUEBA',
      umbralMedio: 10,
      umbralMaximo: 20,
      usuarioModificacion: 'ZTEST01',
    })
    const result = await resolveTimers(pending)

    expect(result.ok).toBe(true)
    expect(store.materiales[0]).toEqual(expect.objectContaining({
      codigoMaterial: 'MAT-900',
      descripcionMaterial: 'MATERIAL DE PRUEBA',
      umbralMinimo: 1,
      umbralMedio: 10,
      umbralMaximo: 20,
      usuarioModificacion: 'ZTEST01',
      activo: 'S',
    }))
  })

  it('detecta un código activo existente', async () => {
    const store = useAbmMaterialesStore()
    await resolveTimers(store.fetchMateriales())

    const result = await resolveTimers(store.crearMaterial({
      codigoMaterial: '1000102813',
      descripcionMaterial: 'DUPLICADO',
      umbralMedio: 10,
      umbralMaximo: 20,
    }))

    expect(result).toEqual({ ok: false, reason: 'ACTIVE_EXISTS' })
    expect(store.materiales).toHaveLength(5)
  })

  it('detecta un código inactivo existente para ofrecer reactivación', async () => {
    const store = useAbmMaterialesStore()
    await resolveTimers(store.fetchMateriales())

    const result = await resolveTimers(store.crearMaterial({
      codigoMaterial: '1000102815',
      descripcionMaterial: 'DUPLICADO INACTIVO',
      umbralMedio: 10,
      umbralMaximo: 20,
    }))

    expect(result).toEqual({ ok: false, reason: 'INACTIVE_EXISTS' })
  })

  it('actualiza umbral medio y máximo de un material activo', async () => {
    const store = useAbmMaterialesStore()
    await resolveTimers(store.fetchMateriales())

    const updated = await resolveTimers(store.actualizarMaterial({
      codigoMaterial: '1000102816',
      umbralMedio: 40,
      umbralMaximo: 90,
      usuarioModificacion: 'ZTEST02',
    }))

    expect(updated).toEqual(expect.objectContaining({
      codigoMaterial: '1000102816',
      umbralMinimo: 1,
      umbralMedio: 40,
      umbralMaximo: 90,
      usuarioModificacion: 'ZTEST02',
    }))
  })

  it('rechaza la edición de un material inactivo', async () => {
    const store = useAbmMaterialesStore()
    await resolveTimers(store.fetchMateriales())

    const rejection = expect(store.actualizarMaterial({
      codigoMaterial: '1000102815',
      umbralMedio: 9,
      umbralMaximo: 18,
    })).rejects.toThrow('Los materiales desactivados no pueden editarse.')

    await vi.runAllTimersAsync()
    await rejection

    expect(store.loading).toBe(false)
    expect(store.error).toBe('Los materiales desactivados no pueden editarse.')
  })
})
