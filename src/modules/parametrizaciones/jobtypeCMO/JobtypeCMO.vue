<template>
  <div ref="screenRoot" class="cmo-actividad-screen">
    <JobtypeRelacion relation="cmo" />
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

const customizeActivityDialog = () => {
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
    customizeActivityDialog()
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

<style scoped>
/*
 * CMO-Actividad reutiliza el popup y la grilla común aprobados.
 * Esta capa adapta únicamente el título, las columnas visibles y el estado
 * inicial del segundo acordeón, sin afectar Jobtype-Contrato.
 */
.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child) {
  font-size: 0;
}

.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child)::after {
  content: 'RELACIONES CMO-ACTIVIDAD';
  font-size: 12px;
}

/* CMO-Actividad no muestra la columna PAIS heredada de la grilla común. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(8)) {
  display: none !important;
}

/* Las siete columnas visibles ocupan todo el ancho de la grilla. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(-n + 7)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(-n + 7)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(-n + 7)) {
  width: 14.2857% !important;
  min-width: 0 !important;
  max-width: 14.2857% !important;
}

/*
 * PrimeVue 4 usa .p-datatable-column-title. Se conserva también
 * .p-column-title por compatibilidad con cualquier tema anterior.
 */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(-n + 7) .p-datatable-column-title),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(-n + 7) .p-column-title) {
  font-size: 0 !important;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1) .p-column-title)::after {
  content: 'CODIGO_ACTIVIDAD';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2) .p-column-title)::after {
  content: 'DESC_ACTIVIDAD';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3) .p-column-title)::after {
  content: 'CODIGO_S4';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(4) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(4) .p-column-title)::after {
  content: 'CMO';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(5) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(5) .p-column-title)::after {
  content: 'USUARIO_MODIFICACION';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(6) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(6) .p-column-title)::after {
  content: 'FECHA_MODIFICACION';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(7) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(7) .p-column-title)::after {
  content: 'ACTIVO';
  font-size: 11px;
}
</style>