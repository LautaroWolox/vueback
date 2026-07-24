<template>
  <iframe
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
import { computed, ref } from 'vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'
import { useLegacyIframeViewport } from '@/composables/useLegacyIframeViewport'

const iframeRef = ref(null)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)
const { onIframeLoad: applyLegacyViewport } = useLegacyIframeViewport(iframeRef)
const onIframeLoad = () => {
  applyLegacyLayout()
  applyLegacyViewport()
}

const iframeSrc = computed(() =>
  `${window.location.origin}/pc${sessionStorage.getItem('urlDetalle')}?nroActa=${sessionStorage.getItem('nroActa')}`
)

const titulo = `Detalle Acta - ${sessionStorage.getItem('nroActa') || ''}`
</script>

<style scoped>
.legacy-iframe {
  position: absolute;
  height: 100%;
  width: 100%;
} 
</style>
