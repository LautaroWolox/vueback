import { onBeforeUnmount } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

const ACCORDION_ROOT_SELECTOR = '.ui-accordion, .accordion, .p-accordion, [data-pc-name="accordion"]'
const HEADER_SELECTOR = [
  '.ui-accordion-header',
  '.accordion-heading',
  '.accordion-header',
  '.panel-heading',
  '.p-accordionheader',
  '[data-pc-name="accordionheader"]',
  '[data-toggle="collapse"]',
  '[data-bs-toggle="collapse"]'
].join(',')
const CONTENT_SELECTOR = [
  '.ui-accordion-content',
  '.accordion-inner',
  '.accordion-content',
  '.accordion-collapse',
  '.panel-collapse',
  '.p-accordioncontent',
  '[data-pc-name="accordioncontent"]',
  '.collapse'
].join(',')
const ITEM_SELECTOR = [
  '.ui-accordion-panel',
  '.accordion-group',
  '.accordion-item',
  '.panel',
  '.p-accordionpanel',
  '[data-pc-name="accordionpanel"]'
].join(',')
const GRID_SELECTOR = [
  '.ui-datatable',
  '.dataTables_wrapper',
  '.p-datatable',
  '.ui-jqgrid',
  '.jqx-grid',
  '.ag-root-wrapper',
  '.handsontable',
  '.table-responsive'
].join(',')

const SCROLL_SELECTORS = [
  '.ui-datatable-scrollable-body',
  '.dataTables_scrollBody',
  '.p-datatable-table-container',
  '[data-pc-section="tablecontainer"]',
  '.p-datatable-wrapper',
  '.ui-jqgrid-bdiv',
  '.jqx-grid-content',
  '.ag-body-viewport',
  '.ht_master .wtHolder',
  '.ui-datatable-tablewrapper',
  '.table-responsive'
]

const PAGINATOR_SELECTORS = [
  '.ui-paginator',
  '.p-paginator',
  '.dataTables_paginate',
  '.ui-jqgrid-pager',
  '.pagination',
  '.pager'
]

const isVisible = (element, view) => {
  if (!element || !view) return false
  const rect = element.getBoundingClientRect()
  const style = view.getComputedStyle(element)
  return !element.hidden && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
}

const findVisibleByPriority = (container, selectors, view) => {
  if (!container) return null
  for (const selector of selectors) {
    const visible = [...container.querySelectorAll(selector)].find((element) => isVisible(element, view))
    if (visible) return visible
  }
  return null
}

const getPanelContent = (header) => {
  const next = header?.nextElementSibling
  if (next?.matches?.(CONTENT_SELECTOR)) return next
  const item = header?.closest?.(ITEM_SELECTOR)
  return item?.querySelector?.(CONTENT_SELECTOR) || null
}

const getTopLevelHeaders = (root) => [...root.querySelectorAll(HEADER_SELECTOR)]
  .filter((header) => header.closest(ACCORDION_ROOT_SELECTOR) === root)

const findGridIn = (container, view) => {
  if (!container) return null
  return [...container.querySelectorAll(GRID_SELECTOR)]
    .filter((grid) => isVisible(grid, view))
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()
      return (bRect.width * bRect.height) - (aRect.width * aRect.height)
    })[0] || null
}

const findMainGrid = (doc, view) => {
  const roots = [...doc.querySelectorAll(ACCORDION_ROOT_SELECTOR)].filter((root) => isVisible(root, view))
  for (const root of roots) {
    const headers = getTopLevelHeaders(root)
    if (headers.length < 2) continue
    const secondContent = getPanelContent(headers[1])
    if (!isVisible(secondContent, view)) continue
    const grid = findGridIn(secondContent, view)
    if (grid) return { grid, panel: secondContent }
  }
  const grid = findGridIn(doc, view)
  return grid ? { grid, panel: grid.parentElement } : null
}

export function useLegacyIframeLayout(iframeRef) {
  let currentDocument = null
  let observer = null
  let markedGrid = null
  let markedScroll = null
  let markedPaginator = null
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

    const target = findMainGrid(doc, view)
    const grid = target?.grid
    const panel = target?.panel
    if (!grid) return

    const scroll = findVisibleByPriority(grid, SCROLL_SELECTORS, view)
    if (!scroll) return

    const paginator = findVisibleByPriority(grid, PAGINATOR_SELECTORS, view) || findVisibleByPriority(panel, PAGINATOR_SELECTORS, view)

    if (markedGrid !== grid) {
      markedGrid?.classList.remove('fm-legacy-main-grid')
      markedGrid?.style?.removeProperty('--fm-legacy-main-grid-body-height')
      markedGrid = grid
      markedGrid.classList.add('fm-legacy-main-grid')
    }

    if (markedScroll !== scroll) {
      markedScroll?.classList.remove('fm-legacy-main-grid-scroll')
      markedScroll = scroll
      markedScroll.classList.add('fm-legacy-main-grid-scroll')
    }

    if (markedPaginator !== paginator) {
      markedPaginator?.classList.remove('fm-legacy-main-grid-paginator')
      markedPaginator = paginator || null
      markedPaginator?.classList.add('fm-legacy-main-grid-paginator')
    }

    const viewportHeight = Math.max(view.innerHeight || 0, doc.documentElement?.clientHeight || 0)
    const scrollRect = scroll.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    const paginatorRect = isVisible(paginator, view) ? paginator.getBoundingClientRect() : null

    let reservedBelow = 0
    if (paginatorRect) {
      const gapBeforePaginator = Math.max(0, paginatorRect.top - scrollRect.bottom)
      const tailAfterPaginator = Math.max(0, gridRect.bottom - paginatorRect.bottom)
      reservedBelow = gapBeforePaginator + paginatorRect.height + Math.min(tailAfterPaginator, 12)
    } else {
      reservedBelow = Math.min(Math.max(0, gridRect.bottom - scrollRect.bottom), 80)
    }

    const availableHeight = Math.floor(viewportHeight - Math.max(0, scrollRect.top) - reservedBelow - 6)
    if (availableHeight < 160) return

    grid.style.setProperty('--fm-legacy-main-grid-body-height', `${availableHeight}px`)
  }

  const scheduleLayout = () => {
    clearTimers()
    updateTimer = window.setTimeout(applyLayout, 25)
    retryTimers = [120, 300, 700, 1200, 1800].map((delay) => window.setTimeout(applyLayout, delay))
  }

  const cleanup = () => {
    clearTimers()
    observer?.disconnect()
    observer = null
    removeSearchBehavior?.()
    removeSearchBehavior = null
    currentDocument?.removeEventListener('click', scheduleLayout, true)
    currentDocument?.removeEventListener('submit', scheduleLayout, true)
    currentDocument?.defaultView?.removeEventListener('resize', scheduleLayout)
    markedGrid?.classList.remove('fm-legacy-main-grid')
    markedGrid?.style?.removeProperty('--fm-legacy-main-grid-body-height')
    markedScroll?.classList.remove('fm-legacy-main-grid-scroll')
    markedPaginator?.classList.remove('fm-legacy-main-grid-paginator')
    markedGrid = null
    markedScroll = null
    markedPaginator = null
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
    currentDocument.addEventListener('submit', scheduleLayout, true)
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
