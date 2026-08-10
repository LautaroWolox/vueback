import { onBeforeUnmount } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

const STYLE_ID = 'fm-legacy-layout-only'

const LAYOUT_CSS = `
  html.fm-legacy-layout-root,
  body.fm-legacy-layout {
    min-height: 100% !important;
  }

  body.fm-legacy-layout {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  body.fm-legacy-layout .fm-legacy-accordion-root {
    width: 100% !important;
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded {
    height: 100vh !important;
    min-height: 100vh !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-accordion-root {
    height: 100% !important;
    min-height: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-accordion-first {
    flex: 0 0 auto !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-accordion-grid {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-content {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    max-height: none !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-shell {
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: none !important;
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-scroll {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    flex: 1 1 auto !important;
    overflow: auto !important;
  }
`

const HEADER_SELECTORS = [
  '.ui-accordion-header',
  '.accordion-heading',
  '.accordion-header',
  '.panel-heading',
  '[data-toggle="collapse"]',
  '[data-bs-toggle="collapse"]'
].join(',')

const CONTENT_SELECTORS = [
  '.ui-accordion-content',
  '.accordion-inner',
  '.accordion-content',
  '.accordion-collapse',
  '.panel-collapse',
  '.collapse'
].join(',')

const ITEM_SELECTORS = [
  '.accordion-group',
  '.accordion-item',
  '.ui-accordion-panel',
  '.panel'
].join(',')

const GRID_SHELL_SELECTORS = [
  '.ui-datatable',
  '.dataTables_wrapper',
  '.p-datatable',
  '.ag-root-wrapper',
  '.jqx-grid',
  '.handsontable',
  '.table-responsive'
].join(',')

const GRID_SCROLL_SELECTORS = [
  '.ui-datatable-scrollable-body',
  '.ui-datatable-tablewrapper',
  '.dataTables_scrollBody',
  '.p-datatable-table-container',
  '.p-datatable-wrapper',
  '.ag-body-viewport',
  '.jqx-grid-content',
  '.ht_master .wtHolder'
].join(',')

const getItem = (header) => header.closest(ITEM_SELECTORS) || header

const getContent = (header, item) => {
  const next = header.nextElementSibling
  if (next?.matches?.(CONTENT_SELECTORS)) return next
  return item?.querySelector?.(CONTENT_SELECTORS) || null
}

const isVisible = (element, view) => {
  if (!element) return false
  const style = view.getComputedStyle(element)
  return !element.hidden && style.display !== 'none' && style.visibility !== 'hidden'
}

const isOpen = (header, content, view) => {
  const expanded = header?.getAttribute?.('aria-expanded')
  if (expanded === 'true') return true
  if (expanded === 'false') return false

  if (header?.classList?.contains('ui-state-active') || header?.classList?.contains('active')) {
    return true
  }

  if (content?.classList?.contains('show') || content?.classList?.contains('in')) return true
  return isVisible(content, view)
}

const clearMarkers = (doc) => {
  doc.querySelectorAll([
    '.fm-legacy-accordion-root',
    '.fm-legacy-accordion-first',
    '.fm-legacy-accordion-grid',
    '.fm-legacy-grid-content',
    '.fm-legacy-grid-shell',
    '.fm-legacy-grid-scroll'
  ].join(',')).forEach((element) => {
    element.classList.remove(
      'fm-legacy-accordion-root',
      'fm-legacy-accordion-first',
      'fm-legacy-accordion-grid',
      'fm-legacy-grid-content',
      'fm-legacy-grid-shell',
      'fm-legacy-grid-scroll'
    )
  })
}

const findAccordionRoot = (headers) => {
  const firstHeader = headers[0]
  return firstHeader?.closest('.ui-accordion, .accordion') || firstHeader?.parentElement || null
}

export function useLegacyIframeLayout(iframeRef) {
  let observer = null
  let currentDocument = null
  let clickHandler = null
  let resizeHandler = null
  let updateTimer = null
  let removeSearchBehavior = null

  const cleanupDocument = () => {
    if (updateTimer) window.clearTimeout(updateTimer)
    updateTimer = null

    observer?.disconnect()
    observer = null

    removeSearchBehavior?.()
    removeSearchBehavior = null

    if (currentDocument && clickHandler) {
      currentDocument.removeEventListener('click', clickHandler, true)
    }

    if (currentDocument?.defaultView && resizeHandler) {
      currentDocument.defaultView.removeEventListener('resize', resizeHandler)
    }

    currentDocument?.body?.classList.remove('fm-legacy-layout', 'fm-legacy-grid-expanded')
    currentDocument?.documentElement?.classList.remove('fm-legacy-layout-root')
    if (currentDocument) clearMarkers(currentDocument)

    currentDocument = null
    clickHandler = null
    resizeHandler = null
  }

  const applyLayout = () => {
    const doc = currentDocument
    const view = doc?.defaultView
    if (!doc?.body || !view) return

    const headers = [...doc.querySelectorAll(HEADER_SELECTORS)]
      .filter((header) => header.closest('.ui-accordion, .accordion, .accordion-group, .accordion-item, .panel'))

    if (headers.length < 2) {
      doc.body.classList.remove('fm-legacy-grid-expanded')
      return
    }

    const firstHeader = headers[0]
    const secondHeader = headers[1]
    const firstItem = getItem(firstHeader)
    const secondItem = getItem(secondHeader)
    const firstContent = getContent(firstHeader, firstItem)
    const secondContent = getContent(secondHeader, secondItem)
    const accordionRoot = findAccordionRoot(headers)
    const firstLayoutItem = firstItem === firstHeader ? firstHeader : firstItem
    const secondLayoutItem = secondItem === secondHeader ? (secondContent || secondHeader) : secondItem

    accordionRoot?.classList.add('fm-legacy-accordion-root')
    firstLayoutItem?.classList.add('fm-legacy-accordion-first')
    secondLayoutItem?.classList.add('fm-legacy-accordion-grid')
    secondContent?.classList.add('fm-legacy-grid-content')

    const gridShell = secondContent?.querySelector(GRID_SHELL_SELECTORS)
    const gridScroll = secondContent?.querySelector(GRID_SCROLL_SELECTORS)

    gridShell?.classList.add('fm-legacy-grid-shell')
    gridScroll?.classList.add('fm-legacy-grid-scroll')

    const shouldExpand = !isOpen(firstHeader, firstContent, view) && isOpen(secondHeader, secondContent, view)
    doc.body.classList.toggle('fm-legacy-grid-expanded', shouldExpand)
  }

  const scheduleLayout = () => {
    if (updateTimer) window.clearTimeout(updateTimer)
    updateTimer = window.setTimeout(applyLayout, 40)
  }

  const onIframeLoad = () => {
    cleanupDocument()

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
      style.textContent = LAYOUT_CSS
      doc.head.appendChild(style)
    }

    doc.documentElement.classList.add('fm-legacy-layout-root')
    doc.body.classList.add('fm-legacy-layout')

    removeSearchBehavior = installAccordionSearchBehavior(doc)
    clickHandler = scheduleLayout
    resizeHandler = scheduleLayout

    doc.addEventListener('click', clickHandler, true)
    doc.defaultView?.addEventListener('resize', resizeHandler)

    observer = new MutationObserver(scheduleLayout)
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-expanded']
    })

    applyLayout()
  }

  onBeforeUnmount(cleanupDocument)

  return { onIframeLoad }
}
