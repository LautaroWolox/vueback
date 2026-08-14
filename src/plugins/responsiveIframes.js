import globalCss from '@/assets/css/fm-global.css?raw'

const LEGACY_START = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
const LEGACY_END = '/* ===== FIN: fm-legacy-responsive.css ===== */'

const legacyStartIndex = globalCss.indexOf(LEGACY_START)
const legacyEndIndex = globalCss.indexOf(LEGACY_END)

if (legacyStartIndex === -1 || legacyEndIndex === -1 || legacyEndIndex <= legacyStartIndex) {
  throw new Error('No se encontró la sección responsive legacy en fm-global.css')
}

const legacyResponsiveCss = globalCss
  .slice(legacyStartIndex + LEGACY_START.length, legacyEndIndex)
  .trim()

const STYLE_ID = 'fm-legacy-responsive-styles'
const NATIVE_CONTROLS_PATHS = new Set(['/gestionOperadores.html'])
const actionObservers = new WeakMap()
const viewportBindings = new WeakMap()

const getIframePathname = (iframe) => {
  try {
    return iframe.contentWindow?.location?.pathname || new URL(iframe.src, window.location.href).pathname
  } catch {
    try {
      return new URL(iframe.src, window.location.href).pathname
    } catch {
      return ''
    }
  }
}

const isNotebookEnvironment = (view) => {
  if (!view) return false

  const screenWidth = Math.max(
    Number(view.screen?.width || 0),
    Number(view.screen?.availWidth || 0)
  )
  const screenHeight = Math.max(
    Number(view.screen?.height || 0),
    Number(view.screen?.availHeight || 0)
  )
  const finePointer = Boolean(view.matchMedia?.('(pointer: fine)')?.matches)
  const coarsePointer = Boolean(view.matchMedia?.('(pointer: coarse)')?.matches)

  // screen.width no cae con el zoom del navegador. Así una notebook de 1366 px
  // sigue siendo tratada como notebook aunque a 150% tenga ~910 CSS px de viewport.
  return screenWidth >= 900 && screenHeight >= 560 && (finePointer || !coarsePointer)
}

const applyViewportProfile = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!document?.body || !view) return

  const notebook = isNotebookEnvironment(view)
  const viewportWidth = Math.max(
    Number(view.innerWidth || 0),
    Number(document.documentElement?.clientWidth || 0)
  )

  document.body.classList.toggle('fm-legacy-notebook', notebook)
  document.body.classList.toggle(
    'fm-legacy-notebook-compact',
    notebook && viewportWidth <= 1100
  )
}

const bindViewportProfile = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!view || viewportBindings.has(document)) {
    applyViewportProfile(iframe, document)
    return
  }

  const update = () => applyViewportProfile(iframe, document)
  view.addEventListener('resize', update, { passive: true })
  view.visualViewport?.addEventListener('resize', update, { passive: true })
  viewportBindings.set(document, update)
  update()
}

const getControlLabel = (element) => String(
  element.value ||
  element.textContent ||
  element.getAttribute?.('aria-label') ||
  element.getAttribute?.('title') ||
  ''
).trim().replace(/\s+/g, ' ').toUpperCase()

const markGestionOperadoresActions = (document) => {
  if (!document?.body?.classList.contains('fm-legacy-native-controls')) return

  const controls = document.querySelectorAll(
    'button, input[type="button"], input[type="submit"], a.btn, .ui-button'
  )

  controls.forEach((control) => {
    const label = getControlLabel(control)
    control.classList.toggle('fm-legacy-action-search', label === 'BUSCAR')
    control.classList.toggle('fm-legacy-action-clear', label === 'LIMPIAR')
  })
}

const observeGestionOperadoresActions = (document) => {
  if (!document?.body?.classList.contains('fm-legacy-native-controls')) return

  markGestionOperadoresActions(document)

  if (actionObservers.has(document)) return

  const observer = new MutationObserver(() => {
    markGestionOperadoresActions(document)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  actionObservers.set(document, observer)
}

const applyResponsiveStyles = (iframe) => {
  try {
    const document = iframe.contentDocument || iframe.contentWindow?.document
    if (!document?.head || !document?.body) return

    const usesNativeControls = NATIVE_CONTROLS_PATHS.has(getIframePathname(iframe))

    document.body.classList.add('fm-responsive-legacy')
    document.body.classList.toggle('fm-legacy-native-controls', usesNativeControls)
    bindViewportProfile(iframe, document)

    let style = document.getElementById(STYLE_ID)
    if (!style) {
      style = document.createElement('style')
      style.id = STYLE_ID
      document.head.appendChild(style)
    }

    style.textContent = legacyResponsiveCss

    if (usesNativeControls) {
      observeGestionOperadoresActions(document)
    }
  } catch {}
}

const attachIframe = (iframe) => {
  if (!(iframe instanceof HTMLIFrameElement)) return
  if (iframe.dataset.fmResponsiveAttached === 'true') return

  iframe.dataset.fmResponsiveAttached = 'true'
  iframe.addEventListener('load', () => applyResponsiveStyles(iframe))
  applyResponsiveStyles(iframe)
}

export const installResponsiveIframes = () => {
  const attachAll = (root = document) => {
    root.querySelectorAll?.('iframe').forEach(attachIframe)
  }

  attachAll()

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node.matches('iframe')) attachIframe(node)
        attachAll(node)
      })
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  return () => observer.disconnect()
}
