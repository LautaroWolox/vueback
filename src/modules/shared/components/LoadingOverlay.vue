<template>
  <FmTypingLoader
    v-if="loading"
    fullscreen
    :variant="variant"
    :title="title"
    :message="message"
  />
</template>

<script setup>
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'

defineProps({
  loading: { type: Boolean, default: false },
  variant: { type: String, default: 'auto' },
  title: { type: String, default: '' },
  message: { type: String, default: '' }
})
</script>
