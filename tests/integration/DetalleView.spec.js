import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  applyLegacyLayout: vi.fn(),
}))

vi.mock('@/composables/useLegacyIframeLayout', () => ({
  useLegacyIframeLayout: () => ({ onIframeLoad: mocks.applyLegacyLayout }),
}))

import DetalleView from '@/views/DetalleView.vue'

const setIframeHref = (wrapper, href) => {
  const iframe = wrapper.get('iframe').element
  Object.defineProperty(iframe, 'contentWindow', {
    configurable: true,
    value: { location: { href } },
  })
}

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

  it('mantiene visible el spinner estándar hasta que el detalle termina de cargar', async () => {
    const wrapper = mount(DetalleView)
    expect(wrapper.text()).toContain('Cargando Información')
    expect(wrapper.text()).toContain('Preparando Grilla')

    setIframeHref(wrapper, `${window.location.origin}/pc/detalleActaLegacy.html?nroActa=ACTA-900`)
    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(500)

    expect(mocks.applyLegacyLayout).toHaveBeenCalledOnce()
    expect(wrapper.find('.fm-loader').exists()).toBe(false)
  })

  it('ignora about:blank y conserva el loader', async () => {
    const wrapper = mount(DetalleView)
    setIframeHref(wrapper, 'about:blank')

    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(1000)

    expect(mocks.applyLegacyLayout).not.toHaveBeenCalled()
    expect(wrapper.find('.fm-loader').exists()).toBe(true)
  })

  it('tolera errores del adaptador legacy sin dejar la pantalla inutilizable', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.applyLegacyLayout.mockImplementationOnce(() => {
      throw new Error('fallo de adaptación')
    })
    const wrapper = mount(DetalleView)
    setIframeHref(wrapper, `${window.location.origin}/pc/detalleActaLegacy.html?nroActa=ACTA-900`)

    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(500)

    expect(consoleSpy).toHaveBeenCalled()
    expect(wrapper.find('.fm-loader').exists()).toBe(false)
    expect(wrapper.get('iframe').exists()).toBe(true)
  })
})
