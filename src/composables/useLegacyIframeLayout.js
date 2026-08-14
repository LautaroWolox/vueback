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
const DIALOG_SELECTOR = [
  '.ui-dialog',
  '.p-dialog',
  '.modal',
  '.modal-dialog',
  '.modal-content',
  '.bootbox',
  '.swal2-popup',
  '[role="dialog"]',
  '[aria-modal="true"]'
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

const NATIVE_ACCORDION_PATHS = new Set(['/gestionOperadores.html'])
const MANAGED_SCROLL_PROPERTIES = ['height', 'min-height', 'max-height', 'overflow-x', 'overflow-y']

const getIframePathname = (iframe) => {
  try {
    return iframe?.contentWindow?.location?.pathname || new URL(iframe?.src || '', window.location.href).pathname
  } catch {
    try {
      return new URL(iframe?.src || '', window.location.href).pathname
    } catch {
      return ''
    }
  }
}

const isVisible = (element, view) => {
  if (!element || !view || !element.isConnected) return false
  const rect = element.getBoundingClientRect()
  const style = view.getComputedStyle(element)
  return !element.hidden && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
}

const isInsideDialog = (element) => Boolean(element?.closest?.(DIALOG_SELECTOR))

const findVisibleByPriority = (container, selectors, view) => {
  if (!container) return null
  for (const selector of selectors) {
    const visible = [...container.querySelectorAll(selector)]
      .find((element) => isVisible(element, view) && !isInsideDialog(element))
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
    .filter((grid) => isVisible(grid, view) && !isInsideDialog(grid))
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()
      return (bRect.width * bRect.height) - (aRect.width * aRect.height)
    })[0] || null
}

const findMainGrid = (doc, view) => {
  const roots = [...doc.querySelectorAll(ACCORDION_ROOT_SELECTOR)]
    .filter((root) => isVisible(root, view) && !isInsideDialog(root))

  let hasTwoSectionAccordion = false

  for (const root of roots) {
    const headers = getTopLevelHeaders(root)
    if (headers.length < 2) continue

    hasTwoSectionAccordion = true
    const secondContent = getPanelContent(headers[1])
    if (!isVisible(secondContent, view) || isInsideDialog(secondContent)) continue

    const grid = findGridIn(secondContent, view)
    if (grid) return { grid, panel: secondContent }
  }

  // Si la pantalla tiene el patrón Filtros + Resultados, sólo se estira la grilla
  // del segundo acordeón. Nunca se usa como fallback una tabla del primer panel.
  if (hasTwoSectionAccordion) return null

  const grid = findGridIn(doc, view)
  return grid ? { grid, panel: grid.parentElement } : null
}

