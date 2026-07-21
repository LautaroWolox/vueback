<template>
  <FmGridShell
    class="otf-grid-shell"
    :loading="store.loading"
    loading-title="Procesando OTs"
    loading-message="Consultando datos y preparando la grilla"
  >
    <DataTable
      id="tabla"
      ref="dt"
      v-model:filters="filters"
      v-model:selection="selectedRows"
      :value="store.rows"
      dataKey="id"
      class="fm-pass-grid otf-grid"
      tableStyle="table-layout: fixed; width: max-content; min-width: 100%"
      scrollable
      scrollHeight="430px"
      :rowClass="rowClass"
      :isDataSelectable="isRowSelectable"
      :selectAll="allSelectableSelected"
      resizableColumns
      columnResizeMode="expand"
      removableSort
      sortMode="multiple"
      filterDisplay="row"
      selectionMode="multiple"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 50, 100, 500]"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Página {currentPage} de {totalPages}"
      showGridlines
      @select-all-change="onSelectAllChange"
    >
      <template #paginatorstart>
        <FmGridActions
          size="large"
          @export="exportarExcel"
          @delete="excluir"
          @refresh="reprocesar"
        />
      </template>

      <template #paginatorend>
        <span class="fm-grid-counter">
          Mostrando {{ store.rows.length ? 1 : 0 }} - {{ Math.min(10, store.rows.length) }} de {{ store.rows.length }}
        </span>
      </template>

      <template #empty>
        <div class="fm-grid-empty">No hay resultados</div>
      </template>

      <Column
        selectionMode="multiple"
        headerStyle="width: 36px; min-width: 36px; max-width: 36px"
        bodyStyle="width: 36px; min-width: 36px; max-width: 36px"
      />

      <Column
        v-for="col in cols"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sort !== false"
        :filter="col.filter !== false"
        :filterField="col.field"
        :showFilterMenu="false"
        :hidden="col.hidden"
        :exportable="col.exportable"
        :style="columnStyle(col.field)"
        :headerStyle="columnStyle(col.field)"
        :bodyStyle="columnStyle(col.field)"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div v-if="col.filter !== false" class="fm-filter-cell">
            <span class="fm-filter-prefix">~</span>
            <InputText
              v-model="filterModel.value"
              type="text"
              class="fm-column-filter"
              @input="filterCallback()"
            />
            <span class="fm-filter-more">...</span>
          </div>
        </template>

        <template #body="{ data }">
          <template v-if="col.field === 'tieneNota'">
            <button
              v-if="data.nota"
              type="button"
              class="fm-icon-btn otf-row-action"
              title="Ver nota"
              aria-label="Ver nota"
              @click.stop="showNote(data)"
            >
              <i class="pi pi-file-edit"></i>
            </button>
          </template>

          <template v-else-if="col.field === 'incluir'">
            <button
              v-if="data.excluida === 'S'"
              type="button"
              class="fm-icon-btn otf-row-action"
              title="Incluir OT"
              aria-label="Incluir OT"
              @click.stop="openInclude(data)"
            >
              <i class="pi pi-undo"></i>
            </button>
          </template>

          <span v-else class="fm-cell-text" :title="String(data[col.field] ?? '')">
            {{ data[col.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>

    <ExcluirDialog
      v-model:visibleExc="showExcluir"
      :selected-rows="selectedRows"
    />

    <IncluirDialog v-model:visibleInc="showIncluir" />

    <NotaDialog
      v-model:visible="showNota"
      :note="selectedNote"
    />

    <ReprocesoDialog
      v-model:visible="showReproceso"
      :count="store.selectedRows.length"
      @confirm="confirmReprocess"
    />

    <FmAlertDialog
      v-model:visible="showAlert"
      title="Alerta"
      :message="alertMessage"
    />
  </FmGridShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'
import { columns } from './columns'
import { useFallidasCtStore } from '../store/CtFallidaStore'
import ExcluirDialog from './ExcluirDialog.vue'
import IncluirDialog from './IncluirDialog.vue'
import NotaDialog from './NotaDialog.vue'
import ReprocesoDialog from './ReprocesoDialog.vue'
import { useExcelExport } from '@/composables/useExportExcel'

const store = useFallidasCtStore()
const cols = ref(columns)
const dt = ref()
const showExcluir = ref(false)
const showIncluir = ref(false)
const showNota = ref(false)
const showReproceso = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')
const selectedNote = ref('')
const { exportToExcel, parseDataFromTable } = useExcelExport()

const filters = ref(Object.fromEntries(
  columns
    .filter((column) => !column.hidden)
    .map((column) => [
      column.field,
      { value: null, matchMode: FilterMatchMode.CONTAINS }
    ])
))

const selectableRows = computed(() => store.rows.filter((row) => row.excluida !== 'S'))
const allSelectableSelected = computed(() => (
  selectableRows.value.length > 0 &&
  selectableRows.value.every((row) => store.selectedRows.includes(row.id))
))

const selectedRows = computed({
  get: () => store.rows.filter((row) => store.selectedRows.includes(row.id)),
  set: (value) => store.setSelectedRows(
    value
      .filter((row) => row.excluida !== 'S')
      .map((row) => row.id)
  )
})

const rowClass = (data) => ({
  'fm-disabled-row': data?.excluida === 'S',
  'fm-enabled-row': data?.excluida === 'N',
  'fm-selected-row': store.selectedRows.includes(data?.id)
})

const isRowSelectable = (event) => event?.data?.excluida !== 'S'

const onSelectAllChange = () => {
  store.setSelectedRows(
    allSelectableSelected.value
      ? []
      : selectableRows.value.map((row) => row.id)
  )
}

const columnStyle = (field) => {
  const widths = {
    nroOrdenTrabajo: '132px',
    fechaCierre: '145px',
    tareaCodigo: '100px',
    direccion: '180px',
    ciudad: '125px',
    provincia: '125px',
    region: '105px',
    pais: '72px',
    contratista: '190px',
    tecnicoCierre: '125px',
    actividades: '175px',
    sistemaOrigen: '115px',
    errorDescripcion: '190px',
    excluida: '82px',
    motivoExclusion: '160px',
    tieneNota: '60px',
    incluir: '60px'
  }

  const width = widths[field] || '120px'
  return {
    width,
    minWidth: width,
    maxWidth: width
  }
}

const showMessage = (message) => {
  alertMessage.value = message
  showAlert.value = true
}

const showNote = (data) => {
  selectedNote.value = data.nota || ''
  showNota.value = true
}

const openInclude = (data) => {
  store.nroOT = data.nroOrdenTrabajo
  showIncluir.value = true
}

const excluir = () => {
  if (!store.selectedRows.length) {
    showMessage('No hay datos para la consulta efectuada')
    return
  }
  showExcluir.value = true
}

const reprocesar = () => {
  if (!store.selectedRows.length) {
    showMessage('No hay datos para la consulta efectuada')
    return
  }
  showReproceso.value = true
}

const confirmReprocess = async () => {
  showReproceso.value = false
  await store.sendReproceso()
}

const exportarExcel = () => {
  const { rows, fields } = parseDataFromTable(dt)
  const exportedFields = fields.filter((field) => {
    const column = cols.value.find((item) => item.field === field)
    return column && column.exportable !== false
  })

  exportToExcel({
    rows,
    fields: exportedFields,
    columns: cols.value,
    filename: 'Ot_FallidasReproceso.xlsx',
    columnTypes: {},
    groupField: null
  })
}
</script>

<style scoped>
.otf-grid-shell {
  min-height: 300px;
  border-left-width: 2px !important;
}

:deep(#tabla.fm-pass-grid),
:deep(#tabla.p-datatable) {
  width: 100% !important;
  max-width: 100% !important;
  border-left: 2px solid #00a9bd !important;
}

:deep(#tabla .p-datatable-table-container),
:deep(#tabla .p-datatable-wrapper) {
  min-height: 300px !important;
  max-width: 100% !important;
  overflow: auto !important;
  background: #eafcff !important;
}

:deep(#tabla .p-datatable-table) {
  width: max-content !important;
  min-width: 100% !important;
  table-layout: fixed !important;
}

:deep(#tabla .p-datatable-thead > tr > th) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 4px 7px !important;
  background: #f3f7f9 !important;
  color: #173142 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
}

:deep(#tabla .p-datatable-thead > tr.p-datatable-filter-row > th),
:deep(#tabla .p-datatable-thead > tr.p-filter-row > th) {
  height: 34px !important;
  min-height: 34px !important;
  padding: 3px 5px !important;
  background: #fff !important;
}

:deep(#tabla .p-datatable-tbody > tr > td) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 5px 8px !important;
  color: #263746 !important;
  font-size: 12px !important;
  white-space: nowrap !important;
}

:deep(#tabla .p-datatable-tbody > tr:hover > td) {
  background: #f1fbfc !important;
}

:deep(#tabla .fm-selected-row > td) {
  background: #9debf3 !important;
  color: #112f39 !important;
  font-weight: 600 !important;
}

:deep(#tabla .fm-disabled-row > td) {
  background: #eef1f3 !important;
  color: #76858d !important;
}

:deep(#tabla .fm-disabled-row .p-checkbox) {
  pointer-events: none;
  opacity: .45;
}

:deep(#tabla .fm-filter-cell) {
  display: grid !important;
  grid-template-columns: auto minmax(45px, 1fr) auto !important;
  align-items: center !important;
  gap: 4px !important;
  width: 100% !important;
}

:deep(#tabla .fm-column-filter) {
  width: 100% !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 2px 5px !important;
  border: 1px solid #c5d1d8 !important;
  border-radius: 2px !important;
  background: #fff !important;
  font-size: 11px !important;
}

:deep(#tabla .p-paginator) {
  min-height: 42px !important;
  padding: 4px 9px !important;
  border: 1px solid #d4dde2 !important;
  border-top: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
}

:deep(#tabla .p-paginator-content) {
  width: 100% !important;
  display: grid !important;
  grid-template-columns: 1fr auto 1fr !important;
  align-items: center !important;
}

:deep(#tabla .p-paginator-start) {
  justify-self: start !important;
}

:deep(#tabla .p-paginator-end) {
  justify-self: end !important;
}

:deep(#tabla .p-paginator-page),
:deep(#tabla .p-paginator-first),
:deep(#tabla .p-paginator-prev),
:deep(#tabla .p-paginator-next),
:deep(#tabla .p-paginator-last) {
  width: 30px !important;
  min-width: 30px !important;
  height: 30px !important;
  min-height: 30px !important;
  border-radius: 50% !important;
  color: #45606f !important;
}

:deep(#tabla .p-paginator-rpp-dropdown),
:deep(#tabla .p-paginator .p-select) {
  width: 82px !important;
  min-width: 82px !important;
  height: 30px !important;
  min-height: 30px !important;
}

.fm-grid-counter {
  padding-right: 8px;
  color: #222;
  font-size: 12px;
  white-space: nowrap;
}

:deep(#tabla .fm-grid-actions-final) {
  gap: 12px !important;
}

:deep(#tabla .fm-grid-action-final),
:deep(#tabla .fm-grid-actions-final .p-button) {
  width: 25px !important;
  min-width: 25px !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 0 !important;
  color: #001f2f !important;
}

:deep(#tabla .fm-grid-action-final .pi),
:deep(#tabla .fm-grid-actions-final .p-button .pi) {
  font-size: 18px !important;
  line-height: 18px !important;
}

.otf-row-action {
  width: 24px !important;
  min-width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  margin: 0 auto;
  color: #001f2f !important;
}

.otf-row-action .pi {
  font-size: 17px !important;
}
</style>
