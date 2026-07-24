import { onBeforeUnmount } from 'vue'

const STYLE_ID = 'fm-legacy-viewport-fix'

const VIEWPORT_CSS = `
  html.fm-legacy-viewport-root {
    height: 100% !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }

  html.fm-legacy-viewport-root body.fm-legacy-layout.fm-legacy-grid-expanded {
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-accordion-root {
    height: var(--fm-legacy-available-height, calc(100vh - 6px)) !important;
    min-height: 0 !important;
    max-height: var(--fm-legacy-available-height, calc(100vh - 6px)) !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-accordion-grid,
  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-content,
  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-shell {
    box-sizing: border-box !important;
  }
`

export function useLegacyIframeViewport(iframeRef) {
  let currentDocument = null
  let observer = null
  let resizeHandler = null
  let clickHandler = null
  let updateTimer = null

  const clearTimer = () => {
    if (!updateTimer) return
    window.clearTimeout(updateTimer)
    updateTimer = null
  }

  const resetViewport = () => {
    const root = currentDocument?.querySelector('.fm-legacy-accordion-root')
    root?.style.removeProperty('--fm-legacy-available-height')
    currentDocument?.documentElement?.classList.remove('fm-legacy-viewport-root')
  }

  const cleanup = () => {
    clearTimer()
    observer?.disconnect()
    observer = null

    if (currentDocument && clickHandler) {
      currentDocument.removeEventListener('click', clickHandler, true)
    }

    if (currentDocument?.defaultView && resizeHandler) {
      currentDocument.defaultView.removeEventListener('resize', resizeHandler)
    }

    resetViewport()
    currentDocument = null
    resizeHandler = null
    clickHandler = null
  }

  const applyViewport = () => {
    const doc = currentDocument
    const view = doc?.defaultView
    const body = doc?.body
    const root = doc?.querySelector('.fm-legacy-accordion-root')
    const expanded = body?.classList.contains('fm-legacy-grid-expanded')

    if (!doc?.documentElement || !view || !body || !root || !expanded) {
      resetViewport()
      return
    }

    const viewportHeight = view.innerHeight || doc.documentElement.clientHeight || 0
    const rootTop = Math.max(0, root.getBoundingClientRect().top)
    const availableHeight = Math.max(Math.floor(viewportHeight - rootTop - 6), 180)

    root.style.setProperty('--fm-legacy-available-height', `${availableHeight}px`)
    doc.documentElement.classList.add('fm-legacy-viewport-root')
  }

  const scheduleViewport = () => {
    clearTimer()
    updateTimer = window.setTimeout(applyViewport, 60)
  }

  const onIframeLoad = () => {
    cleanup()

    const iframe = iframeRef.value
    let doc

    try {
      doc = iframe?.contentDocument || iframe?.contentWindow?.document
    } catch {
      return
    }

    if (!doc?.head || !doc?.body) return
    currentDocument = doc

    let style = doc.getElementById(STYLE_ID)
    if (!style) {
      style = doc.createElement('style')
      style.id = STYLE_ID
      style.textContent = VIEWPORT_CSS
      doc.head.appendChild(style)
    }

    clickHandler = scheduleViewport
    resizeHandler = scheduleViewport

    doc.addEventListener('click', clickHandler, true)
    doc.defaultView?.addEventListener('resize', resizeHandler)

    observer = new MutationObserver(scheduleViewport)
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-expanded']
    })

    scheduleViewport()
    window.setTimeout(applyViewport, 140)
  }

  onBeforeUnmount(cleanup)

  return { onIframeLoad }
}
