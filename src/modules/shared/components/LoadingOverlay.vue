<template>
  <FmTypingLoader
    v-if="loading"
    fullscreen
    :title="title"
    :message="message"
    :variant="variant"
  />
</template>

<script setup>
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'

defineProps({
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Cargando Información' },
  message: { type: String, default: 'Preparando pantalla' },
  variant: { type: String, default: 'default' },
})
</script>
