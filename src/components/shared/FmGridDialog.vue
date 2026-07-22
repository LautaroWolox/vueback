<template>
  <Dialog
    v-model:visible="visibleModel"
    appendTo="body"
    :modal="modal"
    :draggable="draggable && !maximized"
    :resizable="false"
    :closable="false"
    class="fm-grid-dialog"
    :class="{ 'fm-grid-dialog--maximized': maximized }"
    :style="dialogStyle"
    @hide="onHide"
  >
    <template #header>
      <div class="fm-grid-dialog__header">
        <span class="fm-grid-dialog__title">{{ title }}</span>

        <div class="fm-grid-dialog__header-actions">
          <button
            v-if="maximizable"
            type="button"
            class="fm-grid-dialog__header-button"
            :title="maximized ? 'Restaurar' : 'Maximizar'"
            :aria-label="maximized ? 'Restaurar' : 'Maximizar'"
            @click="toggleMaximized"
          >
            <i
              :class="maximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
              aria-hidden="true"
            ></i>
          </button>

          <button
            type="button"
            class="fm-grid-dialog__header-button"
            title="Cerrar"
            aria-label="Cerrar"
            @click="close"
          >
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </template>

    <div class="fm-grid-dialog__body">
      <div
        v-if="$slots.form"
        class="fm-grid-dialog__form"
        :style="formStyle"
      >
        <slot name="form" />
      </div>

      <div class="fm-grid-dialog__grid-area">
        <slot />
      </div>
    </div>

    <template v-if="$slots.footer" #footer>
      <div class="fm-grid-dialog__footer">
        <slot name="footer" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '980px' },
  maxWidth: { type: String, default: 'calc(100vw - 32px)' },
  modal: { type: Boolean, default: true },
  draggable: { type: Boolean, default: true },
  maximizable: { type: Boolean, default: true },
  formColumns: {
    type: String,
    default: 'repeat(auto-fit, minmax(150px, 1fr))'
  },
  formGap: { type: String, default: '12px' }
})

const emit = defineEmits(['update:visible', 'close', 'maximize-change'])
const maximized = ref(false)

const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogStyle = computed(() => ({
  '--fm-grid-dialog-width': props.width,
  '--fm-grid-dialog-max-width': props.maxWidth
}))

const formStyle = computed(() => ({
  '--fm-grid-dialog-form-columns': props.formColumns,
  '--fm-grid-dialog-form-gap': props.formGap
}))

const toggleMaximized = () => {
  maximized.value = !maximized.value
  emit('maximize-change', maximized.value)
}

const close = () => {
  visibleModel.value = false
  emit('close')
}

const onHide = () => {
  if (maximized.value) emit('maximize-change', false)
  maximized.value = false
}
</script>

<style>
.fm-grid-dialog.p-dialog {
  width: min(var(--fm-grid-dialog-width), var(--fm-grid-dialog-max-width)) !important;
  max-width: var(--fm-grid-dialog-max-width) !important;
  max-height: calc(100vh - 28px) !important;
  display: flex !important;
  flex-direction: column !important;
  border: 1px solid #d6e1e8 !important;
  border-radius: 4px !important;
  background: #fff !important;
  box-shadow: 0 12px 28px rgba(21, 37, 50, .18) !important;
  overflow: hidden !important;
}

.fm-grid-dialog--maximized.p-dialog {
  position: fixed !important;
  inset: 10px !important;
  width: auto !important;
  max-width: none !important;
  height: auto !important;
  max-height: none !important;
  margin: 0 !important;
  transform: none !important;
}

.fm-grid-dialog .p-dialog-header {
  flex: 0 0 40px !important;
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 14px !important;
  border-bottom: 1px solid #e2e9ee !important;
  background: #fff !important;
}

