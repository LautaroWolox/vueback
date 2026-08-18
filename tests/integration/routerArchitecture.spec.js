import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: {
    autenticado: true,
    rutas: [],
  },
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: () => mocks.auth,
}))

import router from '@/router'

const routeByName = (name) => {
  const route = router.getRoutes().find((item) => item.name === name)
  if (!route) throw new Error(`No existe la ruta ${name}`)
  return route
}

const defaultComponentSource = (route) => String(route.components?.default ?? '')
const defaultProps = (route) => route.props?.default ?? route.props ?? {}
const runBeforeEnter = (routeName, permittedRoutes = []) => {
  mocks.auth.autenticado = true
  mocks.auth.rutas = permittedRoutes
  const route = routeByName(routeName)
  const next = vi.fn()
  const guard = Array.isArray(route.beforeEnter) ? route.beforeEnter[0] : route.beforeEnter
  guard({ name: routeName }, {}, next)
  return next
}

describe('Arquitectura de rutas FMR-22776', () => {
  beforeEach(() => {
    mocks.auth.autenticado = true
    mocks.auth.rutas = []
  })

  it.each([
    ['EMUL', 'emulacion', 'Emulacion.vue'],
    ['EXDA', 'reporteSas', 'ReporteSAS.vue'],
    ['ROTF', 'otFallidasCT', 'OtFallidasCT.vue'],
  ])('mantiene %s como pantalla Vue migrada', (name, moduleName, fileName) => {
    const route = routeByName(name)
    const componentSource = defaultComponentSource(route)

    expect(componentSource).toContain(moduleName)
    expect(componentSource).toContain(fileName)
    expect(componentSource).not.toContain('IframeView')
  })

  it.each([
    ['BUOT', '/busquedaOtsGcc.html', 'Búsqueda de OTs'],
    ['JOCO', '/jobtypeContrato.html', 'Jobtype - Contrato'],
    ['JOCM', '/jobtypeCMO.html', 'CMO - Actividad'],
    ['COAC', '/consultarActas.html', 'consultarActas'],
  ])('mantiene %s por iframe legacy con URL explícita', (name, urlParam, titleParam) => {
    const route = routeByName(name)
    const componentSource = defaultComponentSource(route)
    const props = defaultProps(route)

    expect(componentSource).toContain('IframeView')
    expect(props.urlParam).toBe(urlParam)
    expect(props.titleParam).toBe(titleParam)
  })

  it('no publica una ruta ABM Materiales en esta versión', () => {
    expect(router.getRoutes().some((route) => route.name === 'ABMM')).toBe(false)
  })

  it('autoriza una ruta cuando el perfil contiene el permiso exacto', () => {
    const next = runBeforeEnter('ROTF', ['ROTF'])
    expect(next).toHaveBeenCalledWith()
  })

  it('mantiene compatibilidad JOCM para perfiles que todavía reciben JOCO', () => {
    const next = runBeforeEnter('JOCM', ['JOCO'])
    expect(next).toHaveBeenCalledWith()
  })

  it('rechaza una ruta autenticada sin permiso', () => {
    const next = runBeforeEnter('ROTF', ['OTRO'])
    expect(next).toHaveBeenCalledWith({ name: '401' })
  })

  it('redirige a 401 cuando un usuario no autenticado intenta entrar a una ruta protegida', () => {
    mocks.auth.autenticado = false
    mocks.auth.rutas = []
    const route = routeByName('ROTF')
    const next = vi.fn()
    const guard = Array.isArray(route.beforeEnter) ? route.beforeEnter[0] : route.beforeEnter

    guard({ name: 'ROTF' }, {}, next)

    expect(next).toHaveBeenCalledWith({ name: '401' })
  })
})
