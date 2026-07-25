const PRIME_ACCORDION_ROOT_SELECTOR = [
  '.p-accordion',
  '[data-pc-name="accordion"]'
].join(',')

const CUSTOM_PANEL_ROOT_SELECTOR = [
  '.jobtype-screen',
  '[data-fm-search-panels]'
].join(',')

const SUPPORTED_ROOT_SELECTOR = [
  PRIME_ACCORDION_ROOT_SELECTOR,
  CUSTOM_PANEL_ROOT_SELECTOR
].join(',')

const HEADER_SELECTOR = [
  '.p-accordionheader',
  '[data-pc-name="accordionheader"]',
  '.jobtype-panel__header',
  '[data-fm-panel-header]'
].join(',')

const PANEL_SELECTOR = [
  '.p-accordionpanel',
  '[data-pc-name="accordionpanel"]',
  '.jobtype-panel',
  '[data-fm-panel]'
].join(',')

const CONTENT_SELECTOR = [
  '.p-accordioncontent',
  '[data-pc-name="accordioncontent"]',
  '.jobtype-panel__body',
  '.jobtype-results-body',
  '[data-fm-panel-content]'
].join(',')

const ACTION_SELECTOR = [
  'button',
  '[role="button"]',
  'input[type="submit"]',
  'input[type="button"]',
  'a'
].join(',')

const SEARCH_ACTION_PATTERN = /(^|\s)(BUSCAR|CONSULTAR|FILTRAR|APLICAR FILTROS?)(\s|$)/
const EXCLUDED_ACTION_PATTERN = /(^|\s)(LIMPIAR|RESTABLECER|CANCELAR)(\s|$)/

const normalizeText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toUpperCase()

const getActionText = (element) => normalizeText([
  element?.textContent,
  element?.value,
  element?.getAttribute?.('aria-label'),
  element?.getAttribute?.('title'),
  element?.getAttribute?.('data-action')
].filter(Boolean).join(' '))

const isDisabled = (element) => Boolean(
  element?.disabled ||
  element?.getAttribute?.('aria-disabled') === 'true' ||
  element?.classList?.contains('p-disabled') ||
  element?.classList?.contains('disabled')
)

const findSearchAction = (target) => {
  const element = target?.closest?.(ACTION_SELECTOR)
  if (!element || isDisabled(element)) return null

  const actionText = getActionText(element)
  if (EXCLUDED_ACTION_PATTERN.test(actionText)) return null

  const explicitSearchAction = SEARCH_ACTION_PATTERN.test(actionText)
  const searchIcon = element.querySelector?.(
    '.pi-search, [class*="icon-search"], [class*="fa-search"], [data-icon="search"]'
  )

  return explicitSearchAction || searchIcon ? element : null
}

const nearestSupportedRoot = (element) => element?.closest?.(SUPPORTED_ROOT_SELECTOR) || null

const getTopLevelHeaders = (root) => [...root.querySelectorAll(HEADER_SELECTOR)]
  .filter((header) => nearestSupportedRoot(header) === root)

const getSection = (header) => {
  const panel = header?.closest?.(PANEL_SELECTOR)
  const nextElement = header?.nextElementSibling
  const content = nextElement?.matches?.(CONTENT_SELECTOR)
    ? nextElement
    : panel?.querySelector?.(CONTENT_SELECTOR) || null

  return {
    header,
    content,
    container: panel || content || header
  }
}

const belongsToFirstSection = (root, trigger) => {
  const firstHeader = getTopLevelHeaders(root)[0]
  if (!firstHeader) return false

  const firstSection = getSection(firstHeader)
  return Boolean(
    firstSection.container?.contains(trigger) ||
    firstSection.content?.contains(trigger)
  )
}

const shouldHandleRoot = (root) => {
  const headerCount = getTopLevelHeaders(root).length

  if (root.matches(CUSTOM_PANEL_ROOT_SELECTOR)) {
    return headerCount >= 1
  }

  // Los acordeones PrimeVue con dos o más paneles ya son atendidos por
  // accordionSearchBehavior. Aquí solo completamos el caso de un único panel.
  return root.matches(PRIME_ACCORDION_ROOT_SELECTOR) && headerCount === 1
}

const findSupportedRoot = (trigger, doc) => {
  const directRoot = nearestSupportedRoot(trigger)
  if (
    directRoot &&
    shouldHandleRoot(directRoot) &&
    belongsToFirstSection(directRoot, trigger)
  ) {
    return directRoot
  }

  const scope = trigger?.closest?.('.fm-screen, main, [role="main"], form') || doc?.body
  if (!scope) return null

  return [...scope.querySelectorAll(SUPPORTED_ROOT_SELECTOR)].find((root) => (
    shouldHandleRoot(root) && belongsToFirstSection(root, trigger)
  )) || null
}

