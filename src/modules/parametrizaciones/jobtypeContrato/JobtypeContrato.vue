<template>
  <div
    ref="screenRoot"
    class="jobtype-contrato-screen"
    @click.capture="interceptDeleteClick"
  >
    <JobtypeRelacion relation="contrato" />

    <Dialog
      v-model:visible="showDeleteConfirm"
      appendTo="body"
      modal
      :closable="false"
      :draggable="true"
      :resizable="false"
      class="jobtype-contrato-delete-confirm-dialog"
      :style="deleteConfirmDialogStyle"
      @hide="cancelDelete"
    >
      <template #header>
        <div class="jobtype-contrato-delete-confirm__header">
          <div class="jobtype-contrato-delete-confirm__header-main">
            <span class="jobtype-contrato-delete-confirm__icon-circle">
              <i class="pi pi-bell jobtype-contrato-delete-confirm__header-icon" aria-hidden="true" />
            </span>
            <span class="jobtype-contrato-delete-confirm__title">Confirmar Accion</span>
          </div>

          <button
            type="button"
            class="jobtype-contrato-delete-confirm__close"
            title="Cerrar"
            aria-label="Cerrar"
            @click="cancelDelete"
          >×</button>
        </div>
      </template>

      <div class="jobtype-contrato-delete-confirm__content">
        <span class="jobtype-contrato-delete-confirm__message">
          ¿Confirma que desea desactivar la relación seleccionada?
        </span>
      </div>

      <template #footer>
        <div class="jobtype-contrato-delete-confirm__actions">
          <button
            type="button"
            class="jobtype-contrato-delete-confirm__button jobtype-contrato-delete-confirm__button--cancel"
            @click="cancelDelete"
          >
            CANCELAR
          </button>
          <button
            type="button"
            class="jobtype-contrato-delete-confirm__button jobtype-contrato-delete-confirm__button--accept"
            @click="acceptDelete"
          >
            ACEPTAR
          </button>
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
      const label = control.closest('.jobtype-alta-field')?.querySelector('label')?.textContent?.trim()
      if (label === 'Jobtype' || label === 'Contrato') {
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
  pendingDeleteButton = null
  window.removeEventListener('resize', scheduleDialogCustomization)

  if (dialogRefreshFrame !== null) {
    cancelAnimationFrame(dialogRefreshFrame)
    dialogRefreshFrame = null
  }
})
</script>

<style scoped>
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr.p-datatable-row-selected > td),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr.p-datatable-row-selected:hover > td),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[data-p-selected='true'] > td),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[data-p-selected='true']:hover > td),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[aria-selected='true'] > td),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[aria-selected='true']:hover > td) {
  background: #9ee7ee !important;
  color: #111 !important;
}

.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr.p-datatable-row-selected > td *),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[data-p-selected='true'] > td *),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[aria-selected='true'] > td *) {
  color: #111 !important;
}

.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-emptymessage > td),
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-empty-message > td) {
  position: relative !important;
  height: 120px !important;
  padding: 0 !important;
  text-align: center !important;
  vertical-align: middle !important;
  background: #e8f9fc !important;
  color: transparent !important;
}

.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-emptymessage > td)::after,
.jobtype-contrato-screen :deep(#tabla-jobtype-contrato .p-datatable-empty-message > td)::after {
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

.jobtype-contrato-delete-confirm__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.jobtype-contrato-delete-confirm__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.jobtype-contrato-delete-confirm__title {
  color: #252b33;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.jobtype-contrato-delete-confirm__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8fa;
}

.jobtype-contrato-delete-confirm__header-icon {
  color: #11aabd;
  font-size: 23px;
}

.jobtype-contrato-delete-confirm__close {
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

.jobtype-contrato-delete-confirm__close:hover {
  color: #00a9bd;
}

.jobtype-contrato-delete-confirm__content {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.jobtype-contrato-delete-confirm__message {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.35;
}

.jobtype-contrato-delete-confirm__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

:global(.p-dialog.jobtype-contrato-delete-confirm-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.jobtype-contrato-delete-confirm-dialog .p-dialog-header) {
  min-height: 68px;
  padding: 12px 18px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.jobtype-contrato-delete-confirm-dialog .p-dialog-content) {
  padding: 0 18px;
  background: #fff;
}

:global(.jobtype-contrato-delete-confirm-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid #dedede;
  background: #fff;
}

.jobtype-contrato-delete-confirm__button {
  appearance: none;
  width: 100px;
  min-width: 100px;
  height: 30px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid #00acc1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  box-shadow: none;
  outline: none;
  cursor: pointer;
}

.jobtype-contrato-delete-confirm__button--cancel,
.jobtype-contrato-delete-confirm__button--cancel:hover,
.jobtype-contrato-delete-confirm__button--cancel:focus,
.jobtype-contrato-delete-confirm__button--cancel:active {
  background: #fff;
  color: #0097a7;
}

.jobtype-contrato-delete-confirm__button--accept,
.jobtype-contrato-delete-confirm__button--accept:hover,
.jobtype-contrato-delete-confirm__button--accept:focus,
.jobtype-contrato-delete-confirm__button--accept:active {
  background: #00acc1;
  color: #fff;
}
</style>
