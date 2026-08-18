import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  applyLegacyLayout: vi.fn(),
  resolve: vi.fn(() => ({ href: '/UI/FM/detallActa.html' })),
}))

vi.mock('@/composables/useLegacyIframeLayout', () => ({
  useLegacyIframeLayout: () => ({ onIframeLoad: mocks.applyLegacyLayout }),
}))

vi.mock('@/router', () => ({
  default: { resolve: mocks.resolve },
}))

import IframeView from '@/views/IframeView.vue'

const mountedWrappers = []
const mountIframeView = (props) => {
  const wrapper = mount(IframeView, { props })
  mountedWrappers.push(wrapper)
  return wrapper
}

const setIframeHref = (wrapper, href) => {
  const iframe = wrapper.get('iframe').element
  Object.defineProperty(iframe, 'contentWindow', {
    configurable: true,
    value: { location: { href } },
  })
}

describe('IframeView - integración legacy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.applyLegacyLayout.mockReset()
    mocks.resolve.mockClear()
  })

  afterEach(() => {
    while (mountedWrappers.length) {
      const wrapper = mountedWrappers.pop()
      if (wrapper?.exists()) wrapper.unmount()
    }
  })

  it('construye la URL /pc, conserva título y persiste parámetros de navegación', async () => {
    const wrapper = mountIframeView({
      urlParam: '/busquedaOtsGcc.html',
      titleParam: 'Búsqueda de OTs',
    })
    await nextTick()

    const iframe = wrapper.get('iframe')
    expect(iframe.attributes('src')).toBe('/pc/busquedaOtsGcc.html')
    expect(iframe.attributes('title')).toBe('Búsqueda de OTs')
    expect(sessionStorage.getItem('urlParam')).toBe('/busquedaOtsGcc.html')
    expect(sessionStorage.getItem('titleParam')).toBe('Búsqueda de OTs')
  })

  it('muestra el spinner estándar mientras el iframe está cargando', () => {
    const wrapper = mountIframeView({
      urlParam: '/jobtypeContrato.html',
      titleParam: 'Jobtype - Contrato',
    })

    expect(wrapper.find('.fm-loader').exists()).toBe(true)
    expect(wrapper.text()).toContain('Cargando Información')
    expect(wrapper.text()).toContain('Preparando Grilla')
    expect(wrapper.get('iframe').classes()).toContain('legacy-iframe--loading')
  })

  it('aplica el layout legacy y oculta el spinner después del load real', async () => {
    const wrapper = mountIframeView({
      urlParam: '/consultarActas.html',
      titleParam: 'Consultar Actas',
    })
    setIframeHref(wrapper, 'http://localhost/pc/consultarActas.html')

    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(500)

    expect(mocks.applyLegacyLayout).toHaveBeenCalledOnce()
    expect(wrapper.find('.fm-loader').exists()).toBe(false)
    expect(wrapper.get('iframe').classes()).not.toContain('legacy-iframe--loading')
  })

  it('ignora el load inicial about:blank para no quitar el spinner antes de tiempo', async () => {
    const wrapper = mountIframeView({
      urlParam: '/consultarActas.html',
      titleParam: 'Consultar Actas',
    })
    setIframeHref(wrapper, 'about:blank')

    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(1000)

    expect(mocks.applyLegacyLayout).not.toHaveBeenCalled()
    expect(wrapper.find('.fm-loader').exists()).toBe(true)
  })

  it('al cambiar de URL vuelve a activar el loader y no deja que un load anterior lo oculte', async () => {
    const wrapper = mountIframeView({
      urlParam: '/primera.html',
      titleParam: 'Primera',
    })
    setIframeHref(wrapper, 'http://localhost/pc/primera.html')
    await wrapper.get('iframe').trigger('load')

    await wrapper.setProps({ urlParam: '/segunda.html', titleParam: 'Segunda' })
    await nextTick()
    expect(wrapper.find('.fm-loader').exists()).toBe(true)
    expect(wrapper.get('iframe').attributes('src')).toBe('/pc/segunda.html')

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.find('.fm-loader').exists()).toBe(true)

    setIframeHref(wrapper, 'http://localhost/pc/segunda.html')
    await wrapper.get('iframe').trigger('load')
    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.find('.fm-loader').exists()).toBe(false)
  })

  it('procesa redirects del mismo origen hacia Detalle de Acta', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    mountIframeView({ urlParam: '/consultarActas.html', titleParam: 'Consultar Actas' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: window.location.origin,
      data: {
        type: 'redirect',
        nroActa: 'ACTA-123',
        url: '/detalleActaLegacy.html',
      },
    }))
    await nextTick()

    expect(sessionStorage.getItem('nroActa')).toBe('ACTA-123')
    expect(sessionStorage.getItem('urlDetalle')).toBe('/detalleActaLegacy.html')
    expect(mocks.resolve).toHaveBeenCalledWith({ name: 'DEAC' })
    expect(openSpy).toHaveBeenCalledWith('/UI/FM/detallActa.html', '_blank')
  })

  it('rechaza mensajes de otros orígenes', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    mountIframeView({ urlParam: '/consultarActas.html', titleParam: 'Consultar Actas' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://origen-no-permitido.example',
      data: { type: 'redirect', nroActa: 'X', url: '/x.html' },
    }))
    await nextTick()

    expect(openSpy).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('nroActa')).toBeNull()
  })

  it('elimina el listener de mensajes al desmontar la vista', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountIframeView({ urlParam: '/x.html', titleParam: 'X' })

    wrapper.unmount()
    mountedWrappers.splice(mountedWrappers.indexOf(wrapper), 1)

    expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function))
  })
})
