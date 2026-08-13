<template>
  <div class="legacy-iframe-stage">
    <Teleport to="body">
      <FmTypingLoader v-if="iframeLoading" fullscreen />
    </Teleport>

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
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const MIN_LOADER_VISIBLE_MS = 550
const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)

let loadingStartedAt = performance.now()
let hideLoaderTimer = null

const clearHideLoaderTimer = () => {
  if (hideLoaderTimer !== null) {
    window.clearTimeout(hideLoaderTimer)
    hideLoaderTimer = null
  }
}

const onIframeLoad = () => {
  let loadedHref = ''

  try {
    loadedHref = iframeRef.value?.contentWindow?.location?.href || ''
  } catch {
    // Si el navegador no permite leer la URL, el evento load sigue siendo válido.
  }

  if (loadedHref === 'about:blank') return

  try {
    applyLegacyLayout()
  } catch (error) {
    console.error('Error aplicando layout al detalle legacy:', error)
  }

  const elapsed = performance.now() - loadingStartedAt
  const remaining = Math.max(0, MIN_LOADER_VISIBLE_MS - elapsed)

  clearHideLoaderTimer()
  hideLoaderTimer = window.setTimeout(() => {
    iframeLoading.value = false
    hideLoaderTimer = null
  }, remaining)
}

const iframeSrc = computed(() =>
  `${window.location.origin}/pc${sessionStorage.getItem('urlDetalle')}?nroActa=${sessionStorage.getItem('nroActa')}`
)

const titulo = `Detalle Acta - ${sessionStorage.getItem('nroActa') || ''}`

onUnmounted(clearHideLoaderTimer)
</script>
