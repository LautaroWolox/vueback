const STATE_CLASSES = [
  'actas-state--success',
  'actas-state--info',
  'actas-state--warning',
  'actas-state--danger',
  'actas-state--neutral',
]

const normalizeState = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toUpperCase()

const resolveStateClass = (value) => {
  const state = normalizeState(value)
  if (!state) return 'actas-state--neutral'

  if (state.includes('CERTIFIC') || state.includes('CERRAD')) return 'actas-state--success'
  if (state.includes('CURSO') || state.includes('PROCES') || state.includes('EJECUC')) return 'actas-state--info'
  if (state.includes('ABIERT') || state.includes('PENDIENT') || state.includes('INICI')) return 'actas-state--warning'
  if (state.includes('ANUL') || state.includes('RECHAZ') || state.includes('ERROR') || state.includes('FALL')) return 'actas-state--danger'
  return 'actas-state--neutral'
}

const createAccordionHeader = ({ kind, title }) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `actas-accordion-header actas-accordion-header--${kind}`
  button.dataset.actasAccordion = kind
  button.setAttribute('aria-expanded', 'false')
  button.innerHTML = `
    <span class="actas-accordion-header__title">${title}</span>
    <i class="pi pi-chevron-down actas-accordion-header__chevron" aria-hidden="true"></i>
  `
  return button
}

const getFilterNodes = (page) => [
  ...page.querySelectorAll('.actas-filter-card'),
  ...page.querySelectorAll('.actas-feedback:not(.actas-feedback--inside)'),
  ...page.querySelectorAll('.actas-search-actions'),
]

const getGridNode = (page) => page.querySelector('.actas-grid-card')

const setNodesHidden = (nodes, hidden) => {
  nodes.filter(Boolean).forEach((node) => {
    if (node.hidden !== hidden) node.hidden = hidden
  })
}

const normalizeGridStructure = (page) => {
  const table = page.querySelector('.actas-main-grid .p-datatable-table')
  const thead = table?.querySelector('thead')
  if (!thead) return

  const rows = [...thead.querySelectorAll(':scope > tr')]
  const filterRow = rows.find((row) => (
    row.classList.contains('p-datatable-filter-row') ||
    row.classList.contains('p-filter-row') ||
    row.querySelector('.actas-column-filter')
  ))

  const titleRow = rows.find((row) => row !== filterRow && [...row.children].some((cell) => {
    const text = normalizeState(cell.textContent)
    return text.includes('NRO_ACTA') || text.includes('ESTADO_ACTA') || text.includes('CONTRATISTA')
  }))

  if (filterRow) {
    filterRow.classList.add('actas-filter-row--top')
    if (thead.firstElementChild !== filterRow) thead.insertBefore(filterRow, thead.firstElementChild)
  }

  if (titleRow) titleRow.classList.add('actas-title-row--below')

  page.querySelectorAll('.actas-main-grid .p-datatable-frozen-column').forEach((cell) => {
    cell.classList.remove('p-datatable-frozen-column')
    cell.style.removeProperty('left')
    cell.style.removeProperty('right')
    cell.style.removeProperty('position')
    cell.style.removeProperty('z-index')
  })
}

const applyStateBadges = (page) => {
  page.querySelectorAll('.actas-main-grid table').forEach((table) => {
    const thead = table.querySelector('thead')
    if (!thead) return

    const headerRow = [...thead.querySelectorAll(':scope > tr')].find((row) => (
      [...row.children].some((cell) => normalizeState(cell.textContent).includes('ESTADO_ACTA'))
    ))
    if (!headerRow) return

    const headers = [...headerRow.children]
    const stateIndex = headers.findIndex((header) => {
      const text = normalizeState(header.textContent)
      return text === 'ESTADO_ACTA' || text === 'ESTADO ACTA' || text.includes('ESTADO_ACTA')
    })

    if (stateIndex < 0) return

    table.querySelectorAll('tbody tr').forEach((row) => {
      const cell = row.children[stateIndex]
      if (!cell) return

      const target = cell.querySelector('.actas-cell-text') || cell.querySelector('span') || cell
      const stateClass = resolveStateClass(target.textContent)
      STATE_CLASSES.forEach((className) => target.classList.remove(className))
      target.classList.add('actas-state-badge', stateClass)
    })
  })
}

