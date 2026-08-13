import { onBeforeUnmount } from 'vue'
import { installAccordionSearchBehavior } from '@/utils/accordionSearchBehavior'

const LEGACY_LAYOUT_STYLE_ID = 'fm-legacy-layout-only'
const GRID_HEIGHT_PROPERTY = '--fm-legacy-main-grid-body-height'

const ACCORDION_ROOT_SELECTOR = [
  '.p-accordion',
  '[data-pc-name="accordion"]',
  '.ui-accordion',
  '.accordion'
].join(',')

const HEADER_SELECTOR = [
  '.p-accordionheader',
  '[data-pc-name="accordionheader"]',
  '.ui-accordion-header',
  '.accordion-heading',
  '.accordion-header',
  '.panel-heading',
  '[data-toggle="collapse"]',
  '[data-bs-toggle="collapse"]'
].join(',')

const PANEL_SELECTOR = [
  '.p-accordionpanel',
  '[data-pc-name="accordionpanel"]',
  '.ui-accordion-panel',
  '.accordion-group',
  '.accordion-item',
  '.panel'
].join(',')

const CONTENT_SELECTOR = [
  '.p-accordioncontent',
  '[data-pc-name="accordioncontent"]',
  '.ui-accordion-content',
  '.accordion-inner',
  '.accordion-content',
  '.accordion-collapse',
  '.panel-collapse',
  '.collapse'
].join(',')

const GRID_SHELL_SELECTOR = [
  '.ui-datatable',
  '.dataTables_wrapper',
  '.p-datatable',
  '.ui-jqgrid',
  '.jqx-grid',
  '.handsontable',
  '.table-responsive'
].join(',')

const GRID_SCROLL_SELECTOR = [
  '.ui-datatable-scrollable-body',
  '.dataTables_scrollBody',
  '.p-datatable-table-container',
  '.p-datatable-wrapper',
  '.ui-jqgrid-bdiv',
  '.jqx-grid-content',
  '.ht_master .wtHolder',
  '.ui-datatable-tablewrapper'
].join(',')

const PAGINATOR_SELECTOR = [
  '.ui-paginator',
  '.p-paginator',
  '.dataTables_paginate',
  '.pagination',
  '.pager',
  '.ui-jqgrid-pager'
].join(',')

const nearestAccordionRoot = (element) => element?.closest?.(ACCORDION_ROOT_SELECTOR) || null

const getTopLevelHeaders = (root) => [...root.querySelectorAll(HEADER_SELECTOR)]
  .filter((header) => nearestAccordionRoot(header) === root)