.fm-grid-dialog__header {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.fm-grid-dialog__title {
  min-width: 0;
  overflow: hidden;
  color: #456273;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-grid-dialog__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.fm-grid-dialog__header-button {
  width: 22px;
  min-width: 22px;
  height: 22px;
  min-height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #456273;
  box-shadow: none;
  cursor: pointer;
}

.fm-grid-dialog__header-button:hover,
.fm-grid-dialog__header-button:focus-visible {
  color: #008fa1;
  outline: none;
}

.fm-grid-dialog__header-button .pi {
  font-size: 16px;
  line-height: 16px;
}

.fm-grid-dialog .p-dialog-content {
  flex: 0 1 auto !important;
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff !important;
}

.fm-grid-dialog--maximized .p-dialog-content {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
}

.fm-grid-dialog__body {
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px 10px;
  overflow: auto;
  box-sizing: border-box;
  container: fm-grid-dialog / inline-size;
}

.fm-grid-dialog--maximized .fm-grid-dialog__body {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.fm-grid-dialog__form {
  width: 100%;
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: var(--fm-grid-dialog-form-columns);
  gap: var(--fm-grid-dialog-form-gap);
  align-items: end;
  box-sizing: border-box;
}

.fm-grid-dialog__field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fm-grid-dialog__field label {
  display: block;
  margin: 0;
  color: #111;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
}

.fm-grid-dialog__control,
.fm-grid-dialog__control.p-inputtext,
.fm-grid-dialog__control.p-select {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 31px !important;
  min-height: 31px !important;
  max-height: 31px !important;
  border-color: #b9cbd6 !important;
  border-radius: 3px !important;
  background: #fff !important;
  font-size: 13px !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__control.p-select .p-select-label {
  padding: 5px 28px 5px 9px !important;
  line-height: 19px !important;
  font-size: 13px !important;
}

.fm-grid-dialog__control.p-select .p-select-dropdown {
  width: 26px !important;
}

.fm-grid-dialog__form-action,
.fm-grid-dialog__form-action.p-button,
.fm-grid-dialog__form-action.p-button:enabled:hover,
.fm-grid-dialog__form-action.p-button:enabled:focus {
  width: 112px !important;
  min-width: 112px !important;
  max-width: 112px !important;
  height: 31px !important;
  min-height: 31px !important;
  justify-self: stretch;
  padding: 0 16px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 18px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: 0 3px 7px rgba(0, 169, 189, .18) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__form-action.p-button:disabled,
.fm-grid-dialog__form-action.p-button.p-disabled {
  background: #b8c6ce !important;
  border-color: #b8c6ce !important;
  color: #fff !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

.fm-grid-dialog__grid-area {
  width: 100%;
  min-width: 0;
  min-height: 0;
}

/*
 * En pantalla completa la grilla es el contenido flexible central del popup.
 * Esto evita el bloque blanco enorme que aparecía al mantenerla fija en 210px.
 */
.fm-grid-dialog--maximized .fm-grid-dialog__grid-area {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.fm-grid-dialog--maximized .fm-grid-dialog__grid-area > * {
  flex: 1 1 auto;
  min-height: 0;
}

.fm-grid-dialog--maximized .fm-popup-grid {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.fm-grid-dialog--maximized .fm-popup-grid .fm-popup-grid__table,
.fm-grid-dialog--maximized .fm-popup-grid .p-datatable {
  flex: 1 1 auto;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-table-container,
.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-wrapper {
  flex: 1 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
}

.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-table {
  height: 100% !important;
}

.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-tbody,
.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-empty-message,
.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-empty-message > td {
  height: 100% !important;
}

.fm-grid-dialog--maximized .fm-popup-grid__empty {
  height: 100% !important;
  min-height: 100% !important;
}

.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-paginator-bottom {
  flex: 0 0 34px !important;
}

.fm-grid-dialog .p-dialog-footer {
  flex: 0 0 50px !important;
  min-height: 50px !important;
  padding: 9px 14px 10px !important;
  border-top: 1px solid #edf2f5 !important;
  background: #fff !important;
}

.fm-grid-dialog__footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.fm-grid-dialog__footer .p-button,
.fm-grid-dialog__footer .p-button:enabled:hover,
.fm-grid-dialog__footer .p-button:enabled:focus {
  min-width: 112px !important;
  height: 31px !important;
  padding: 0 16px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 18px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: 0 3px 7px rgba(0, 169, 189, .18) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__footer .p-button:disabled,
.fm-grid-dialog__footer .p-button.p-disabled {
  background: #b8c6ce !important;
  border-color: #b8c6ce !important;
  color: #fff !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

@container fm-grid-dialog (max-width: 790px) {
  .fm-grid-dialog__form {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .fm-grid-dialog__form-action,
  .fm-grid-dialog__form-action.p-button {
    justify-self: start;
  }
}

@container fm-grid-dialog (max-width: 500px) {
  .fm-grid-dialog__form {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 600px) {
  .fm-grid-dialog.p-dialog {
    width: calc(100vw - 12px) !important;
    max-width: calc(100vw - 12px) !important;
    max-height: calc(100vh - 12px) !important;
  }

  .fm-grid-dialog--maximized.p-dialog {
    inset: 4px !important;
  }

  .fm-grid-dialog__body {
    padding: 10px;
  }
}
</style>