const isVisible = (element, view) => {
  if (!element || !view) return false
  const style = view.getComputedStyle(element)
  return !element.hidden && style.display !== 'none' && style.visibility !== 'hidden'
}

const isSectionOpen = (section, view) => {
  const expanded = section.header?.getAttribute?.('aria-expanded')
  if (expanded === 'true') return true
  if (expanded === 'false') return false

  const activeAttribute = section.container?.getAttribute?.('data-p-active')
  if (activeAttribute === 'true') return true
  if (activeAttribute === 'false') return false

  if (
    section.container?.classList?.contains('p-accordionpanel-active') ||
    section.container?.classList?.contains('is-expanded') ||
    section.container?.classList?.contains('active') ||
    section.content?.classList?.contains('show') ||
    section.content?.classList?.contains('in')
  ) {
    return true
  }

  return isVisible(section.content, view)
}

const clickHeader = (header) => {
  if (!header) return

  const clickable = header.matches?.('button, [role="button"], a')
    ? header
    : header.querySelector?.('button, [role="button"], a') || header

  clickable.click()
}

const switchMigratedPanels = (root) => {
  const doc = root?.ownerDocument
  const view = doc?.defaultView
  if (!doc || !view) return false

  const headers = getTopLevelHeaders(root)
  if (!headers.length) return false

  const filtersSection = getSection(headers[0])
  const resultsSection = headers[1] ? getSection(headers[1]) : null

  if (isSectionOpen(filtersSection, view)) {
    clickHeader(filtersSection.header)
  }

  if (!resultsSection) return true

  view.setTimeout(() => {
    if (!isSectionOpen(resultsSection, view)) {
      clickHeader(resultsSection.header)
    }

    view.setTimeout(() => {
      if (isSectionOpen(filtersSection, view)) {
        clickHeader(filtersSection.header)
      }

      if (!isSectionOpen(resultsSection, view)) {
        clickHeader(resultsSection.header)
      }
    }, 80)
  }, 0)

  return true
}

export function installMigratedAccordionSearchBehavior(doc = document) {
  if (!doc?.addEventListener) return () => {}

  const pendingRoots = new Map()

  const scheduleTransition = (trigger) => {
    const root = findSupportedRoot(trigger, doc)
    if (!root) return

    const view = doc.defaultView || window
    const previousTimer = pendingRoots.get(root)
    if (previousTimer) view.clearTimeout(previousTimer)

    const timer = view.setTimeout(() => {
      pendingRoots.delete(root)
      switchMigratedPanels(root)
    }, 0)

    pendingRoots.set(root, timer)
  }

  const handleClick = (event) => {
    const action = findSearchAction(event.target)
    if (action) scheduleTransition(action)
  }

  const handleSubmit = (event) => {
    const submitter = findSearchAction(event.submitter)
    if (submitter) {
      scheduleTransition(submitter)
      return
    }

    const form = event.target
    const root = findSupportedRoot(form, doc)
    if (!root) return

    const firstHeader = getTopLevelHeaders(root)[0]
    const firstSection = firstHeader ? getSection(firstHeader) : null
    const actions = firstSection?.container?.querySelectorAll?.(ACTION_SELECTOR) || []
    const hasSearchAction = [...actions].some((action) => Boolean(findSearchAction(action)))

    if (hasSearchAction) scheduleTransition(form)
  }

  const handleKeydown = (event) => {
    if (event.key !== 'Enter' || event.isComposing) return
    const target = event.target
    if (!target?.matches?.('input, select, textarea')) return

    const root = findSupportedRoot(target, doc)
    if (!root) return

    const firstHeader = getTopLevelHeaders(root)[0]
    const firstSection = firstHeader ? getSection(firstHeader) : null
    const actions = firstSection?.container?.querySelectorAll?.(ACTION_SELECTOR) || []
    const hasSearchAction = [...actions].some((action) => Boolean(findSearchAction(action)))

    if (hasSearchAction) scheduleTransition(target)
  }

  doc.addEventListener('click', handleClick, true)
  doc.addEventListener('submit', handleSubmit, true)
  doc.addEventListener('keydown', handleKeydown, true)

  return () => {
    const view = doc.defaultView || window
    pendingRoots.forEach((timer) => view.clearTimeout(timer))
    pendingRoots.clear()
    doc.removeEventListener('click', handleClick, true)
    doc.removeEventListener('submit', handleSubmit, true)
    doc.removeEventListener('keydown', handleKeydown, true)
  }
}
