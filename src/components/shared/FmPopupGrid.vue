<template>
  <div
    class="fm-popup-grid"
    :class="{ 'fm-popup-grid--horizontal': !fitColumns }"
    :style="popupGridStyle"
  >
    <DataTable
      ref="dataTable"
      v-model:filters="filtersModel"
      v-model:selection="selectionModel"
      v-model:first="first"
      v-model:rows="currentRows"
      :value="rows"
      :dataKey="dataKey"
      class="fm-popup-grid__table"
      :tableStyle="tableStyle"
      scrollable
      :scrollHeight="scrollHeight"
      removableSort
      sortMode="multiple"
      filterDisplay="row"
      :selectionMode="selectionMode"
      :rowClass="rowClass"
      paginator
      :rowsPerPageOptions="rowsOptions"
      :resizableColumns="resizableColumns"
      columnResizeMode="fit"
      showGridlines
      @row-click="$emit('row-click', $event)"
      @value-change="$emit('value-change', $event)"
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
          :page-count="pageCount"
          :rows="paginatorRows"
          :total-records="totalRecords"
          :rows-options="rowsOptions"
          :disabled="loading"
          :show-rows-select="showRowsSelect"
          :show-counter="showCounter"
          @first-page="firstPageCallback"
          @prev-page="prevPageCallback"
          @next-page="nextPageCallback"
          @last-page="lastPageCallback"
          @page-change="changePageCallback"
          @rows-change="rowChangeCallback"
        >
          <template #actions>
            <slot name="actions">
              <FmGridActions
                :size="actionSize"
                :show-export="showExport"
                :show-delete="showDelete"
                :show-edit="showEdit"
                :show-refresh="showRefresh"
                :show-add="showAdd"
                :export-disabled="exportDisabled"
                :delete-disabled="deleteDisabled"
                :edit-disabled="editDisabled"
                :refresh-disabled="refreshDisabled"
                :add-disabled="addDisabled"
                :export-title="exportTitle"
                :delete-title="deleteTitle"
                :edit-title="editTitle"
                :refresh-title="refreshTitle"
                :add-title="addTitle"
                @export="$emit('export')"
                @delete="$emit('delete')"
                @edit="$emit('edit')"
                @refresh="$emit('refresh')"
                @add="$emit('add')"
              />
            </slot>
          </template>
        </FmGridPaginator>
      </template>

      <template #empty>
        <div class="fm-popup-grid__empty">{{ emptyMessage }}</div>
      </template>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :sortField="column.field"
        :filterField="column.field"
        :header="column.header"
        :sortable="column.sort !== false"
        :filter="column.filter !== false"
        :showFilterMenu="false"
        :exportable="column.exportable !== false"
        :style="columnStyle(column)"
        :headerStyle="columnStyle(column)"
        :bodyStyle="columnStyle(column)"
      >
        <template #filter="{ filterModel, filterCallback }">
          <slot
            name="filter"
            :column="column"
            :filter-model="filterModel"
            :filter-callback="filterCallback"
          >
            <div v-if="column.filter !== false" class="fm-popup-grid__filter">
              <span class="fm-popup-grid__filter-prefix">~</span>
              <InputText
                v-model="filterModel.value"
                type="text"
                class="fm-popup-grid__filter-input"
                @input="filterCallback()"
              />
              <span class="fm-popup-grid__filter-more">...</span>
            </div>
          </slot>
        </template>

        <template #body="{ data }">
          <slot name="body" :data="data" :column="column">
            <span
              class="fm-popup-grid__cell"
              :title="String(data?.[column.field] ?? '')"
            >
              {{ data?.[column.field] ?? '' }}
            </span>
          </slot>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridPaginator from './FmGridPaginator.vue'
