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

const applyStandardButtonDesign = () => {
  document.querySelectorAll(popupButtonSelector).forEach((button) => {
    if (!(button instanceof HTMLElement)) return

    const label = button.textContent?.trim().toUpperCase() ?? ''
    const isOutline = label.includes('CANCELAR') || label.includes('RECHAZAR')

    button.dataset.cmoPopupButton = 'true'
    button.dataset.cmoPopupButtonVariant = isOutline ? 'outline' : 'primary'

    setImportantStyle(button, 'width', 'auto')
    setImportantStyle(button, 'min-width', '120px')
    setImportantStyle(button, 'max-width', 'none')
    setImportantStyle(button, 'height', '36px')
    setImportantStyle(button, 'min-height', '36px')
    setImportantStyle(button, 'max-height', '36px')
    setImportantStyle(button, 'padding', '0 18px')
    setImportantStyle(button, 'border-radius', '8px')
    setImportantStyle(button, 'gap', '8px')
    setImportantStyle(button, 'font-size', '13px')
    setImportantStyle(button, 'font-weight', '600')
    setImportantStyle(button, 'line-height', '1')
    setImportantStyle(button, 'box-shadow', '0 5px 14px rgba(0, 73, 84, 0.14)')
    setImportantStyle(button, 'transform', 'none')
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

<style>
body [data-cmo-popup-button='true'],
body [data-cmo-popup-button='true'] .p-button-label {
  font-size: 13px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
}

body [data-cmo-popup-button='true'][data-cmo-popup-button-variant='primary'] {
  border: 1px solid #00a9bd !important;
  background: #00a9bd !important;
  color: #fff !important;
}

body [data-cmo-popup-button='true'][data-cmo-popup-button-variant='primary']:hover:not(:disabled) {
  border-color: #008fa1 !important;
  background: #008fa1 !important;
  color: #fff !important;
}

body [data-cmo-popup-button='true'][data-cmo-popup-button-variant='outline'] {
  border: 1px solid #00a9bd !important;
  background: #fff !important;
  color: #008fa1 !important;
  box-shadow: none !important;
}

body [data-cmo-popup-button='true'][data-cmo-popup-button-variant='outline']:hover:not(:disabled) {
  border-color: #008fa1 !important;
  background: #e4f9fc !important;
  color: #006f7d !important;
}

body [data-cmo-popup-button='true']:disabled {
  border-color: #c9d2d7 !important;
  background: #dbe1e4 !important;
  color: #7c8a92 !important;
  box-shadow: none !important;
  opacity: 1 !important;
}
</style>
