<template>
  <div class="busqueda-ots-view">
    <FmTypingLoader
      v-if="store.searching"
      fullscreen
      title="Cargando Información"
      message="Preparando pantalla"
      variant="search"
    />
    <BuscadorOts />
  </div>
</template>

<script setup>
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
import BuscadorOts from './BuscadorOts.vue'
import { useBuscadorOtsStore } from './store/buscadorOtsStore'

const store = useBuscadorOtsStore()
</script>
