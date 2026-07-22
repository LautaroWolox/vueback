const MODAL_SELECTOR = '.jobtype-modal'
const HEADER_SELECTOR = '.jobtype-modal-header'
const CLOSE_SELECTOR = '.jobtype-modal-close'
const MAXIMIZE_CLASS = 'jobtype-modal-maximize'
const EXPANDED_CLASS = 'jobtype-modal--expanded'
const BOUND_ATTR = 'data-jobtype-maximize-bound'

const SHARED_DIALOG_SELECTOR = '.fm-grid-dialog'
const SHARED_EXPANDED_CLASS = 'fm-grid-dialog--maximized'
const SHARED_RESIZE_BOUND_ATTR = 'data-fm-grid-resize-bound'

const createToggle = () => {
  const toggle = document.createElement('span')
  toggle.setAttribute('role', 'button')
  toggle.setAttribute('tabindex', '0')
  toggle.setAttribute('aria-label', 'Maximizar')
  toggle.setAttribute('title', 'Maximizar')
  toggle.className = MAXIMIZE_CLASS

  const icon = document.createElement('i')
  icon.className = 'pi pi-window-maximize'
  icon.setAttribute('aria-hidden', 'true')
  toggle.appendChild(icon)

  return toggle
}

const setToggleState = (modal, toggle) => {
  const isExpanded = modal.classList.contains(EXPANDED_CLASS)
  const icon = toggle.querySelector('i')

  toggle.setAttribute('aria-label', isExpanded ? 'Minimizar' : 'Maximizar')
  toggle.setAttribute('title', isExpanded ? 'Minimizar' : 'Maximizar')

  if (icon) {
    icon.className = isExpanded ? 'pi pi-window-minimize' : 'pi pi-window-maximize'
  }
}

const toggleModalSize = (toggle) => {
  const modal = toggle.closest(MODAL_SELECTOR)
  if (!modal) return

  modal.classList.toggle(EXPANDED_CLASS)
  setToggleState(modal, toggle)
}

const bindToggle = (toggle) => {
  if (!toggle || toggle.getAttribute(BOUND_ATTR) === 'true') return

  toggle.setAttribute(BOUND_ATTR, 'true')

  toggle.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggleModalSize(toggle)
  })

  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      toggleModalSize(toggle)
    }
  })
}

const enhanceModal = (modal) => {
  const header = modal.querySelector(HEADER_SELECTOR)
  if (!header) return

  let toggle = header.querySelector(`.${MAXIMIZE_CLASS}`)

  if (!toggle) {
    const close = header.querySelector(CLOSE_SELECTOR)
    toggle = createToggle()

    if (close) {
      header.insertBefore(toggle, close)
    } else {
      header.appendChild(toggle)
    }
  }

  bindToggle(toggle)
  setToggleState(modal, toggle)
}

const important = (element, property, value) => {
  element?.style.setProperty(property, value, 'important')
}

const clearInlineLayout = (element, properties) => {
  if (!element) return
  properties.forEach((property) => element.style.removeProperty(property))
}

const clearSharedDialogLayout = (dialog) => {
  const body = dialog.querySelector('.fm-grid-dialog__body')
  const gridArea = dialog.querySelector('.fm-grid-dialog__grid-area')
  const popupGrid = dialog.querySelector('.fm-popup-grid')
  const dataTable = popupGrid?.querySelector('.p-datatable')
  const tableContainer = popupGrid?.querySelector(
    '.p-datatable-table-container, .p-datatable-wrapper, [data-pc-section="tablecontainer"]'
  )
  const emptyContent = popupGrid?.querySelector('.fm-popup-grid__empty')

  clearInlineLayout(body, ['height', 'min-height', 'max-height', 'overflow'])
  clearInlineLayout(gridArea, ['height', 'min-height', 'max-height', 'display', 'flex'])
  clearInlineLayout(popupGrid, ['height', 'min-height', 'max-height', 'display', 'flex'])
  clearInlineLayout(dataTable, ['height', 'min-height', 'max-height', 'display', 'flex'])
  clearInlineLayout(tableContainer, ['height', 'min-height', 'max-height', 'flex'])
  clearInlineLayout(emptyContent, ['height', 'min-height', 'max-height'])
}