import FmGridActions from './FmGridActions.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({}) },
  selection: { type: [Object, Array, String, Number], default: null },
  dataKey: { type: String, default: 'id' },
  selectionMode: { type: String, default: 'single' },
  rowClass: { type: Function, default: null },
  rowsPerPage: { type: Number, default: 10 },
  rowsOptions: { type: Array, default: () => [10, 20, 50] },
  scrollHeight: { type: String, default: '210px' },
  emptyMessage: { type: String, default: 'No hay resultados' },
  loading: { type: Boolean, default: false },
  fitColumns: { type: Boolean, default: true },
  resizableColumns: { type: Boolean, default: true },
  showRowsSelect: { type: Boolean, default: false },
  showCounter: { type: Boolean, default: false },
  actionSize: { type: String, default: 'compact' },
  showExport: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: false },
  showRefresh: { type: Boolean, default: false },
  showAdd: { type: Boolean, default: false },
  exportDisabled: { type: Boolean, default: false },
  deleteDisabled: { type: Boolean, default: false },
  editDisabled: { type: Boolean, default: false },
  refreshDisabled: { type: Boolean, default: false },
  addDisabled: { type: Boolean, default: false },
  exportTitle: { type: String, default: 'Exportar' },
  deleteTitle: { type: String, default: 'Eliminar' },
  editTitle: { type: String, default: 'Editar' },
  refreshTitle: { type: String, default: 'Reprocesar' },
  addTitle: { type: String, default: 'Agregar' }
})

const emit = defineEmits([
  'update:filters',
  'update:selection',
  'row-click',
  'value-change',
  'export',
  'delete',
  'edit',
  'refresh',
  'add'
])

const dataTable = ref()
const first = ref(0)
const currentRows = ref(props.rowsPerPage)

watch(() => props.rowsPerPage, (value) => {
  currentRows.value = value
})

watch(() => props.rows.length, (length) => {
  if (first.value >= length) first.value = 0
})

const filtersModel = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})

const selectionModel = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
})

const popupGridStyle = computed(() => ({
  '--fm-popup-grid-height': props.scrollHeight
}))

const tableStyle = computed(() => (
  props.fitColumns
    ? 'table-layout: fixed; width: 100%; min-width: 100%'
    : 'table-layout: fixed; width: max-content; min-width: 100%'
))

const columnStyle = (column) => ({
  width: column.width || '140px',
  minWidth: props.fitColumns ? '0' : (column.minWidth || column.width || '100px'),
  maxWidth: props.fitColumns ? (column.maxWidth || 'none') : 'none'
})

defineExpose({ dataTable })
</script>

<style>
.fm-popup-grid {
  width: 100%;
  min-width: 0;
  border: 1px solid #9fb8c7;
  border-left: 4px solid #00a9bd;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

.fm-popup-grid .fm-popup-grid__table,
.fm-popup-grid .p-datatable {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  border: 0 !important;
  background: #fff !important;
}

.fm-popup-grid .p-datatable-table-container,
.fm-popup-grid .p-datatable-wrapper {
  width: 100% !important;
  max-width: 100% !important;
  height: min(var(--fm-popup-grid-height), 210px) !important;
  min-height: min(var(--fm-popup-grid-height), 210px) !important;
  max-height: min(var(--fm-popup-grid-height), 210px) !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  scrollbar-gutter: stable !important;
  border: 0 !important;
  border-bottom: 1px solid #9fb8c7 !important;
  background: #fff !important;
}

.fm-popup-grid--horizontal .p-datatable-table-container,
.fm-popup-grid--horizontal .p-datatable-wrapper {
  overflow-x: auto !important;
}

.fm-popup-grid .p-datatable-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: fixed !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 12px !important;
}

.fm-popup-grid .p-datatable-thead > tr > th,
.fm-popup-grid .p-datatable-tbody > tr > td {
  box-sizing: border-box !important;
  border-right: 1px solid #b8cad4 !important;
  border-bottom: 1px solid #c7d5dd !important;
  vertical-align: middle !important;
}