export const installActasPrototypeEnhancements = () => {
  let disposed = false
  let root = null
  let observer = null
  let animationFrame = 0
  let filtersOpen = true
  let gridOpen = false
  let gridWasOpened = false

  const render = () => {
    if (!root || disposed) return

    const selectionPage = root.querySelector('.actas-selection-page')
    if (!selectionPage) return

    const filtersHeader = selectionPage.querySelector('[data-actas-accordion="filters"]')
    const gridHeader = selectionPage.querySelector('[data-actas-accordion="grid"]')
    const grid = getGridNode(selectionPage)

    setNodesHidden(getFilterNodes(selectionPage), !filtersOpen)
    if (grid && grid.hidden !== !gridOpen) grid.hidden = !gridOpen

    filtersHeader?.classList.toggle('is-open', filtersOpen)
    gridHeader?.classList.toggle('is-open', gridOpen)
    filtersHeader?.setAttribute('aria-expanded', String(filtersOpen))
    gridHeader?.setAttribute('aria-expanded', String(gridOpen))

    root.classList.toggle('actas-v2-page--grid-expanded', gridOpen && !filtersOpen)
    normalizeGridStructure(selectionPage)
    applyStateBadges(selectionPage)
  }

  const scheduleRender = () => {
    if (disposed || animationFrame) return
    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = 0
      ensureAccordions()
      render()
    })
  }

  const onFiltersClick = () => {
    filtersOpen = !filtersOpen
    if (filtersOpen) gridOpen = false
    render()
  }

  const onGridClick = () => {
    gridOpen = !gridOpen
    if (gridOpen) {
      filtersOpen = false
      gridWasOpened = true
    }
    render()
  }

  const onSelectionPageClick = (event) => {
    const searchButton = event.target.closest('.actas-search-actions button')
    if (!searchButton) return

    const label = normalizeState(searchButton.textContent)
    if (!label.includes('BUSCAR')) return

    filtersOpen = false
    gridOpen = true
    gridWasOpened = true
    window.setTimeout(render, 0)
  }

  const ensureAccordions = () => {
    if (!root || disposed) return
    const selectionPage = root.querySelector('.actas-selection-page')
    if (!selectionPage) return

    if (!selectionPage.dataset.actasAccordionEnhanced) {
      selectionPage.dataset.actasAccordionEnhanced = 'true'
      selectionPage.addEventListener('click', onSelectionPageClick)
    }

    const firstFilter = selectionPage.querySelector('.actas-filter-card')
    if (firstFilter && !selectionPage.querySelector('[data-actas-accordion="filters"]')) {
      const filtersHeader = createAccordionHeader({
        kind: 'filters',
        title: 'FILTROS DE BÚSQUEDA',
      })
      filtersHeader.addEventListener('click', onFiltersClick)
      firstFilter.before(filtersHeader)
    }

    const grid = getGridNode(selectionPage)
    if (grid && !selectionPage.querySelector('[data-actas-accordion="grid"]')) {
      const gridHeader = createAccordionHeader({
        kind: 'grid',
        title: 'ACTAS',
      })
      gridHeader.addEventListener('click', onGridClick)
      grid.before(gridHeader)

      if (gridWasOpened) {
        filtersOpen = false
        gridOpen = true
      }
    }
  }

  const tryInstall = () => {
    if (disposed) return
    root = document.querySelector('.actas-v2-page')
    if (!root) {
      animationFrame = window.requestAnimationFrame(tryInstall)
      return
    }

    root.classList.add('actas-accordion-enhanced')
    ensureAccordions()
    render()

    observer = new MutationObserver(scheduleRender)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
  }

  tryInstall()

  return () => {
    disposed = true
    if (animationFrame) window.cancelAnimationFrame(animationFrame)
    observer?.disconnect()

    if (root) {
      root.classList.remove('actas-accordion-enhanced', 'actas-v2-page--grid-expanded')
      root.querySelectorAll('[data-actas-accordion]').forEach((node) => node.remove())
      root.querySelectorAll('.actas-selection-page[data-actas-accordion-enhanced]').forEach((selectionPage) => {
        selectionPage.removeEventListener('click', onSelectionPageClick)
        delete selectionPage.dataset.actasAccordionEnhanced
      })
      root.querySelectorAll('[hidden]').forEach((node) => { node.hidden = false })
    }
  }
}
