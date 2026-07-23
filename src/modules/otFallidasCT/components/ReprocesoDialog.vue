<template>
  <Dialog
    :visible="visible"
    modal
    :header="dialogTitle"
    :closable="false"
    :closeOnEscape="false"
    :dismissableMask="false"
    class="fm-dialog otf-reprocess-dialog"
    :style="{ width: '38rem' }"
  >
    <div class="fm-dialog-body otf-reprocess-body">
      <div
        class="otf-reprocess-icon"
        :class="{
          'otf-reprocess-icon--processing': processing,
          'otf-reprocess-icon--error': Boolean(errorMessage)
        }"
      >
        <i :class="errorMessage ? 'pi pi-exclamation-triangle' : 'pi pi-refresh'"></i>
      </div>

      <div class="otf-reprocess-message">
        <template v-if="processing">
          <h3>Reprocesando...</h3>
          <p>
            Se están reprocesando {{ count }}
            OT{{ count === 1 ? '' : 's' }}. Aguarde un momento.
          </p>
        </template>

        <template v-else-if="errorMessage">
          <h3>No se pudo completar el reproceso</h3>
          <p>{{ errorMessage }}</p>
        </template>

        <p v-else class="otf-reprocess-result">
          Se enviaron a reprocesar ({{ count }}) OT{{ count === 1 ? '' : 's' }}.
        </p>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="CERRAR"
        variant="outline"
        :disabled="processing"
        @click="cerrar"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
  processing: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const dialogTitle = computed(() => {
  if (props.processing) return 'Reprocesando'
  if (props.errorMessage) return 'Error de reproceso'
  return 'Reproceso'
})

const cerrar = () => {
  if (props.processing) return
  emit('close')
}
</script>

<style scoped>
.otf-reprocess-body {
  min-height: 110px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.otf-reprocess-icon {
  width: 54px;
  min-width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #008fa1;
}

.otf-reprocess-icon i {
  font-size: 24px;
}

.otf-reprocess-icon--processing i {
  animation: otf-reprocess-spin .9s linear infinite;
}

.otf-reprocess-icon--error {
  background: #fff0f1;
  color: #d9363e;
}

.otf-reprocess-message {
  min-width: 0;
}

.otf-reprocess-message h3 {
  margin: 0 0 7px;
  color: #203947;
  font-size: 17px;
  font-weight: 500;
}

.otf-reprocess-message p {
  margin: 0;
  color: #607887;
  font-size: 13px;
  line-height: 1.5;
}

.otf-reprocess-result {
  color: #203947 !important;
  font-size: 16px !important;
  font-weight: 500;
}

@keyframes otf-reprocess-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:global(.otf-reprocess-dialog .p-dialog-footer) {
  display: flex !important;
  justify-content: flex-end !important;
  padding: 12px 18px !important;
}
</style>
