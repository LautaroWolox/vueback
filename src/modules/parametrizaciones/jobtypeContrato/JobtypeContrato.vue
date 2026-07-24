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
        target.matches('.p-dialog.jobtype-alta-dialog, .jobtype-add-button, .jobtype-relate-button') ||
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
})

onBeforeUnmount(() => {
  dialogObserver?.disconnect()

  if (dialogRefreshFrame !== null) {
    cancelAnimationFrame(dialogRefreshFrame)
    dialogRefreshFrame = null
  }
})
</script>
