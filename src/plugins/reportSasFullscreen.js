const PAGE_SELECTOR = '.report-sas-page'
const GRID_ROW_SELECTOR = '.report-sas-grid .p-datatable-tbody > tr'
const EMPTY_ROW_CLASSES = ['p-datatable-emptymessage', 'p-datatable-empty-message']

const hasRealRows = (page) => [...page.querySelectorAll(GRID_ROW_SELECTOR)].some((row) => (
  !EMPTY_ROW_CLASSES.some((className) => row.classList.contains(className))
))

const syncReportSasFullscreen = () => {
  document.querySelectorAll(PAGE_SELECTOR).forEach((page) => {
    const isLoading = Boolean(page.querySelector('.fm-typing-loader'))
    page.classList.toggle('report-sas-page--fullscreen', !isLoading && hasRealRows(page))
  })
}

export const installReportSasFullscreen = () => {
  syncReportSasFullscreen()

  const observer = new MutationObserver(syncReportSasFullscreen)
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}
