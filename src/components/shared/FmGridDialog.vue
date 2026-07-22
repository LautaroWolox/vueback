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
    @hide="onHide"
  >
    <template #header>
      <div class="fm-grid-dialog__header">
        <span class="fm-grid-dialog__title">{{ title }}</span>

        <div class="fm-grid-dialog__header-actions">
          <button
            v-if="maximizable"
            type="button"
            class="fm-grid-dialog__header-button fm-grid-dialog__maximize"
            :class="{ 'fm-grid-dialog__maximize--restore': maximized }"
            :title="maximized ? 'Restaurar' : 'Maximizar'"
            :aria-label="maximized ? 'Restaurar' : 'Maximizar'"
            @click="toggleMaximized"
          >
            <span aria-hidden="true"></span>
          </button>

          <button
            type="button"
            class="fm-grid-dialog__header-button fm-grid-dialog__close"
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
  modal: { type: Boolean, default: true },
  draggable: { type: Boolean, default: true },
  maximizable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:visible', 'close', 'maximize-change'])
const maximized = ref(false)

provide('fmGridDialogMaximized', readonly(maximized))

const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

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
html body .fm-grid-dialog.p-dialog {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  width: min(1360px, calc(100vw - 36px)) !important;
  min-width: 0 !important;
  max-width: calc(100vw - 36px) !important;
  height: min(850px, calc(100vh - 20px)) !important;
  min-height: min(620px, calc(100vh - 20px)) !important;
  max-height: calc(100vh - 20px) !important;
  display: grid !important;
  grid-template-rows: 96px minmax(0, 1fr) 92px !important;
  margin: 0 !important;
  border: 1px solid #c8cfd4 !important;
  border-radius: 3px !important;
  background: #fff !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .28) !important;
  transform: translate(-50%, -50%) !important;
  overflow: hidden !important;
}

html body .fm-grid-dialog .p-dialog-header {
  width: 100% !important;
  height: 96px !important;
  min-height: 96px !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 22px !important;
  border-bottom: 1px solid #d9dfe3 !important;
  background: #fff !important;
  box-sizing: border-box !important;
}

html body .fm-grid-dialog__header {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 20px !important;
}

