<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    class="fm-dialog certificacion-contratista-dialog certificacion-contratista-note-dialog"
    :style="{ width: 'min(600px, calc(100vw - 28px))' }"
  >
    <div class="certificacion-contratista-note-dialog__content">
      <p>{{ note || 'La OT no posee una nota registrada.' }}</p>
    </div>

    <template #footer>
      <div class="certificacion-contratista-dialog__footer">
        <FmButton label="CERRAR" variant="outline" @click="visible = false" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
const visible = defineModel('visible', { type: Boolean, default: false })
defineProps({
  title: { type: String, default: 'Detalle de nota' },
  note: { type: String, default: '' }
})
</script>
