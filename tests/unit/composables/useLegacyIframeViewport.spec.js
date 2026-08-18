import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLegacyIframeViewport } from '@/composables/useLegacyIframeViewport'

let wrapper = null

describe('useLegacyIframeViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    wrapper = null
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllTimers()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('inyecta el CSS y calcula el alto disponible cuando la grilla legacy está expandida', async () => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument
    const root = doc.createElement('div')
    root.className = 'fm-legacy-accordion-root'
    root.getBoundingClientRect = () => ({ top: 100 })
    doc.body.classList.add('fm-legacy-layout', 'fm-legacy-grid-expanded')
    doc.body.appendChild(root)
    Object.defineProperty(doc.defaultView, 'innerHeight', { configurable: true, value: 800 })

    let api
    const Host = defineComponent({
      setup() {
        api = useLegacyIframeViewport(ref(iframe))
        return () => h('div')
      },
    })
    wrapper = mount(Host)

    api.onIframeLoad()
    await vi.advanceTimersByTimeAsync(200)

    expect(doc.getElementById('fm-legacy-viewport-fix')).not.toBeNull()
    expect(doc.documentElement.classList.contains('fm-legacy-viewport-root')).toBe(true)
    expect(root.style.getPropertyValue('--fm-legacy-available-height')).toBe('694px')
  })

  it('restaura clase y variable de altura al desmontar', async () => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument
    const root = doc.createElement('div')
    root.className = 'fm-legacy-accordion-root'
    root.getBoundingClientRect = () => ({ top: 50 })
    doc.body.classList.add('fm-legacy-layout', 'fm-legacy-grid-expanded')
    doc.body.appendChild(root)
    Object.defineProperty(doc.defaultView, 'innerHeight', { configurable: true, value: 700 })

    let api
    const Host = defineComponent({
      setup() {
        api = useLegacyIframeViewport(ref(iframe))
        return () => h('div')
      },
    })
    wrapper = mount(Host)

    api.onIframeLoad()
    await vi.advanceTimersByTimeAsync(200)
    expect(root.style.getPropertyValue('--fm-legacy-available-height')).toBe('644px')

    wrapper.unmount()
    wrapper = null

    expect(doc.documentElement.classList.contains('fm-legacy-viewport-root')).toBe(false)
    expect(root.style.getPropertyValue('--fm-legacy-available-height')).toBe('')
  })
})
