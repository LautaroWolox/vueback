<template>
  <FmTypingLoader v-if="iframeLoading" fullscreen />
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
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import { useLegacyIframeLayout } from '@/composables/useLegacyIframeLayout'

const iframeRef = ref(null)
const iframeLoading = ref(true)
const { onIframeLoad: applyLegacyLayout } = useLegacyIframeLayout(iframeRef)

const onIframeLoad = () => {
  applyLegacyLayout()
  iframeLoading.value = false
}

const iframeSrc = computed(() =>
  `${window.location.origin}/pc${sessionStorage.getItem('urlDetalle')}?nroActa=${sessionStorage.getItem('nroActa')}`
)

const titulo = `Detalle Acta - ${sessionStorage.getItem('nroActa') || ''}`
</script>
