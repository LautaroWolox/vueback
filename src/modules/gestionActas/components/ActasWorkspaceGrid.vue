<template>
  <div class="actas-work-grid-shell">
    <div v-if="title || $slots.toolbar" class="actas-work-grid-toolbar">
      <div class="actas-work-grid-title">
        <strong>{{ title }}</strong>
        <span>{{ rows.length }} registro{{ rows.length === 1 ? '' : 's' }}</span>
      </div>
      <div v-if="$slots.toolbar" class="actas-work-grid-toolbar__actions">
        <slot name="toolbar" />
      </div>
    </div>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:first="first"
      v-model:rows="pageRows"
      v-model:expandedRows="expandedRowsProxy"
      :selection="selection"
      :value="rows"
      :dataKey="dataKey"
      class="fm-pass-grid actas-work-grid"
      scrollable
      scrollHeight="flex"
      filterDisplay="row"
      removableSort
      sortMode="single"
      paginator
      :rowsPerPageOptions="rowsOptions"
      :resizableColumns="true"
      columnResizeMode="fit"
      showGridlines
      stripedRows
      @update:selection="$emit('update:selection', $event)"
      @row-expand="$emit('row-expand', $event)"
      @row-collapse="$emit('row-collapse', $event)"
    >
      <template
        #paginatorcontainer="{
          first: paginatorFirst,
          last,
          page,
          pageCount,
          rows: paginatorRows,
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
          :rows="paginatorRows"
          :total-records="totalRecords"
          :rows-options="rowsOptions"
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
              v-if="showExport || showRefresh || $slots.actions"
              size="large"
              :show-export="showExport"
              :show-delete="false"
              :show-refresh="showRefresh"
              :show-add="false"
              :export-disabled="!rows.length"
              :refresh-disabled="refreshDisabled"
              :export-title="exportTitle"
              :refresh-title="refreshTitle"
              @export="exportRows"
              @refresh="$emit('refresh')"
            />
            <slot name="actions" />
          </template>
        </FmGridPaginator>
      </template>

      <template #empty>
        <div class="fm-grid-empty">{{ emptyText }}</div>
      </template>

      <Column
        v-if="selectable"
        selectionMode="multiple"
        :exportable="false"
        style="width: 44px; min-width: 44px; max-width: 44px"
      />
      <Column
        v-if="expandable"
        expander
        :exportable="false"
        style="width: 42px; min-width: 42px; max-width: 42px"
      />

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :sortable="column.sortable !== false"
        :filter="filterable && column.filterable !== false"
        :showFilterMenu="false"
        :exportable="column.exportable !== false"
        :style="columnStyle(column)"
        :headerStyle="columnStyle(column)"
        :bodyStyle="columnStyle(column)"
      >
        <template v-if="filterable && column.filterable !== false" #filter="{ filterModel, filterCallback }">
          <div class="fm-filter-cell actas-work-filter-cell">
            <span class="fm-filter-prefix">~</span>
            <InputText
              v-model="filterModel.value"
              class="fm-column-filter actas-work-filter-input"
              @input="filterCallback()"
            />
            <button
              type="button"
              class="actas-work-filter-clear"
              title="Limpiar filtro"
              aria-label="Limpiar filtro"
              @click="clearFilter(filterModel, filterCallback)"
            >×</button>
          </div>
        </template>

        <template #body="slotProps">
          <slot :name="`cell-${column.field}`" v-bind="slotProps">
            <span
              class="fm-cell-text actas-work-cell"
              :class="column.bodyClass || ''"
              :title="String(slotProps.data?.[column.field] ?? '')"
            >{{ slotProps.data?.[column.field] ?? '' }}</span>
          </slot>
        </template>
      </Column>

      <template v-if="expandable" #expansion="slotProps">
        <slot name="expansion" v-bind="slotProps" />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'
import { useExcelExport } from '@/composables/useExportExcel'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  dataKey: { type: String, default: 'id' },
  title: { type: String, default: '' },
  emptyText: { type: String, default: 'No hay resultados' },
  selectable: { type: Boolean, default: false },
  selection: { type: Array, default: () => [] },
  expandable: { type: Boolean, default: false },
  expandedRows: { type: [Array, Object], default: () => ({}) },
  filterable: { type: Boolean, default: true },
  showExport: { type: Boolean, default: false },
  showRefresh: { type: Boolean, default: false },
  refreshDisabled: { type: Boolean, default: false },
  exportTitle: { type: String, default: 'Descargar Excel' },
  refreshTitle: { type: String, default: 'Actualizar' },
  exportFilename: { type: String, default: 'datos.xlsx' },
  rowsOptions: { type: Array, default: () => [25, 50, 100, 250, 500] },
})

