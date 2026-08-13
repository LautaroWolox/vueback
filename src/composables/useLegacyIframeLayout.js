import { onBeforeUnmount } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

const HEADER_SELECTOR = '.ui-accordion-header, .accordion-heading, .accordion-header, .panel-heading, [data-toggle="collapse"], [data-bs-toggle="collapse"]'
const CONTENT_SELECTOR = '.ui-accordion-content, .accordion-inner, .accordion-content, .accordion-collapse, .panel-collapse, .collapse'
const GRID_SELECTOR = '.ui-datatable, .dataTables_wrapper, .p-datatable, .ag-root-wrapper, .jqx-grid, .handsontable, .table-responsive'
const SCROLL_SELECTOR = '.ui-datatable-scrollable-body, .ui-datatable-tablewrapper, .dataTables_scrollBody, .p-datatable-table-container, .p-datatable-wrapper, .ag-body-viewport, .jqx-grid-content, .ht_master .wtHolder'
const PAGINATOR_SELECTOR = '.ui-paginator, .p-paginator, .dataTables_paginate, .pagination, .pager'

const visible = (element, view) => {
  if (!element || !view) return false
  const rect = element.getBoundingClientRect()
  const style = view.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
}

const panelContent = (header) => {
  const next = header?.nextElementSibling
  if (next?.matches?.(CONTENT_SELECTOR)) return next
  return header?.parentElement?.querySelector?.(CONTENT_SELECTOR) || null
}

const mainGrid = (doc, view) => {
  const headers = [...doc.querySelectorAll(HEADER_SELECTOR)]
  if (headers.length > 1) {
    const content = panelContent(headers[1])
    const grid = content?.querySelector?.(GRID_SELECTOR)
    if (visible(grid, view)) return grid
  }

  return [...doc.querySelectorAll(GRID_SELECTOR)]
    .filter((grid) => visible(grid, view))
    .sort((a, b) => {
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      return (br.width * br.height) - (ar.width * ar.height)
    })[0] || null
}

export function useLegacyIframeLayout(iframeRef) {
  let doc = null
  let observer = null
  let removeSearchBehavior = null
  let timer = null
  let retries = []

  const clearTimers = () => {
    if (timer) window.clearTimeout(timer)
    retries.forEach((id) => window.clearTimeout(id))
    timer = null
    retries = []
  }

  const applyLayout = () => {
    const view = doc?.defaultView
    if (!doc?.body || !view) return

    const grid = mainGrid(doc, view)
    const scroll = grid?.querySelector?.(SCROLL_SELECTOR)
    if (!grid || !visible(scroll, view)) return

    const paginator = grid.querySelector(PAGINATOR_SELECTOR)
    const paginatorHeight = visible(paginator, view) ? paginator.getBoundingClientRect().height : 0
    const top = Math.max(0, scroll.getBoundingClientRect().top)
    const viewport = view.innerHeight || doc.documentElement.clientHeight || 0
    const height = Math.floor(viewport - top - paginatorHeight - 8)
    if (height < 160) return

    scroll.style.setProperty('height', `${height}px`, 'important')
    scroll.style.setProperty('min-height', '160px', 'important')
    scroll.style.setProperty('max-height', `${height}px`, 'important')
    scroll.style.setProperty('overflow-y', 'auto', 'important')
  }

  const schedule = () => {
    clearTimers()
    timer = window.setTimeout(applyLayout, 20)
    retries = [100, 250, 500, 900].map((delay) => window.setTimeout(applyLayout, delay))
  }

  const cleanup = () => {
    clearTimers()
    observer?.disconnect()
    observer = null
    removeSearchBehavior?.()
    removeSearchBehavior = null
    doc?.removeEventListener('click', schedule, true)
    doc?.defaultView?.removeEventListener('resize', schedule)
    doc = null
  }

  const onIframeLoad = () => {
    cleanup()
    try {
      doc = iframeRef.value?.contentDocument || iframeRef.value?.contentWindow?.document
    } catch {
      return
    }
    if (!doc?.body) return

    removeSearchBehavior = installAccordionSearchBehavior(doc)
    doc.addEventListener('click', schedule, true)
    doc.defaultView?.addEventListener('resize', schedule)

    observer = new MutationObserver(schedule)
    observer.observe(doc.body, { childList: true, subtree: true })
    schedule()
  }

  onBeforeUnmount(cleanup)
  return { onIframeLoad }
}