const getViewportHeight = (doc, view) => {
  const visualHeight = Number(view?.visualViewport?.height || 0)
  if (visualHeight > 0) return Math.floor(visualHeight)

  const innerHeight = Number(view?.innerHeight || 0)
  if (innerHeight > 0) return Math.floor(innerHeight)

  return Math.floor(Number(doc?.documentElement?.clientHeight || 0))
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

  const originalScrollStyles = new WeakMap()

  const rememberScrollStyles = (element) => {
    if (!element || originalScrollStyles.has(element)) return

    const snapshot = {}
    MANAGED_SCROLL_PROPERTIES.forEach((property) => {
      snapshot[property] = {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property)
      }
    })
    originalScrollStyles.set(element, snapshot)
  }

  const restoreScrollStyles = (element) => {
    if (!element) return
    const snapshot = originalScrollStyles.get(element)
    if (!snapshot) return

    MANAGED_SCROLL_PROPERTIES.forEach((property) => {
      const saved = snapshot[property]
      if (saved?.value) {
        element.style.setProperty(property, saved.value, saved.priority || '')
      } else {
        element.style.removeProperty(property)
      }
    })
    originalScrollStyles.delete(element)
  }

  const clearTimers = () => {
    if (updateTimer !== null) window.clearTimeout(updateTimer)
    retryTimers.forEach((timer) => window.clearTimeout(timer))
    updateTimer = null
    retryTimers = []
  }

  const resetMarkedGrid = () => {
    markedGrid?.classList.remove('fm-legacy-main-grid')
    markedGrid?.style?.removeProperty('--fm-legacy-main-grid-body-height')

    if (markedScroll) {
      restoreScrollStyles(markedScroll)
      markedScroll.classList.remove('fm-legacy-main-grid-scroll')
    }

    markedPaginator?.classList.remove('fm-legacy-main-grid-paginator')
    markedGrid = null
    markedScroll = null
    markedPaginator = null
  }

  const applyLayout = () => {
    const doc = currentDocument
    const view = doc?.defaultView
    if (!doc?.body || !view) return

    const target = findMainGrid(doc, view)
    const grid = target?.grid
    const panel = target?.panel

    if (!grid) {
      resetMarkedGrid()
      return
    }

    const scroll = findVisibleByPriority(grid, SCROLL_SELECTORS, view)
    if (!scroll) {
      resetMarkedGrid()
      return
    }

    const paginator = findVisibleByPriority(grid, PAGINATOR_SELECTORS, view) ||
      findVisibleByPriority(panel, PAGINATOR_SELECTORS, view)

    if (markedGrid !== grid) {
      resetMarkedGrid()
      markedGrid = grid
      markedGrid.classList.add('fm-legacy-main-grid')
    }

    if (markedScroll !== scroll) {
      if (markedScroll) {
        restoreScrollStyles(markedScroll)
        markedScroll.classList.remove('fm-legacy-main-grid-scroll')
      }
      markedScroll = scroll
      rememberScrollStyles(markedScroll)
      markedScroll.classList.add('fm-legacy-main-grid-scroll')
    }

    if (markedPaginator !== paginator) {
      markedPaginator?.classList.remove('fm-legacy-main-grid-paginator')
      markedPaginator = paginator || null
      markedPaginator?.classList.add('fm-legacy-main-grid-paginator')
    }

    const viewportHeight = getViewportHeight(doc, view)
    if (viewportHeight <= 0) return

    const scrollRect = scroll.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    const panelRect = isVisible(panel, view) ? panel.getBoundingClientRect() : gridRect
    const paginatorRect = isVisible(paginator, view) ? paginator.getBoundingClientRect() : null

    let reservedBelow = 8

    if (paginatorRect) {
      const gapBeforePaginator = Math.max(0, paginatorRect.top - scrollRect.bottom)
      const tailAfterPaginator = Math.max(0, panelRect.bottom - paginatorRect.bottom)
      reservedBelow += gapBeforePaginator + paginatorRect.height + Math.min(tailAfterPaginator, 16)
    } else {
      const existingTail = Math.max(0, gridRect.bottom - scrollRect.bottom)
      reservedBelow += Math.min(existingTail, 72)
    }

    const rawAvailableHeight = Math.floor(
      viewportHeight - Math.max(0, scrollRect.top) - reservedBelow
    )

    if (rawAvailableHeight < 56) return

    const availableHeight = Math.max(72, rawAvailableHeight)
    const height = `${availableHeight}px`

    grid.style.setProperty('--fm-legacy-main-grid-body-height', height)

    // Doble garantía: la clase permite centralizar el estilo en fm-global.css,
    // y el inline !important evita que un JSP/PrimeFaces vuelva a fijar otra altura
    // después de un AJAX, búsqueda o cambio de zoom.
    scroll.style.setProperty('height', height, 'important')
    scroll.style.setProperty('min-height', '0', 'important')
    scroll.style.setProperty('max-height', height, 'important')
    scroll.style.setProperty('overflow-x', 'auto', 'important')
    scroll.style.setProperty('overflow-y', 'auto', 'important')
  }

  const scheduleLayout = () => {
    clearTimers()
    updateTimer = window.setTimeout(applyLayout, 20)
    retryTimers = [80, 180, 350, 700, 1200, 1800].map((delay) =>
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
    currentDocument?.removeEventListener('submit', scheduleLayout, true)
    currentDocument?.defaultView?.removeEventListener('resize', scheduleLayout)
    currentDocument?.defaultView?.visualViewport?.removeEventListener('resize', scheduleLayout)
    currentDocument?.defaultView?.visualViewport?.removeEventListener('scroll', scheduleLayout)

    resetMarkedGrid()
    currentDocument = null
  }

  const onIframeLoad = () => {
    cleanup()

    const iframe = iframeRef.value
    try {
      currentDocument = iframe?.contentDocument || iframe?.contentWindow?.document
    } catch {
      currentDocument = null
      return
    }

    if (!currentDocument?.body) return

    const keepsNativeAccordion = NATIVE_ACCORDION_PATHS.has(getIframePathname(iframe))
    if (!keepsNativeAccordion) {
      removeSearchBehavior = installAccordionSearchBehavior(currentDocument)
    }

    currentDocument.addEventListener('click', scheduleLayout, true)
    currentDocument.addEventListener('submit', scheduleLayout, true)
    currentDocument.defaultView?.addEventListener('resize', scheduleLayout)
    currentDocument.defaultView?.visualViewport?.addEventListener('resize', scheduleLayout)
    currentDocument.defaultView?.visualViewport?.addEventListener('scroll', scheduleLayout)

    observer = new MutationObserver(scheduleLayout)
    observer.observe(currentDocument.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'aria-expanded']
    })

    scheduleLayout()
  }

  onBeforeUnmount(cleanup)
  return { onIframeLoad }
}
