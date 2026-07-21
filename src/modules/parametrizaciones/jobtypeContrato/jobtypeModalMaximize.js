const MODAL_SELECTOR = '.jobtype-modal'
const HEADER_SELECTOR = '.jobtype-modal-header'
const CLOSE_SELECTOR = '.jobtype-modal-close'
const MAXIMIZE_CLASS = 'jobtype-modal-maximize'
const EXPANDED_CLASS = 'jobtype-modal--expanded'
const BOUND_ATTR = 'data-jobtype-maximize-bound'

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

const enhanceOpenModals = () => {
  document.querySelectorAll(MODAL_SELECTOR).forEach(enhanceModal)
}

export const initJobtypeModalMaximize = () => {
  if (typeof window === 'undefined') return

  enhanceOpenModals()

  const observer = new MutationObserver(() => {
    enhanceOpenModals()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

export default initJobtypeModalMaximize
