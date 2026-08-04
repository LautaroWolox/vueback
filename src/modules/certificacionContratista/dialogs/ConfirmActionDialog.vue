<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="!loading"
    :closeOnEscape="!loading"
    :dismissableMask="false"
    :header="title"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-confirm-dialog"
    :style="{ width: 'min(520px, calc(100vw - 28px))' }"
  >
    <div class="certificacion-contratista-confirm-dialog__body">
      <i :class="iconClass" aria-hidden="true" />
      <div>
        <strong>{{ message }}</strong>
        <p v-if="detail">{{ detail }}</p>
      </div>
    </div>
    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CANCELAR" variant="outline" :disabled="loading" @click="visible = false" />
        <FmButton :label="confirmLabel" :loading="loading" @click="$emit('confirm')" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'

const visible = defineModel('visible', { type: Boolean, default: false })
const props = defineProps({
  title: { type: String, default: 'Confirmar operación' },
  message: { type: String, required: true },
  detail: { type: String, default: '' },
  confirmLabel: { type: String, default: 'CONFIRMAR' },
  loading: { type: Boolean, default: false },
  severity: { type: String, default: 'warning' }
})

defineEmits(['confirm'])
const iconClass = computed(() => [
  'pi',
  props.severity === 'danger' ? 'pi-exclamation-triangle' : 'pi-question-circle',
  `certificacion-contratista-confirm-dialog__icon--${props.severity}`
])
</script>
