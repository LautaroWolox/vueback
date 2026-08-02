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

const setImportantStyle = (element, property, value) => {
  if (
    element.style.getPropertyValue(property) === value &&
    element.style.getPropertyPriority(property) === 'important'
  ) {
    return
  }

  element.style.setProperty(property, value, 'important')
}

const applySearchButtonDesign = () => {
  document.querySelectorAll(popupButtonSelector).forEach((button) => {
    if (!(button instanceof HTMLElement)) return

    setImportantStyle(button, 'width', 'auto')
    setImportantStyle(button, 'min-width', '66px')
    setImportantStyle(button, 'max-width', 'none')
    setImportantStyle(button, 'height', '27px')
    setImportantStyle(button, 'min-height', '27px')
    setImportantStyle(button, 'max-height', '27px')
    setImportantStyle(button, 'padding', '0 12px')
    setImportantStyle(button, 'border-radius', '15px')
    setImportantStyle(button, 'gap', '6px')
    setImportantStyle(button, 'font-size', '11px')
    setImportantStyle(button, 'font-weight', '400')
    setImportantStyle(button, 'line-height', '1')
    setImportantStyle(button, 'box-shadow', 'none')
    setImportantStyle(button, 'transform', 'none')
  })
}

const scheduleSearchButtonDesign = () => {
  if (popupButtonFrame !== null) return

  popupButtonFrame = requestAnimationFrame(() => {
    popupButtonFrame = null
    applySearchButtonDesign()
  })
}

const buscar = async () => {
  resultsExpanded.value = true
  await store.fetchData()
}

onMounted(async () => {
  await nextTick()
  applySearchButtonDesign()

  popupButtonObserver = new MutationObserver(scheduleSearchButtonDesign)
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

<style>
body .p-dialog .jobtype-add-button .p-button-label,
body .p-dialog .jobtype-relate-button .p-button-label,
body .p-confirmdialog .p-button .p-button-label {
  font-size: 11px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
}
</style>
