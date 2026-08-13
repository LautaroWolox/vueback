import { onBeforeUnmount } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

const STYLE_ID = 'fm-legacy-layout-only'
const GRID_SHELL_HEIGHT = '--fm-legacy-grid-shell-height'
const GRID_SCROLL_HEIGHT = '--fm-legacy-grid-scroll-height'

const LAYOUT_CSS = `
  html.fm-legacy-layout-root,
  body.fm-legacy-layout {
    height: 100% !important;
    min-height: 0 !important;
  }

  body.fm-legacy-layout {
    margin: 0 !important;
    padding-top: 0 !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded {
    height: 100vh !important;
    min-height: 100vh !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout .fm-legacy-accordion-root {
    width: 100% !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    padding-top: 0 !important;
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

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-accordion-grid,
  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-content {
    min-height: 0 !important;
    max-height: none !important;
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-grow {
    min-height: 0 !important;
    max-height: none !important;
    flex: 1 1 auto !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-shell {
    width: 100% !important;
    height: var(${GRID_SHELL_HEIGHT}, auto) !important;
    min-height: 0 !important;
    max-height: var(${GRID_SHELL_HEIGHT}, none) !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  body.fm-legacy-layout.fm-legacy-grid-expanded .fm-legacy-grid-scroll {
    height: var(${GRID_SCROLL_HEIGHT}, auto) !important;
    min-height: 0 !important;
    max-height: var(${GRID_SCROLL_HEIGHT}, none) !important;
    box-sizing: border-box !important;
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
  '.ui-jqgrid',
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
  '.ui-jqgrid-bdiv',
  '.jqx-grid-content',
  '.ht_master .wtHolder'
].join(',')

const PAGER_SELECTORS = [
  '.ui-paginator',
  '.dataTables_paginate',
  '.p-paginator',
  '.ag-paging-panel',
  '.ui-jqgrid-pager',
  '.jqx-grid-pager'
].join(',')

const getItem = (header) => header.closest(ITEM_SELECTORS) || header

const getContent = (header, item) => {
  const next = header?.nextElementSibling
  if (next?.matches?.(CONTENT_SELECTORS)) return next
  return item?.querySelector?.(CONTENT_SELECTORS) || null
}

const isVisible = (element, view) => {
  if (!element || !view) return false
  const style = view.getComputedStyle(element)
  const rect = element.getBoundingClientRect()
  return !element.hidden &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0
}

const isOpen = (header, content, view) => {
  if (!header) return false

  const expanded = header.getAttribute?.('aria-expanded')
  if (expanded === 'true') return true
  if (expanded === 'false') return false

  if (header.classList?.contains('ui-accordion-header')) {
    return header.classList.contains('ui-state-active')
  }

  if (header.classList?.contains('active') || header.classList?.contains('ui-state-active')) {
    return true
  }

  if (content?.classList?.contains('collapse')) {
    return content.classList.contains('show') || content.classList.contains('in')
  }

  return isVisible(content, view)
}

const findAccordionRoot = (headers) => {
  const firstHeader = headers[0]
  return firstHeader?.closest('.ui-accordion, .accordion') || firstHeader?.parentElement || null
}

const visibleGridCandidates = (root, view) => [...(root?.querySelectorAll?.(GRID_SHELL_SELECTORS) || [])]
  .filter((element) => isVisible(element, view))

const findLargestGrid = (root, view) => visibleGridCandidates(root, view)
  .sort((a, b) => {
    const aRect = a.getBoundingClientRect()
    const bRect = b.getBoundingClientRect()
    return (bRect.width * bRect.height) - (aRect.width * aRect.height)
  })[0] || null

const findGridScroll = (gridShell, view) => {
  if (!gridShell) return null
  const candidates = [...gridShell.querySelectorAll(GRID_SCROLL_SELECTORS)]
    .filter((element) => isVisible(element, view))
  return candidates[0] || null
}

const findPager = (gridShell, boundary, view) => {
  const local = [...(gridShell?.querySelectorAll?.(PAGER_SELECTORS) || [])]
    .find((element) => isVisible(element, view))
  if (local) return local

  return [...(boundary?.querySelectorAll?.(PAGER_SELECTORS) || [])]
    .find((element) => isVisible(element, view)) || null
}

const clearMarkers = (doc) => {
  doc.querySelectorAll([
    '.fm-legacy-accordion-root',
    '.fm-legacy-accordion-first',
    '.fm-legacy-accordion-grid',
    '.fm-legacy-grid-content',
    '.fm-legacy-grid-shell',
    '.fm-legacy-grid-scroll',
    '.fm-legacy-grid-grow'
  ].join(',')).forEach((element) => {
    element.style.removeProperty(GRID_SHELL_HEIGHT)
    element.style.removeProperty(GRID_SCROLL_HEIGHT)
    element.classList.remove(
      'fm-legacy-accordion-root',
      'fm-legacy-accordion-first',
      'fm-legacy-accordion-grid',
      'fm-legacy-grid-content',
      'fm-legacy-grid-shell',
      'fm-legacy-grid-scroll',
      'fm-legacy-grid-grow'
    )
  })
}

const markGrowChain = (gridShell, boundary) => {
  let current = gridShell?.parentElement
  while (current && boundary && current !== boundary) {
    current.classList.add('fm-legacy-grid-grow')
    current = current.parentElement
  }
}

export function useLegacyIframeLayout(iframeRef) {
  let observer = null
  let currentDocument = null
  let clickHandler = null
  let resizeHandler = null
  let updateTimer = null
  let removeSearchBehavior = null

  const clearTimer = () => {
    if (!updateTimer) return
    window.clearTimeout(updateTimer)
    updateTimer = null
  }

  const cleanupDocument = () => {
    clearTimer()

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

  const applyGridMeasurements = ({ doc, view, gridShell, gridScroll, boundary }) => {
    if (!gridShell || !view) return

    const viewportHeight = view.innerHeight || doc.documentElement?.clientHeight || 0
    if (!viewportHeight) return

    const bottomGap = 6
    const shellTop = Math.max(0, Math.floor(gridShell.getBoundingClientRect().top))
    const shellHeight = Math.max(180, viewportHeight - shellTop - bottomGap)
    const shellValue = `${shellHeight}px`

    if (gridShell.style.getPropertyValue(GRID_SHELL_HEIGHT) !== shellValue) {
      gridShell.style.setProperty(GRID_SHELL_HEIGHT, shellValue)
    }

    if (!gridScroll) return

    const pager = findPager(gridShell, boundary, view)
    const pagerHeight = pager ? Math.ceil(pager.getBoundingClientRect().height) : 0
    const scrollTop = Math.max(0, Math.floor(gridScroll.getBoundingClientRect().top))
    const scrollHeight = Math.max(120, viewportHeight - scrollTop - pagerHeight - bottomGap)
    const scrollValue = `${scrollHeight}px`

    if (gridScroll.style.getPropertyValue(GRID_SCROLL_HEIGHT) !== scrollValue) {
      gridScroll.style.setProperty(GRID_SCROLL_HEIGHT, scrollValue)
    }
  }

  const applyLayout = () => {
    const doc = currentDocument
    const view = doc?.defaultView
    if (!doc?.body || !view) return

    const headers = [...doc.querySelectorAll(HEADER_SELECTORS)]
      .filter((header) => header.closest('.ui-accordion, .accordion, .accordion-group, .accordion-item, .panel'))

    let accordionRoot = null
    let secondContent = null

    if (headers.length >= 2) {
      const firstHeader = headers[0]
      const secondHeader = headers[1]
      const firstItem = getItem(firstHeader)
      const secondItem = getItem(secondHeader)
      secondContent = getContent(secondHeader, secondItem)
      accordionRoot = findAccordionRoot(headers)
      const firstLayoutItem = firstItem === firstHeader ? firstHeader : firstItem
      const secondLayoutItem = secondItem === secondHeader ? (secondContent || secondHeader) : secondItem

      accordionRoot?.classList.add('fm-legacy-accordion-root')
      firstLayoutItem?.classList.add('fm-legacy-accordion-first')
      secondLayoutItem?.classList.add('fm-legacy-accordion-grid')
      secondContent?.classList.add('fm-legacy-grid-content')

      if (!isOpen(secondHeader, secondContent, view)) {
        doc.body.classList.remove('fm-legacy-grid-expanded')
        return
      }
    }

    const preferredBoundary = secondContent || accordionRoot || doc.body
    const gridShell = findLargestGrid(preferredBoundary, view) || findLargestGrid(doc.body, view)

    if (!gridShell) {
      doc.body.classList.remove('fm-legacy-grid-expanded')
      return
    }

    const boundary = secondContent?.contains(gridShell)
      ? secondContent
      : accordionRoot?.contains(gridShell)
        ? accordionRoot
        : doc.body

    const gridScroll = findGridScroll(gridShell, view)

    gridShell.classList.add('fm-legacy-grid-shell')
    gridScroll?.classList.add('fm-legacy-grid-scroll')
    markGrowChain(gridShell, boundary)

    // Toda grilla principal visible dentro de un legacy ocupa el alto restante.
    // Se recalcula después de cambios AJAX/BUSCAR y también al redimensionar.
    doc.body.classList.add('fm-legacy-grid-expanded')

    applyGridMeasurements({ doc, view, gridShell, gridScroll, boundary })
  }

  const scheduleLayout = (delay = 40) => {
    clearTimer()
    updateTimer = window.setTimeout(applyLayout, delay)
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
      doc.head.appendChild(style)
    }
    style.textContent = LAYOUT_CSS

    doc.documentElement.classList.add('fm-legacy-layout-root')
    doc.body.classList.add('fm-legacy-layout')

    removeSearchBehavior = installAccordionSearchBehavior(doc)
    clickHandler = () => scheduleLayout(50)
    resizeHandler = () => scheduleLayout(20)

    doc.addEventListener('click', clickHandler, true)
    doc.defaultView?.addEventListener('resize', resizeHandler)

    observer = new MutationObserver(() => scheduleLayout(80))
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-expanded']
    })

    applyLayout()
    // PrimeFaces puede completar el update AJAX después del primer mutation.
    window.setTimeout(applyLayout, 180)
    window.setTimeout(applyLayout, 420)
  }

  onBeforeUnmount(cleanupDocument)

  return { onIframeLoad }
}
