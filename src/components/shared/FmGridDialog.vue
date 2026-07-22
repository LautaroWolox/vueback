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
        <slot :maximized="maximized" />
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
import { computed, provide, readonly, ref } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '1180px' },
  maxWidth: { type: String, default: 'calc(100vw - 40px)' },
  modal: { type: Boolean, default: true },
  draggable: { type: Boolean, default: true },
  maximizable: { type: Boolean, default: true },
  formColumns: {
    type: String,
    default: 'repeat(auto-fit, minmax(150px, 1fr))'
  },
  formGap: { type: String, default: '14px' }
})

const emit = defineEmits(['update:visible', 'close', 'maximize-change'])
const maximized = ref(false)

provide('fmGridDialogMaximized', readonly(maximized))

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
  height: auto !important;
  min-height: 0 !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
  border: 1px solid #d6e1e8 !important;
  border-radius: 4px !important;
  background: #fff !important;
  box-shadow: 0 16px 38px rgba(21, 37, 50, .22) !important;
  overflow: hidden !important;
}

.fm-grid-dialog .p-dialog-header {
  flex: 0 0 56px !important;
  height: 56px !important;
  min-height: 56px !important;
  padding: 0 22px !important;
  border-bottom: 1px solid #dce6ec !important;
  background: #fff !important;
}

.fm-grid-dialog__header {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fm-grid-dialog__title {
  min-width: 0;
  overflow: hidden;
  color: #456273;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-grid-dialog__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.fm-grid-dialog__header-button {
  width: 28px;
  min-width: 28px;
  height: 28px;
  min-height: 28px;
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
  font-size: 19px;
  line-height: 19px;
}

.fm-grid-dialog .p-dialog-content {
  flex: 0 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: calc(100vh - 150px) !important;
  padding: 0 !important;
  overflow: auto !important;
  background: #fff !important;
}

.fm-grid-dialog__body {
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 24px 18px;
  box-sizing: border-box;
  container-type: inline-size;
}

.fm-grid-dialog__form {
  width: 100%;
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
  gap: 6px;
}

.fm-grid-dialog__field label {
  display: block;
  margin: 0;
  color: #111;
  font-size: 13px;
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
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  border-color: #b9cbd6 !important;
  border-radius: 3px !important;
  background: #fff !important;
  font-size: 13px !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__control.p-select .p-select-label {
  padding: 6px 30px 6px 10px !important;
  line-height: 20px !important;
  font-size: 13px !important;
}

.fm-grid-dialog__control.p-select .p-select-dropdown {
  width: 28px !important;
}

.fm-grid-dialog__form-action,
.fm-grid-dialog__form-action.p-button,
.fm-grid-dialog__form-action.p-button:enabled:hover,
.fm-grid-dialog__form-action.p-button:enabled:focus {
  width: 124px !important;
  min-width: 124px !important;
  max-width: 124px !important;
  height: 34px !important;
  min-height: 34px !important;
  justify-self: stretch;
  padding: 0 16px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 17px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: 0 3px 7px rgba(0, 169, 189, .18) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__form-action.p-button:disabled,
.fm-grid-dialog__form-action.p-button.p-disabled {
  background: #dbe2e6 !important;
  border-color: #cbd5da !important;
  color: #7f8f98 !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

.fm-grid-dialog__grid-area {
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.fm-grid-dialog .p-dialog-footer {
  flex: 0 0 62px !important;
  height: 62px !important;
  min-height: 62px !important;
  padding: 12px 24px !important;
  border-top: 1px solid #dce6ec !important;
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
  min-width: 150px !important;
  height: 38px !important;
  padding: 0 18px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 8px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 14px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__footer .p-button:disabled,
.fm-grid-dialog__footer .p-button.p-disabled {
  background: #e5eaed !important;
  border-color: #d5dde1 !important;
  color: #91a0a8 !important;
  opacity: 1 !important;
}

.fm-grid-dialog--maximized.p-dialog {
  position: fixed !important;
  inset: 8px !important;
  width: auto !important;
  max-width: none !important;
  height: auto !important;
  max-height: none !important;
  display: grid !important;
  grid-template-rows: 56px minmax(0, 1fr) 62px;
  transform: none !important;
}

.fm-grid-dialog--maximized .p-dialog-content {
  min-height: 0 !important;
  max-height: none !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.fm-grid-dialog--maximized .fm-grid-dialog__body {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.fm-grid-dialog--maximized .fm-grid-dialog__form {
  flex: 0 0 auto;
}

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

.fm-grid-dialog--maximized .fm-popup-grid,
.fm-grid-dialog--maximized .fm-popup-grid .fm-popup-grid__table,
.fm-grid-dialog--maximized .fm-popup-grid .p-datatable {
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  display: flex !important;
  flex-direction: column !important;
}

.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-table-container,
.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-wrapper,
.fm-grid-dialog--maximized .fm-popup-grid [data-pc-section="tablecontainer"] {
  flex: 1 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
}

.fm-grid-dialog--maximized .fm-popup-grid__empty {
  height: 100% !important;
  min-height: 100% !important;
  max-height: none !important;
}

.fm-grid-dialog--maximized .fm-popup-grid .p-datatable-paginator-bottom,
.fm-grid-dialog--maximized .fm-popup-grid .p-paginator {
  flex: 0 0 34px !important;
}

@container (max-width: 720px) {
  .fm-grid-dialog__form {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .fm-grid-dialog__form-action,
  .fm-grid-dialog__form-action.p-button {
    justify-self: start;
  }
}

@container (max-width: 470px) {
  .fm-grid-dialog__form {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 600px) {
  .fm-grid-dialog.p-dialog {
    width: calc(100vw - 8px) !important;
    max-width: calc(100vw - 8px) !important;
    max-height: calc(100vh - 8px) !important;
  }

  .fm-grid-dialog--maximized.p-dialog {
    inset: 4px !important;
  }

  .fm-grid-dialog__body {
    padding: 16px;
  }
}
</style>
