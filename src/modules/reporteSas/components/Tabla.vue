<template>
  <div class="reporte-sas-table-shell">
    <DataTable
      id="tabla-reporte-sas"
      ref="dt"
      v-model:filters="filters"
      v-model:first="first"
      v-model:rows="pageRows"
      class="fm-pass-grid reporte-sas-main-grid"
      :value="store.rows"
      dataKey="_rowKey"
      :tableStyle="reporteSasTableStyle"
      scrollable
      scrollHeight="flex"
      removableSort
      sortMode="single"
      filterDisplay="row"
      paginator
      :rowsPerPageOptions="reporteSasRowsOptions"
      :resizableColumns="true"
      columnResizeMode="fit"
      showGridlines
    >
      <template
        #paginatorcontainer="{
          first: paginatorFirst,
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
          :first="paginatorFirst"
          :last="last"
          :page="page"
          :page-count="Math.max(pageCount, 1)"
          :rows="rows"
          :total-records="totalRecords"
          :rows-options="reporteSasRowsOptions"
          :show-rows-select="true"
          :show-counter="true"
          :auto-max-rows="false"
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
              size="large"
              :show-delete="false"
              :show-refresh="false"
              export-title="Descargar reporte"
              @export="exportarExcel"
            />
          </template>
        </FmGridPaginator>
      </template>

      <template #empty>
        <div class="fm-grid-empty">No hay resultados</div>
      </template>

      <Column
        v-for="column in reporteSasColumns"
        :key="column.field"
        :field="column.field"
        :sortField="column.field"
        :filterField="column.field"
        :header="column.header"
        sortable
        filter
        :showFilterMenu="false"
        :exportable="column.exportable !== false"
        :style="columnStyle(column)"
        :headerStyle="columnStyle(column)"
        :bodyStyle="columnStyle(column)"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div class="fm-filter-cell reporte-sas-filter-cell">
            <span class="fm-filter-prefix">~</span>
            <InputText
              v-model="filterModel.value"
              type="text"
              class="fm-column-filter reporte-sas-filter-input"
              @input="filterCallback()"
            />
            <button
              type="button"
              class="reporte-sas-filter-clear"
              title="Limpiar filtro"
              aria-label="Limpiar filtro"
              @click="clearColumnFilter(filterModel, filterCallback)"
            >×</button>
          </div>
        </template>

        <template #body="{ data }">
          <button
            v-if="column.type === 'legajoList'"
            type="button"
            class="reporte-sas-legajo-preview"
            :class="{ 'reporte-sas-legajo-preview--expanded': isExpanded(data, column.field) }"
            :title="String(data[column.field] ?? '')"
            @click="toggleExpanded(data, column.field)"
          >
            <span>
              {{
                isExpanded(data, column.field)
                  ? getLegajosArray(data[column.field]).join(', ')
                  : getLegajosPreview(data[column.field])
              }}
            </span>
            <i
              v-if="isExpandable(data[column.field])"
              class="pi"
              :class="
                isExpanded(data, column.field)
                  ? 'pi-chevron-up'
                  : 'pi-chevron-down'
              "
              aria-hidden="true"
            />
          </button>

          <span
            v-else
            class="fm-cell-text reporte-sas-cell-text"
            :title="String(data[column.field] ?? '')"
          >
            {{ data[column.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import { useReporteSasStore } from '../store/reporteSasStore'
import {
  createReporteSasFilters,
  reporteSasColumns,
  reporteSasRowsOptions,
  reporteSasTableStyle,
} from './columns'

const store = useReporteSasStore()
const { exportToExcel } = useExcelExport()

const dt = ref(null)
const first = ref(0)
const pageRows = ref(500)
const filters = ref(createReporteSasFilters())
const expandedCells = ref({})

const columnStyle = (column) => ({
  width: column.width,
  minWidth: column.width,
  maxWidth: column.width,
})

const clearColumnFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
  first.value = 0
}

const getLegajosArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const isExpandable = (value) => getLegajosArray(value).length > 2

const getLegajosPreview = (value) => {
  const legajos = getLegajosArray(value)
  if (legajos.length <= 2) return legajos.join(', ')
  return `${legajos.slice(0, 2).join(', ')} (+${legajos.length - 2} más)`
}

const getExpandedKey = (row, field) => `${row?._rowKey ?? ''}_${field}`

const isExpanded = (row, field) =>
  Boolean(expandedCells.value[getExpandedKey(row, field)])

const toggleExpanded = (row, field) => {
  if (!isExpandable(row?.[field])) return

  const key = getExpandedKey(row, field)
  expandedCells.value[key] = !expandedCells.value[key]
}

const exportarExcel = () => {
  if (!store.rows.length) return

  const exportColumns = reporteSasColumns.filter(
    (column) => column.exportable !== false
  )
  const fields = exportColumns.map((column) => column.field)

  exportToExcel({
    rows: store.rows,
    fields,
    columns: exportColumns,
    filename: 'reporteSAS.xlsx',
    columnTypes: {},
    groupField: 'codTarea',
  })
}
</script>

<style scoped>
.reporte-sas-table-shell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;
  background: #fff;
}

.reporte-sas-main-grid,
.reporte-sas-main-grid.p-datatable {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  border: 0 !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-table-container),
.reporte-sas-main-grid :deep(.p-datatable-wrapper),
.reporte-sas-main-grid :deep([data-pc-section='tablecontainer']) {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-table) {
  table-layout: fixed !important;
  border-collapse: collapse !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr > th) {
  height: 32px !important;
  min-height: 32px !important;
  padding: 0 7px !important;
  border: 1px solid #bcbcbc !important;
  background: #f1f1f1 !important;
  color: #242424 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 1.1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th),
.reporte-sas-main-grid :deep(.p-datatable-thead > tr.p-filter-row > th) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 3px 5px !important;
  border-top: 0 !important;
  background: #fff !important;
}

.reporte-sas-main-grid :deep(.p-datatable-tbody > tr > td) {
  height: 31px !important;
  min-height: 31px !important;
  padding: 3px 7px !important;
  border: 1px solid #d3d3d3 !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 1.2 !important;
  vertical-align: middle !important;
  overflow: hidden !important;
}

.reporte-sas-main-grid :deep(.p-sortable-column-badge),
.reporte-sas-main-grid :deep(.p-datatable-sort-badge),
.reporte-sas-main-grid :deep([data-pc-section='sortbadge']) {
  display: none !important;
}

.reporte-sas-main-grid :deep(.p-datatable-paginator-bottom),
.reporte-sas-main-grid :deep(> .p-paginator) {
  width: 100% !important;
  height: 40px !important;
  min-height: 40px !important;
  flex: 0 0 40px !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.reporte-sas-filter-cell {
  grid-template-columns: 10px minmax(0, 1fr) 16px !important;
}

.reporte-sas-filter-input,
.reporte-sas-filter-input.p-inputtext {
  width: 100% !important;
  min-width: 0 !important;
  height: 26px !important;
  min-height: 26px !important;
  padding: 1px 5px !important;
  font-size: 12px !important;
}

.reporte-sas-filter-clear {
  width: 16px;
  min-width: 16px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.reporte-sas-filter-clear:hover {
  color: #00a9bd;
}

.reporte-sas-cell-text {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reporte-sas-legajo-preview {
  appearance: none;
  width: 100%;
  min-width: 0;
  min-height: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 2px 5px;
  border: 1px solid #cfe1e6;
  border-radius: 3px;
  background: #fff;
  color: #263238;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.reporte-sas-legajo-preview > span {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reporte-sas-legajo-preview--expanded {
  min-height: 31px;
  white-space: normal;
}

.reporte-sas-legajo-preview--expanded > span {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}
</style>
