<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    :base-z-index="4000"
    class="fm-alert-dialog fm-responsive-dialog"
    :style="{ '--fm-dialog-width': '34rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="jobtype-contrato-unsaved__header">
        <span class="p-dialog-title">Alerta</span>
        <button
          type="button"
          class="fm-icon-button"
          title="Cerrar"
          aria-label="Cerrar alerta"
          @click="close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M6 6L18 18" />
            <path d="M18 6L6 18" />
          </svg>
        </button>
      </div>
    </template>

    <div class="fm-alert-body">
      <div class="jobtype-contrato-unsaved__icon-circle" aria-hidden="true">
        <i class="pi pi-bell jobtype-contrato-unsaved__header-icon"></i>
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
