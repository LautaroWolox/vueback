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

const DIALOG_EXPLICIT_SELECTOR = [
  '.ui-dialog',
  '.p-dialog',
  '.modal-dialog',
  '.modal-content',
  '.bootbox',
  '.swal2-popup',
  '[role="dialog"]',
  '[aria-modal="true"]'
].join(',')

const DIALOG_WRAPPER_SELECTOR = [
  '.modal',
  '.p-dialog-mask',
  '.ui-dialog-mask',
  '.ui-widget-overlay'
].join(',')

const DIALOG_BODY_SELECTOR = [
  '.modal-body',
  '.ui-dialog-content',
  '.p-dialog-content',
  '.bootbox-body',
  '.swal2-html-container',
  '.tab-content',
  '.ui-tabs-panels'
].join(',')

const DIALOG_HEADER_SELECTOR = [
  '.modal-header',
  '.ui-dialog-titlebar',
  '.p-dialog-header',
  '.bootbox-header',
  '.swal2-title'
].join(',')

const DIALOG_FOOTER_SELECTOR = [
  '.modal-footer',
  '.ui-dialog-buttonpane',
  '.p-dialog-footer',
  '.bootbox-footer',
  '.swal2-actions'
].join(',')

const actionObservers = new WeakMap()
const viewportBindings = new WeakMap()
const dialogObservers = new WeakMap()
const documentScrollState = new WeakMap()

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

  return screenWidth >= 800 && screenHeight >= 480 && (finePointer || !coarsePointer)
}

const getVisualViewportSize = (view, document) => {
  const visualViewport = view?.visualViewport

  const width = Number(
    visualViewport?.width ||
    view?.innerWidth ||
    document?.documentElement?.clientWidth ||
    0
  )
  const height = Number(
    visualViewport?.height ||
    view?.innerHeight ||
    document?.documentElement?.clientHeight ||
    0
  )

  return {
    width: Math.max(320, Math.floor(width)),
    height: Math.max(240, Math.floor(height)),
    offsetLeft: Math.max(0, Math.floor(Number(visualViewport?.offsetLeft || 0))),
    offsetTop: Math.max(0, Math.floor(Number(visualViewport?.offsetTop || 0)))
  }
}

