<template>
  <div
    class="fm-grid-actions-final fm-responsive-grid-actions"
    :class="{ 'fm-grid-actions-final--large': size === 'large' }"
  >
    <Button
      v-if="showExport"
      icon="pi pi-download"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="exportDisabled"
      :title="exportDisabled ? 'Exportación no disponible' : 'Exportar'"
      :aria-label="exportDisabled ? 'Exportación no disponible' : 'Exportar'"
      @click="$emit('export')"
    />
    <Button
      v-if="showDelete"
      icon="pi pi-trash"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="deleteDisabled"
      :title="deleteDisabled ? 'Seleccione al menos una OT' : 'Excluir seleccionados'"
      :aria-label="deleteDisabled ? 'Seleccione al menos una OT' : 'Excluir seleccionados'"
      @click="$emit('delete')"
    />
    <Button
      v-if="showRefresh"
      icon="pi pi-refresh"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="refreshDisabled"
      :title="refreshDisabled ? 'Seleccione al menos una OT' : 'Reprocesar'"
      :aria-label="refreshDisabled ? 'Seleccione al menos una OT' : 'Reprocesar'"
      @click="$emit('refresh')"
    />
  </div>
</template>

<script setup>
import Button from 'primevue/button'

defineProps({
  showExport: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: true },
  exportDisabled: { type: Boolean, default: false },
  deleteDisabled: { type: Boolean, default: false },
  refreshDisabled: { type: Boolean, default: false },
  size: { type: String, default: 'compact' }
})

defineEmits(['export', 'delete', 'refresh'])
</script>
