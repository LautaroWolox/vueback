<template>
  <Dialog
    :visible="visible"
    modal
    header="Confirmar reproceso"
    class="fm-dialog otf-reprocess-dialog"
    :style="{ width: '38rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="fm-dialog-body otf-reprocess-body">
      <div class="otf-reprocess-icon">
        <i class="pi pi-refresh"></i>
      </div>
      <div>
        <h3>Reprocesar órdenes seleccionadas</h3>
        <p>Se enviarán {{ count }} OT{{ count === 1 ? '' : 's' }} al proceso de reproceso.</p>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="CANCELAR"
        variant="outline"
        @click="$emit('update:visible', false)"
      />
      <FmButton
        label="REPROCESAR"
        icon="pi-refresh"
        @click="$emit('confirm')"
      />
    </template>
  </Dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  count: { type: Number, default: 0 }
})

defineEmits(['update:visible', 'confirm'])
</script>

<style scoped>
.otf-reprocess-body {
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.otf-reprocess-icon {
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #008fa1;
}

.otf-reprocess-icon i {
  font-size: 23px;
}

.otf-reprocess-body h3 {
  margin: 0 0 6px;
  color: #203947;
  font-size: 16px;
}

.otf-reprocess-body p {
  margin: 0;
  color: #607887;
  line-height: 1.45;
}
</style>
