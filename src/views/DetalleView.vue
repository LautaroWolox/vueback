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

const iframeRef = ref(null)
const { onIframeLoad } = useLegacyIframeLayout(iframeRef)

const iframeSrc = computed(() =>
  `${window.location.origin}/pc${sessionStorage.getItem('urlDetalle')}?nroActa=${sessionStorage.getItem('nroActa')}`
)

const titulo = `Detalle Acta - ${sessionStorage.getItem('nroActa') || ''}`
</script>

<style scoped>
.legacy-iframe {
  width: 100%;
  height: calc(100vh - 64px);
  min-height: 520px;
  display: block;
  margin: -4px 0 0;
  border: 0;
}
</style>
