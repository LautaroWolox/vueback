<template>
  <div class="legacy-iframe-stage">
    <FmTypingLoader
      v-if="iframeLoading"
      overlay
      :variant="loaderProfile.variant"
      :title="loaderProfile.title"
      :message="loaderProfile.message"
    />

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
import { useRoute } from 'vue-router'
import router from '@/router'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import { getLoaderProfile } from '@/components/shared/fmLoaderProfiles.js'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const MIN_LOADER_VISIBLE_MS = 450
const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const route = useRoute()
const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')
const loaderProfile = computed(() => getLoaderProfile({
  name: route.name,
  path: route.path,
  title: titulo.value
}))
let loadingStartedAt = performance.now()
let loadingGeneration = 0
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
  loadingGeneration += 1
  loadingStartedAt = performance.now()
  clearHideLoaderTimer()
  iframeLoading.value = true
}, { immediate: true })

const onIframeLoad = () => {
  let loadedHref = ''
  try {
    loadedHref = iframeRef.value?.contentWindow?.location?.href || ''
  } catch {}
  if (loadedHref === 'about:blank') return

  const completedGeneration = loadingGeneration
  try {
    applyLegacyLayout()
  } catch (error) {
    console.error('Error aplicando layout al iframe legacy:', error)
  }

  const remaining = Math.max(0, MIN_LOADER_VISIBLE_MS - (performance.now() - loadingStartedAt))
  clearHideLoaderTimer()
  hideLoaderTimer = window.setTimeout(() => {
    if (completedGeneration === loadingGeneration) iframeLoading.value = false
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
    const detailRoute = router.resolve({ name: 'DEAC' })
    window.open(detailRoute.href, '_blank')
  }
}

window.addEventListener('message', handleRedirect)
onUnmounted(() => {
  clearHideLoaderTimer()
  window.removeEventListener('message', handleRedirect)
})
</script>
