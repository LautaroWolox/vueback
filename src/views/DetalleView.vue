<template>
  <iframe
    :src="iframeSrc"
    :title="titulo"
    width="100%"
    frameborder="0"
    allowfullscreen
    style="width: 100%; height: calc(100vh - 82px); min-height: 520px; display: block; border: 0;"
  />
</template>

<script setup>
import { computed } from 'vue'

const iframeSrc = computed(() =>
  `${window.location.origin}/pc${sessionStorage.getItem('urlDetalle')}?nroActa=${sessionStorage.getItem('nroActa')}`
)

const titulo = `Detalle Acta - ${sessionStorage.getItem('nroActa') || ''}`
</script>
