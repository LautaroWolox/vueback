<template>
  <button
    :type="type"
    class="fm-action-button fm-ui-button"
    :class="buttonClass"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <svg v-if="icon === 'search'" class="fm-ui-button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 5.3-12.8 7.5 7.5 0 0 1-5.3 12.8Zm5.5-2 5 5" />
    </svg>
    <svg v-else-if="icon === 'clean'" class="fm-ui-button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h13M4 12h8M4 17h5" />
    </svg>
    <svg v-else-if="icon === 'add'" class="fm-ui-button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
    <svg v-else-if="icon === 'save'" class="fm-ui-button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h12l2 2v14H5V4Zm3 0v6h8V4M8 20v-6h8v6" />
    </svg>
    <svg v-else-if="icon === 'cancel'" class="fm-ui-button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline'].includes(value)
  },
  icon: {
    type: String,
    default: '',
    validator: (value) => ['', 'search', 'clean', 'add', 'save', 'cancel'].includes(value)
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])

const buttonClass = computed(() => ({
  'fm-action-button--primary fm-ui-button--primary': props.variant === 'primary',
  'fm-action-button--outline fm-ui-button--outline': props.variant === 'outline'
}))
</script>
