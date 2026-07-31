<template>
  <FmConfirmDialog
    :visible="visible"
    title="Confirmar acción"
    message="¿Confirma que desea desactivar la relación seleccionada?"
    accept-label="ACEPTAR"
    cancel-label="CANCELAR"
    @update:visible="$emit('update:visible', $event)"
    @accept="$emit('confirmar')"
  />
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false }
})

defineEmits(['update:visible', 'confirmar'])
</script>
