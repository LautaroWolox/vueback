import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  applyLegacyLayout: vi.fn(),
}))

vi.mock('@/composables/useLegacyIframeLayout', () => ({
  useLegacyIframeLayout: () => ({ onIframeLoad: mocks.applyLegacyLayout }),
}))

import DetalleView from '@/views/DetalleView.vue'

const mockIframeHref = (href) => {
  return vi
    .spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get')
    .mockReturnValue({ location: { href } })
}

describe('DetalleView - integración legacy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.applyLegacyLayout.mockReset()
    sessionStorage.setItem('nroActa', 'ACTA-900')
    sessionStorage.setItem('urlDetalle', '/detalleActaLegacy.html')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('arma la URL legacy con el número de acta y un título accesible', () => {
    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    expect(iframe.attributes('src')).toBe(
      `${window.location.origin}/pc/detalleActaLegacy.html?nroActa=ACTA-900`,
    )
    expect(iframe.attributes('title')).toBe('Detalle Acta - ACTA-900')
  })

  it('mantiene visible el spinner estándar mientras el documento legacy todavía no confirmó su carga', () => {
    const wrapper = mount(DetalleView)

    const loader = wrapper.get('[role="status"]')
    expect(loader.text()).toContain('Cargando Información')
    expect(loader.text()).toContain('Preparando Grilla')
    expect(wrapper.get('iframe').classes()).toContain('legacy-iframe--loading')
  })

  it('ignora un load real de about:blank y conserva el loader', async () => {
    mockIframeHref('about:blank')
    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    await iframe.trigger('load')
    await vi.advanceTimersByTimeAsync(1000)

    expect(mocks.applyLegacyLayout).not.toHaveBeenCalled()
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(iframe.classes()).toContain('legacy-iframe--loading')
  })

  it('al cargar el documento legacy aplica layout y oculta el loader luego del mínimo visible', async () => {
    mockIframeHref(`${window.location.origin}/pc/detalleActaLegacy.html?nroActa=ACTA-900`)
    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    await iframe.trigger('load')
    expect(mocks.applyLegacyLayout).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(iframe.classes()).not.toContain('legacy-iframe--loading')
  })

  it('si el layout legacy falla no rompe la vista y termina ocultando el loader', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.applyLegacyLayout.mockImplementationOnce(() => {
      throw new Error('layout test error')
    })
    mockIframeHref(`${window.location.origin}/pc/detalleActaLegacy.html?nroActa=ACTA-900`)

    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    await expect(iframe.trigger('load')).resolves.toBeUndefined()
    expect(consoleError).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('usa siempre los datos de detalle vigentes al crear una nueva vista', () => {
    sessionStorage.setItem('nroActa', 'ACTA-XYZ')
    sessionStorage.setItem('urlDetalle', '/otraPantallaDetalle.html')

    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    expect(iframe.attributes('src')).toContain('/pc/otraPantallaDetalle.html?nroActa=ACTA-XYZ')
    expect(iframe.attributes('title')).toBe('Detalle Acta - ACTA-XYZ')
  })

  it('mantiene un título válido aunque el número de acta esté vacío', () => {
    sessionStorage.removeItem('nroActa')
    const wrapper = mount(DetalleView)

    expect(wrapper.get('iframe').attributes('title')).toBe('Detalle Acta - ')
  })

  it('puede desmontarse durante la carga y cancela su timer pendiente', async () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    mockIframeHref(`${window.location.origin}/pc/detalleActaLegacy.html?nroActa=ACTA-900`)
    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    await iframe.trigger('load')
    const callsBeforeUnmount = clearTimeoutSpy.mock.calls.length

    expect(() => wrapper.unmount()).not.toThrow()
    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(callsBeforeUnmount)
    await vi.runAllTimersAsync()
  })
})
