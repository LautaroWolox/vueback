<template>
  <div class="jobtype-screen">
    <section class="jobtype-panel jobtype-panel--filters">
      <button
        type="button"
        class="jobtype-panel__header"
        :aria-expanded="filtersExpanded"
        @click="filtersExpanded = !filtersExpanded"
      >
        <span>FILTROS DE BÚSQUEDA</span>
        <span class="jobtype-panel__toggle">{{ filtersExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="filtersExpanded" class="jobtype-panel__body jobtype-search-body">
        <FmButton label="BUSCAR" class="jobtype-search-button" :loading="store.loading" @click="buscar" />
      </div>
    </section>

    <section class="jobtype-panel jobtype-panel--results" :class="{ 'is-expanded': resultsExpanded }">
      <button
        type="button"
        class="jobtype-panel__header"
        :aria-expanded="resultsExpanded"
        @click="resultsExpanded = !resultsExpanded"
      >
        <span>RELACIONES CMO-ACTIVIDAD</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <Tabla />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'
import { useCmoActividadStore } from './store/cmoActividadStore'
import Tabla from './components/Tabla.vue'

const store = useCmoActividadStore()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)

const buscar = async () => {
  resultsExpanded.value = true
  await store.fetchData()
}

// Liberar memoria (~9000+ registros) al salir de la pantalla
onUnmounted(() => {
  store.clearStore()
})
</script>
