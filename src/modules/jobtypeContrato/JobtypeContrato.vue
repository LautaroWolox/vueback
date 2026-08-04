<template>
  <div class="jobtype-screen">
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
          :rowClass="rowClass"
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
                  @delete="solicitarDesactivacion"
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
            <template #filter="{ filterModel, filterCallback }">
              <div class="jobtype-filter-cell">
                <span class="jobtype-filter-symbol">~</span>
                <InputText
                  v-model="filterModel.value"
                  class="jobtype-filter-input"
                  type="text"
                  @input="filterCallback()"
                />
                <span class="jobtype-filter-clear" @click="clearFilter(filterModel, filterCallback)">x</span>
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
      :origen="editForm.origen"
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'
import FmButton from '@/components/shared/FmButton.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'
import LoadingOverlay from '@/modules/shared/components/LoadingOverlay.vue'
import AltaJobtypeContratoDialog from './AltaJobtypeContratoDialog.vue'
import EditarJobtypeContratoDialog from './EditarJobtypeContratoDialog.vue'
import ConfirmarDesactivacionDialog from './ConfirmarDesactivacionDialog.vue'
import { useJobtypeContratoStore } from './jobtypeContratoStore'

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
  contratoTipoId: 0,
  jobtype: '',
  contratoActual: '',
  pais: '',
  origen: ''
})

const columns = [
  { field: 'tareaContratoId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'tareaId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'contratoTipoId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'tareaCodigo', header: 'CODIGO_TAREA', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'tareaNombre', header: 'TAREA', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'origen', header: 'ORIGEN', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'contratoNombre', header: 'NOMBRE_CONTRATO', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'legajoModificacion', header: 'USUARIO_MODIFICACION', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'activo', header: 'ACTIVO', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'pais', header: 'PAIS', width: '12.5%', exportable: true, filter: true, sort: true }
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

const onRowClick = ({ data }) => {
  if (data.activo === 'N') return
  selectedRow.value = data
}

const rowClass = (data) => {
  return data.activo === 'N' ? 'jobtype-row-inactive' : ''
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
    origen: selectedRow.value.origen || ''
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
