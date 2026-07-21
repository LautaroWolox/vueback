<template>
  <div class="fm-panel-content fm-panel-content--accent fm-filters otf-filters">
    <div class="fm-filter-grid">
      <NroOT />
      <FechaDesde />
      <FechaHasta />
      <Contratista />
      <DescError />
      <Excluida />
      <Pais />
    </div>

    <div class="fm-actions fm-filter-actions">
      <FmButton
        label="BUSCAR"
        icon="pi-search"
        :disabled="store.loading"
        @click="store.setData"
      />
      <FmButton
        label="LIMPIAR"
        icon="pi-filter-slash"
        variant="outline"
        :disabled="store.loading"
        @click="store.clearFilters"
      />
    </div>
  </div>
</template>

<script setup>
import Contratista from './elementos/Contratista.vue'
import DescError from './elementos/DescError.vue'
import Excluida from './elementos/Excluida.vue'
import FechaDesde from './elementos/FechaDesde.vue'
import FechaHasta from './elementos/FechaHasta.vue'
import NroOT from './elementos/NroOT.vue'
import Pais from './elementos/Pais.vue'
import { useFallidasCtStore } from '../store/CtFallidaStore'

const store = useFallidasCtStore()
</script>

<style scoped>
.otf-filters {
  width: 100%;
}

@media (max-width: 900px) {
  .otf-filters :deep(.fm-field--span-3) {
    grid-column: span 6;
  }
}

@media (max-width: 620px) {
  .otf-filters :deep(.fm-field--span-3) {
    grid-column: span 12;
  }
}
</style>
