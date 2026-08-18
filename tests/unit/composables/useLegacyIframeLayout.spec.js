import { JSDOM } from 'jsdom'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  installAccordionSearchBehavior: vi.fn(() => vi.fn()),
}))

vi.mock('@/utils/accordionSearchBehavior', () => ({
  installAccordionSearchBehavior: mocks.installAccordionSearchBehavior,
}))

import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const rect = (top, height, width = 900) => ({
  x: 0,
  y: top,
  top,
  left: 0,
  width,
  height,
  right: width,
  bottom: top + height,
  toJSON() { return this },
})

const createLegacyDocument = (url = 'http://localhost/consultarActas.html') => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <div class="ui-accordion" id="main-accordion">
      <div class="ui-accordion-header">Filtros</div>
      <div class="ui-accordion-content" id="filters-panel">
        <div class="ui-datatable" id="grid-filtros">
          <div class="ui-datatable-scrollable-body"></div>
        </div>
      </div>
      <div class="ui-accordion-header">Resultados</div>
      <div class="ui-accordion-content" id="results-panel">
        <div class="ui-datatable" id="grid-resultados">
          <div class="ui-datatable-scrollable-body" id="results-scroll" style="height: 120px; overflow-y: hidden"></div>
          <div class="ui-paginator" id="results-paginator"></div>
        </div>
      </div>
    </div>
  </body></html>`, { url })

  Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 800 })

  const doc = dom.window.document
  const accordion = doc.querySelector('#main-accordion')
  const headers = doc.querySelectorAll('.ui-accordion-header')
  const filtersPanel = doc.querySelector('#filters-panel')
  const resultsPanel = doc.querySelector('#results-panel')
  const filterGrid = doc.querySelector('#grid-filtros')
  const resultGrid = doc.querySelector('#grid-resultados')
  const filterScroll = filterGrid.querySelector('.ui-datatable-scrollable-body')
  const resultScroll = doc.querySelector('#results-scroll')
  const paginator = doc.querySelector('#results-paginator')

  accordion.getBoundingClientRect = () => rect(20, 720)
  headers[0].getBoundingClientRect = () => rect(20, 30)
  filtersPanel.getBoundingClientRect = () => rect(50, 150)
  filterGrid.getBoundingClientRect = () => rect(60, 120)
  filterScroll.getBoundingClientRect = () => rect(70, 90)
  headers[1].getBoundingClientRect = () => rect(210, 30)
  resultsPanel.getBoundingClientRect = () => rect(240, 500)
  resultGrid.getBoundingClientRect = () => rect(250, 480)
  resultScroll.getBoundingClientRect = () => rect(270, 400)
  paginator.getBoundingClientRect = () => rect(690, 38)

  return { dom, doc, filterGrid, resultGrid, resultScroll, paginator }
}

const mountHarness = (iframe) => mount(defineComponent({
  setup(_props, { expose }) {
    const iframeRef = ref(iframe)
    const api = useLegacyIframeLayout(iframeRef)
    expose(api)
    return () => h('div')
  },
}))

describe('useLegacyIframeLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.installAccordionSearchBehavior.mockClear()
    vi.stubGlobal('MutationObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  it('adapta únicamente la grilla principal del segundo panel Filtros + Resultados', async () => {
    const { dom, doc, filterGrid, resultGrid, resultScroll, paginator } = createLegacyDocument()
    const wrapper = mountHarness({
      contentDocument: doc,
      contentWindow: dom.window,
      src: 'http://localhost/pc/consultarActas.html',
    })

    wrapper.vm.onIframeLoad()
    await vi.advanceTimersByTimeAsync(25)

    expect(filterGrid.classList.contains('fm-legacy-main-grid')).toBe(false)
    expect(resultGrid.classList.contains('fm-legacy-main-grid')).toBe(true)
    expect(resultScroll.classList.contains('fm-legacy-main-grid-scroll')).toBe(true)
    expect(paginator.classList.contains('fm-legacy-main-grid-paginator')).toBe(true)
    expect(resultScroll.style.getPropertyValue('overflow-x')).toBe('auto')
    expect(resultScroll.style.getPropertyPriority('overflow-x')).toBe('important')
    expect(resultScroll.style.getPropertyValue('overflow-y')).toBe('auto')

    const computedHeight = Number.parseInt(resultScroll.style.getPropertyValue('height'), 10)
    expect(computedHeight).toBeGreaterThan(50)
    expect(computedHeight).toBeLessThan(800)

    wrapper.unmount()
    dom.window.close()
  })

  it('restaura estilos originales al desmontar y no contamina el documento legacy', async () => {
    const { dom, doc, resultGrid, resultScroll } = createLegacyDocument()
    const wrapper = mountHarness({
      contentDocument: doc,
      contentWindow: dom.window,
      src: 'http://localhost/pc/consultarActas.html',
    })

    wrapper.vm.onIframeLoad()
    await vi.advanceTimersByTimeAsync(25)
    expect(resultScroll.style.height).not.toBe('120px')

    wrapper.unmount()

    expect(resultGrid.classList.contains('fm-legacy-main-grid')).toBe(false)
    expect(resultScroll.classList.contains('fm-legacy-main-grid-scroll')).toBe(false)
    expect(resultScroll.style.height).toBe('120px')
    expect(resultScroll.style.overflowY).toBe('hidden')
    dom.window.close()
  })

  it('conserva el acordeón nativo de Gestión de Operadores', async () => {
    const { dom, doc } = createLegacyDocument('http://localhost/gestionOperadores.html')
    const wrapper = mountHarness({
      contentDocument: doc,
      contentWindow: dom.window,
      src: 'http://localhost/pc/gestionOperadores.html',
    })

    wrapper.vm.onIframeLoad()
    await vi.advanceTimersByTimeAsync(25)

    expect(mocks.installAccordionSearchBehavior).not.toHaveBeenCalled()
    wrapper.unmount()
    dom.window.close()
  })

  it('recalcula el layout frente a resize sin perder el scroll de la grilla', async () => {
    const { dom, doc, resultScroll } = createLegacyDocument()
    const wrapper = mountHarness({
      contentDocument: doc,
      contentWindow: dom.window,
      src: 'http://localhost/pc/consultarActas.html',
    })

    wrapper.vm.onIframeLoad()
    await vi.advanceTimersByTimeAsync(25)
    const firstHeight = resultScroll.style.height

    Object.defineProperty(dom.window, 'innerHeight', { configurable: true, value: 620 })
    dom.window.dispatchEvent(new dom.window.Event('resize'))
    await vi.advanceTimersByTimeAsync(25)

    expect(resultScroll.style.height).not.toBe(firstHeight)
    expect(resultScroll.style.overflowX).toBe('auto')
    expect(resultScroll.style.overflowY).toBe('auto')

    wrapper.unmount()
    dom.window.close()
  })
})