html body .fm-grid-dialog__title {
  min-width: 0 !important;
  overflow: hidden !important;
  color: #344f61 !important;
  font-size: 28px !important;
  font-weight: 400 !important;
  line-height: 1.2 !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

html body .fm-grid-dialog__header-actions {
  display: inline-flex !important;
  align-items: center !important;
  gap: 18px !important;
  flex: 0 0 auto !important;
}

html body .fm-grid-dialog__header-button,
html body .fm-grid-dialog__header-button:hover,
html body .fm-grid-dialog__header-button:focus,
html body .fm-grid-dialog__header-button:active {
  position: relative !important;
  width: 32px !important;
  min-width: 32px !important;
  height: 32px !important;
  min-height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #38566a !important;
  box-shadow: none !important;
  outline: 0 !important;
  cursor: pointer !important;
}

html body .fm-grid-dialog__header-button:hover,
html body .fm-grid-dialog__header-button:focus-visible {
  color: #00a9bd !important;
}

html body .fm-grid-dialog__close .pi {
  font-size: 25px !important;
  line-height: 25px !important;
}

html body .fm-grid-dialog__maximize > span,
html body .fm-grid-dialog__maximize > span::after {
  position: absolute !important;
  width: 16px !important;
  height: 16px !important;
  border: 2px solid currentColor !important;
  border-radius: 1px !important;
  box-sizing: border-box !important;
  content: '' !important;
}

html body .fm-grid-dialog__maximize > span::after {
  top: -6px !important;
  left: 5px !important;
  background: #fff !important;
}

html body .fm-grid-dialog__maximize--restore > span {
  transform: translate(-3px, 3px) !important;
}

html body .fm-grid-dialog .p-dialog-content {
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

html body .fm-grid-dialog__body {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  display: grid !important;
  grid-template-rows: 116px minmax(0, 1fr) !important;
  gap: 18px !important;
  padding: 18px 22px 22px !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

html body .fm-grid-dialog__form {
  width: 100% !important;
  min-width: 0 !important;
  height: 116px !important;
  display: grid !important;
  grid-template-columns: 192px minmax(190px, 1fr) minmax(190px, 1fr) 192px 136px !important;
  column-gap: 30px !important;
  row-gap: 12px !important;
  align-items: center !important;
  align-content: center !important;
  box-sizing: border-box !important;
}

html body .fm-grid-dialog__field {
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}

html body .fm-grid-dialog__field label {
  display: block !important;
  margin: 0 !important;
  color: #111 !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  line-height: 1.1 !important;
  white-space: nowrap !important;
}

html body .fm-grid-dialog__control,
html body .fm-grid-dialog__control.p-inputtext,
html body .fm-grid-dialog__control.p-select {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  border: 1px solid #bfc8ce !important;
  border-radius: 3px !important;
  background: #f4f4f4 !important;
  color: #263746 !important;
  font-size: 16px !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

html body .fm-grid-dialog__control.p-select .p-select-label {
  padding: 11px 40px 11px 12px !important;
  font-size: 16px !important;
  line-height: 24px !important;
}

html body .fm-grid-dialog__control.p-select .p-select-dropdown {
  width: 38px !important;
}

html body .fm-grid-dialog__form-action,
html body .fm-grid-dialog__form-action.p-button,
html body .fm-grid-dialog__form-action.p-button:enabled:hover,
html body .fm-grid-dialog__form-action.p-button:enabled:focus {
  width: 136px !important;
  min-width: 136px !important;
  max-width: 136px !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  align-self: end !important;
  justify-self: stretch !important;
  padding: 0 18px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 24px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 15px !important;
  font-weight: 700 !important;
}

html body .fm-grid-dialog__form-action.p-button:disabled,
html body .fm-grid-dialog__form-action.p-button.p-disabled {
  border-color: #cbd5da !important;
  background: #dbe2e6 !important;
  color: #7f8f98 !important;
  opacity: 1 !important;
}

html body .fm-grid-dialog__grid-area {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

html body .fm-grid-dialog__grid-area > * {
  flex: 1 1 auto !important;
  min-height: 0 !important;
}

html body .fm-grid-dialog .p-dialog-footer {
  width: 100% !important;
  height: 92px !important;
  min-height: 92px !important;
  display: flex !important;
  align-items: center !important;
  padding: 14px 22px !important;
  border-top: 1px solid #d9dfe3 !important;
  background: #fff !important;
  box-sizing: border-box !important;
}

html body .fm-grid-dialog__footer {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 12px !important;
}

html body .fm-grid-dialog__footer .p-button,
html body .fm-grid-dialog__footer .p-button:enabled:hover,
html body .fm-grid-dialog__footer .p-button:enabled:focus {
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

html body .fm-grid-dialog__footer .p-button:disabled,
html body .fm-grid-dialog__footer .p-button.p-disabled {
  background: #e5eaed !important;
  border-color: #d5dde1 !important;
  color: #91a0a8 !important;
  opacity: 1 !important;
}

html body .fm-grid-dialog.fm-grid-dialog--maximized.p-dialog {
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

@media (max-width: 1050px) {
  html body .fm-grid-dialog__form {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    height: auto !important;
  }

  html body .fm-grid-dialog__body {
    grid-template-rows: auto minmax(0, 1fr) !important;
  }

  html body .fm-grid-dialog__form-action,
  html body .fm-grid-dialog__form-action.p-button {
    justify-self: start !important;
  }
}

@media (max-width: 560px) {
  html body .fm-grid-dialog__form {
    grid-template-columns: 1fr !important;
  }
}
</style>
