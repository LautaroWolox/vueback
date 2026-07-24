<template>
  <div ref="screenRoot" class="jobtype-contrato-screen">
    <JobtypeRelacion relation="contrato" />
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import JobtypeRelacion from '../jobtypeRelacion/JobtypeRelacion.vue'

const screenRoot = ref(null)
let dialogObserver = null
let dialogRefreshFrame = null

const openResultsAccordion = async () => {
  await nextTick()

  const resultsHeader = screenRoot.value?.querySelector(
    '.jobtype-panel--results .jobtype-panel__header'
  )

  if (resultsHeader?.getAttribute('aria-expanded') !== 'true') {
    resultsHeader?.click()
  }
}

const setImportantStyle = (element, property, value) => {
  if (
    element.style.getPropertyValue(property) === value &&
    element.style.getPropertyPriority(property) === 'important'
  ) {
    return
  }

  element.style.setProperty(property, value, 'important')
}

const customizeContratoDialog = () => {
  const dialog = document.querySelector('.p-dialog.jobtype-alta-dialog')
  if (!dialog) return

  setImportantStyle(dialog, 'width', 'min(980px, calc(100vw - 48px))')
  setImportantStyle(dialog, 'max-width', '980px')
  setImportantStyle(dialog, 'height', 'min(560px, calc(100dvh - 48px))')
  setImportantStyle(dialog, 'max-height', 'calc(100dvh - 48px)')

  const form = dialog.querySelector('.jobtype-alta-form')
  if (form) {
    setImportantStyle(form, 'width', '100%')
    setImportantStyle(form, 'max-width', '100%')
    setImportantStyle(form, 'box-sizing', 'border-box')
    setImportantStyle(form, 'grid-template-columns', '100px minmax(0, 1fr) minmax(0, 1fr) 100px 120px')
    setImportantStyle(form, 'column-gap', '14px')
    setImportantStyle(form, 'align-items', 'end')

    form.querySelectorAll('.jobtype-alta-field').forEach((field) => {
      setImportantStyle(field, 'width', '100%')
      setImportantStyle(field, 'min-width', '0')
      setImportantStyle(field, 'max-width', 'none')
    })

    form.querySelectorAll('.jobtype-alta-control').forEach((control) => {
      if (control.closest('.jobtype-alta-field')?.querySelector('label')?.textContent?.trim() === 'Jobtype' ||
          control.closest('.jobtype-alta-field')?.querySelector('label')?.textContent?.trim() === 'Contrato') {
        setImportantStyle(control, 'width', '100%')
        setImportantStyle(control, 'min-width', '0')
        setImportantStyle(control, 'max-width', 'none')
      }
    })
  }

  dialog.querySelectorAll('.jobtype-add-button, .jobtype-relate-button').forEach((button) => {
    setImportantStyle(button, 'width', '120px')
    setImportantStyle(button, 'min-width', '120px')
    setImportantStyle(button, 'max-width', '120px')
    setImportantStyle(button, 'height', '36px')
    setImportantStyle(button, 'min-height', '36px')
    setImportantStyle(button, 'max-height', '36px')
    setImportantStyle(button, 'padding', '0 13px')
    setImportantStyle(button, 'border-radius', '6px')
    setImportantStyle(button, 'font-size', '12px')
    setImportantStyle(button, 'font-weight', '600')
    setImportantStyle(button, 'box-shadow', '0 2px 6px rgba(0, 91, 104, .14)')
    setImportantStyle(button, 'transform', 'none')
    setImportantStyle(button, 'box-sizing', 'border-box')
  })
}

const scheduleDialogCustomization = () => {
  if (dialogRefreshFrame !== null) return

  dialogRefreshFrame = requestAnimationFrame(() => {
    dialogRefreshFrame = null
    customizeContratoDialog()
  })
}

onMounted(async () => {
  await openResultsAccordion()
  scheduleDialogCustomization()

  dialogObserver = new MutationObserver((mutations) => {
    const dialogChanged = mutations.some((mutation) => {
      if (mutation.type === 'childList') return true

      const target = mutation.target
      return target instanceof Element && Boolean(
        target.matches('.p-dialog.jobtype-alta-dialog, .jobtype-add-button, .jobtype-relate-button, .jobtype-alta-form, .jobtype-alta-field, .jobtype-alta-control') ||
        target.closest('.p-dialog.jobtype-alta-dialog')
      )
    })

    if (dialogChanged) scheduleDialogCustomization()
  })

  dialogObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
  })

  window.addEventListener('resize', scheduleDialogCustomization)
})

onBeforeUnmount(() => {
  dialogObserver?.disconnect()
  window.removeEventListener('resize', scheduleDialogCustomization)

  if (dialogRefreshFrame !== null) {
    cancelAnimationFrame(dialogRefreshFrame)
    dialogRefreshFrame = null
  }
})
</script>
