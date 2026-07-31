<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="draggable"
    :resizable="false"
    class="fm-confirm-dialog"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="fm-confirm-dialog__header">
        <div class="fm-confirm-dialog__header-main">
          <span class="fm-confirm-dialog__icon-circle" aria-hidden="true">
            <i :class="`pi pi-${iconName}`" class="fm-confirm-dialog__header-icon" />
          </span>
          <span class="fm-confirm-dialog__title">{{ title }}</span>
        </div>
        <button
          type="button"
          class="fm-confirm-dialog__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="onCancel"
        >×</button>
      </div>
    </template>

    <div class="fm-confirm-dialog__body">
      <slot>
        <p class="fm-confirm-dialog__message">{{ message }}</p>
      </slot>
    </div>

    <template #footer>
      <div class="fm-confirm-dialog__actions">
        <FmButton
          :label="cancelLabel"
          variant="outline"
          class="fm-confirm-dialog__btn"
          @click="onCancel"
        />
        <FmButton
          :label="acceptLabel"
          class="fm-confirm-dialog__btn"
          @click="onAccept"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible:     { type: Boolean, default: false },
  title:       { type: String,  default: 'Confirmar acción' },
  message:     { type: String,  default: '' },
  acceptLabel: { type: String,  default: 'ACEPTAR' },
  cancelLabel: { type: String,  default: 'CANCELAR' },
  /** 'bell' | 'exclamation-triangle' | 'info-circle' | 'check-circle' */
  icon:        { type: String,  default: 'bell' },
  width:       { type: String,  default: 'min(540px, calc(100vw - 32px))' },
  draggable:   { type: Boolean, default: true }
})

const emit = defineEmits(['update:visible', 'accept', 'cancel'])

const iconName = computed(() => props.icon)

const dialogStyle = computed(() => ({
  width:    props.width,
  maxWidth: '100dvw'
}))

const onVisibleChange = (val) => {
  if (!val) onCancel()
}

const onCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const onAccept = () => {
  emit('update:visible', false)
  emit('accept')
}
</script>

<style>
/* No-scoped: estiliza el Dialog de PrimeVue que se teletransporta a body */
.fm-confirm-dialog.p-dialog {
  overflow: hidden;
  border: 1px solid var(--fm-border-strong);
  border-radius: var(--fm-radius-md);
  box-shadow: var(--fm-shadow-dialog);
}

.fm-confirm-dialog .p-dialog-header {
  min-height: var(--fm-dialog-header-height);
  padding: 12px 18px;
  border-bottom: 1px solid var(--fm-border);
  background: var(--fm-white);
}

.fm-confirm-dialog .p-dialog-content {
  padding: 0 18px;
  background: var(--fm-white);
}

.fm-confirm-dialog .p-dialog-footer {
  min-height: var(--fm-dialog-footer-height);
  padding: 10px 18px;
  border-top: 1px solid var(--fm-border);
  background: var(--fm-white);
}
</style>

<style scoped>
.fm-confirm-dialog__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fm-confirm-dialog__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.fm-confirm-dialog__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--fm-cyan-soft);
}

.fm-confirm-dialog__header-icon {
  color: var(--fm-cyan);
  font-size: 22px;
}

.fm-confirm-dialog__title {
  color: #252b33;
  font-size: var(--fm-font-size-3xl);
  font-weight: 700;
  line-height: 1.2;
}

.fm-confirm-dialog__close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c7c7c7;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: color var(--fm-transition-fast);
}

.fm-confirm-dialog__close:hover {
  color: var(--fm-cyan);
}

.fm-confirm-dialog__body {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.fm-confirm-dialog__message {
  margin: 0;
  color: #4b5563;
  font-size: var(--fm-font-size-lg);
  line-height: 1.4;
}

.fm-confirm-dialog__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* Tamaño compacto para botones dentro del confirm */
.fm-confirm-dialog__actions :deep(.fm-confirm-dialog__btn),
.fm-confirm-dialog__actions :deep(.fm-confirm-dialog__btn.p-button) {
  width: 110px !important;
  min-width: 110px !important;
  height: 32px !important;
  min-height: 32px !important;
  padding: 0 12px !important;
  border-radius: var(--fm-radius-md) !important;
  font-size: var(--fm-font-size-md) !important;
}

@media (max-width: 430px) {
  .fm-confirm-dialog__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .fm-confirm-dialog__actions :deep(.fm-confirm-dialog__btn),
  .fm-confirm-dialog__actions :deep(.fm-confirm-dialog__btn.p-button) {
    width: 100% !important;
    min-width: 0 !important;
  }
}
</style>