const getSection = (header) => {
  const panel = header?.closest?.(PANEL_SELECTOR)
  const next = header?.nextElementSibling
  const content = next?.matches?.(CONTENT_SELECTOR)
    ? next
    : panel?.querySelector?.(CONTENT_SELECTOR) || null

  return { header, panel, content }
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

const firstVisible = (root, selector, view) => {
  if (!root) return null
  return [...root.querySelectorAll(selector)].find((element) => isVisible(element, view)) || null
}

const findResultsGrid = (doc, view) => {
  const roots = [...doc.querySelectorAll(ACCORDION_ROOT_SELECTOR)]

  for (const root of roots) {
    const headers = getTopLevelHeaders(root)
    if (headers.length < 2) continue

    const results = getSection(headers[1])
    if (!results.content || !isVisible(results.content, view)) continue

    const gridShell = firstVisible(results.content, GRID_SHELL_SELECTOR, view)
    if (!gridShell) continue

    const gridScroll = firstVisible(gridShell, GRID_SCROLL_SELECTOR, view)
    if (!gridScroll) continue

    const paginator = firstVisible(results.content, PAGINATOR_SELECTOR, view)

    return {
      resultsContent: results.content,
      gridShell,
      gridScroll,
      paginator
    }
  }

  return null
}

const removeOldAccordionLayoutArtifacts = (doc) => {
  doc.getElementById(LEGACY_LAYOUT_STYLE_ID)?.remove()

  doc.body?.classList.remove(
    'fm-legacy-layout',
    'fm-legacy-grid-expanded',
    'fm-legacy-grid-fill'
  )

  doc.documentElement?.classList.remove(
    'fm-legacy-layout-root',
    'fm-legacy-viewport-root'
  )

  doc.querySelectorAll([
    '.fm-legacy-accordion-root',
    '.fm-legacy-accordion-first',
    '.fm-legacy-accordion-grid',
    '.fm-legacy-grid-content',
    '.fm-legacy-grid-shell',
    '.fm-legacy-grid-scroll',
    '.fm-legacy-grid-grow'
  ].join(',')).forEach((element) => {
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

export function useLegacyIframeLayout(iframeRef) {
  let observer = null
  let currentDocument = null
  let clickHandler = null
  let submitHandler = null
  let resizeHandler = null
  let updateTimer = null
  let settleTimer = null
  let removeSearchBehavior = null
  let marked = null

  const clearTimers = () => {
    if (updateTimer) window.clearTimeout(updateTimer)
    if (settleTimer) window.clearTimeout(settleTimer)
    updateTimer = null
    settleTimer = null
  }

  const clearMarkedGrid = () => {
    if (!marked) return

    marked.resultsContent?.classList.remove('fm-legacy-grid-results-content')
    marked.gridShell?.classList.remove('fm-legacy-main-grid')
    marked.gridScroll?.classList.remove('fm-legacy-main-grid-scroll')
    marked.paginator?.classList.remove('fm-legacy-main-grid-paginator')
    marked.gridShell?.style.removeProperty(GRID_HEIGHT_PROPERTY)

    marked = null
  }

  const cleanupDocument = () => {
    clearTimers()
    observer?.disconnect()
    observer = null

    removeSearchBehavior?.()
    removeSearchBehavior = null

    if (currentDocument && clickHandler) {
      currentDocument.removeEventListener('click', clickHandler, true)
    }

    if (currentDocument && submitHandler) {
      currentDocument.removeEventListener('submit', submitHandler, true)
    }

    if (currentDocument?.defaultView && resizeHandler) {
      currentDocument.defaultView.removeEventListener('resize', resizeHandler)
    }

    clearMarkedGrid()
    if (currentDocument) removeOldAccordionLayoutArtifacts(currentDocument)

    currentDocument = null
    clickHandler = null
    submitHandler = null
    resizeHandler = null
  }

  const applyLayout = () => {
    const doc = currentDocument
    const view = doc?.defaultView
    if (!doc?.body || !doc?.documentElement || !view) return

    const next = findResultsGrid(doc, view)
    if (!next) {
      clearMarkedGrid()
      return
    }

    if (
      marked?.gridShell !== next.gridShell ||
      marked?.gridScroll !== next.gridScroll ||
      marked?.resultsContent !== next.resultsContent
    ) {
      clearMarkedGrid()
      marked = next

      marked.resultsContent.classList.add('fm-legacy-grid-results-content')
      marked.gridShell.classList.add('fm-legacy-main-grid')
      marked.gridScroll.classList.add('fm-legacy-main-grid-scroll')
      marked.paginator?.classList.add('fm-legacy-main-grid-paginator')
    } else {
      marked.paginator = next.paginator
      marked.paginator?.classList.add('fm-legacy-main-grid-paginator')
    }

    const viewportHeight = view.innerHeight || doc.documentElement.clientHeight || 0
    const scrollRect = marked.gridScroll.getBoundingClientRect()
    const shellRect = marked.gridShell.getBoundingClientRect()

    if (!viewportHeight || scrollRect.top <= 0) return

    const footerInsideGrid = Math.max(0, shellRect.bottom - scrollRect.bottom)
    const paginatorOutsideGrid = marked.paginator && !marked.gridShell.contains(marked.paginator)
      ? marked.paginator.getBoundingClientRect().height
      : 0

    const reservedBottom = footerInsideGrid + paginatorOutsideGrid + 8
    const availableBodyHeight = Math.max(
      Math.floor(viewportHeight - scrollRect.top - reservedBottom),
      160
    )

    const nextHeight = `${availableBodyHeight}px`
    if (marked.gridShell.style.getPropertyValue(GRID_HEIGHT_PROPERTY) !== nextHeight) {
      marked.gridShell.style.setProperty(GRID_HEIGHT_PROPERTY, nextHeight)
    }
  }

  const scheduleLayout = (delay = 45) => {
    if (updateTimer) window.clearTimeout(updateTimer)
    updateTimer = window.setTimeout(() => {
      updateTimer = null
      applyLayout()
    }, delay)

    // PrimeFaces/DataTables pueden terminar de recalcular la tabla después del AJAX.
    if (settleTimer) window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(() => {
      settleTimer = null
      applyLayout()
    }, 180)
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

    // Quita únicamente los artefactos de los intentos anteriores que convertían
    // el acordeón legacy en flex. El acordeón conserva su CSS y su JS originales.
    removeOldAccordionLayoutArtifacts(doc)

    removeSearchBehavior = installAccordionSearchBehavior(doc)
    clickHandler = () => scheduleLayout(60)
    submitHandler = () => scheduleLayout(80)
    resizeHandler = () => scheduleLayout(30)

    doc.addEventListener('click', clickHandler, true)
    doc.addEventListener('submit', submitHandler, true)
    doc.defaultView?.addEventListener('resize', resizeHandler)

    // AJAX de PrimeFaces reemplaza nodos de la grilla. Observamos reemplazos,
    // no cambios de style, para evitar ciclos cuando nosotros actualizamos la altura.
    observer = new MutationObserver(() => scheduleLayout(40))
    observer.observe(doc.body, {
      childList: true,
      subtree: true
    })

    scheduleLayout(0)
  }

  onBeforeUnmount(cleanupDocument)

  return { onIframeLoad }
}
