<template>
  <FmButton
    :label="label"
    :variant="variant"
    :icon="resolvedIcon"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import FmButton from './FmButton.vue'

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

const iconMap = {
  search: 'pi-search',
  clean: 'pi-filter-slash',
  add: 'pi-plus',
  save: 'pi-save',
  cancel: 'pi-times'
}

const resolvedIcon = computed(() => iconMap[props.icon] || '')
</script>
