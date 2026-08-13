<template>
  <BuscadorOts v-if="isBuscadorOts" />

  <template v-else>
    <Teleport to="body">
      <FmTypingLoader v-if="iframeLoading" fullscreen />
    </Teleport>

    <iframe
      :key="iframeSrc"
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
import { useLegacyIframeViewport } from '@/composables/useLegacyIframeViewport'

const MIN_LOADER_VISIBLE_MS = 550

const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const isBuscadorOts = computed(() => props.urlParam === '/busquedaOtsGcc.html')
const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const { onIframeLoad: applyLegacyViewport } = useLegacyIframeViewport(iframeRef)
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')

let loadingStartedAt = performance.now()
let loadGeneration = 0
let hideLoaderTimer = null

watchEffect(() => {
  sessionStorage.setItem('urlParam', props.urlParam)
  sessionStorage.setItem('titleParam', props.titleParam)
})

const iframeSrc = computed(() => `/pc${props.urlParam || sessionStorage.getItem('urlParam') || ''}`)

const clearHideLoaderTimer = () => {
  if (hideLoaderTimer !== null) {
    window.clearTimeout(hideLoaderTimer)
    hideLoaderTimer = null
  }
}

watch(iframeSrc, () => {
  if (isBuscadorOts.value) return

  loadGeneration += 1
  loadingStartedAt = performance.now()
  clearHideLoaderTimer()
  iframeLoading.value = true
}, { immediate: true })

const onIframeLoad = () => {
  if (isBuscadorOts.value) return

  let loadedHref = ''
  try {
    loadedHref = iframeRef.value?.contentWindow?.location?.href || ''
  } catch {
    // Si el navegador no permite leer la URL, el evento load sigue siendo válido.
  }

  if (loadedHref === 'about:blank') return

  const completedGeneration = loadGeneration

  try {
    applyLegacyLayout()
    applyLegacyViewport()
  } catch (error) {
    console.error('Error aplicando layout al iframe legacy:', error)
  }

  const elapsed = performance.now() - loadingStartedAt
  const remaining = Math.max(0, MIN_LOADER_VISIBLE_MS - elapsed)

  clearHideLoaderTimer()
  hideLoaderTimer = window.setTimeout(() => {
    if (completedGeneration === loadGeneration) {
      iframeLoading.value = false
    }
    hideLoaderTimer = null
  }, remaining)
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
  clearHideLoaderTimer()
  window.removeEventListener('message', handleRedirect)
})
</script>

<style scoped>
.legacy-iframe {
  width: 100%;
  height: calc(100vh - 64px);
  height: calc(100dvh - 64px);
  min-width: 0;
  min-height: 420px;
  display: block;
  margin: 0;
  border: 0;
  background: #fff;
}

.legacy-iframe--loading {
  visibility: hidden;
}

@media (min-width: 961px) {
  .legacy-iframe {
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
  }
}
</style>
