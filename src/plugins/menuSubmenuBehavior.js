const OPEN_MENU_SELECTOR = [
  '.main-menu .p-menubar-item-active',
  '.main-menu [data-p-active="true"]',
  '#fm-user-menu-v3'
].join(',')

const MENU_VIDEO_STYLE_ID = 'fm-menu-video-runtime-v2'

const MENU_VIDEO_CSS = `
/*
 * Referencia visual: menú aprobado en video.
 * Se inyecta después de montar Vue para que tenga prioridad sobre los estilos
 * scoped del componente sin modificar grillas, pantallas ni responsive legacy.
 */
html body #app .menu-container .main-menu.p-menubar {
  background: #0fb8bb !important;
}

html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item:hover > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item.p-focus > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item.p-menubar-item-active > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item[data-p-active="true"] > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-root-list > .p-menuitem:hover > .p-menuitem-content,
html body #app .menu-container .main-menu .p-menubar-root-list > .p-menuitem.p-focus > .p-menuitem-content {
  background: #0b9d9e !important;
  box-shadow: none !important;
}

html body #app .menu-container .main-menu .fm-menu-link--root,
html body #app .menu-container .main-menu .fm-menu-link--root .fm-menu-label,
html body #app .menu-container .main-menu .fm-menu-link--root .fm-menu-chevron {
  color: #ffffff !important;
}

html body #app .menu-container .main-menu .p-menubar-submenu,
html body #app .menu-container .main-menu .p-submenu-list {
  padding: 0 !important;
  border: 1px solid #dfe5e8 !important;
  border-radius: 0 !important;
  background: #ffffff !important;
  box-shadow: 0 8px 20px rgba(28, 47, 53, .20) !important;
  overflow: visible !important;
  z-index: 3200 !important;
}

html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menuitem,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item,
html body #app .menu-container .main-menu .p-submenu-list .p-menuitem,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menuitem-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menuitem-content {
  height: 34px !important;
  min-height: 34px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menuitem-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menuitem-content {
  border-bottom: 1px solid #e7ecef !important;
}

html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item:last-child > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menuitem:last-child > .p-menuitem-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item:last-child > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menuitem:last-child > .p-menuitem-content {
  border-bottom: 0 !important;
}

html body #app .menu-container .main-menu .fm-menu-link--submenu {
  width: 100% !important;
  height: 34px !important;
  min-height: 34px !important;
  padding: 0 16px !important;
  gap: 9px !important;
  background: transparent !important;
  color: #3d4a4d !important;
  box-sizing: border-box !important;
}

html body #app .menu-container .main-menu .fm-menu-link--submenu .fm-menu-label {
  color: #3d4a4d !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
}

html body #app .menu-container .main-menu .fm-menu-link--submenu .fm-menu-chevron {
  margin-left: auto !important;
  color: #a7b2b7 !important;
  font-size: 8px !important;
}

html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item-content:hover,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menuitem-content:hover,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item-content:hover,
html body #app .menu-container .main-menu .p-submenu-list .p-menuitem-content:hover,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item.p-menubar-item-active > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item[data-p-active="true"] > .p-menubar-item-content,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item[data-p-active="true"] > .p-menubar-item-content {
  background: #e2f8f8 !important;
  box-shadow: none !important;
  transform: none !important;
}

html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item-content:hover .fm-menu-label,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item-content:hover .fm-menu-chevron,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item-content:hover .fm-menu-label,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item-content:hover .fm-menu-chevron,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-label,
html body #app .menu-container .main-menu .p-menubar-submenu .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-chevron,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-label,
html body #app .menu-container .main-menu .p-submenu-list .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-chevron {
  color: #0b9d9e !important;
}

@media (min-width: 901px) {
  html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item,
  html body #app .menu-container .main-menu .p-menubar-root-list > .p-menuitem,
  html body #app .menu-container .main-menu .p-menubar-submenu > .p-menubar-item,
  html body #app .menu-container .main-menu .p-menubar-submenu > .p-menuitem,
  html body #app .menu-container .main-menu .p-submenu-list > .p-menubar-item,
  html body #app .menu-container .main-menu .p-submenu-list > .p-menuitem {
    position: relative !important;
  }

  /* Primer panel: abre exactamente debajo del item principal que lo invoca. */
  html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item > .p-menubar-submenu,
  html body #app .menu-container .main-menu .p-menubar-root-list > .p-menubar-item > .p-submenu-list,
  html body #app .menu-container .main-menu .p-menubar-root-list > .p-menuitem > .p-menubar-submenu,
  html body #app .menu-container .main-menu .p-menubar-root-list > .p-menuitem > .p-submenu-list {
    position: absolute !important;
    top: 100% !important;
    inset-block-start: 100% !important;
    left: 0 !important;
    inset-inline-start: 0 !important;
    right: auto !important;
    margin: 0 !important;
    width: 244px !important;
    min-width: 244px !important;
    max-width: 244px !important;
    border-top: 0 !important;
    transform: none !important;
  }

  /* Segundo panel: sale desde la misma fila y queda unido al primer panel. */
  html body #app .menu-container .main-menu .p-menubar-submenu > .p-menubar-item > .p-menubar-submenu,
  html body #app .menu-container .main-menu .p-menubar-submenu > .p-menubar-item > .p-submenu-list,
  html body #app .menu-container .main-menu .p-menubar-submenu > .p-menuitem > .p-menubar-submenu,
  html body #app .menu-container .main-menu .p-menubar-submenu > .p-menuitem > .p-submenu-list,
  html body #app .menu-container .main-menu .p-submenu-list > .p-menubar-item > .p-menubar-submenu,
  html body #app .menu-container .main-menu .p-submenu-list > .p-menubar-item > .p-submenu-list,
  html body #app .menu-container .main-menu .p-submenu-list > .p-menuitem > .p-menubar-submenu,
  html body #app .menu-container .main-menu .p-submenu-list > .p-menuitem > .p-submenu-list {
    position: absolute !important;
    top: -1px !important;
    inset-block-start: -1px !important;
    left: calc(100% - 1px) !important;
    inset-inline-start: calc(100% - 1px) !important;
    right: auto !important;
    margin: 0 !important;
    width: 274px !important;
    min-width: 274px !important;
    max-width: 274px !important;
    border-top: 3px solid #0fb8bb !important;
    transform: none !important;
  }
}
`

let documentObserver = null
let menuVisualStyle = null

const iframeLoadHandlers = new Map()
const iframeDocumentHandlers = new Map()

const installMenuVideoStyles = () => {
  let style = document.getElementById(MENU_VIDEO_STYLE_ID)

  if (!style) {
    style = document.createElement('style')
    style.id = MENU_VIDEO_STYLE_ID
    document.head.appendChild(style)
  }

  style.textContent = MENU_VIDEO_CSS
  menuVisualStyle = style
}

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

  installMenuVideoStyles()
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
    menuVisualStyle?.remove()
    menuVisualStyle = null
    documentObserver = null
  }
}
