<template>
  <ConsultarActasStepper v-if="isActasPrototype" />

  <div v-else class="legacy-iframe-stage">
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import router from '@/router'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import ConsultarActasStepper from '@/modules/gestionActas/ConsultarActasStepperV2.vue'
import { installActasPrototypeEnhancements } from '@/modules/gestionActas/actasPrototypeEnhancements'
import '@/modules/gestionActas/actasPrototypeEnhancements.css'
import '@/modules/gestionActas/actasPrototypeGridFullscreenFix.css'
import '@/modules/gestionActas/actasPrototypeGridViewportFill.css'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const MIN_LOADER_VISIBLE_MS = 450
const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const isActasPrototype = computed(() => props.urlParam === '/consultarActas.html')
const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')
let loadingStartedAt = performance.now()
let loadingGeneration = 0
let hideLoaderTimer = null
let cleanupActasPrototypeEnhancements = null

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

const syncActasPrototypeEnhancements = async () => {
  cleanupActasPrototypeEnhancements?.()
  cleanupActasPrototypeEnhancements = null

  if (!isActasPrototype.value) return

  await nextTick()
  cleanupActasPrototypeEnhancements = installActasPrototypeEnhancements()
}

watch(iframeSrc, () => {
  if (isActasPrototype.value) {
    iframeLoading.value = false
    return
  }

  loadingGeneration += 1
  loadingStartedAt = performance.now()
  clearHideLoaderTimer()
  iframeLoading.value = true
}, { immediate: true })

watch(isActasPrototype, syncActasPrototypeEnhancements)
onMounted(syncActasPrototypeEnhancements)

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
    const route = router.resolve({ name: 'DEAC' })
    window.open(route.href, '_blank')
  }
}

window.addEventListener('message', handleRedirect)
onUnmounted(() => {
  cleanupActasPrototypeEnhancements?.()
  cleanupActasPrototypeEnhancements = null
  clearHideLoaderTimer()
  window.removeEventListener('message', handleRedirect)
})
</script>