const isVisibleElement = (element, view) => {
  if (!element || !view || !element.isConnected) return false

  const style = view.getComputedStyle(element)
  if (
    element.hidden ||
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    Number(style.opacity || 1) === 0
  ) {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

const getDialogSurface = (candidate) => {
  if (!candidate) return null

  if (candidate.matches?.('.modal-content')) {
    return candidate.closest?.('.modal-dialog') || candidate
  }

  if (candidate.matches?.('.modal-dialog')) return candidate

  if (candidate.matches?.('.modal')) {
    return candidate.querySelector?.('.modal-dialog') || candidate.querySelector?.('.modal-content') || null
  }

  return candidate
}

const isLikelyDialogByGeometry = (element, view, viewport) => {
  if (!isVisibleElement(element, view)) return false

  const style = view.getComputedStyle(element)
  if (!['fixed', 'absolute'].includes(style.position)) return false

  const rect = element.getBoundingClientRect()
  if (rect.width < 260 || rect.height < 140) return false

  const almostFullViewport = (
    rect.width >= viewport.width * 0.94 &&
    rect.height >= viewport.height * 0.94
  )
  if (almostFullViewport) return false

  const zIndex = Number.parseInt(style.zIndex, 10)
  const hasForegroundDepth = Number.isFinite(zIndex) && zIndex >= 50
  const hasDialogContent = Boolean(
    element.querySelector?.('button, input, select, textarea, table, .ui-tabs, .nav-tabs')
  )

  return hasDialogContent && (hasForegroundDepth || style.boxShadow !== 'none')
}

const findHeuristicDialogs = (document, view, viewport) => {
  const candidates = document.querySelectorAll([
    'body > div',
    'body > section',
    '[class*="popup"]',
    '[class*="dialog"]',
    '[id*="popup"]',
    '[id*="dialog"]'
  ].join(','))

  return [...candidates].filter((element) => isLikelyDialogByGeometry(element, view, viewport))
}

const findVisibleDialogSurfaces = (document, view, viewport) => {
  const surfaces = new Set()

  document.querySelectorAll(DIALOG_EXPLICIT_SELECTOR).forEach((candidate) => {
    const surface = getDialogSurface(candidate)
    if (isVisibleElement(surface, view)) surfaces.add(surface)
  })

  document.querySelectorAll('.modal').forEach((wrapper) => {
    if (!isVisibleElement(wrapper, view)) return
    const surface = getDialogSurface(wrapper)
    if (isVisibleElement(surface, view)) surfaces.add(surface)
  })

  findHeuristicDialogs(document, view, viewport).forEach((surface) => surfaces.add(surface))

  return [...surfaces].filter((surface) => {
    return ![...surfaces].some((other) => other !== surface && surface.contains(other))
  })
}

const findDialogScrollArea = (surface, view) => {
  if (!surface) return null

  const explicitAreas = [...surface.querySelectorAll(DIALOG_BODY_SELECTOR)]
    .filter((element) => isVisibleElement(element, view))
    .sort((a, b) => {
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      return (br.width * br.height) - (ar.width * ar.height)
    })

  if (explicitAreas[0]) return explicitAreas[0]

  const overflowCandidates = [...surface.querySelectorAll('div, section, form')]
    .filter((element) => {
      if (!isVisibleElement(element, view)) return false
      return element.scrollHeight > element.clientHeight + 2 || element.scrollWidth > element.clientWidth + 2
    })
    .sort((a, b) => {
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      return (br.width * br.height) - (ar.width * ar.height)
    })

  return overflowCandidates[0] || surface
}

const ensureDocumentScrollBaseline = (document) => {
  const html = document?.documentElement
  const body = document?.body
  if (!html || !body || documentScrollState.has(document)) return

  documentScrollState.set(document, {
    htmlOverflow: html.style.overflow,
    htmlOverflowY: html.style.overflowY,
    bodyOverflow: body.style.overflow,
    bodyOverflowY: body.style.overflowY
  })
}

const setDocumentScroll = (document, enabled) => {
  const html = document?.documentElement
  const body = document?.body
  if (!html || !body) return

  ensureDocumentScrollBaseline(document)
  const baseline = documentScrollState.get(document)

  if (enabled) {
    html.classList.add('fm-legacy-dialog-open')
    body.classList.add('fm-legacy-dialog-open')
    html.style.setProperty('overflow-y', 'auto', 'important')
    body.style.setProperty('overflow-y', 'auto', 'important')
    return
  }

  html.classList.remove('fm-legacy-dialog-open')
  body.classList.remove('fm-legacy-dialog-open')

  if (!baseline) return

  html.style.overflow = baseline.htmlOverflow
  html.style.overflowY = baseline.htmlOverflowY
  body.style.overflow = baseline.bodyOverflow
  body.style.overflowY = baseline.bodyOverflowY
}

const applyDialogSurfaceLayout = (surface, document, view, viewport) => {
  const margin = 8
  const maxWidth = Math.max(304, viewport.width - margin * 2)
  const maxHeight = Math.max(224, viewport.height - margin * 2)

  surface.classList.add('fm-legacy-responsive-dialog')
  surface.style.setProperty('box-sizing', 'border-box', 'important')
  surface.style.setProperty('max-width', `${maxWidth}px`, 'important')
  surface.style.setProperty('max-height', `${maxHeight}px`, 'important')

  const wrapper = surface.closest?.(DIALOG_WRAPPER_SELECTOR)
  if (wrapper && wrapper !== surface && isVisibleElement(wrapper, view)) {
    wrapper.classList.add('fm-legacy-responsive-dialog-overlay')
    wrapper.style.setProperty('overflow-x', 'auto', 'important')
    wrapper.style.setProperty('overflow-y', 'auto', 'important')
    wrapper.style.setProperty('max-width', `${viewport.width}px`, 'important')
    wrapper.style.setProperty('max-height', `${viewport.height}px`, 'important')
  }

  let rect = surface.getBoundingClientRect()
  if (rect.width > maxWidth + 1) {
    surface.style.setProperty('width', `${maxWidth}px`, 'important')
  }

  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')
  const outsideViewport = (
    rect.top < viewport.offsetTop + margin ||
    rect.left < viewport.offsetLeft + margin ||
    rect.right > viewport.offsetLeft + viewport.width - margin ||
    rect.bottom > viewport.offsetTop + viewport.height - margin
  )

  if (compactNotebook && outsideViewport) {
    surface.style.setProperty('position', 'fixed', 'important')
    surface.style.setProperty('top', `${viewport.offsetTop + margin}px`, 'important')
    surface.style.setProperty('left', `${viewport.offsetLeft + viewport.width / 2}px`, 'important')
    surface.style.setProperty('right', 'auto', 'important')
    surface.style.setProperty('bottom', 'auto', 'important')
    surface.style.setProperty('margin', '0', 'important')
    surface.style.setProperty('transform', 'translateX(-50%)', 'important')
  }

  rect = surface.getBoundingClientRect()

  const header = [...surface.querySelectorAll(DIALOG_HEADER_SELECTOR)]
    .find((element) => isVisibleElement(element, view))
  const footer = [...surface.querySelectorAll(DIALOG_FOOTER_SELECTOR)]
    .find((element) => isVisibleElement(element, view))
  const scrollArea = findDialogScrollArea(surface, view)

  const headerHeight = header?.getBoundingClientRect().height || 0
  const footerHeight = footer?.getBoundingClientRect().height || 0
  const availableBodyHeight = Math.max(
    120,
    Math.floor(maxHeight - headerHeight - footerHeight - 20)
  )

  if (scrollArea) {
    scrollArea.classList.add('fm-legacy-responsive-dialog-scroll')
    scrollArea.style.setProperty('min-width', '0', 'important')
    scrollArea.style.setProperty('max-width', '100%', 'important')
    scrollArea.style.setProperty('max-height', `${availableBodyHeight}px`, 'important')
    scrollArea.style.setProperty('overflow-x', 'auto', 'important')
    scrollArea.style.setProperty('overflow-y', 'auto', 'important')
    scrollArea.style.setProperty('overscroll-behavior', 'contain', 'important')
  }

  if (rect.height > maxHeight + 1 || !scrollArea || scrollArea === surface) {
    surface.style.setProperty('overflow-x', 'auto', 'important')
    surface.style.setProperty('overflow-y', 'auto', 'important')
  }
}

const applyResponsiveDialogLayout = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!document?.body || !view) return

  const viewport = getVisualViewportSize(view, document)
  const surfaces = findVisibleDialogSurfaces(document, view, viewport)

  setDocumentScroll(document, surfaces.length > 0 || document.body.classList.contains('modal-open'))

  surfaces.forEach((surface) => {
    applyDialogSurfaceLayout(surface, document, view, viewport)
  })
}