.fm-popup-grid .p-datatable-thead > tr > th:last-child,
.fm-popup-grid .p-datatable-tbody > tr > td:last-child {
  border-right: 0 !important;
}

.fm-popup-grid .p-datatable-thead > tr > th {
  height: 31px !important;
  min-height: 31px !important;
  padding: 0 7px !important;
  overflow: hidden !important;
  background: #f8fafb !important;
  color: #163849 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  line-height: 1.1 !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
}

.fm-popup-grid .p-column-header-content {
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  overflow: hidden !important;
}

.fm-popup-grid .p-datatable-column-title {
  min-width: 0 !important;
  flex: 1 1 auto !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.fm-popup-grid .p-sortable-column-icon {
  flex: 0 0 auto !important;
  width: 12px !important;
  height: 12px !important;
  font-size: 12px !important;
}

.fm-popup-grid .p-datatable-thead > tr.p-datatable-filter-row > th,
.fm-popup-grid .p-datatable-thead > tr.p-filter-row > th {
  height: 31px !important;
  min-height: 31px !important;
  padding: 3px 5px !important;
  overflow: hidden !important;
  background: #fff !important;
}

.fm-popup-grid__filter {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 3px;
}

.fm-popup-grid__filter-prefix,
.fm-popup-grid__filter-more {
  color: #000;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

.fm-popup-grid__filter-input,
.fm-popup-grid__filter-input.p-inputtext {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 22px !important;
  min-height: 22px !important;
  max-height: 22px !important;
  padding: 0 5px !important;
  border: 1px solid #c7d6df !important;
  border-radius: 2px !important;
  background: #fff !important;
  color: #0f2f3d !important;
  font-size: 11px !important;
  line-height: 22px !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

.fm-popup-grid__filter-input:focus {
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 1px rgba(0, 169, 189, .14) !important;
  outline: none !important;
}

.fm-popup-grid .p-datatable-tbody > tr > td {
  height: 31px !important;
  min-height: 31px !important;
  max-height: 31px !important;
  padding: 0 7px !important;
  overflow: hidden !important;
  background: #fff !important;
  color: #0f2f3d !important;
  font-size: 12px !important;
  line-height: 31px !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.fm-popup-grid .p-datatable-tbody > tr:hover > td {
  background: #eefbfc !important;
}

.fm-popup-grid .p-datatable-tbody > tr.p-highlight > td,
.fm-popup-grid .p-datatable-tbody > tr.p-datatable-row-selected > td,
.fm-popup-grid .p-datatable-tbody > tr.fm-selected-row > td {
  background: #e8f8fb !important;
  color: #0f2f3d !important;
  font-weight: 600 !important;
}

.fm-popup-grid__cell {
  width: 100%;
  min-width: 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-popup-grid .p-datatable-empty-message > td {
  padding: 0 !important;
  border-right: 0 !important;
  background: #eafcff !important;
}

.fm-popup-grid__empty {
  width: 100%;
  min-height: 146px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #eafcff;
  color: #6f8594;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  box-sizing: border-box;
}

.fm-popup-grid .p-paginator,
.fm-popup-grid .p-datatable-paginator-bottom {
  width: 100% !important;
  min-width: 100% !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  display: block !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
  overflow: visible !important;
  box-sizing: border-box !important;
}

.fm-popup-grid .fm-custom-paginator {
  height: 34px !important;
  min-height: 34px !important;
  padding: 0 10px !important;
  font-size: 11px !important;
}

.fm-popup-grid .fm-page-input {
  width: 42px !important;
  min-width: 42px !important;
  height: 26px !important;
  min-height: 26px !important;
}

.fm-popup-grid .fm-page-label,
.fm-popup-grid .fm-page-total {
  font-size: 11px !important;
}

.fm-popup-grid .p-column-resizer,
.fm-popup-grid .p-datatable-column-resizer {
  width: 8px !important;
  right: -4px !important;
  cursor: col-resize !important;
  background: transparent !important;
}
</style>