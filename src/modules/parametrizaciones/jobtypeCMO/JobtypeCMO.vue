<template>
  <div
    ref="screenRoot"
    class="cmo-actividad-screen"
    @click.capture="interceptDeleteClick"
  >
    <JobtypeRelacion relation="cmo" />

    <Dialog
      v-model:visible="showDeleteConfirm"
      appendTo="body"
      modal
      :closable="false"
      :draggable="true"
      :resizable="false"
      class="cmo-delete-confirm-dialog"
      :style="deleteConfirmDialogStyle"
      @hide="cancelDelete"
    >
      <template #header>
        <div class="cmo-delete-confirm__header">
          <span>Alerta</span>
          <button
            type="button"
            class="cmo-delete-confirm__close"
            title="Cerrar"
            aria-label="Cerrar"
            @click="cancelDelete"
          >×</button>
        </div>
      </template>

      <div class="cmo-delete-confirm__content">
        <i class="pi pi-exclamation-triangle cmo-delete-confirm__icon" aria-hidden="true" />
        <span>¿Confirma que desea desactivar la relación seleccionada?</span>
      </div>

      <template #footer>
        <div class="cmo-delete-confirm__actions">
          <FmButton
            label="CANCELAR"
            class="cmo-delete-confirm__cancel"
            @click="cancelDelete"
          />
          <FmButton
            label="ACEPTAR"
            class="cmo-delete-confirm__accept"
            @click="acceptDelete"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import JobtypeRelacion from '../jobtypeRelacion/JobtypeRelacion.vue'

const screenRoot = ref(null)
const showDeleteConfirm = ref(false)
const deleteConfirmDialogStyle = 'width: min(540px, calc(100vw - 32px)); max-width: 540px;'

let dialogObserver = null
let dialogRefreshFrame = null
let pendingDeleteButton = null
let allowDeleteOnce = false

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

const interceptDeleteClick = (event) => {
  const target = event.target instanceof Element ? event.target : null
  const button = target?.closest('button')

  if (!button || button.disabled || !button.querySelector('.pi-trash')) return
  if (button.closest('.jobtype-alta-dialog')) return

  if (allowDeleteOnce) {
    allowDeleteOnce = false
    return
  }

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  pendingDeleteButton = button
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  pendingDeleteButton = null
  allowDeleteOnce = false
}

const acceptDelete = () => {
  const button = pendingDeleteButton

  showDeleteConfirm.value = false
  pendingDeleteButton = null

  if (!button?.isConnected) {
    allowDeleteOnce = false
    return
  }

  allowDeleteOnce = true
  button.click()
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
  pendingDeleteButton = null

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

/* Estado vacío de la grilla principal. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-emptymessage > td),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-empty-message > td) {
  position: relative !important;
  height: 120px !important;
  padding: 0 !important;
  text-align: center !important;
  vertical-align: middle !important;
  background: #e8f9fc !important;
  color: transparent !important;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-emptymessage > td)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-empty-message > td)::after {
  content: 'No hay resultados';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #075f6d;
  font-size: 12px;
  font-weight: 400;
}

/* Fila seleccionada: fondo turquesa y texto negro. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr.p-datatable-row-selected > td),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr.p-datatable-row-selected:hover > td),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr[data-p-selected='true'] > td),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr[data-p-selected='true']:hover > td),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr[aria-selected='true'] > td),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr[aria-selected='true']:hover > td) {
  background: #9ee7ee !important;
  color: #111 !important;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr.p-datatable-row-selected > td *),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr[data-p-selected='true'] > td *),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr[aria-selected='true'] > td *) {
  color: #111 !important;
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

.cmo-delete-confirm__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #404040;
  font-size: 16px;
  font-weight: 400;
}

.cmo-delete-confirm__close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c7c7c7;
  font-size: 21px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.cmo-delete-confirm__close:hover {
  color: #00a9bd;
}

.cmo-delete-confirm__content {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  color: #202020;
  font-size: 13px;
}

.cmo-delete-confirm__icon {
  flex: 0 0 auto;
  color: #f0ad4e;
  font-size: 24px;
}

.cmo-delete-confirm__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

:global(.p-dialog.cmo-delete-confirm-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.cmo-delete-confirm-dialog .p-dialog-header) {
  min-height: 48px;
  padding: 10px 14px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.cmo-delete-confirm-dialog .p-dialog-content) {
  padding: 0 14px;
  background: #fff;
}

:global(.cmo-delete-confirm-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-top: 1px solid #dedede;
  background: #fff;
}

:global(.cmo-delete-confirm-dialog .cmo-delete-confirm__cancel),
:global(.cmo-delete-confirm-dialog .cmo-delete-confirm__accept) {
  width: auto !important;
  min-width: 88px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 12px !important;
  border-radius: 16px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

:global(.cmo-delete-confirm-dialog .cmo-delete-confirm__cancel) {
  border: 1px solid #00acc1 !important;
  background: #fff !important;
  color: #0097a7 !important;
  box-shadow: none !important;
}

:global(.cmo-delete-confirm-dialog .cmo-delete-confirm__accept) {
  border: 1px solid #00acc1 !important;
  background: #00acc1 !important;
  color: #fff !important;
  box-shadow: none !important;
}
</style>
