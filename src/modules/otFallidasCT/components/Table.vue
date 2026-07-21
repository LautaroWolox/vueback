<template>
  <FmGridShell
    class="otf-grid-shell"
    :loading="store.loading"
    loading-title="Cargando aviso"
    loading-message="Preparando el mensaje"
  >
    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:selection="selectedRows"
      :value="store.rows"
      dataKey="id"
      class="fm-pass-grid otf-grid"
      tableStyle="table-layout: fixed; width: 100%"
      scrollable
      scrollHeight="430px"
      :rowClass="rowClass"
      resizableColumns
      columnResizeMode="expand"
      removableSort
      sortMode="multiple"
      filterDisplay="row"
      selectionMode="multiple"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 50, 100, 250, 500]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords}"
      showGridlines
    >
      <template #paginatorstart>
        <FmGridActions
          size="large"
          @export="exportarExcel"
          @delete="excluir"
          @refresh="reprocesar"
        />
      </template>

      <template #empty>
        <div class="fm-grid-empty">No hay resultados</div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 34px" />

      <Column
        v-for="col in cols"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sort"
        :filter="col.filter"
        :filterField="col.field"
        :showFilterMenu="false"
        :hidden="col.hidden"
        :exportable="col.exportable"
        :style="columnStyle(col.field)"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div v-if="col.filter" class="fm-filter-cell">
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

const filters = ref({
  nroOrdenTrabajo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  tareaCodigo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  tecnicoCierre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  contratista: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
})

const selectedRows = computed({
  get: () => store.rows.filter((row) => store.selectedRows.includes(row.id)),
  set: (value) => store.setSelectedRows(value.map((row) => row.id))
})

const rowClass = (data) => ({
  'fm-disabled-row': data?.excluida === 'S',
  'fm-enabled-row': data?.excluida === 'N'
})

const columnStyle = (field) => {
  const widths = {
    nroOrdenTrabajo: 'width: 130px',
    fechaCierre: 'width: 145px',
    tareaCodigo: 'width: 100px',
    direccion: 'width: 180px',
    ciudad: 'width: 125px',
    provincia: 'width: 125px',
    region: 'width: 105px',
    pais: 'width: 72px',
    contratista: 'width: 190px',
    tecnicoCierre: 'width: 125px',
    actividades: 'width: 170px',
    sistemaOrigen: 'width: 115px',
    errorDescripcion: 'width: 190px',
    excluida: 'width: 82px',
    motivoExclusion: 'width: 160px',
    tieneNota: 'width: 60px',
    incluir: 'width: 60px'
  }
  return widths[field] || 'width: 120px'
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
}

.otf-grid :deep(.p-datatable-table-container) {
  min-height: 210px;
  background: #eafcff;
}

.otf-row-action {
  margin: 0 auto;
}

.otf-row-action .pi {
  font-size: 16px;
}

:deep(.fm-disabled-row > td) {
  background: #eef1f3 !important;
  color: #76858d !important;
}

:deep(.fm-disabled-row .p-checkbox) {
  pointer-events: none;
  opacity: .45;
}
</style>
