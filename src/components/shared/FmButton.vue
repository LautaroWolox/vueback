<template>
  <Button
    :type="type"
    :disabled="disabled || loading"
    :loading="loading"
    :label="loading ? loadingLabel : label"
    :icon="primeIcon"
    :outlined="variant === 'outline'"
    class="fm-action-button fm-ui-button"
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

const primeIcon = computed(() => {
  if (!props.icon) return undefined
  return props.icon.startsWith('pi ') ? props.icon : `pi ${props.icon}`
})

const variantClass = computed(() => ({
  'fm-action-button--primary fm-ui-button--primary': props.variant === 'primary',
  'fm-action-button--outline fm-ui-button--outline': props.variant === 'outline'
}))
</script>
