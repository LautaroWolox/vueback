<template>
  <div class="legacy-iframe-stage legacy-iframe-stage--detail">
    <FmTypingLoader v-if="iframeLoading" overlay title="Cargando Información" message="Preparando pantalla" />
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
import { computed, onUnmounted, ref } from 'vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const MIN_LOADER_VISIBLE_MS = 450
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
  } catch {}
  if (loadedHref === 'about:blank') return

  try {
    applyLegacyLayout()
  } catch (error) {
    console.error('Error aplicando layout al detalle legacy:', error)
  }

  const remaining = Math.max(0, MIN_LOADER_VISIBLE_MS - (performance.now() - loadingStartedAt))
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

onUnmounted(() => {
  clearHideLoaderTimer()
})
</script>
