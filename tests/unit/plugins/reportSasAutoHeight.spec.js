import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadPlugin = async () => {
  vi.resetModules()
  return import('@/plugins/reportSasAutoHeight')
}

const createPage = (rows, emptyRows = 0) => {
  const page = document.createElement('section')
  page.className = 'report-sas-page report-sas-page--fullscreen'
  const table = document.createElement('table')
  table.className = 'report-sas-grid p-datatable'
  const tbody = document.createElement('tbody')
  tbody.className = 'p-datatable-tbody'

  for (let index = 0; index < rows; index += 1) {
    tbody.appendChild(document.createElement('tr'))
  }

  for (let index = 0; index < emptyRows; index += 1) {
    const row = document.createElement('tr')
    row.className = 'p-datatable-emptymessage'
    tbody.appendChild(row)
  }

  table.appendChild(tbody)
  page.appendChild(table)
  document.body.appendChild(page)
  return page
}

describe('reportSasAutoHeight', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('respeta la altura mínima cuando hay pocas filas', async () => {
    const page = createPage(1)
    const { installReportSasAutoHeight } = await loadPlugin()

    installReportSasAutoHeight()

    expect(page.style.getPropertyValue('--fm-report-sas-desired-height')).toBe('300px')
  })

  it('aumenta la altura según filas reales e ignora la fila de estado vacío', async () => {
    const page = createPage(5, 1)
    const { installReportSasAutoHeight } = await loadPlugin()

    installReportSasAutoHeight()

    expect(page.style.getPropertyValue('--fm-report-sas-desired-height')).toBe('332px')
  })
})
