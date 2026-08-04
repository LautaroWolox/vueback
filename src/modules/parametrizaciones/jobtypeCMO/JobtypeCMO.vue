<template>
  <div
    class="jobtype-screen cmo-actividad-page"
    :class="{ 'jobtype-contrato-screen--grid-expanded': resultsExpanded }"
  >
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
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useCmoActividadStore } from './store/cmoActividadStore'
import Tabla from './components/Tabla.vue'

const store = useCmoActividadStore()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)

let popupButtonObserver = null
let popupButtonFrame = null

const popupButtonSelector = [
  '.p-dialog .jobtype-add-button',
  '.p-dialog .jobtype-relate-button',
  '.p-confirmdialog .p-button'
].join(', ')

const applyStandardButtonDesign = () => {
  document.querySelectorAll(popupButtonSelector).forEach((button) => {
    if (!(button instanceof HTMLElement)) return

    const label = button.textContent?.trim().toUpperCase() ?? ''
    const isOutline = label.includes('CANCELAR') || label.includes('RECHAZAR')

    button.dataset.cmoPopupButton = 'true'
    button.dataset.cmoPopupButtonVariant = isOutline ? 'outline' : 'primary'
  })
}

const scheduleStandardButtonDesign = () => {
  if (popupButtonFrame !== null) return

  popupButtonFrame = requestAnimationFrame(() => {
    popupButtonFrame = null
    applyStandardButtonDesign()
  })
}

const buscar = async () => {
  resultsExpanded.value = true
  await store.fetchData()
}

onMounted(async () => {
  await nextTick()
  applyStandardButtonDesign()

  popupButtonObserver = new MutationObserver(scheduleStandardButtonDesign)
  popupButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  })
})

onBeforeUnmount(() => {
  popupButtonObserver?.disconnect()
  popupButtonObserver = null

  if (popupButtonFrame !== null) {
    cancelAnimationFrame(popupButtonFrame)
    popupButtonFrame = null
  }

  // Liberar memoria (~9000+ registros) al salir de la pantalla.
  store.clearStore()
})
</script>
