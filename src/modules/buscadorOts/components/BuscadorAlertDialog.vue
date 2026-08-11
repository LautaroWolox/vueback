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
    </template>

    <div class="fm-alert-body">
      <svg
        width="42"
        height="42"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M24 5.5L44 40H4L24 5.5Z"
          fill="#fff5f5"
          stroke="#d9363e"
          stroke-width="2.4"
          stroke-linejoin="round"
        />
        <path
          d="M24 17V28"
          stroke="#d9363e"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle cx="24" cy="34.5" r="1.8" fill="#d9363e" />
      </svg>
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
