<template>
  <span
    class="parametrizacion-button"
    :class="[
      `parametrizacion-button--${size}`,
      { 'parametrizacion-button--fluid': fluid }
    ]"
  >
    <FmButton
      :label="label"
      :loading-label="loadingLabel"
      :icon="icon"
      :variant="variant"
      :type="type"
      :disabled="disabled"
      :loading="loading"
      @click="emit('click', $event)"
    />
  </span>
</template>

<script setup>
import FmButton from '@/components/shared/FmButton.vue'

const props = defineProps({
  label: { type: String, default: '' },
  loadingLabel: { type: String, default: 'PROCESANDO...' },
  icon: { type: String, default: '' },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['search', 'default', 'wide', 'confirm'].includes(value)
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  fluid: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.parametrizacion-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.parametrizacion-button :deep(.p-button) {
  box-sizing: border-box !important;
}

.parametrizacion-button--search :deep(.p-button) {
  width: auto !important;
  min-width: 66px !important;
  max-width: none !important;
  height: 27px !important;
  min-height: 27px !important;
  max-height: 27px !important;
  padding: 0 12px !important;
  border-radius: 15px !important;
  font-size: 11px !important;
  font-weight: 400 !important;
  box-shadow: none !important;
}

.parametrizacion-button--default :deep(.p-button) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

.parametrizacion-button--wide :deep(.p-button) {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
}

.parametrizacion-button--confirm :deep(.p-button) {
  width: 110px !important;
  min-width: 110px !important;
  max-width: 110px !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  border-radius: 7px !important;
}

.parametrizacion-button--fluid,
.parametrizacion-button--fluid :deep(.p-button) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}
</style>
