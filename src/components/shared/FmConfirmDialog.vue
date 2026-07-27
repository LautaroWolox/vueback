<template>
  <FmDialog
    :visible="visible"
    :closable="false"
    :draggable="draggable"
    :resizable="false"
    :dialog-class="['fm-confirm-dialog', dialogClass]"
    :dialog-style="{ width }"
    @update:visible="updateVisible"
  >
    <template #header>
      <div class="fm-confirm-dialog__header">
        <span class="fm-confirm-dialog__title">{{ title }}</span>
        <button
          v-if="showClose"
          type="button"
          class="fm-confirm-dialog__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cancel"
        >×</button>
      </div>
    </template>

    <div class="fm-confirm-dialog__body">
      <slot>
        <span>{{ message }}</span>
      </slot>
    </div>

    <template #footer>
      <div class="fm-confirm-dialog__actions">
        <FmButton
          :label="cancelLabel"
          variant="outline"
          :disabled="loading"
          @click="cancel"
        />
        <FmButton
          :label="acceptLabel"
          :icon="acceptIcon"
          :loading="loading"
          :loading-label="loadingLabel"
          :disabled="acceptDisabled"
          @click="$emit('accept')"
        />
      </div>
    </template>
  </FmDialog>
</template>

<script setup>
import FmButton from './FmButton.vue'
import FmDialog from './FmDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '' },
  acceptLabel: { type: String, default: 'ACEPTAR' },
  cancelLabel: { type: String, default: 'CANCELAR' },
  acceptIcon: { type: String, default: '' },
  loadingLabel: { type: String, default: 'PROCESANDO...' },
  width: { type: String, default: 'min(540px, calc(100vw - 32px))' },
  dialogClass: { type: [String, Array, Object], default: '' },
  acceptDisabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  draggable: { type: Boolean, default: false },
  showClose: { type: Boolean, default: true }
})

const emit = defineEmits(['update:visible', 'accept', 'cancel'])

const updateVisible = (value) => {
  emit('update:visible', value)
}

const cancel = () => {
  if (props.loading) return
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.fm-confirm-dialog__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fm-confirm-dialog__title {
  color: #263746;
  font-size: 18px;
  font-weight: 600;
}

.fm-confirm-dialog__close {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8da0aa;
  font-size: 22px;
  cursor: pointer;
}

.fm-confirm-dialog__close:hover {
  color: #008fa1;
}

.fm-confirm-dialog__body {
  min-height: 88px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
  color: #263746;
  font-size: 14px;
  line-height: 1.45;
}

.fm-confirm-dialog__actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
