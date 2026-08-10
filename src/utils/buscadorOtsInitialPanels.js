const PAGE_SELECTOR = '.busqueda-ots-page'
const ACCORDION_SELECTOR = '.p-accordion, [data-pc-name="accordion"]'
const HEADER_SELECTOR = '.p-accordionheader, [data-pc-name="accordionheader"]'
const PANEL_SELECTOR = '.p-accordionpanel, [data-pc-name="accordionpanel"]'
const INITIALIZED_ATTRIBUTE = 'data-fm-buscador-panels-initialized'

const nearestAccordion = (element) => element?.closest?.(ACCORDION_SELECTOR) || null

const getTopLevelHeaders = (accordion) => [...accordion.querySelectorAll(HEADER_SELECTOR)]
  .filter((header) => nearestAccordion(header) === accordion)

const isHeaderOpen = (header) => {
  const expanded = header?.getAttribute?.('aria-expanded')
  if (expanded === 'true') return true
  if (expanded === 'false') return false

  const panel = header?.closest?.(PANEL_SELECTOR)
  return Boolean(
    panel?.getAttribute?.('data-p-active') === 'true' ||
    panel?.classList?.contains('p-accordionpanel-active')
  )
}

const clickHeader = (header) => {
  if (!header) return

  const clickable = header.matches?.('button, [role="button"], a')
    ? header
    : header.querySelector?.('button, [role="button"], a') || header

  clickable.click()
}

const initializeAccordion = (accordion) => {
  if (!accordion || accordion.hasAttribute(INITIALIZED_ATTRIBUTE)) return false

  const headers = getTopLevelHeaders(accordion).slice(0, 2)
  if (headers.length < 2) return false

  accordion.setAttribute(INITIALIZED_ATTRIBUTE, 'true')

  headers.forEach((header) => {
    if (!isHeaderOpen(header)) clickHeader(header)
  })

  const view = accordion.ownerDocument?.defaultView || window
  view.setTimeout(() => {
    headers.forEach((header) => {
      if (!isHeaderOpen(header)) clickHeader(header)
    })
  }, 80)

  return true
}

const initializePage = (doc) => {
  const page = doc?.querySelector?.(PAGE_SELECTOR)
  if (!page) return false

  const accordion = page.querySelector(ACCORDION_SELECTOR)
  return initializeAccordion(accordion)
}

export function installBuscadorOtsInitialPanels(doc = document) {
  if (!doc?.querySelector) return () => {}

  let scheduled = false
  const view = doc.defaultView || window

  const scheduleInitialization = () => {
    if (scheduled) return
    scheduled = true

    view.setTimeout(() => {
      scheduled = false
      initializePage(doc)
    }, 0)
  }

  scheduleInitialization()

  const observer = new MutationObserver(() => {
    scheduleInitialization()
  })

  observer.observe(doc.body || doc.documentElement, {
    childList: true,
    subtree: true
  })

  return () => {
    observer.disconnect()
  }
}
