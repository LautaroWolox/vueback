<template>
  <BuscadorOts v-if="isBuscadorOts" />

  <template v-else>
    <FmTypingLoader v-if="iframeLoading" fullscreen />

    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      :title="titulo"
      width="100%"
      frameborder="0"
      allowfullscreen
      class="legacy-iframe"
      :class="{ 'legacy-iframe--loading': iframeLoading }"
      @load="onIframeLoad"
    />
  </template>
</template>

<script setup>
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import router from '@/router'
import BuscadorOts from '@/modules/buscadorOts/BuscadorOts.vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const isBuscadorOts = computed(() => props.urlParam === '/busquedaOtsGcc.html')
const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')

watchEffect(() => {
  sessionStorage.setItem('urlParam', props.urlParam)
  sessionStorage.setItem('titleParam', props.titleParam)
})

const iframeSrc = computed(() => `/pc${props.urlParam || sessionStorage.getItem('urlParam') || ''}`)

watch(iframeSrc, () => {
  if (!isBuscadorOts.value) iframeLoading.value = true
}, { immediate: true })

const onIframeLoad = () => {
  if (isBuscadorOts.value) return
  try {
    applyLegacyLayout()
  } finally {
    iframeLoading.value = false
  }
}

function handleRedirect(event) {
  const origins = new Set([import.meta.env.VITE_ORIGIN, window.location.origin])
  if (!origins.has(event.origin)) return

  const message = event.data
  if (message?.type === 'redirect' && message.nroActa && message.url) {
    sessionStorage.setItem('nroActa', message.nroActa)
    sessionStorage.setItem('urlDetalle', message.url)
    const route = router.resolve({ name: 'DEAC' })
    window.open(route.href, '_blank')
  }
}

window.addEventListener('message', handleRedirect)

onUnmounted(() => {
  window.removeEventListener('message', handleRedirect)
})
</script>
