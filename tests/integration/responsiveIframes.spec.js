import { beforeEach, describe, expect, it } from 'vitest'
import { installResponsiveIframes } from '@/plugins/responsiveIframes'

const createIframe = (src = '/pc/consultarActas.html') => {
  const iframe = document.createElement('iframe')
  iframe.src = src
  document.body.appendChild(iframe)
  return iframe
}

const makeVisible = (element, { top = 20, left = 20, width = 600, height = 300 } = {}) => {
  element.getBoundingClientRect = () => ({
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON() { return this },
  })
}

describe('responsiveIframes - integración', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('marca e inicializa iframes existentes sin alterar el documento padre', () => {
    const iframe = createIframe()
    const stop = installResponsiveIframes()

    expect(iframe.dataset.fmResponsiveAttached).toBe('true')

    iframe.dispatchEvent(new Event('load'))
    const iframeDocument = iframe.contentDocument

    expect(iframeDocument.body.classList.contains('fm-responsive-legacy')).toBe(true)
    expect(iframeDocument.getElementById('fm-legacy-responsive-styles')).not.toBeNull()
    expect(document.body.classList.contains('fm-responsive-legacy')).toBe(false)

    stop()
  })

  it('adjunta automáticamente iframes agregados después de instalar el plugin', async () => {
    const stop = installResponsiveIframes()
    const iframe = createIframe('/pc/jobtypeContrato.html')

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(iframe.dataset.fmResponsiveAttached).toBe('true')
    stop()
  })

  it('no duplica el style responsive al recibir múltiples eventos load', () => {
    const iframe = createIframe()
    const stop = installResponsiveIframes()

    iframe.dispatchEvent(new Event('load'))
    iframe.dispatchEvent(new Event('load'))

    expect(iframe.contentDocument.querySelectorAll('#fm-legacy-responsive-styles')).toHaveLength(1)
    stop()
  })

  it('mantiene el iframe de Gestión de Operadores con controles nativos', () => {
    const iframe = createIframe('/pc/gestionOperadores.html')
    const stop = installResponsiveIframes()

    iframe.dispatchEvent(new Event('load'))

    expect(iframe.contentDocument.body.classList.contains('fm-legacy-native-controls')).toBe(true)
    stop()
  })

  it('limita diálogos legacy al viewport y habilita scroll interno', () => {
    const iframe = createIframe('/pc/consultarActas.html')
    const iframeDocument = iframe.contentDocument
    const iframeWindow = iframe.contentWindow

    Object.defineProperty(iframeWindow, 'innerWidth', { configurable: true, value: 1024 })
    Object.defineProperty(iframeWindow, 'innerHeight', { configurable: true, value: 700 })

    const dialog = iframeDocument.createElement('div')
    dialog.className = 'ui-dialog'
    const body = iframeDocument.createElement('div')
    body.className = 'ui-dialog-content'
    dialog.appendChild(body)
    iframeDocument.body.appendChild(dialog)

    makeVisible(dialog, { top: 50, left: 50, width: 900, height: 620 })
    makeVisible(body, { top: 100, left: 70, width: 840, height: 500 })

    const stop = installResponsiveIframes()
    iframe.dispatchEvent(new Event('load'))

    expect(dialog.classList.contains('fm-legacy-responsive-dialog')).toBe(true)
    expect(dialog.style.getPropertyValue('max-width')).toBe('1008px')
    expect(dialog.style.getPropertyValue('max-height')).toBe('684px')
    expect(body.classList.contains('fm-legacy-responsive-dialog-scroll')).toBe(true)
    expect(body.style.getPropertyValue('overflow-x')).toBe('auto')
    expect(body.style.getPropertyValue('overflow-y')).toBe('auto')

    stop()
  })
})
