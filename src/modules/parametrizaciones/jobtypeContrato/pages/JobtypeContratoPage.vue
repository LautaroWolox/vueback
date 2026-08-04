<template>
  <div class="jobtype-screen">
    <FmTypingLoader
      v-if="store.loading && !showAlta && !showEditar && !showDesactivar"
      overlay
      title="Cargando relaciones"
      message="Procesando Jobtype-Contrato"
    />

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

      <div v-show="filtersExpanded" class="jobtype-search-body">
        <FmButton
          label="BUSCAR"
          class="jobtype-search-button"
          :loading="store.loading"
          @click="buscar"
        />
      </div>
    </section>

    <section
      class="jobtype-panel jobtype-panel--results"
      :class="{ 'is-expanded': resultsExpanded }"
    >
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
        <DataTable
          id="tabla-jobtype-contrato"
          v-model:filters="mainFilters"
          v-model:selection="selectedRow"
          v-model:first="mainFirst"
          v-model:rows="mainPageRows"
          class="jobtype-main-grid fm-pass-grid"
          :value="store.relaciones"
          dataKey="tareaContratoId"
          tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scrollHeight="flex"
          removableSort
          sortMode="multiple"
          filterDisplay="row"
          selectionMode="single"
          :rowSelectable="isRowSelectable"
          :rowClass="rowClass"
          paginator
          :rowsPerPageOptions="ROWS_OPTIONS"
          :resizableColumns="true"
          columnResizeMode="fit"
          showGridlines
          @row-click="onRowClick"
        >
          <template #empty>
            <div class="fm-grid-empty">No hay resultados</div>
          </template>

          <template
            #paginatorcontainer="{
              first,
              last,
              page,
              pageCount,
              rows,
              totalRecords,
              firstPageCallback,
              lastPageCallback,
              prevPageCallback,
              nextPageCallback,
              rowChangeCallback,
              changePageCallback
            }"
          >
            <FmGridPaginator
              :first="first"
              :last="last"
              :page="page"
              :page-count="pageCount"
              :rows="rows"
              :total-records="totalRecords"
              :rows-options="ROWS_OPTIONS"
              :show-rows-select="true"
              :show-counter="true"
              :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
              @first-page="firstPageCallback"
              @prev-page="prevPageCallback"
              @next-page="nextPageCallback"
              @last-page="lastPageCallback"
              @page-change="changePageCallback"
              @rows-change="rowChangeCallback"
            >
              <template #actions>
                <FmGridActions
                  :show-refresh="false"
                  :show-edit="true"
                  :show-add="true"
                  :delete-disabled="!puedeOperarSeleccion"
                  :edit-disabled="!puedeOperarSeleccion"
                  export-title="Descargar"
                  delete-title="Desactivar"
                  edit-title="Editar"
                  add-title="Nueva relación"
                  @export="exportarExcel"
                  @delete="solicitarDesactivacion"
                  @edit="editarSeleccionado"
                  @add="abrirAlta"
                />
              </template>
            </FmGridPaginator>
          </template>

          <Column
            v-for="col in visibleColumns"
            :key="col.field"
            :field="col.field"
            :sortField="col.field"
            :filterField="col.field"
            :header="col.header"
            :sortable="col.sort"
            :filter="col.filter"
            :showFilterMenu="false"
            :style="{ width: col.width }"
            :headerStyle="{ width: col.width }"
            :bodyStyle="{ width: col.width }"
          >
            <template v-if="col.filter" #filter="{ filterModel, filterCallback }">
              <div class="jobtype-filter-cell">
                <span class="jobtype-filter-symbol">~</span>
                <InputText
                  v-model="filterModel.value"
                  class="jobtype-filter-input"
                  type="text"
                  @input="filterCallback()"
                />
                <button
                  type="button"
                  class="jobtype-filter-clear"
                  title="Limpiar filtro"
                  aria-label="Limpiar filtro"
                  @click="clearFilter(filterModel, filterCallback)"
                >×</button>
              </div>
            </template>

            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="String(data[col.field] ?? '')">
                {{ data[col.field] ?? '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </section>

    <AltaJobtypeContratoDialog
      v-model:visible="showAlta"
      @relacionado="onRelacionado"
    />

    <EditarJobtypeContratoDialog
      v-model:visible="showEditar"
      :tarea-contrato-id="editForm.tareaContratoId"
      :contrato-tipo-id="editForm.contratoTipoId"
      :jobtype-codigo="editForm.jobtypeCodigo"
      :jobtype="editForm.jobtype"
      :contrato-actual="editForm.contratoActual"
      :pais="editForm.pais"
      :origen-actual="editForm.origenActual"
      @actualizado="onActualizado"
    />

    <ConfirmarDesactivacionDialog
      v-model:visible="showDesactivar"
      @confirmar="onDesactivacionConfirmada"
    />

    <FmAlertDialog
      v-model:visible="showError"
      title="Error"
      :message="errorMessage"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import AltaJobtypeContratoDialog from '../dialogs/AltaJobtypeContratoDialog.vue'
import EditarJobtypeContratoDialog from '../dialogs/EditarJobtypeContratoDialog.vue'
import ConfirmarDesactivacionDialog from '../dialogs/ConfirmarDesactivacionDialog.vue'
import { JOBTYPE_CONTRATO_COLUMNS, ROWS_OPTIONS } from '../config/columns'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const store = useJobtypeContratoStore()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const selectedRow = ref(null)
const mainFirst = ref(0)
const mainPageRows = ref(ROWS_OPTIONS[0])
const showAlta = ref(false)
const showEditar = ref(false)
const showDesactivar = ref(false)
const showError = ref(false)
const localError = ref('')

const editForm = ref({
  tareaContratoId: 0,
  contratoTipoId: 0,
  jobtypeCodigo: '',
  jobtype: '',
  contratoActual: '',
  pais: '',
  origenActual: ''
})

const columns = JOBTYPE_CONTRATO_COLUMNS
const visibleColumns = computed(() => columns.filter((col) => !col.hidden))
const errorMessage = computed(() => localError.value || store.error || 'Ocurrió un error inesperado')
const puedeOperarSeleccion = computed(() => Boolean(selectedRow.value && isRowActive(selectedRow.value)))

const mainFilters = ref(
  Object.fromEntries(
    visibleColumns.value
      .filter((col) => col.filter)
      .map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

const normalizeFlag = (value) => String(value ?? '').trim().toUpperCase()
const isRowActive = (row) => normalizeFlag(row?.activo) !== 'N'
const isRowSelectable = (event) => isRowActive(event?.data ?? event)
const rowClass = (data) => (isRowActive(data) ? '' : 'jobtype-row-inactive fm-disabled-row')

const reportError = (error) => {
  localError.value = error instanceof Error ? error.message : (store.error || 'Error de conexión. Contacte al administrador')
  showError.value = true
}

const buscar = async () => {
  resultsExpanded.value = true
  mainFirst.value = 0
  selectedRow.value = null
  localError.value = ''

  try {
    await store.fetchRelaciones()
  } catch (error) {
    reportError(error)
  }
}

const abrirAlta = async () => {
  localError.value = ''
  try {
    if (!store.relaciones.length) await store.fetchRelaciones()
    showAlta.value = true
  } catch (error) {
    reportError(error)
  }
}

const onRowClick = ({ data }) => {
  if (!isRowActive(data)) {
    selectedRow.value = null
    return
  }
  selectedRow.value = data
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const editarSeleccionado = () => {
  if (!puedeOperarSeleccion.value) return

  editForm.value = {
    tareaContratoId: selectedRow.value.tareaContratoId,
    contratoTipoId: selectedRow.value.contratoTipoId,
    jobtypeCodigo: selectedRow.value.tareaCodigo ?? '',
    jobtype: selectedRow.value.tareaNombre ?? '',
    contratoActual: selectedRow.value.contratoNombre ?? '',
    pais: selectedRow.value.pais ?? '',
    origenActual: selectedRow.value.origen ?? ''
  }
  showEditar.value = true
}

const solicitarDesactivacion = () => {
  if (!puedeOperarSeleccion.value) return
  showDesactivar.value = true
}

const onDesactivacionConfirmada = async () => {
  if (!puedeOperarSeleccion.value) return

  try {
    await store.desactivarRelacion(selectedRow.value.tareaContratoId)
    selectedRow.value = null
    await store.fetchRelaciones()
  } catch (error) {
    reportError(error)
  }
}

const refrescarDespuesDeCambio = async () => {
  selectedRow.value = null
  mainFirst.value = 0
  resultsExpanded.value = true
  try {
    await store.fetchRelaciones()
  } catch (error) {
    reportError(error)
  }
}

const onRelacionado = () => refrescarDespuesDeCambio()
const onActualizado = () => refrescarDespuesDeCambio()

const exportarExcel = () => {
  if (!store.relaciones.length) return

  const exportCols = columns.filter((column) => column.exportable)
  const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const headers = exportCols.map((column) => escapeCsv(column.header))
  const lines = store.relaciones.map((row) =>
    exportCols.map((column) => escapeCsv(row[column.field])).join(',')
  )
  const csv = `\uFEFF${[headers.join(','), ...lines].join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'Jobtype_Contrato.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>
