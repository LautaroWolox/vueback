<template>
  <BuscadorOts v-if="isBuscadorOts" />

  <iframe
    v-else
    ref="iframeRef"
    :src="iframeSrc"
    :title="titulo"
    width="100%"
    frameborder="0"
    allowfullscreen
    class="legacy-iframe"
    @load="onIframeLoad"
  />
</template>

<script setup>
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import router from '@/router'
import BuscadorOts from '@/modules/buscadorOts/BuscadorOts.vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'
import { useLegacyIframeViewport } from '@/composables/useLegacyIframeViewport'

const props = defineProps({
  urlParam: { type: String, required: true },
  titleParam: { type: String, required: true }
})

const iframeRef = ref(null)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const { onIframeLoad: applyLegacyViewport } = useLegacyIframeViewport(iframeRef)
const onIframeLoad = () => {
  applyLegacyLayout()
  applyLegacyViewport()
}
const titulo = computed(() => props.titleParam || sessionStorage.getItem('titleParam') || '')
const isBuscadorOts = computed(() => props.urlParam === '/busquedaOtsGcc.html')

watchEffect(() => {
  sessionStorage.setItem('urlParam', props.urlParam)
  sessionStorage.setItem('titleParam', props.titleParam)
})

const iframeSrc = computed(() => `/pc${props.urlParam || sessionStorage.getItem('urlParam') || ''}`)

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

<style scoped>
.legacy-iframe {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: block;
  margin: 0;
  border: 0;
  background: #fff;
}
</style>
