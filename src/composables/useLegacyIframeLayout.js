import { onBeforeUnmount } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

const HEADER_SELECTOR = '.ui-accordion-header, .accordion-heading, .accordion-header, .panel-heading, [data-toggle="collapse"], [data-bs-toggle="collapse"]'
const CONTENT_SELECTOR = '.ui-accordion-content, .accordion-inner, .accordion-content, .accordion-collapse, .panel-collapse, .collapse'
const GRID_SELECTOR = '.ui-datatable, .dataTables_wrapper, .p-datatable, .ag-root-wrapper, .jqx-grid, .handsontable, .table-responsive'
const SCROLL_SELECTOR = '.ui-datatable-scrollable-body, .ui-datatable-tablewrapper, .dataTables_scrollBody, .p-datatable-table-container, .p-datatable-wrapper, .ag-body-viewport, .jqx-grid-content, .ht_master .wtHolder'
const PAGINATOR_SELECTOR = '.ui-paginator, .p-paginator, .dataTables_paginate, .pagination, .pager'

const isVisible = (element, view) => {
  if (!element || !view) return false

  const rect = element.getBoundingClientRect()
  const style = view.getComputedStyle(element)

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    rect.width > 0 &&
    rect.height > 0
  )
}

const getPanelContent = (header) => {
  const next = header?.nextElementSibling
  if (next?.matches?.(CONTENT_SELECTOR)) return next
  return header?.parentElement?.querySelector?.(CONTENT_SELECTOR) || null
}

const findMainGrid = (doc, view) => {
  const headers = [...doc.querySelectorAll(HEADER_SELECTOR)]

  if (headers.length > 1) {
    const secondContent = getPanelContent(headers[1])
    const secondGrid = secondContent?.querySelector?.(GRID_SELECTOR)
    if (isVisible(secondGrid, view)) return secondGrid
  }

  return [...doc.querySelectorAll(GRID_SELECTOR)]
    .filter((grid) => isVisible(grid, view))
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()
      return (bRect.width * bRect.height) - (aRect.width * aRect.height)
    })[0] || null
}

export function useLegacyIframeLayout(iframeRef) {
  let currentDocument = null
  let observer = null
  let removeSearchBehavior = null
  let updateTimer = null
  let retryTimers = []

  const clearTimers = () => {
    if (updateTimer !== null) window.clearTimeout(updateTimer)
    retryTimers.forEach((timer) => window.clearTimeout(timer))
    updateTimer = null
    retryTimers = []
  }

  const applyLayout = () => {
    const doc = currentDocument
    const view = doc?.defaultView
    if (!doc?.body || !view) return

    const grid = findMainGrid(doc, view)
    const scroll = grid?.querySelector?.(SCROLL_SELECTOR)

    if (!grid || !isVisible(scroll, view)) return

    const paginator = grid.querySelector(PAGINATOR_SELECTOR)
    const paginatorHeight = isVisible(paginator, view)
      ? paginator.getBoundingClientRect().height
      : 0

    const viewportHeight = view.innerHeight || doc.documentElement.clientHeight || 0
    const scrollTop = Math.max(0, scroll.getBoundingClientRect().top)
    const availableHeight = Math.floor(viewportHeight - scrollTop - paginatorHeight - 8)

    if (availableHeight < 160) return

    grid.style.setProperty('height', `${availableHeight + paginatorHeight}px`, 'important')
    grid.style.setProperty('min-height', `${availableHeight + paginatorHeight}px`, 'important')
    grid.style.setProperty('max-height', 'none', 'important')

    scroll.style.setProperty('height', `${availableHeight}px`, 'important')
    scroll.style.setProperty('min-height', `${availableHeight}px`, 'important')
    scroll.style.setProperty('max-height', `${availableHeight}px`, 'important')
    scroll.style.setProperty('overflow-y', 'auto', 'important')
  }

  const scheduleLayout = () => {
    clearTimers()
    updateTimer = window.setTimeout(applyLayout, 20)
    retryTimers = [100, 250, 500, 900].map((delay) =>
      window.setTimeout(applyLayout, delay)
    )
  }

  const cleanup = () => {
    clearTimers()

    observer?.disconnect()
    observer = null

    removeSearchBehavior?.()
    removeSearchBehavior = null

    currentDocument?.removeEventListener('click', scheduleLayout, true)
    currentDocument?.defaultView?.removeEventListener('resize', scheduleLayout)

    currentDocument = null
  }

  const onIframeLoad = () => {
    cleanup()

    try {
      currentDocument = iframeRef.value?.contentDocument || iframeRef.value?.contentWindow?.document
    } catch {
      currentDocument = null
      return
    }

    if (!currentDocument?.body) return

    removeSearchBehavior = installAccordionSearchBehavior(currentDocument)

    currentDocument.addEventListener('click', scheduleLayout, true)
    currentDocument.defaultView?.addEventListener('resize', scheduleLayout)

    observer = new MutationObserver(scheduleLayout)
    observer.observe(currentDocument.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'aria-expanded']
    })

    scheduleLayout()
  }

  onBeforeUnmount(cleanup)

  return { onIframeLoad }
}