const applyViewportProfile = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!document?.body || !view) return

  const notebook = isNotebookEnvironment(view)
  const viewport = getVisualViewportSize(view, document)

  document.body.classList.toggle('fm-legacy-notebook', notebook)
  document.body.classList.toggle(
    'fm-legacy-notebook-compact',
    notebook && viewport.width <= 1100
  )
  document.documentElement.classList.toggle('fm-legacy-notebook', notebook)
  document.documentElement.classList.toggle(
    'fm-legacy-notebook-compact',
    notebook && viewport.width <= 1100
  )

  const cssWidth = `${viewport.width}px`
  const cssHeight = `${viewport.height}px`
  document.documentElement.style.setProperty('--fm-legacy-visual-width', cssWidth)
  document.documentElement.style.setProperty('--fm-legacy-visual-height', cssHeight)
  document.body.style.setProperty('--fm-legacy-visual-width', cssWidth)
  document.body.style.setProperty('--fm-legacy-visual-height', cssHeight)
}

const bindViewportProfile = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!view || viewportBindings.has(document)) {
    applyViewportProfile(iframe, document)
    applyResponsiveDialogLayout(iframe, document)
    return
  }

  const update = () => {
    applyViewportProfile(iframe, document)
    applyResponsiveDialogLayout(iframe, document)
  }

  view.addEventListener('resize', update, { passive: true })
  view.visualViewport?.addEventListener('resize', update, { passive: true })
  view.visualViewport?.addEventListener('scroll', update, { passive: true })
  viewportBindings.set(document, update)
  update()
}

const observeResponsiveDialogs = (iframe, document) => {
  if (!document?.body || dialogObservers.has(document)) {
    applyResponsiveDialogLayout(iframe, document)
    return
  }

  const view = document.defaultView || iframe?.contentWindow
  let timer = null

  const schedule = () => {
    if (timer !== null) view?.clearTimeout(timer)
    timer = view?.setTimeout(() => {
      timer = null
      applyResponsiveDialogLayout(iframe, document)
    }, 20)
  }

  const observer = new MutationObserver(schedule)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'aria-hidden', 'aria-modal']
  })

  document.addEventListener('click', () => {
    schedule()
    view?.setTimeout(schedule, 100)
    view?.setTimeout(schedule, 300)
  }, true)

  dialogObservers.set(document, observer)
  schedule()
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
    ensureDocumentScrollBaseline(document)

    let style = document.getElementById(STYLE_ID)
    if (!style) {
      style = document.createElement('style')
      style.id = STYLE_ID
      document.head.appendChild(style)
    }

    style.textContent = legacyResponsiveCss

    bindViewportProfile(iframe, document)
    observeResponsiveDialogs(iframe, document)

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
