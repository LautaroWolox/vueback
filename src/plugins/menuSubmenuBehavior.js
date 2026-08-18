const OPEN_MENU_SELECTOR = [
  '.main-menu .p-menubar-item-active',
  '.main-menu [data-p-active="true"]',
  '#fm-user-menu-v3'
].join(',')

let documentObserver = null

const iframeLoadHandlers = new Map()
const iframeDocumentHandlers = new Map()

const hasOpenMenu = () => Boolean(document.querySelector(OPEN_MENU_SELECTOR))

const notifyParentOutsideClick = () => {
  if (!hasOpenMenu()) return

  const target = document.body || document.documentElement
  if (!target) return

  /*
   * Los clicks dentro de un iframe no burbujean hacia el documento padre.
   * PrimeVue ya sabe cerrar el menú al hacer click fuera en el documento principal,
   * por lo que reenviamos un click sintético únicamente cuando el click ocurrió
   * dentro de una pantalla embebida.
   */
  target.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  }))
}

const bindIframeDocument = (iframe) => {
  try {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDocument || iframeDocumentHandlers.has(iframeDocument)) return

    const outsideHandler = () => notifyParentOutsideClick()
    iframeDocument.addEventListener('pointerdown', outsideHandler, true)
    iframeDocumentHandlers.set(iframeDocument, outsideHandler)
  } catch {
    // Si el iframe fuera cross-origin, el blur global cubre el cierre del menú.
  }
}

const bindIframe = (iframe) => {
  if (!(iframe instanceof HTMLIFrameElement)) return

  if (!iframeLoadHandlers.has(iframe)) {
    const loadHandler = () => bindIframeDocument(iframe)
    iframe.addEventListener('load', loadHandler)
    iframeLoadHandlers.set(iframe, loadHandler)
  }

  bindIframeDocument(iframe)
}

const bindIframesFrom = (root) => {
  if (!root) return

  if (root instanceof HTMLIFrameElement) bindIframe(root)
  root.querySelectorAll?.('iframe').forEach(bindIframe)
}

const handleWindowBlur = () => {
  window.setTimeout(() => {
    if (document.activeElement instanceof HTMLIFrameElement) {
      notifyParentOutsideClick()
    }
  }, 0)
}

export const installMenuSubmenuBehavior = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  bindIframesFrom(document)
  window.addEventListener('blur', handleWindowBlur)

  documentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        bindIframesFrom(node)
      })
    })
  })

  documentObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  return () => {
    documentObserver?.disconnect()
    window.removeEventListener('blur', handleWindowBlur)

    iframeLoadHandlers.forEach((handler, iframe) => {
      iframe.removeEventListener('load', handler)
    })

    iframeDocumentHandlers.forEach((handler, iframeDocument) => {
      iframeDocument.removeEventListener('pointerdown', handler, true)
    })

    iframeLoadHandlers.clear()
    iframeDocumentHandlers.clear()
    documentObserver = null
  }
}
