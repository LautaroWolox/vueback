<template>
  <Dialog
    :visible="visible"
    modal
    header="Detalle de Nota"
    class="fm-dialog otf-note-dialog"
    :style="{ width: '38rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="fm-dialog-body otf-note-body">
      <i class="pi pi-file-edit" aria-hidden="true"></i>
      <p>{{ note || 'La orden no posee una nota cargada.' }}</p>
    </div>

    <template #footer>
      <FmDialogActions
        secondary-label="CERRAR"
        @secondary="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<script setup>
import FmDialogActions from '@/components/shared/FmDialogActions.vue'

defineProps({
  visible: { type: Boolean, default: false },
  note: { type: String, default: '' }
})

defineEmits(['update:visible'])
</script>

<style scoped>
.otf-note-body {
  min-height: 90px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.otf-note-body i {
  color: #00a9bd;
  font-size: 25px;
}

.otf-note-body p {
  margin: 1px 0 0;
  color: #314957;
  line-height: 1.55;
  white-space: pre-wrap;
}
</style>
