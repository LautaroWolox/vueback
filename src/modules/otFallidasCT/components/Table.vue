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
      @page="onPage"
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
          Mostrando {{ firstDisplayed }} - {{ lastDisplayed }} de {{ store.rows.length }}
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
const pageState = ref({ first: 0, rows: 10 })
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

const firstDisplayed = computed(() => (
  store.rows.length ? pageState.value.first + 1 : 0
))

const lastDisplayed = computed(() => Math.min(
  pageState.value.first + pageState.value.rows,
  store.rows.length
))

const onPage = (event) => {
  pageState.value = {
    first: event.first ?? 0,
    rows: event.rows ?? 10
  }
}

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
  min-height: 0;
  border-left-width: 4px !important;
  background: #fff !important;
}

:deep(#tabla.fm-pass-grid),
:deep(#tabla.p-datatable) {
  width: 100% !important;
  max-width: 100% !important;
  border-left: 0 !important;
  background: #fff !important;
}

:deep(#tabla .p-datatable-table-container),
:deep(#tabla .p-datatable-wrapper) {
  min-height: 186px !important;
  max-height: 470px !important;
  max-width: 100% !important;
  overflow: auto !important;
  border: 1px solid #d1d1d1 !important;
  background: #fff !important;
}

:deep(#tabla .p-datatable-table) {
  width: max-content !important;
  min-width: 100% !important;
  table-layout: fixed !important;
  border-collapse: collapse !important;
  font-size: 12px !important;
}

:deep(#tabla .p-datatable-thead > tr > th),
:deep(#tabla .p-datatable-tbody > tr > td) {
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  vertical-align: middle !important;
}

:deep(#tabla .p-datatable-thead > tr > th) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 4px 7px !important;
  background: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
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
  color: #263238 !important;
  font-size: 12px !important;
}

:deep(#tabla .p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(#tabla .p-datatable-tbody > tr:hover > td) {
  background: #edfafd !important;
}

:deep(#tabla .fm-selected-row > td),
:deep(#tabla .p-datatable-row-selected > td),
:deep(#tabla .p-highlight > td) {
  background: #9eeff7 !important;
  color: #263238 !important;
}

:deep(#tabla .fm-disabled-row > td) {
  background: #fff !important;
  color: #8b8b8b !important;
}

:deep(#tabla .fm-disabled-row .p-checkbox) {
  pointer-events: none;
  opacity: .45;
}

:deep(#tabla .fm-filter-cell) {
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  width: 100% !important;
  min-width: 0 !important;
}

:deep(#tabla .fm-filter-prefix),
:deep(#tabla .fm-filter-more) {
  flex: 0 0 auto !important;
  color: #000 !important;
  font-size: 11px !important;
}

:deep(#tabla .fm-column-filter) {
  width: 100% !important;
  min-width: 0 !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 3px 6px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  font-size: 12px !important;
  box-sizing: border-box !important;
}

:deep(#tabla .fm-column-filter:focus) {
  outline: none !important;
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, .14) !important;
}

:deep(#tabla .p-datatable-empty-message > td),
:deep(#tabla .fm-grid-empty) {
  height: 110px !important;
  min-height: 110px !important;
  background: #eafcff !important;
  text-align: center !important;
  color: #407080 !important;
}

:deep(#tabla .p-checkbox-box) {
  width: 14px !important;
  height: 14px !important;
  border-color: #9eb4bd !important;
}

:deep(#tabla .p-checkbox-checked .p-checkbox-box),
:deep(#tabla .p-checkbox.p-highlight .p-checkbox-box) {
  background: #00a9bd !important;
  border-color: #00a9bd !important;
}

:deep(#tabla .p-paginator) {
  min-height: 38px !important;
  height: 38px !important;
  display: flex !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 2px !important;
  padding: 3px 150px !important;
  border: 1px solid #d1d1d1 !important;
  border-top: 0 !important;
  background: #fff !important;
  font-size: 12px !important;
  position: relative !important;
  overflow: visible !important;
}

:deep(#tabla .p-paginator-content-start),
:deep(#tabla .p-paginator-left-content) {
  position: absolute !important;
  left: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  display: flex !important;
  align-items: center !important;
  margin: 0 !important;
}

:deep(#tabla .p-paginator-content-end),
:deep(#tabla .p-paginator-right-content) {
  position: absolute !important;
  right: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  display: flex !important;
  align-items: center !important;
  margin: 0 !important;
}

:deep(#tabla .p-paginator-first),
:deep(#tabla .p-paginator-prev),
:deep(#tabla .p-paginator-next),
:deep(#tabla .p-paginator-last) {
  width: 28px !important;
  min-width: 28px !important;
  height: 28px !important;
  min-height: 28px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 50% !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(#tabla .p-paginator-current) {
  min-width: 106px !important;
  margin: 0 7px !important;
  color: #294457 !important;
  font-size: 12px !important;
  text-align: center !important;
  white-space: nowrap !important;
}

:deep(#tabla .p-paginator-rpp-dropdown),
:deep(#tabla .p-paginator .p-select) {
  width: 74px !important;
  min-width: 74px !important;
  height: 28px !important;
  min-height: 28px !important;
  margin-left: 8px !important;
  border-radius: 3px !important;
}

:deep(#tabla .p-paginator .p-disabled) {
  opacity: .28 !important;
}

.fm-grid-counter {
  color: #222;
  font-size: 12px;
  white-space: nowrap;
}

:deep(#tabla .fm-grid-actions-final) {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
}

:deep(#tabla .fm-grid-action-final),
:deep(#tabla .fm-grid-actions-final .p-button) {
  width: 24px !important;
  min-width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #173142 !important;
  box-shadow: none !important;
}

:deep(#tabla .fm-grid-actions-final .pi) {
  font-size: 17px !important;
}

.otf-row-action {
  margin: 0 auto;
}

:deep(#tabla .otf-row-action) {
  width: 24px !important;
  min-width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 !important;
  color: #001f2f !important;
  background: transparent !important;
}

:deep(#tabla .otf-row-action .pi) {
  font-size: 16px !important;
}

@media (max-width: 900px) {
  :deep(#tabla .p-paginator) {
    min-height: 76px !important;
    height: auto !important;
    padding: 5px 8px 38px !important;
  }

  :deep(#tabla .p-paginator-content-start),
  :deep(#tabla .p-paginator-left-content) {
    top: auto !important;
    bottom: 5px !important;
    transform: none !important;
  }

  :deep(#tabla .p-paginator-content-end),
  :deep(#tabla .p-paginator-right-content) {
    top: auto !important;
    bottom: 9px !important;
    transform: none !important;
  }
}
</style>