const emit = defineEmits(['update:selection', 'update:expandedRows', 'refresh', 'row-expand', 'row-collapse'])
const dt = ref(null)
const first = ref(0)
const pageRows = ref(50)
const { exportToExcel, parseDataFromTable } = useExcelExport()

const createFilters = () => Object.fromEntries(
  props.columns
    .filter((column) => column.filterable !== false)
    .map((column) => [column.field, { value: null, matchMode: 'contains' }])
)

const filters = ref(createFilters())
watch(() => props.columns, () => { filters.value = createFilters() }, { deep: true })

const expandedRowsProxy = computed({
  get: () => props.expandedRows,
  set: (value) => emit('update:expandedRows', value),
})

const columnStyle = (column) => ({
  width: column.width || '140px',
  minWidth: column.width || '140px',
  maxWidth: column.width || '140px',
})

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
  first.value = 0
}

const exportRows = () => {
  const parsed = parseDataFromTable(dt)
  if (!parsed.rows.length || !parsed.fields.length) return
  const exportColumns = parsed.fields
    .map((field) => props.columns.find((column) => column.field === field))
    .filter(Boolean)

  exportToExcel({
    rows: parsed.rows,
    fields: parsed.fields,
    columns: exportColumns,
    filename: props.exportFilename,
    columnTypes: {},
    valueTransformers: {},
  })
}
</script>

<style scoped>
.actas-work-grid-shell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d4dde2;
  background: #fff;
}

.actas-work-grid-toolbar {
  min-height: 38px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 8px;
  border-bottom: 1px solid #d4dde2;
  background: #f8fafb;
}

.actas-work-grid-title { min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.actas-work-grid-title strong { color: #263b45; font-size: 11px; text-transform: uppercase; }
.actas-work-grid-title span { color: #7a8b92; font-size: 10px; }
.actas-work-grid-toolbar__actions { display: flex; align-items: center; gap: 6px; }

.actas-work-grid,
.actas-work-grid.p-datatable {
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

.actas-work-grid :deep(.p-datatable-table-container),
.actas-work-grid :deep(.p-datatable-wrapper),
.actas-work-grid :deep([data-pc-section='tablecontainer']) {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
  background: #fff !important;
}

.actas-work-grid :deep(.p-datatable-table) {
  width: max-content !important;
  min-width: 100% !important;
  table-layout: fixed !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

.actas-work-grid :deep(.p-datatable-thead) {
  position: sticky !important;
  top: 0 !important;
  z-index: 30 !important;
  background: #fff !important;
}

.actas-work-grid :deep(.p-datatable-thead > tr > th) {
  height: 32px !important;
  min-height: 32px !important;
  padding: 0 7px !important;
  border: 1px solid #bfcbd1 !important;
  background: #f1f4f6 !important;
  color: #233b47 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  line-height: 1.1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.actas-work-grid :deep(.p-datatable-thead > tr.p-datatable-filter-row > th),
.actas-work-grid :deep(.p-datatable-thead > tr.p-filter-row > th) {
  height: 34px !important;
  min-height: 34px !important;
  padding: 3px 5px !important;
  border-top: 0 !important;
  background: #fff !important;
}

.actas-work-grid :deep(.p-datatable-tbody > tr > td) {
  height: 31px !important;
  min-height: 31px !important;
  padding: 3px 7px !important;
  border: 1px solid #d8e0e4 !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 11px !important;
  line-height: 1.2 !important;
  vertical-align: middle !important;
  overflow: hidden !important;
}

.actas-work-grid :deep(.p-datatable-tbody > tr:nth-child(even) > td) { background: #fbfcfd !important; }
.actas-work-grid :deep(.p-datatable-tbody > tr:hover > td) { background: #effafd !important; }
.actas-work-grid :deep(.p-datatable-row-selected > td),
.actas-work-grid :deep(.p-highlight > td) { background: #e0f7fa !important; }

.actas-work-grid :deep(.p-datatable-paginator-bottom),
.actas-work-grid :deep(> .p-paginator) {
  width: 100% !important;
  height: 40px !important;
  min-height: 40px !important;
  flex: 0 0 40px !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.actas-work-filter-cell {
  display: grid !important;
  grid-template-columns: 10px minmax(0, 1fr) 16px !important;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-width: 0;
  background: #fff;
}

.actas-work-filter-input,
.actas-work-filter-input.p-inputtext {
  width: 100% !important;
  min-width: 0 !important;
  height: 26px !important;
  min-height: 26px !important;
  padding: 1px 5px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 2px !important;
  background: #fff !important;
  box-shadow: none !important;
  font-size: 11px !important;
}

.actas-work-filter-clear {
  width: 16px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.actas-work-filter-clear:hover { color: #00a9bd; }

.actas-work-cell {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
