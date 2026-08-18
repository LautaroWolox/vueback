import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  applyLegacyLayout: vi.fn(),
}))

vi.mock('@/composables/useLegacyIframeLayout', () => ({
  useLegacyIframeLayout: () => ({ onIframeLoad: mocks.applyLegacyLayout }),
}))

import DetalleView from '@/views/DetalleView.vue'

describe('DetalleView - integración legacy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.applyLegacyLayout.mockReset()
    sessionStorage.setItem('nroActa', 'ACTA-900')
    sessionStorage.setItem('urlDetalle', '/detalleActaLegacy.html')
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

  it('ignora el evento load de about:blank y conserva el loader', async () => {
    const wrapper = mount(DetalleView)

    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(1000)

    expect(mocks.applyLegacyLayout).not.toHaveBeenCalled()
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.get('iframe').classes()).toContain('legacy-iframe--loading')
  })

  it('usa siempre los datos de detalle vigentes al crear una nueva vista', () => {
    sessionStorage.setItem('nroActa', 'ACTA-XYZ')
    sessionStorage.setItem('urlDetalle', '/otraPantallaDetalle.html')

    const wrapper = mount(DetalleView)
    const iframe = wrapper.get('iframe')

    expect(iframe.attributes('src')).toContain('/pc/otraPantallaDetalle.html?nroActa=ACTA-XYZ')
    expect(iframe.attributes('title')).toBe('Detalle Acta - ACTA-XYZ')
  })

  it('puede desmontarse durante la carga sin dejar timers que modifiquen la vista', async () => {
    const wrapper = mount(DetalleView)

    expect(() => wrapper.unmount()).not.toThrow()
    await expect(vi.runAllTimersAsync()).resolves.toBeUndefined()
  })
})
