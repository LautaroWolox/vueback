<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    :style="{ width }"
    class="fm-alert-dialog"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="fm-alert-body">
      <div v-if="type === 'warning'" class="fm-alert-triangle"><span>!</span></div>
      <slot>
        <span>{{ message }}</span>
      </slot>
    </div>
    <template #footer>
      <Button
        :label="closeLabel"
        outlined
        class="fm-btn fm-btn--outline"
        @click="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Alerta' },
  message: { type: String, default: '' },
  closeLabel: { type: String, default: 'CERRAR' },
  width: { type: String, default: '42rem' },
  type: { type: String, default: 'warning' }
})

defineEmits(['update:visible'])
</script>
