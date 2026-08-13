<template>
  <div class="legacy-iframe-stage">
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
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import router from '@/router'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const MIN_LOADER_VISIBLE_MS = 550

const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')

let loadingStartedAt = performance.now()
let loadGeneration = 0
let hideLoaderTimer = null

watchEffect(() => {
  sessionStorage.setItem('urlParam', props.urlParam)
  sessionStorage.setItem('titleParam', props.titleParam)
})

const iframeSrc = computed(() => {
  const pantalla = props.urlParam !== undefined
    ? `/pc${props.urlParam}`
    : `/pc${sessionStorage.getItem('urlParam') || ''}`

  return pantalla
})

const clearHideLoaderTimer = () => {
  if (hideLoaderTimer !== null) {
    window.clearTimeout(hideLoaderTimer)
    hideLoaderTimer = null
  }
}

watch(iframeSrc, () => {
  loadGeneration += 1
  loadingStartedAt = performance.now()
  clearHideLoaderTimer()
  iframeLoading.value = true
}, { immediate: true })

const onIframeLoad = () => {
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
  const origins = new Set([window.location.origin])
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
