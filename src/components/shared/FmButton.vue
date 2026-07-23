<template>
  <Button
    :type="type"
    :disabled="disabled || loading"
    :loading="loading"
    :label="loading ? loadingLabel : label"
    :icon="usesGlobalCleanIcon ? undefined : primeIcon"
    :outlined="variant === 'outline'"
    class="fm-action-button fm-ui-button fm-responsive-button"
    :class="variantClass"
    @click="$emit('click', $event)"
  >
    <template v-if="$slots.icon || usesGlobalCleanIcon" #icon>
      <slot v-if="$slots.icon" name="icon" />
      <svg
        v-else
        class="fm-clean-button-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 6h14" />
        <path d="M4 12h10" />
        <path d="M4 18h6" />
      </svg>
    </template>
  </Button>
</template>

<script setup>
import { computed, useSlots } from 'vue'
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

const slots = useSlots()

defineEmits(['click'])

const normalizedLabel = computed(() => props.label.trim().toUpperCase())

const defaultIcons = {
  BUSCAR: 'pi-search'
}

const usesGlobalCleanIcon = computed(() => (
  normalizedLabel.value === 'LIMPIAR' &&
  !props.icon &&
  !slots.icon
))

const primeIcon = computed(() => {
  const requestedIcon = props.icon || defaultIcons[normalizedLabel.value]
  if (!requestedIcon) return undefined
  return requestedIcon.startsWith('pi ') ? requestedIcon : `pi ${requestedIcon}`
})

const variantClass = computed(() => ({
  'fm-action-button--primary fm-ui-button--primary': props.variant === 'primary',
  'fm-action-button--outline fm-ui-button--outline': props.variant === 'outline',
  'fm-action-button--clean fm-ui-button--clean': normalizedLabel.value === 'LIMPIAR'
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

.fm-clean-button-icon {
  width: 16px !important;
  min-width: 16px !important;
  height: 16px !important;
  min-height: 16px !important;
  flex: 0 0 16px !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 2.2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
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

.fm-action-button--clean,
.fm-ui-button--clean {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 13px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 6px !important;
  background: #ffffff !important;
  color: #00a0b4 !important;
  gap: 8px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 4px 10px rgba(0, 78, 91, 0.16) !important;
}

.fm-action-button--clean :deep(.p-button-label),
.fm-ui-button--clean :deep(.p-button-label) {
  font-size: 13px !important;
  font-weight: 400 !important;
}

.fm-action-button--clean:hover:not(:disabled),
.fm-ui-button--clean:hover:not(:disabled) {
  border-color: #008fa1 !important;
  background: #f2fcfe !important;
  color: #008fa1 !important;
}

.fm-action-button:disabled,
.fm-ui-button:disabled {
  border-color: #c9d2d7 !important;
  background: #dbe1e4 !important;
  color: #7c8a92 !important;
  box-shadow: none !important;
}
</style>
