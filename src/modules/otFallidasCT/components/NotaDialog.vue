<template>
  <FmDialog
    :visible="visible"
    modal
    header="Detalle de Nota"
    base-class="fm-dialog"
    dialog-class="otf-note-dialog"
    :dialog-style="{ width: '38rem' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="fm-dialog-body otf-note-body">
      <i class="pi pi-file-edit" aria-hidden="true"></i>
      <p>{{ note || 'La orden no posee una nota cargada.' }}</p>
    </div>

    <template #footer>
      <FmButton
        label="CERRAR"
        variant="outline"
        @click="$emit('update:visible', false)"
      />
    </template>
  </FmDialog>
</template>

<script setup>
import FmDialog from '@/components/shared/FmDialog.vue'

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

:global(.otf-exclude-confirmation),
:global(.otf-include-confirmation) {
  display: none !important;
}
</style>
