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
      tableStyle="table-layout: fixed; min-width: 100%; width: max-content"
      scrollable
      scrollHeight="430px"
      :rowClass="rowClass"
      :isDataSelectable="isRowSelectable"
      :selectAll="allSelectableSelected"
      resizableColumns
      columnResizeMode="fit"
      removableSort
      sortMode="multiple"
      filterDisplay="row"
      selectionMode="multiple"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 50, 100, 500]"
      showGridlines
      @select-all-change="onSelectAllChange"
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
        <div class="otf-custom-paginator">
          <FmGridActions
            class="otf-custom-paginator__actions"
            size="large"
            :delete-disabled="!hasSelectedRows"
            :refresh-disabled="!hasSelectedRows"
            @export="exportarExcel"
            @delete="excluir"
            @refresh="reprocesar"
          />

          <div class="otf-custom-paginator__navigation" aria-label="Paginación">
            <button
              type="button"
              class="otf-page-button"
              title="Primera página"
              aria-label="Primera página"
              :disabled="page === 0 || pageCount === 0"
              @click="firstPageCallback"
            >|&lt;</button>

            <button
              type="button"
              class="otf-page-button"
              title="Página anterior"
              aria-label="Página anterior"
              :disabled="page === 0 || pageCount === 0"
              @click="prevPageCallback"
            >&lt;</button>

            <span class="otf-page-label">Pagina</span>
            <input
              class="otf-page-input"
              type="number"
              min="1"
              :max="Math.max(pageCount, 1)"
              :value="pageCount ? page + 1 : 0"
              :disabled="pageCount === 0"
              aria-label="Número de página"
              @change="changePageFromInput($event, pageCount, changePageCallback)"
            />
            <span class="otf-page-total">de {{ pageCount }}</span>

            <button
              type="button"
              class="otf-page-button"
              title="Página siguiente"
              aria-label="Página siguiente"
              :disabled="pageCount === 0 || page >= pageCount - 1"
              @click="nextPageCallback"
            >&gt;</button>

            <button
              type="button"
              class="otf-page-button"
              title="Última página"
              aria-label="Última página"
              :disabled="pageCount === 0 || page >= pageCount - 1"
              @click="lastPageCallback"
            >&gt;|</button>

            <select
              class="otf-rows-select"
              :value="rows"
              aria-label="Filas por página"
              @change="changeRows($event, rowChangeCallback)"
            >
              <option v-for="option in [10, 50, 100, 500]" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <span class="otf-custom-paginator__counter">
            Mostrando {{ totalRecords ? first + 1 : 0 }} - {{ last }} de {{ totalRecords }}
          </span>
        </div>
      </template>

      <template #empty>
        <div class="fm-grid-empty">No hay resultados</div>
      </template>

      <Column
        selectionMode="multiple"
        style="width: 44px; min-width: 44px"
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
              v-if="hasNote(data)"
              type="button"
              class="otf-row-action otf-row-action--note"
              :class="{ 'otf-row-action--note-excluded': data.excluida === 'S' }"
              title="Ver nota"
              aria-label="Ver nota"
              @click.stop="showNote(data)"
            >
              <svg class="otf-row-action__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h10M4 11h8M4 16h6" />
                <path d="m14.5 14.5 4.8-4.8 2 2-4.8 4.8-3.2 1.2 1.2-3.2Z" />
              </svg>
            </button>
          </template>

          <template v-else-if="col.field === 'incluir'">
            <button
              type="button"
              class="otf-row-action otf-row-action--include"
              :class="{ 'otf-row-action--disabled': data.excluida !== 'S' }"
              :disabled="data.excluida !== 'S'"
              :title="data.excluida === 'S' ? 'Incluir OT' : 'OT no disponible para incluir'"
              :aria-label="data.excluida === 'S' ? 'Incluir OT' : 'OT no disponible para incluir'"
              @click.stop="openInclude(data)"
            >
              <svg class="otf-row-action__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12a7 7 0 1 1 2.05 4.95" />
                <path d="M5 17v-5h5" />
                <circle cx="12" cy="12" r="1.2" class="otf-row-action__dot" />
              </svg>
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
const hasSelectedRows = computed(() => store.selectedRows.length > 0)
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

const columnStyle = (column) => ({
  width: column.width || '120px',
  minWidth: '48px'
})

const changePageFromInput = (event, pageCount, changePageCallback) => {
  if (!pageCount) return

  const rawValue = Number(event.target.value)
  const requestedPage = Number.isFinite(rawValue) ? rawValue : 1
  const normalizedPage = Math.min(Math.max(requestedPage, 1), pageCount)

  event.target.value = String(normalizedPage)
  changePageCallback(normalizedPage - 1)
}

const changeRows = (event, rowChangeCallback) => {
  const rows = Number(event.target.value)
  if (Number.isFinite(rows) && rows > 0) rowChangeCallback(rows)
}

const hasNote = (data) => {
  const note = data?.nota
  return note !== null && note !== undefined && String(note).trim().length > 0
}

const showMessage = (message) => {
  alertMessage.value = message
  showAlert.value = true
}

const showNote = (data) => {
  if (!hasNote(data)) return
  selectedNote.value = data.nota
  showNota.value = true
}

const openInclude = (data) => {
  if (data?.excluida !== 'S') return
  store.nroOT = data.nroOrdenTrabajo
  showIncluir.value = true
}

const excluir = () => {
  if (!hasSelectedRows.value) return
  showExcluir.value = true
}

const reprocesar = () => {
  if (!hasSelectedRows.value) return
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