const measureSharedDialog = (dialog) => {
  if (!dialog?.isConnected) return

  if (!dialog.classList.contains(SHARED_EXPANDED_CLASS)) {
    clearSharedDialogLayout(dialog)
    return
  }

  const header = dialog.querySelector('.p-dialog-header')
  const content = dialog.querySelector('.p-dialog-content')
  const footer = dialog.querySelector('.p-dialog-footer')
  const body = dialog.querySelector('.fm-grid-dialog__body')
  const form = dialog.querySelector('.fm-grid-dialog__form')
  const gridArea = dialog.querySelector('.fm-grid-dialog__grid-area')
  const popupGrid = dialog.querySelector('.fm-popup-grid')
  const dataTable = popupGrid?.querySelector('.p-datatable')
  const tableContainer = popupGrid?.querySelector(
    '.p-datatable-table-container, .p-datatable-wrapper, [data-pc-section="tablecontainer"]'
  )
  const paginator = popupGrid?.querySelector('.p-datatable-paginator-bottom, .p-paginator')
  const emptyContent = popupGrid?.querySelector('.fm-popup-grid__empty')

  if (!content || !body || !gridArea || !popupGrid || !dataTable || !tableContainer) return

  const dialogHeight = dialog.getBoundingClientRect().height
  const headerHeight = header?.getBoundingClientRect().height || 0
  const footerHeight = footer?.getBoundingClientRect().height || 0
  const formHeight = form?.getBoundingClientRect().height || 0
  const paginatorHeight = paginator?.getBoundingClientRect().height || 34
  const bodyStyles = window.getComputedStyle(body)
  const paddingTop = Number.parseFloat(bodyStyles.paddingTop) || 0
  const paddingBottom = Number.parseFloat(bodyStyles.paddingBottom) || 0
  const gap = Number.parseFloat(bodyStyles.rowGap || bodyStyles.gap) || 0

  const contentHeight = Math.max(240, dialogHeight - headerHeight - footerHeight)
  const gridHeight = Math.max(
    180,
    contentHeight - formHeight - paddingTop - paddingBottom - (formHeight ? gap : 0)
  )
  const tableHeight = Math.max(146, gridHeight - paginatorHeight)
  const emptyHeight = Math.max(80, tableHeight - 62)

  important(content, 'height', `${contentHeight}px`)
  important(content, 'min-height', `${contentHeight}px`)
  important(content, 'max-height', `${contentHeight}px`)

  important(body, 'height', `${contentHeight}px`)
  important(body, 'min-height', '0')
  important(body, 'max-height', `${contentHeight}px`)
  important(body, 'overflow', 'hidden')

  important(gridArea, 'height', `${gridHeight}px`)
  important(gridArea, 'min-height', `${gridHeight}px`)
  important(gridArea, 'max-height', `${gridHeight}px`)
  important(gridArea, 'display', 'flex')
  important(gridArea, 'flex', '0 0 auto')

  important(popupGrid, 'height', `${gridHeight}px`)
  important(popupGrid, 'min-height', `${gridHeight}px`)
  important(popupGrid, 'max-height', `${gridHeight}px`)
  important(popupGrid, 'display', 'flex')
  important(popupGrid, 'flex', '0 0 auto')

  important(dataTable, 'height', `${gridHeight}px`)
  important(dataTable, 'min-height', `${gridHeight}px`)
  important(dataTable, 'max-height', `${gridHeight}px`)
  important(dataTable, 'display', 'flex')
  important(dataTable, 'flex', '0 0 auto')

  important(tableContainer, 'height', `${tableHeight}px`)
  important(tableContainer, 'min-height', `${tableHeight}px`)
  important(tableContainer, 'max-height', `${tableHeight}px`)
  important(tableContainer, 'flex', '0 0 auto')

  if (emptyContent) {
    important(emptyContent, 'height', `${emptyHeight}px`)
    important(emptyContent, 'min-height', `${emptyHeight}px`)
    important(emptyContent, 'max-height', `${emptyHeight}px`)
  }
}

const scheduleSharedDialogMeasure = (dialog) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => measureSharedDialog(dialog))
  })
}

const bindSharedDialogResize = (dialog) => {
  if (!dialog || dialog.getAttribute(SHARED_RESIZE_BOUND_ATTR) === 'true') return
  dialog.setAttribute(SHARED_RESIZE_BOUND_ATTR, 'true')

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => scheduleSharedDialogMeasure(dialog))
    resizeObserver.observe(dialog)
  }
}

const syncSharedGridDialogs = () => {
  document.querySelectorAll(SHARED_DIALOG_SELECTOR).forEach((dialog) => {
    bindSharedDialogResize(dialog)
    scheduleSharedDialogMeasure(dialog)
  })
}

const enhanceOpenModals = () => {
  document.querySelectorAll(MODAL_SELECTOR).forEach(enhanceModal)
  syncSharedGridDialogs()
}

export const initJobtypeModalMaximize = () => {
  if (typeof window === 'undefined') return

  enhanceOpenModals()

  const observer = new MutationObserver(() => {
    enhanceOpenModals()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  })

  window.addEventListener('resize', syncSharedGridDialogs)
}

export default initJobtypeModalMaximize
