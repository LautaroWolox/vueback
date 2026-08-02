<template>
  <AltaDialogBackend
    :visible="visible"
    class="cmo-alta-dialog"
    :style="dialogStyle"
    @update:visible="emit('update:visible', $event)"
    @saved="emit('saved')"
  />
</template>

<script setup lang="ts">
import AltaDialogBackend from './AltaDialogBackend.vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

// Mismas dimensiones que el Alta Jobtype-Contrato.
const dialogStyle =
  'width:min(1440px, calc(100vw - 24px)) !important;' +
  'height:min(680px, 56vw, calc(100dvh - 24px)) !important;' +
  'max-width:calc(100vw - 24px) !important;' +
  'max-height:calc(100dvh - 24px) !important;' +
  'margin:0 !important;'
</script>

<style>
body .p-dialog.jobtype-alta-dialog.cmo-alta-dialog {
  width: min(1440px, calc(100vw - 24px)) !important;
  height: min(680px, 56vw, calc(100dvh - 24px)) !important;
  max-width: calc(100vw - 24px) !important;
  max-height: calc(100dvh - 24px) !important;
  margin: 0 !important;
}

body .p-dialog.cmo-alta-dialog .cmo-alta-form {
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr) 120px !important;
  width: min(860px, 100%) !important;
  max-width: 860px !important;
  align-items: end !important;
}

body .p-dialog.cmo-alta-dialog .jobtype-alta-grid-wrap {
  width: 100% !important;
  min-width: 0 !important;
}

body .p-dialog.cmo-alta-dialog input::placeholder {
  color: transparent !important;
  opacity: 0 !important;
}

@media (max-width: 768px) {
  body .p-dialog.cmo-alta-dialog .cmo-alta-form {
    grid-template-columns: 1fr !important;
    width: 100% !important;
    max-width: none !important;
  }
}
</style>
