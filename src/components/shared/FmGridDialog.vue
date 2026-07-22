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
            @click="maximized = !maximized"
          >
            <i :class="maximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize'" aria-hidden="true"></i>
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
    default: 'repeat(auto-fit, minmax(170px, 1fr))'
  },
  formGap: { type: String, default: '16px' }
})

const emit = defineEmits(['update:visible', 'close'])
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

const close = () => {
  visibleModel.value = false
  emit('close')
}

const onHide = () => {
  maximized.value = false
}
</script>

<style>
.fm-grid-dialog.p-dialog {
  width: min(var(--fm-grid-dialog-width), var(--fm-grid-dialog-max-width)) !important;
  max-width: var(--fm-grid-dialog-max-width) !important;
  max-height: calc(100vh - 32px) !important;
  display: flex !important;
  flex-direction: column !important;
  border: 1px solid #d6e1e8 !important;
  border-radius: 8px !important;
  background: #fff !important;
  box-shadow: 0 18px 38px rgba(21, 37, 50, .22) !important;
  overflow: hidden !important;
}

.fm-grid-dialog--maximized.p-dialog {
  position: fixed !important;
  inset: 12px !important;
  width: auto !important;
  max-width: none !important;
  height: auto !important;
  max-height: none !important;
  margin: 0 !important;
  transform: none !important;
}

.fm-grid-dialog .p-dialog-header {
  flex: 0 0 46px !important;
  height: 46px !important;
  min-height: 46px !important;
  padding: 0 18px !important;
  border-bottom: 1px solid #d7e0e6 !important;
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
  color: #304b5d;
  font-size: 18px;
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
  width: 24px;
  min-width: 24px;
  height: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #304b5d;
  box-shadow: none;
  cursor: pointer;
}

.fm-grid-dialog__header-button:hover,
.fm-grid-dialog__header-button:focus-visible {
  color: #008fa1;
  outline: none;
}

.fm-grid-dialog__header-button .pi {
  font-size: 18px;
  line-height: 18px;
}

.fm-grid-dialog .p-dialog-content {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff !important;
}

.fm-grid-dialog__body {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  overflow: auto;
  box-sizing: border-box;
  container: fm-grid-dialog / inline-size;
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
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
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
  border-color: #b9cbd6 !important;
  border-radius: 3px !important;
  background: #fff !important;
  font-size: 12px !important;
  box-sizing: border-box !important;
}

.fm-grid-dialog__control.p-select .p-select-label {
  padding: 5px 28px 5px 9px !important;
  line-height: 22px !important;
}

.fm-grid-dialog__form-action,
.fm-grid-dialog__form-action.p-button {
  width: 112px !important;
  min-width: 112px !important;
  max-width: 112px !important;
  height: 34px !important;
  min-height: 34px !important;
  justify-self: end;
  border: 0 !important;
  border-radius: 17px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__form-action.p-button:disabled,
.fm-grid-dialog__form-action.p-button.p-disabled {
  background: #d8e0e5 !important;
  color: #7d8d96 !important;
  opacity: 1 !important;
}

.fm-grid-dialog__grid-area {
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.fm-grid-dialog .p-dialog-footer {
  flex: 0 0 58px !important;
  min-height: 58px !important;
  padding: 10px 18px !important;
  border-top: 1px solid #d7e0e6 !important;
  background: #fff !important;
}

.fm-grid-dialog__footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.fm-grid-dialog__footer .p-button {
  min-width: 126px !important;
  height: 34px !important;
  border: 0 !important;
  border-radius: 17px !important;
  background: #00a9bd !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.fm-grid-dialog__footer .p-button:disabled,
.fm-grid-dialog__footer .p-button.p-disabled {
  background: #d8e0e5 !important;
  color: #7d8d96 !important;
  opacity: 1 !important;
}

@container fm-grid-dialog (max-width: 860px) {
  .fm-grid-dialog__form {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .fm-grid-dialog__form-action,
  .fm-grid-dialog__form-action.p-button {
    justify-self: stretch;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}

@container fm-grid-dialog (max-width: 520px) {
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

  .fm-grid-dialog__body {
    padding: 12px 10px;
  }
}
</style>
