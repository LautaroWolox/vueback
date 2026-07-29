<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="true"
    :resizable="false"
    class="parametrizacion-confirm-dialog"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="parametrizacion-confirm__header">
        <div class="parametrizacion-confirm__header-main">
          <span class="parametrizacion-confirm__icon-circle">
            <i :class="['pi', icon, 'parametrizacion-confirm__icon']" aria-hidden="true" />
          </span>
          <span class="parametrizacion-confirm__title">{{ title }}</span>
        </div>

        <button
          type="button"
          class="parametrizacion-confirm__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cancel"
        >×</button>
      </div>
    </template>

    <div class="parametrizacion-confirm__content">
      <span class="parametrizacion-confirm__message">{{ message }}</span>
    </div>

    <template #footer>
      <div class="parametrizacion-confirm__actions">
        <FmButton
          :label="cancelLabel"
          variant="outlined"
          class="parametrizacion-confirm__button"
          @click="cancel"
        />
        <FmButton
          :label="acceptLabel"
          class="parametrizacion-confirm__button"
          @click="accept"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, required: true },
  icon: { type: String, default: 'pi-bell' },
  cancelLabel: { type: String, default: 'CANCELAR' },
  acceptLabel: { type: String, default: 'ACEPTAR' },
  width: { type: String, default: '540px' }
})

const emit = defineEmits(['update:visible', 'cancel', 'accept'])

const dialogStyle = `width: min(${props.width}, calc(100vw - 32px)); max-width: ${props.width};`

const cancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const accept = () => {
  emit('update:visible', false)
  emit('accept')
}

const onVisibleChange = (visible) => {
  if (!visible) cancel()
}
</script>

<style scoped>
.parametrizacion-confirm__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.parametrizacion-confirm__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.parametrizacion-confirm__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8fa;
}

.parametrizacion-confirm__icon {
  color: #11aabd;
  font-size: 23px;
}

.parametrizacion-confirm__title {
  color: #252b33;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.parametrizacion-confirm__close {
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

.parametrizacion-confirm__close:hover {
  color: #00a9bd;
}

.parametrizacion-confirm__content {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.parametrizacion-confirm__message {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.35;
}

.parametrizacion-confirm__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.parametrizacion-confirm__button {
  width: 110px !important;
  min-width: 110px !important;
  max-width: 110px !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  border-radius: 7px !important;
}

:global(.p-dialog.parametrizacion-confirm-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .24);
}

:global(.parametrizacion-confirm-dialog .p-dialog-header) {
  min-height: 68px;
  padding: 12px 18px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.parametrizacion-confirm-dialog .p-dialog-content) {
  padding: 0 18px;
  background: #fff;
}

:global(.parametrizacion-confirm-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid #dedede;
  background: #fff;
}

@media (max-width: 520px) {
  .parametrizacion-confirm__actions {
    flex-direction: column-reverse;
  }

  .parametrizacion-confirm__button {
    width: 100% !important;
    max-width: none !important;
  }
}
</style>
