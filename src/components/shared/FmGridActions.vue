<template>
  <div class="fm-grid-actions-final" :class="{ 'fm-grid-actions-final--large': size === 'large' }">
    <Button
      v-if="showExport"
      icon="pi pi-download"
      text
      rounded
      class="fm-grid-action-final"
      title="Exportar"
      aria-label="Exportar"
      @click="$emit('export')"
    />
    <Button
      v-if="showDelete"
      icon="pi pi-trash"
      text
      rounded
      class="fm-grid-action-final"
      title="Excluir seleccionados"
      aria-label="Excluir seleccionados"
      @click="$emit('delete')"
    />
    <Button
      v-if="showRefresh"
      icon="pi pi-refresh"
      text
      rounded
      class="fm-grid-action-final"
      title="Reprocesar"
      aria-label="Reprocesar"
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
  size: { type: String, default: 'compact' }
})

defineEmits(['export', 'delete', 'refresh'])
</script>
