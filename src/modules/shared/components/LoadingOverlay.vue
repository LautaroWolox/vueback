<template>
  <FmTypingLoader
    v-if="loading"
    fullscreen
  />
</template>

<script setup>
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'

defineProps({
  loading: Boolean
})
</script>
