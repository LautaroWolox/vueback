const MENU_SELECTOR = '.main-menu'
const NESTED_SUBMENU_SELECTOR = [
  '.main-menu .p-menubar-submenu .p-menubar-submenu',
  '.main-menu .p-submenu-list .p-submenu-list'
].join(',')
const OPEN_MENU_SELECTOR = [
  '.main-menu .p-menubar-item-active',
  '.main-menu [data-p-active="true"]',
  '#fm-user-menu-v3'
].join(',')

let currentMenu = null
let menuObserver = null
let documentObserver = null
let alignmentFrame = 0

const iframeLoadHandlers = new Map()
const iframeDocumentHandlers = new Map()

const setImportantStyle = (element, property, value) => {
  if (
    element.style.getPropertyValue(property) === value &&
    element.style.getPropertyPriority(property) === 'important'
  ) {
    return
  }

  element.style.setProperty(property, value, 'important')
}

const isVisibleSubmenu = (submenu) => {
  if (!submenu?.isConnected) return false
  return window.getComputedStyle(submenu).display !== 'none'
}

const alignNestedSubmenu = (submenu) => {
  if (!isVisibleSubmenu(submenu)) return

  const parentItem = submenu.parentElement
  const parentMenu = parentItem?.parentElement

  if (
    !parentItem ||
    !parentMenu ||
    !parentMenu.matches('.p-menubar-submenu, .p-submenu-list')
  ) {
    return
  }

  const parentMenuRect = parentMenu.getBoundingClientRect()
  const parentItemRect = parentItem.getBoundingClientRect()
  const topOffset = Math.round((parentMenuRect.top - parentItemRect.top) * 100) / 100
  const topValue = `${topOffset}px`

  /*
   * PrimeVue posiciona cada submenú hijo tomando como origen el ítem padre.
   * Eso genera una franja vacía arriba cuando el ítem está más abajo en el menú.
   * Recalculamos únicamente el eje vertical para que ambos paneles arranquen
   * exactamente a la misma altura, sin alterar tamaños, colores ni contenido.
   */
  setImportantStyle(submenu, 'top', topValue)
  setImportantStyle(submenu, 'inset-block-start', topValue)
  setImportantStyle(submenu, 'margin-top', '0px')
  setImportantStyle(submenu, 'left', 'calc(100% - 1px)')
  setImportantStyle(submenu, 'inset-inline-start', 'calc(100% - 1px)')
}

const alignOpenSubmenus = () => {
  document.querySelectorAll(NESTED_SUBMENU_SELECTOR).forEach(alignNestedSubmenu)
}

const scheduleAlignment = () => {
  if (alignmentFrame) window.cancelAnimationFrame(alignmentFrame)

  alignmentFrame = window.requestAnimationFrame(() => {
    alignmentFrame = 0
    alignOpenSubmenus()
  })
}

const bindMenu = () => {
  const menu = document.querySelector(MENU_SELECTOR)
  if (!menu || menu === currentMenu) return

  menuObserver?.disconnect()
  currentMenu = menu

  menu.addEventListener('pointerover', scheduleAlignment, true)
  menu.addEventListener('click', scheduleAlignment, true)

  menuObserver = new MutationObserver(scheduleAlignment)
  menuObserver.observe(menu, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-p-active']
  })

  scheduleAlignment()
}

const hasOpenMenu = () => Boolean(document.querySelector(OPEN_MENU_SELECTOR))

const notifyParentOutsideClick = () => {
  if (!hasOpenMenu()) return

  const target = document.body || document.documentElement
  if (!target) return

  /*
   * Los clicks dentro de un iframe no burbujean hacia el documento padre.
   * PrimeVue escucha el click externo en el document principal, por lo que
   * reenviamos un click sintético sobre el body únicamente cuando hay un menú
   * abierto. De esta forma el cierre usa el comportamiento nativo de PrimeVue.
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
    // Un iframe cross-origin no permite leer su document; el blur global cubre ese caso.
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

  bindMenu()
  bindIframesFrom(document)
  window.addEventListener('resize', scheduleAlignment, { passive: true })
  window.addEventListener('blur', handleWindowBlur)

  documentObserver = new MutationObserver((mutations) => {
    if (!currentMenu?.isConnected) bindMenu()

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        bindIframesFrom(node)

        if (node.matches?.(MENU_SELECTOR) || node.querySelector?.(MENU_SELECTOR)) {
          bindMenu()
        }
      })
    })
  })

  documentObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  return () => {
    if (alignmentFrame) window.cancelAnimationFrame(alignmentFrame)

    menuObserver?.disconnect()
    documentObserver?.disconnect()
    window.removeEventListener('resize', scheduleAlignment)
    window.removeEventListener('blur', handleWindowBlur)

    if (currentMenu) {
      currentMenu.removeEventListener('pointerover', scheduleAlignment, true)
      currentMenu.removeEventListener('click', scheduleAlignment, true)
    }

    iframeLoadHandlers.forEach((handler, iframe) => {
      iframe.removeEventListener('load', handler)
    })

    iframeDocumentHandlers.forEach((handler, iframeDocument) => {
      iframeDocument.removeEventListener('pointerdown', handler, true)
    })

    iframeLoadHandlers.clear()
    iframeDocumentHandlers.clear()
    currentMenu = null
    menuObserver = null
    documentObserver = null
  }
}
