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
import { ref, computed } from 'vue'
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
</style>
