<template>
  <div
    class="jobtype-screen jobtype-contrato-screen"
    :class="{
      'jobtype-contrato-screen--grid-expanded': !filtersExpanded && resultsExpanded
    }"
  >
    <LoadingOverlay :loading="store.loading" />

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
        <FmButton label="BUSCAR" class="jobtype-search-button" @click="buscar" />
      </div>
    </section>

    <section class="jobtype-panel jobtype-panel--results" :class="{ 'is-expanded': resultsExpanded }">
      <button
        type="button"
        class="jobtype-panel__header"
        :aria-expanded="resultsExpanded"
        @click="resultsExpanded = !resultsExpanded"
      >
        <span>RELACIONES JOBTYPE-CONTRATO</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <Tabla
          v-model:filters="mainFilters"
          v-model:selected-row="selectedRow"
          v-model:first="mainFirst"
          v-model:rows="mainPageRows"
          :relaciones="store.relaciones"
          :columns="visibleColumns"
          @export="exportarExcel"
          @delete="solicitarDesactivacion"
          @edit="editarSeleccionado"
          @add="showAlta = true"
        />
      </div>
    </section>

    <AltaDialog
      v-model:visible="showAlta"
      @relacionado="onRelacionado"
    />

    <EditarDialog
      v-model:visible="showEditar"
      :tarea-contrato-id="editForm.tareaContratoId"
      :jobtype="editForm.jobtype"
      :contrato-actual="editForm.contratoActual"
      :pais="editForm.pais"
      @actualizado="onActualizado"
    />

    <ConfirmarDesactivacionDialog
      v-model:visible="showDesactivar"
      @confirmar="onDesactivacionConfirmada"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import FmButton from '@/components/shared/FmButton.vue'
import LoadingOverlay from '@/modules/shared/components/LoadingOverlay.vue'
import Tabla from './components/Tabla.vue'
import AltaDialog from './components/AltaDialog.vue'
import EditarDialog from './components/EditarDialog.vue'
import ConfirmarDesactivacionDialog from './components/ConfirmarDesactivacionDialog.vue'
import { useJobtypeContratoStore } from './store/jobtypeContratoStore'

const store = useJobtypeContratoStore()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const selectedRow = ref(null)
const mainFirst = ref(0)
const mainPageRows = ref(100)
const showAlta = ref(false)
const showEditar = ref(false)
const showDesactivar = ref(false)

let popupButtonObserver = null
let popupButtonFrame = null

