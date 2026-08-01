const COUNTER_SELECTOR = '.otf-custom-paginator__counter'
const RANGE_PATTERN = /Mostrando\s+\d+\s*-\s*(\d+)\s+de\s+(\d+)/i

const normalizeCounter = (element) => {
  const text = element.textContent?.trim() ?? ''
  const match = text.match(RANGE_PATTERN)

  if (!match) return

  element.textContent = `Mostrando ${match[1]} de ${match[2]}`
}

const syncCounters = () => {
  document.querySelectorAll(COUNTER_SELECTOR).forEach(normalizeCounter)
}

export const installOtFallidasPaginatorCounter = () => {
  syncCounters()

  const observer = new MutationObserver(syncCounters)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  })
}
