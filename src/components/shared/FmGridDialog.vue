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
      <div v-if="$slots.form" class="fm-grid-dialog__form">
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
  width: { type: String, default: '1360px' },
  maxWidth: { type: String, default: 'calc(100vw - 36px)' },
  height: { type: String, default: '850px' },
  modal: { type: Boolean, default: true },
  draggable: { type: Boolean, default: true },
  maximizable: { type: Boolean, default: true },
  formColumns: { type: String, default: '' },
  formGap: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'close', 'maximize-change'])
const maximized = ref(false)

provide('fmGridDialogMaximized', readonly(maximized))

const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

/*
 * El tamaño estándar de una ventana con grilla es 1360 x 850.
 * Los parámetros antiguos se conservan por compatibilidad, pero no pueden
 * achicar el popup por debajo de la proporción definida para el aplicativo.
 */
const dialogStyle = computed(() => ({
  '--fm-grid-dialog-max-width': props.maxWidth,
  '--fm-grid-dialog-requested-height': props.height
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
.fm-grid-dialog.p-dialog:not(.fm-grid-dialog--maximized) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  width: min(1360px, calc(100vw - 36px)) !important;
  min-width: 0 !important;
  max-width: calc(100vw - 36px) !important;
  height: min(850px, calc(100vh - 20px)) !important;
  min-height: min(650px, calc(100vh - 20px)) !important;
  max-height: calc(100vh - 20px) !important;
  display: grid !important;
  grid-template-rows: 70px minmax(0, 1fr) 90px !important;
  margin: 0 !important;
  border: 1px solid #c7d2d9 !important;
  border-radius: 3px !important;
  background: #fff !important;
  box-shadow: 0 10px 30px rgba(20, 35, 45, .28) !important;
  transform: translate(-50%, -50%) !important;
  overflow: hidden !important;
}

.fm-grid-dialog .p-dialog-header {
  width: 100% !important;
  height: 70px !important;
  min-height: 70px !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 22px !important;
  border-bottom: 1px solid #d8e0e5 !important;
  background: #fff !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__header {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.fm-grid-dialog__title {
  min-width: 0;
  overflow: hidden;
  color: #344f61;
  font-size: 27px;
  font-weight: 400;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-grid-dialog__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  flex: 0 0 auto;
}

.fm-grid-dialog__header-button,
.fm-grid-dialog__header-button:hover,
.fm-grid-dialog__header-button:focus,
.fm-grid-dialog__header-button:active {
  width: 30px;
  min-width: 30px;
  height: 30px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #38566a;
  box-shadow: none;
  outline: 0;
  cursor: pointer;
}

.fm-grid-dialog__header-button:hover,
.fm-grid-dialog__header-button:focus-visible {
  color: #00a9bd;
}

.fm-grid-dialog__header-button .pi {
  font-size: 23px;
  line-height: 23px;
}

.fm-grid-dialog .p-dialog-content {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  display: block !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__body {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 22px;
  padding: 24px 22px 22px;
  overflow: hidden;
  box-sizing: border-box;
}

.fm-grid-dialog__form {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: .9fr 1.45fr 1.45fr .9fr 136px;
  column-gap: 28px;
  row-gap: 14px;
  align-items: end;
  box-sizing: border-box;
}

.fm-grid-dialog__field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.fm-grid-dialog__field label {
  display: block;
  margin: 0;
  color: #151c21;
  font-size: 17px;
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
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  border: 1px solid #bfcbd2 !important;
  border-radius: 3px !important;
  background: #fff !important;
  color: #253846 !important;
  font-size: 16px !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__control:focus,
.fm-grid-dialog__control.p-select.p-focus {
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 1px rgba(0, 169, 189, .18) !important;
}

.fm-grid-dialog__control.p-select .p-select-label {
  padding: 11px 40px 11px 12px !important;
  line-height: 24px !important;
  font-size: 16px !important;
}

.fm-grid-dialog__control.p-select .p-select-dropdown {
  width: 38px !important;
}

.fm-grid-dialog__form-action,
.fm-grid-dialog__form-action.p-button,
.fm-grid-dialog__form-action.p-button:enabled:hover,
.fm-grid-dialog__form-action.p-button:enabled:focus {
  width: 136px !important;
  min-width: 136px !important;
  max-width: 136px !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  justify-self: stretch;
  padding: 0 18px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 24px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 15px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__form-action.p-button:disabled,
.fm-grid-dialog__form-action.p-button.p-disabled {
  background: #dbe2e6 !important;
  border-color: #cbd5da !important;
  color: #7f8f98 !important;
  opacity: 1 !important;
}

.fm-grid-dialog__grid-area {
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fm-grid-dialog__grid-area > * {
  flex: 1 1 auto;
  min-height: 0;
}

.fm-grid-dialog .p-dialog-footer {
  width: 100% !important;
  height: 90px !important;
  min-height: 90px !important;
  display: flex !important;
  align-items: center !important;
  padding: 14px 22px !important;
  border-top: 1px solid #d8e0e5 !important;
  background: #fff !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.fm-grid-dialog__footer .p-button,
.fm-grid-dialog__footer .p-button:enabled:hover,
.fm-grid-dialog__footer .p-button:enabled:focus {
  min-width: 166px !important;
  height: 48px !important;
  padding: 0 22px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 24px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 15px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__footer .p-button:disabled,
.fm-grid-dialog__footer .p-button.p-disabled {
  background: #e5eaed !important;
  border-color: #d5dde1 !important;
  color: #91a0a8 !important;
  opacity: 1 !important;
}

.fm-grid-dialog.fm-grid-dialog--maximized.p-dialog {
  position: fixed !important;
  inset: 0 !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  min-width: 0 !important;
  max-width: none !important;
  height: 100vh !important;
  min-height: 0 !important;
  max-height: none !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  transform: none !important;
}

@media (max-width: 900px) {
  .fm-grid-dialog.p-dialog:not(.fm-grid-dialog--maximized) {
    width: calc(100vw - 8px) !important;
    max-width: calc(100vw - 8px) !important;
    height: calc(100vh - 8px) !important;
    min-height: 0 !important;
    max-height: calc(100vh - 8px) !important;
  }

  .fm-grid-dialog__form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fm-grid-dialog__form-action,
  .fm-grid-dialog__form-action.p-button {
    justify-self: start;
  }
}

@media (max-width: 520px) {
  .fm-grid-dialog__form {
    grid-template-columns: 1fr;
  }
}
</style>
