const PAGE_SELECTOR = '.report-sas-page.report-sas-page--fullscreen'
const REAL_ROW_SELECTOR = [
  '.report-sas-grid .p-datatable-tbody > tr:not(.p-datatable-emptymessage)',
  '.report-sas-grid .p-datatable-tbody > tr:not(.p-datatable-empty-message)'
].join(', ')

const BASE_HEIGHT = 142
const ROW_HEIGHT = 38
const MIN_HEIGHT = 300

const syncReportSasHeight = () => {
  document.querySelectorAll(PAGE_SELECTOR).forEach((page) => {
    const rows = [...page.querySelectorAll(REAL_ROW_SELECTOR)].filter((row) => (
      !row.classList.contains('p-datatable-emptymessage') &&
      !row.classList.contains('p-datatable-empty-message')
    ))

    const desiredHeight = Math.max(MIN_HEIGHT, BASE_HEIGHT + rows.length * ROW_HEIGHT)
    page.style.setProperty('--fm-report-sas-desired-height', `${desiredHeight}px`)
  })
}

export const installReportSasAutoHeight = () => {
  syncReportSasHeight()

  const observer = new MutationObserver(syncReportSasHeight)
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}
