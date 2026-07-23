<template>
  <Button
    :type="type"
    :disabled="disabled || loading"
    :loading="loading"
    :label="loading ? loadingLabel : label"
    :icon="primeIcon"
    :outlined="variant === 'outline'"
    class="fm-action-button fm-ui-button fm-responsive-button"
    :class="variantClass"
    @click="$emit('click', $event)"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </Button>
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  label: { type: String, default: '' },
  loadingLabel: { type: String, default: 'PROCESANDO...' },
  icon: { type: String, default: '' },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline'].includes(value)
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

defineEmits(['click'])

const defaultIcons = {
  BUSCAR: 'pi-search',
  LIMPIAR: 'pi-filter-slash'
}

const primeIcon = computed(() => {
  const requestedIcon = props.icon || defaultIcons[props.label.trim().toUpperCase()]
  if (!requestedIcon) return undefined
  return requestedIcon.startsWith('pi ') ? requestedIcon : `pi ${requestedIcon}`
})

const variantClass = computed(() => ({
  'fm-action-button--primary fm-ui-button--primary': props.variant === 'primary',
  'fm-action-button--outline fm-ui-button--outline': props.variant === 'outline'
}))
</script>

<style scoped>
.fm-action-button,
.fm-ui-button {
  width: auto !important;
  min-width: 120px !important;
  max-width: none !important;
  height: 36px !important;
  min-height: 36px !important;
  padding: 0 18px !important;
  border-radius: 8px !important;
  gap: 8px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  white-space: nowrap;
}

.fm-action-button :deep(.p-button-icon),
.fm-ui-button :deep(.p-button-icon),
.fm-action-button :deep(.pi),
.fm-ui-button :deep(.pi) {
  width: 14px !important;
  min-width: 14px !important;
  height: 14px !important;
  min-height: 14px !important;
  font-size: 14px !important;
  line-height: 14px !important;
}

.fm-action-button--primary,
.fm-ui-button--primary {
  border: 1px solid #00a9bd !important;
  background: #00a9bd !important;
  color: #ffffff !important;
  box-shadow: 0 5px 14px rgba(0, 73, 84, 0.14) !important;
}

.fm-action-button--primary:hover:not(:disabled),
.fm-ui-button--primary:hover:not(:disabled) {
  border-color: #008fa1 !important;
  background: #008fa1 !important;
  color: #ffffff !important;
}

.fm-action-button--outline,
.fm-ui-button--outline {
  border: 1px solid #00a9bd !important;
  background: #ffffff !important;
  color: #008fa1 !important;
  box-shadow: none !important;
}

.fm-action-button--outline:hover:not(:disabled),
.fm-ui-button--outline:hover:not(:disabled) {
  border-color: #008fa1 !important;
  background: #e4f9fc !important;
  color: #006f7d !important;
}

.fm-action-button:disabled,
.fm-ui-button:disabled {
  border-color: #c9d2d7 !important;
  background: #dbe1e4 !important;
  color: #7c8a92 !important;
  box-shadow: none !important;
}
</style>