const popupButtonSelector = [
  '.p-dialog .jobtype-add-button',
  '.p-dialog .jobtype-relate-button',
  '.p-dialog .jobtype-contrato-edit-update',
  '.jobtype-alta-unsaved-dialog .jobtype-alta-unsaved__button',
  '.jobtype-contrato-unsaved-dialog .jobtype-contrato-unsaved__button',
  '.jobtype-contrato-delete-confirm-dialog .jobtype-contrato-delete-confirm__button'
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

const applyPopupButtonDesign = () => {
  document.querySelectorAll(popupButtonSelector).forEach((button) => {
    if (!(button instanceof HTMLElement)) return

    const label = button.textContent?.trim().toUpperCase() ?? ''
    const isOutline = label.includes('CANCELAR') || label.includes('RECHAZAR')

    button.dataset.jobtypePopupButton = 'true'
    button.dataset.jobtypePopupButtonVariant = isOutline ? 'outline' : 'primary'

    setImportantStyle(button, 'width', 'auto')
    setImportantStyle(button, 'min-width', '110px')
    setImportantStyle(button, 'max-width', 'none')
    setImportantStyle(button, 'height', '34px')
    setImportantStyle(button, 'min-height', '34px')
    setImportantStyle(button, 'max-height', '34px')
    setImportantStyle(button, 'padding', '0 16px')
    setImportantStyle(button, 'border-radius', '8px')
    setImportantStyle(button, 'gap', '7px')
    setImportantStyle(button, 'font-size', '12px')
    setImportantStyle(button, 'font-weight', '600')
    setImportantStyle(button, 'line-height', '1')
    setImportantStyle(button, 'box-shadow', '0 4px 12px rgba(0, 73, 84, 0.13)')
    setImportantStyle(button, 'transform', 'none')
  })
}

const schedulePopupButtonDesign = () => {
  if (popupButtonFrame !== null) return

  popupButtonFrame = requestAnimationFrame(() => {
    popupButtonFrame = null
    applyPopupButtonDesign()
  })
}

const editForm = ref({
  tareaContratoId: 0,
  jobtype: '',
  contratoActual: '',
  pais: ''
})

const columns = [
  { field: 'tareaContratoId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'tareaId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'contratoTipoId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'tareaCodigo', header: 'CODIGO_TAREA', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'tareaNombre', header: 'TAREA', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'contratoNombre', header: 'NOMBRE_CONTRATO', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'legajoModificacion', header: 'USUARIO_MODIFICACION', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'activo', header: 'ACTIVO', width: '14.28%', exportable: true, filter: true, sort: true },
  { field: 'pais', header: 'PAIS', width: '14.28%', exportable: true, filter: true, sort: true }
]

const visibleColumns = computed(() => columns.filter((col) => !col.hidden))

const mainFilters = ref(
  Object.fromEntries(
    visibleColumns.value.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

const buscar = async () => {
  resultsExpanded.value = true
  mainFirst.value = 0
  selectedRow.value = null

  try {
    await store.fetchRelaciones()
  } catch {
    // error already in store.error
  }
}

const editarSeleccionado = () => {
  if (!selectedRow.value) return

  editForm.value = {
    tareaContratoId: selectedRow.value.tareaContratoId,
    jobtype: selectedRow.value.tareaNombre,
    contratoActual: selectedRow.value.contratoNombre,
    pais: selectedRow.value.pais
  }
  showEditar.value = true
}

const solicitarDesactivacion = () => {
  if (!selectedRow.value) return
  showDesactivar.value = true
}

const onDesactivacionConfirmada = async () => {
  if (!selectedRow.value) return

  try {
    await store.desactivarRelacion(selectedRow.value.tareaContratoId)
    selectedRow.value = null
    await store.fetchRelaciones()
  } catch {
    // error already in store.error
  }
}

const onRelacionado = async () => {
  selectedRow.value = null
  await store.fetchRelaciones()
}

const onActualizado = async () => {
  selectedRow.value = null
  await store.fetchRelaciones()
}

const exportarExcel = () => {
  if (!store.relaciones.length) return

  const exportColumns = columns.filter((col) => col.exportable)
  const headers = exportColumns.map((col) => col.header)
  const lines = store.relaciones.map((row) =>
    exportColumns.map((col) => JSON.stringify(row[col.field] ?? '')).join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'Jobtype_Contrato.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await nextTick()
  applyPopupButtonDesign()

  popupButtonObserver = new MutationObserver(schedulePopupButtonDesign)
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
})
</script>

<style scoped>
.jobtype-contrato-screen--grid-expanded {
  height: calc(100vh - 64px) !important;
  min-height: 0 !important;
  padding-bottom: 4px !important;
  overflow: hidden !important;
}

.jobtype-contrato-screen--grid-expanded .jobtype-panel--filters {
  flex: 0 0 auto !important;
}

.jobtype-contrato-screen--grid-expanded .jobtype-panel--results {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.jobtype-contrato-screen--grid-expanded .jobtype-results-body {
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  overflow: hidden !important;
}

.jobtype-contrato-screen--grid-expanded :deep(.jobtype-contrato-main-grid),
.jobtype-contrato-screen--grid-expanded :deep(.jobtype-contrato-main-grid.p-datatable) {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.jobtype-contrato-screen--grid-expanded :deep(.jobtype-contrato-main-grid .p-datatable-table-container),
.jobtype-contrato-screen--grid-expanded :deep(.jobtype-contrato-main-grid .p-datatable-wrapper),
.jobtype-contrato-screen--grid-expanded :deep(.jobtype-contrato-main-grid [data-pc-section='tablecontainer']) {
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
}

:global(body [data-jobtype-popup-button='true']),
:global(body [data-jobtype-popup-button='true'] .p-button-label) {
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
}

:global(body [data-jobtype-popup-button='true'][data-jobtype-popup-button-variant='primary']) {
  border: 1px solid #00a9bd !important;
  background: #00a9bd !important;
  color: #fff !important;
}

:global(body [data-jobtype-popup-button='true'][data-jobtype-popup-button-variant='primary']:hover:not(:disabled)) {
  border-color: #008fa1 !important;
  background: #008fa1 !important;
  color: #fff !important;
}

:global(body [data-jobtype-popup-button='true'][data-jobtype-popup-button-variant='outline']) {
  border: 1px solid #00a9bd !important;
  background: #fff !important;
  color: #008fa1 !important;
  box-shadow: none !important;
}

:global(body [data-jobtype-popup-button='true'][data-jobtype-popup-button-variant='outline']:hover:not(:disabled)) {
  border-color: #008fa1 !important;
  background: #e4f9fc !important;
  color: #006f7d !important;
}

:global(body [data-jobtype-popup-button='true']:disabled) {
  border-color: #c9d2d7 !important;
  background: #dbe1e4 !important;
  color: #7c8a92 !important;
  box-shadow: none !important;
  opacity: 1 !important;
}
</style>
