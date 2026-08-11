<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    header="Alerta"
    :draggable="false"
    :resizable="false"
    :base-z-index="4000"
    class="fm-alert-dialog fm-responsive-dialog"
    :style="{ '--fm-dialog-width': '34rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #closeicon>
      <span aria-hidden="true">×</span>
    </template>

    <div class="fm-alert-body">
      <div class="fm-alert-triangle" aria-hidden="true">
        <span>!</span>
      </div>
      <span>{{ message }}</span>
    </div>

    <template #footer>
      <FmButton
        label="CERRAR"
        variant="outline"
        @click="close"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import FmButton from '@/components/shared/FmButton.vue'

const props = defineProps<{
  visible: boolean
  message: string
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
}>()

const close = () => emit('update:visible', false)
</script>
