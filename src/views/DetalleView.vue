<template>
  <div class="fm-screen fm-screen--pad detail-page">
    <FmPanel :title="titulo" accent class="detail-panel">
      <div class="detail-stage">
        <iframe
          :src="iframeSrc"
          :title="titulo"
          class="detail-frame"
          frameborder="0"
          allowfullscreen
          @load="loading = false"
        />
        <FmTypingLoader
          v-if="loading"
          overlay
          variant="grid"
          title="Cargando detalle"
          :message="titulo"
        />
      </div>
    </FmPanel>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const loading = ref(true)
const iframeSrc = computed(() =>
  `${window.location.origin}/pc${sessionStorage.getItem('urlDetalle')}?nroActa=${sessionStorage.getItem('nroActa')}`
)
const titulo = `Detalle Acta - ${sessionStorage.getItem('nroActa') || ''}`
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
}

.detail-panel {
  margin: 0;
}

.detail-stage {
  position: relative;
  width: 100%;
  height: calc(100vh - 56px);
  min-height: 520px;
  overflow: hidden;
  background: #fff;
}

.detail-frame {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}
</style>
