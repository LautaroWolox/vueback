const COUNTER_SELECTOR = [
  '.fm-custom-paginator__counter',
  '.otf-custom-paginator__counter',
  '.p-paginator-current'
].join(', ')

const ROWS_SELECT_SELECTOR = [
  'select.fm-rows-select',
  'select.otf-rows-select',
  'select[aria-label="Filas por página"]'
].join(', ')

const RANGE_PATTERN = /Mostrando\s+[\d.,]+\s*(?:-|–|—|a|al)\s*([\d.,]+)\s+de\s+([\d.,]+)/i
const INITIALIZED_ATTRIBUTE = 'data-fm-max-rows-initialized'
const observedDocuments = new WeakSet()
const registeredIframes = new WeakSet()

const normalizeCounter = (element) => {
  const text = element.textContent?.trim() ?? ''
  const match = text.match(RANGE_PATTERN)

  if (!match) return

  element.textContent = `Mostrando ${match[1]} de ${match[2]}`
}

const resolveInitializationScope = (select) => (
  select.closest('.p-datatable') ||
  select.closest('.fm-grid-shell') ||
  select.parentElement
)

const applyMaximumRows = (select) => {
  const scope = resolveInitializationScope(select)
  const initializedElement = scope || select

  if (initializedElement.hasAttribute(INITIALIZED_ATTRIBUTE)) return

  const options = [...select.options]
    .map((option) => Number(option.value))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (!options.length) return

  const maximumRows = Math.max(...options)
  initializedElement.setAttribute(INITIALIZED_ATTRIBUTE, 'true')

  if (Number(select.value) === maximumRows) return

  select.value = String(maximumRows)

  const EventConstructor = select.ownerDocument.defaultView?.Event ?? Event
  select.dispatchEvent(new EventConstructor('change', { bubbles: true }))
}

const registerIframe = (iframe) => {
  const connectIframeDocument = () => {
    try {
      const iframeDocument = iframe.contentDocument
      if (iframeDocument?.body) observeDocument(iframeDocument)
    } catch {
      // Los iframes de otro dominio no permiten acceder al documento interno.
    }
  }

  if (!registeredIframes.has(iframe)) {
    registeredIframes.add(iframe)
    iframe.addEventListener('load', connectIframeDocument)
  }

  connectIframeDocument()
}

const syncDocument = (rootDocument) => {
  rootDocument.querySelectorAll(COUNTER_SELECTOR).forEach(normalizeCounter)
  rootDocument.querySelectorAll(ROWS_SELECT_SELECTOR).forEach(applyMaximumRows)
  rootDocument.querySelectorAll('iframe').forEach(registerIframe)
}

function observeDocument(rootDocument) {
  if (observedDocuments.has(rootDocument) || !rootDocument.body) return

  observedDocuments.add(rootDocument)
  syncDocument(rootDocument)

  const ObserverConstructor = rootDocument.defaultView?.MutationObserver ?? MutationObserver
  const observer = new ObserverConstructor(() => syncDocument(rootDocument))

  observer.observe(rootDocument.body, {
    childList: true,
    subtree: true,
    characterData: true
  })
}

export const installGridPaginatorDefaults = () => {
  observeDocument(document)
}
