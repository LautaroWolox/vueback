import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock('@/router', () => ({
  default: { push: mocks.push },
}))

import { getRutas } from '@/components/rutas'

const flatten = (items: any[]): any[] => items.flatMap((item) => [item, ...(item.items ? flatten(item.items) : [])])

const findByLabel = (routes: any[], label: string) => flatten(routes).find((item) => item.label === label)
const findAllByLabel = (routes: any[], label: string) => flatten(routes).filter((item) => item.label === label)

describe('Menú principal - contrato de navegación', () => {
  beforeEach(() => {
    mocks.push.mockReset()
  })

  it('mantiene visibles las tres pantallas migradas con sus permisos', () => {
    const menu = getRutas(['ABMV', 'EMUL', 'REPO', 'EXDA', 'CECO', 'ROTF'])

    expect(findByLabel(menu, 'Emulación')?.visible).toBe(true)
    expect(findByLabel(menu, 'Extracción de Datos GM')?.visible).toBe(true)
    expect(findAllByLabel(menu, 'Registro OTs Fallidas').some((item) => item.visible === true)).toBe(true)
  })

  it('mantiene Búsqueda de OTs y Parametrizaciones como entradas de menú legacy', () => {
    const menu = getRutas(['CECO', 'BUOT', 'PARA', 'JOCO', 'JOCM'])

    const buscador = findByLabel(menu, 'Búsqueda de OTs')
    const jobtype = findByLabel(menu, 'Configuración Jobtype-Contrato')
    const cmo = findByLabel(menu, 'Configuración CMO-Actividad')

    buscador.command()
    expect(mocks.push).toHaveBeenLastCalledWith({ name: 'BUOT' })

    jobtype.command()
    expect(mocks.push).toHaveBeenLastCalledWith({ name: 'JOCO' })

    cmo.command()
    expect(mocks.push).toHaveBeenLastCalledWith({ name: 'JOCM' })
  })

  it('permite mostrar CMO con permiso JOCO por compatibilidad', () => {
    const menu = getRutas(['CECO', 'PARA', 'JOCO'])
    expect(findByLabel(menu, 'Configuración CMO-Actividad')?.visible).toBe(true)
  })

  it('no contiene ABM Materiales', () => {
    const menu = getRutas(['GEMA', 'ABMM'])
    const labels = flatten(menu).map((item) => item.label)

    expect(labels).not.toContain('ABM MATERIALES')
    expect(labels).not.toContain('ABM Materiales')
  })

  it('no ejecuta rutas distintas a la asociada al ítem seleccionado', () => {
    const menu = getRutas(['CECO', 'BUOT', 'ROTF'])
    const buscador = findByLabel(menu, 'Búsqueda de OTs')

    buscador.command()

    expect(mocks.push).toHaveBeenCalledTimes(1)
    expect(mocks.push).toHaveBeenCalledWith({ name: 'BUOT' })
  })
})
