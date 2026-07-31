<template>
  <div class="jobtype-screen">
    <FmTypingLoader
      v-if="store.loading"
      overlay
      title="Cargando relaciones"
      message="Consultando Jobtype-Contrato"
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
          class="jobtype-main-grid"
          :value="store.relaciones"
          dataKey="tareaContratoId"
          tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scrollHeight="flex"
          removableSort
          sortMode="multiple"
          filterDisplay="row"
          selectionMode="single"
          paginator
          :rowsPerPageOptions="[100, 250, 500]"
          :resizableColumns="true"
          columnResizeMode="fit"
          showGridlines
          @row-click="onRowClick"
        >
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
              :rows-options="[100, 250, 500]"
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
                  :delete-disabled="!selectedRow"
                  :edit-disabled="!selectedRow"
                  export-title="Descargar"
                  delete-title="Desactivar"
                  edit-title="Editar"
                  add-title="Nueva relación"
                  @export="exportarExcel"
                  @delete="showDesactivar = true"
                  @edit="editarSeleccionado"
                  @add="showAlta = true"
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
                <span
                  class="jobtype-filter-clear"
                  @click="clearFilter(filterModel, filterCallback)"
                >x</span>
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
      :message="store.error ?? ''"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import AltaJobtypeContratoDialog from '../dialogs/AltaJobtypeContratoDialog.vue'
import EditarJobtypeContratoDialog from '../dialogs/EditarJobtypeContratoDialog.vue'
import ConfirmarDesactivacionDialog from '../dialogs/ConfirmarDesactivacionDialog.vue'
import { JOBTYPE_CONTRATO_COLUMNS } from '../config/columns'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const store = useJobtypeContratoStore()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const selectedRow = ref(null)
const mainFirst = ref(0)
const mainPageRows = ref(100)
const showAlta = ref(false)
const showEditar = ref(false)
const showDesactivar = ref(false)
const showError = ref(false)

const editForm = ref({
  tareaContratoId: 0,
  contratoTipoId: 0,
  jobtype: '',
  contratoActual: '',
  pais: '',
  origenActual: ''
})

const columns = JOBTYPE_CONTRATO_COLUMNS
const visibleColumns = computed(() => columns.filter((col) => !col.hidden))

const mainFilters = ref(
  Object.fromEntries(
    visibleColumns.value
      .filter((col) => col.filter)
      .map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

const buscar = async () => {
  resultsExpanded.value = true
  mainFirst.value = 0
  selectedRow.value = null

  try {
    await store.fetchRelaciones()
  } catch {
    showError.value = true
  }
}

const onRowClick = ({ data }) => {
  selectedRow.value = data
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const editarSeleccionado = () => {
  if (!selectedRow.value) return

  editForm.value = {
    tareaContratoId: selectedRow.value.tareaContratoId,
    contratoTipoId: selectedRow.value.contratoTipoId,
    jobtype: selectedRow.value.tareaNombre,
    contratoActual: selectedRow.value.contratoNombre,
    pais: selectedRow.value.pais,
    origenActual: selectedRow.value.origen ?? ''
  }
  showEditar.value = true
}

const onDesactivacionConfirmada = async () => {
  if (!selectedRow.value) return

  try {
    await store.desactivarRelacion(selectedRow.value.tareaContratoId)
    selectedRow.value = null
    await store.fetchRelaciones()
  } catch {
    showError.value = true
  }
}

const onRelacionado = async () => {
  selectedRow.value = null
  try {
    await store.fetchRelaciones()
  } catch {
    showError.value = true
  }
}

const onActualizado = async () => {
  selectedRow.value = null
  try {
    await store.fetchRelaciones()
  } catch {
    showError.value = true
  }
}

const exportarExcel = () => {
  if (!store.relaciones.length) return

  const exportCols = columns.filter((column) => column.exportable)
  const headers = exportCols.map((column) => column.header)
  const lines = store.relaciones.map((row) =>
    exportCols.map((column) => JSON.stringify(row[column.field] ?? '')).join(',')
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
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr.p-datatable-row-selected > td),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr.p-datatable-row-selected:hover > td),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[data-p-selected='true'] > td),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[data-p-selected='true']:hover > td),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[aria-selected='true'] > td),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[aria-selected='true']:hover > td) {
  background: #9ee7ee !important;
  color: #111 !important;
}

.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr.p-datatable-row-selected > td *),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[data-p-selected='true'] > td *),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-tbody > tr[aria-selected='true'] > td *) {
  color: #111 !important;
}

.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-emptymessage > td),
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-empty-message > td) {
  position: relative !important;
  height: 120px !important;
  padding: 0 !important;
  text-align: center !important;
  vertical-align: middle !important;
  background: #e8f9fc !important;
  color: transparent !important;
}

.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-emptymessage > td)::after,
.jobtype-screen :deep(#tabla-jobtype-contrato .p-datatable-empty-message > td)::after {
  content: 'No hay resultados';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #075f6d;
  font-size: 12px;
  font-weight: 400;
}
</style>
