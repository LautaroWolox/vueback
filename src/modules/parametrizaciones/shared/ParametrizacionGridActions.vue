<template>
  <FmGridActions
    :show-export="showExport"
    :show-delete="showDelete"
    :show-edit="showEdit"
    :show-refresh="showRefresh"
    :show-add="showAdd"
    :export-disabled="exportDisabled"
    :delete-disabled="deleteDisabled"
    :edit-disabled="editDisabled"
    :refresh-disabled="refreshDisabled"
    :add-disabled="addDisabled"
    :export-title="exportTitle"
    :delete-title="deleteTitle"
    :edit-title="editTitle"
    :refresh-title="refreshTitle"
    :add-title="addTitle"
    :export-disabled-title="exportDisabledTitle"
    :delete-disabled-title="deleteDisabledTitle"
    :edit-disabled-title="editDisabledTitle"
    :refresh-disabled-title="refreshDisabledTitle"
    :add-disabled-title="addDisabledTitle"
    :size="size"
    @export="emit('export')"
    @delete="emit('delete')"
    @edit="emit('edit')"
    @refresh="emit('refresh')"
    @add="emit('add')"
  />
</template>

<script setup>
import FmGridActions from '@/components/shared/FmGridActions.vue'

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
  refreshTitle: { type: String, default: 'Actualizar' },
  addTitle: { type: String, default: 'Agregar' },
  exportDisabledTitle: { type: String, default: 'Exportación no disponible' },
  deleteDisabledTitle: { type: String, default: 'Seleccione un registro' },
  editDisabledTitle: { type: String, default: 'Seleccione un registro' },
  refreshDisabledTitle: { type: String, default: 'Seleccione un registro' },
  addDisabledTitle: { type: String, default: 'Acción no disponible' },
  size: { type: String, default: 'compact' }
})

const emit = defineEmits(['export', 'delete', 'edit', 'refresh', 'add'])
</script>
