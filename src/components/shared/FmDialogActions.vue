<template>
  <div class="fm-dialog-actions">
    <FmButton
      v-if="secondaryLabel"
      :label="secondaryLabel"
      variant="outline"
      class="fm-dialog-action fm-dialog-action--secondary"
      :disabled="secondaryDisabled || loading"
      @click="$emit('secondary')"
    />

    <FmButton
      v-if="primaryLabel"
      :label="primaryLabel"
      class="fm-dialog-action fm-dialog-action--primary"
      :disabled="primaryDisabled"
      :loading="loading"
      :loading-label="loadingLabel"
      @click="$emit('primary')"
    />
  </div>
</template>

<script setup>
import FmButton from './FmButton.vue'

defineProps({
  primaryLabel: { type: String, default: '' },
  secondaryLabel: { type: String, default: '' },
  primaryDisabled: { type: Boolean, default: false },
  secondaryDisabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingLabel: { type: String, default: 'PROCESANDO...' }
})

defineEmits(['primary', 'secondary'])
</script>

<style scoped>
.fm-dialog-actions {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
</style>
