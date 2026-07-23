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
      :title="exportDisabled ? exportDisabledTitle : exportTitle"
      :aria-label="exportDisabled ? exportDisabledTitle : exportTitle"
      @click="$emit('export')"
    />
    <Button
      v-if="showDelete"
      icon="pi pi-trash"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="deleteDisabled"
      :title="deleteDisabled ? deleteDisabledTitle : deleteTitle"
      :aria-label="deleteDisabled ? deleteDisabledTitle : deleteTitle"
      @click="$emit('delete')"
    />
    <Button
      v-if="showEdit"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="editDisabled"
      :title="editDisabled ? editDisabledTitle : editTitle"
      :aria-label="editDisabled ? editDisabledTitle : editTitle"
      @click="$emit('edit')"
    >
      <template #icon>
        <PenToSquare class="fm-grid-action-svg" aria-hidden="true" />
      </template>
    </Button>
    <Button
      v-if="showRefresh"
      icon="pi pi-refresh"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="refreshDisabled"
      :title="refreshDisabled ? refreshDisabledTitle : refreshTitle"
      :aria-label="refreshDisabled ? refreshDisabledTitle : refreshTitle"
      @click="$emit('refresh')"
    />
    <Button
      v-if="showAdd"
      icon="pi pi-plus"
      text
      rounded
      class="fm-grid-action-final"
      :disabled="addDisabled"
      :title="addDisabled ? addDisabledTitle : addTitle"
      :aria-label="addDisabled ? addDisabledTitle : addTitle"
      @click="$emit('add')"
    />
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import PenToSquare from '@primeicons/vue/pen-to-square';

defineProps({
  showExport: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showEdit: { type: Boolean, default: false },
  showRefresh: { type: Boolean, default: true },
  showAdd: { type: Boolean, default: false },
  exportDisabled: { type: Boolean, default: false },
  deleteDisabled: { type: Boolean, default: false },
  editDisabled: { type: Boolean, default: false },
  refreshDisabled: { type: Boolean, default: false },
  addDisabled: { type: Boolean, default: false },
  exportTitle: { type: String, default: 'Exportar' },
  deleteTitle: { type: String, default: 'Eliminar' },
  editTitle: { type: String, default: 'Editar' },
  refreshTitle: { type: String, default: 'Reprocesar' },
  addTitle: { type: String, default: 'Agregar' },
  exportDisabledTitle: { type: String, default: 'Exportación no disponible' },
  deleteDisabledTitle: { type: String, default: 'Seleccione un registro' },
  editDisabledTitle: { type: String, default: 'Seleccione un registro' },
  refreshDisabledTitle: { type: String, default: 'Seleccione un registro' },
  addDisabledTitle: { type: String, default: 'Acción no disponible' },
  size: { type: String, default: 'compact' }
})

defineEmits(['export', 'delete', 'edit', 'refresh', 'add'])
</script>

<style scoped>
.fm-grid-actions-final {
  min-height: 22px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.fm-grid-actions-final :deep(.fm-grid-action-final),
.fm-grid-actions-final :deep(.p-button) {
  width: 20px !important;
  min-width: 20px !important;
  max-width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
  max-height: 20px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #111 !important;
  box-shadow: none !important;
}

.fm-grid-actions-final :deep(.p-button-label) {
  display: none !important;
}

.fm-grid-actions-final :deep(.p-button-icon),
.fm-grid-actions-final :deep(.pi),
.fm-grid-actions-final :deep(.fm-grid-action-svg) {
  width: 14px !important;
  min-width: 14px !important;
  height: 14px !important;
  min-height: 14px !important;
  font-size: 14px !important;
  line-height: 14px !important;
  color: currentColor !important;
}

.fm-grid-actions-final :deep(.fm-grid-action-svg) {
  display: block !important;
  flex: 0 0 14px !important;
}

.fm-grid-actions-final--large :deep(.fm-grid-action-final),
.fm-grid-actions-final--large :deep(.p-button) {
  width: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
}

.fm-grid-actions-final--large :deep(.p-button-icon),
.fm-grid-actions-final--large :deep(.pi),
.fm-grid-actions-final--large :deep(.fm-grid-action-svg) {
  width: 17px !important;
  min-width: 17px !important;
  height: 17px !important;
  min-height: 17px !important;
  font-size: 17px !important;
  line-height: 17px !important;
}

.fm-grid-actions-final--large :deep(.fm-grid-action-svg) {
  flex-basis: 17px !important;
}

.fm-grid-actions-final :deep(.p-button:enabled:hover),
.fm-grid-actions-final :deep(.p-button:enabled:focus) {
  background: transparent !important;
  color: #00a9bd !important;
  box-shadow: none !important;
}

.fm-grid-actions-final :deep(.p-button:disabled),
.fm-grid-actions-final :deep(.p-button.p-disabled) {
  background: transparent !important;
  color: #b4b4b4 !important;
  opacity: 1 !important;
}
</style>
