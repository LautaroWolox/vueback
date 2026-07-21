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
      currentPageReportTemplate="Pagina {currentPage} de {totalPages}"
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
        headerStyle="width: 3rem; min-width: 3rem"
        bodyStyle="width: 3rem; min-width: 3rem"
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
        :style="columnStyle(col)"
        :headerStyle="columnStyle(col)"
        :bodyStyle="columnStyle(col)"
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

const columnStyle = (column) => ({
  width: column.width || '120px',
  minWidth: column.minWidth || column.width || '80px'
})

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

<style scoped src="./otf-table.css"></style>
