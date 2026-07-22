<template>
  <div class="fm-popup-grid" :class="popupGridClasses">
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
      scrollHeight="flex"
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
            <span class="fm-popup-grid__cell" :title="String(data?.[column.field] ?? '')">
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
  emptyMessage: { type: String, default: 'No hay resultados' },
  loading: { type: Boolean, default: false },
  fitColumns: { type: Boolean, default: true },
  resizableColumns: { type: Boolean, default: true },
  showRowsSelect: { type: Boolean, default: false },
  showCounter: { type: Boolean, default: false },
  actionSize: { type: String, default: 'large' },
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

const popupGridClasses = computed(() => ({
  'fm-popup-grid--horizontal': !props.fitColumns
}))

const tableStyle = computed(() => (
  props.fitColumns
    ? 'table-layout: fixed; width: 100%; min-width: 100%'
    : 'table-layout: fixed; width: max-content; min-width: 100%'
))

const columnStyle = (column) => ({
  width: column.width || 'auto',
  minWidth: props.fitColumns ? '0' : (column.minWidth || column.width || '120px'),
  maxWidth: props.fitColumns ? column.width || 'none' : (column.maxWidth || 'none')
})

defineExpose({ dataTable })
</script>

<style>
html body .fm-popup-grid {
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  border: 1px solid #aab9c2 !important;
  background: #fff !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

html body .fm-popup-grid .fm-popup-grid__table,
html body .fm-popup-grid .p-datatable {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  display: flex !important;
  flex: 1 1 auto !important;
  flex-direction: column !important;
  border: 0 !important;
  background: #fff !important;
}

html body .fm-popup-grid .p-datatable-table-container,
html body .fm-popup-grid .p-datatable-wrapper,
html body .fm-popup-grid [data-pc-section="tablecontainer"] {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  display: block !important;
  flex: 1 1 auto !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  scrollbar-gutter: stable !important;
  border: 0 !important;
  background: #fff !important;
}

html body .fm-popup-grid--horizontal .p-datatable-table-container,
html body .fm-popup-grid--horizontal .p-datatable-wrapper,
html body .fm-popup-grid--horizontal [data-pc-section="tablecontainer"] {
  overflow-x: auto !important;
}

html body .fm-popup-grid .p-datatable-table {
  width: 100% !important;
  min-width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  table-layout: fixed !important;
  font-size: 13px !important;
}

html body .fm-popup-grid .p-datatable-thead {
  display: table-header-group !important;
}

html body .fm-popup-grid .p-datatable-thead > tr {
  display: table-row !important;
}

html body .fm-popup-grid .p-datatable-thead > tr > th,
html body .fm-popup-grid .p-datatable-tbody > tr > td {
  box-sizing: border-box !important;
  border-right: 1px solid #c4d0d6 !important;
  border-bottom: 1px solid #d7e0e5 !important;
  vertical-align: middle !important;
}

html body .fm-popup-grid .p-datatable-thead > tr > th:last-child,
html body .fm-popup-grid .p-datatable-tbody > tr > td:last-child {
  border-right: 0 !important;
}

html body .fm-popup-grid .p-datatable-thead > tr:first-child > th {
  height: 54px !important;
  min-height: 54px !important;
  padding: 0 12px !important;
  overflow: hidden !important;
  background: #f1f4f6 !important;
  color: #173849 !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  line-height: 1.15 !important;
  white-space: nowrap !important;
}

html body .fm-popup-grid .p-column-header-content {
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  overflow: hidden !important;
}

html body .fm-popup-grid .p-datatable-column-title {
  min-width: 0 !important;
  flex: 1 1 auto !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

html body .fm-popup-grid .p-sortable-column-icon {
  flex: 0 0 auto !important;
  width: 17px !important;
  height: 17px !important;
  font-size: 17px !important;
}

html body .fm-popup-grid .p-datatable-thead > tr.p-datatable-filter-row,
html body .fm-popup-grid .p-datatable-thead > tr.p-filter-row,
html body .fm-popup-grid .p-datatable-thead > tr:nth-child(2) {
  display: table-row !important;
  height: 54px !important;
  min-height: 54px !important;
  visibility: visible !important;
}

html body .fm-popup-grid .p-datatable-thead > tr.p-datatable-filter-row > th,
html body .fm-popup-grid .p-datatable-thead > tr.p-filter-row > th,
html body .fm-popup-grid .p-datatable-thead > tr:nth-child(2) > th {
  height: 54px !important;
  min-height: 54px !important;
  padding: 7px 8px !important;
  background: #fff !important;
  visibility: visible !important;
}

html body .fm-popup-grid__filter {
  width: 100% !important;
  min-width: 0 !important;
  display: grid !important;
  grid-template-columns: 16px minmax(0, 1fr) 22px !important;
  align-items: center !important;
  gap: 6px !important;
}

html body .fm-popup-grid__filter-prefix,
html body .fm-popup-grid__filter-more {
  color: #071e2a !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  text-align: center !important;
}

html body .fm-popup-grid__filter-input,
html body .fm-popup-grid__filter-input.p-inputtext {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
  padding: 0 9px !important;
  border: 1px solid #b9c7cf !important;
  border-radius: 2px !important;
  background: #fff !important;
  color: #0f2f3d !important;
  font-size: 14px !important;
  line-height: 38px !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

html body .fm-popup-grid .p-datatable-tbody > tr > td {
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 10px !important;
  overflow: hidden !important;
  background: #fff !important;
  color: #111 !important;
  font-size: 13px !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

html body .fm-popup-grid .p-datatable-tbody > tr:hover > td,
html body .fm-popup-grid .p-datatable-tbody > tr.p-highlight > td,
html body .fm-popup-grid .p-datatable-tbody > tr.fm-selected-row > td {
  background: #e8f8fb !important;
  color: #0f2f3d !important;
}

html body .fm-popup-grid .p-datatable-tbody:has(.p-datatable-empty-message),
html body .fm-popup-grid .p-datatable-empty-message,
html body .fm-popup-grid .p-datatable-empty-message > td {
  height: 100% !important;
  min-height: 100% !important;
}

html body .fm-popup-grid .p-datatable-empty-message > td {
  padding: 0 !important;
  background: #eafcff !important;
}

html body .fm-popup-grid__empty {
  width: 100% !important;
  min-width: 100% !important;
  height: 100% !important;
  min-height: 250px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  background: #eafcff !important;
  color: #607887 !important;
  font-size: 16px !important;
  text-align: center !important;
}

html body .fm-popup-grid .p-paginator,
html body .fm-popup-grid .p-datatable-paginator-bottom {
  width: 100% !important;
  height: 52px !important;
  min-height: 52px !important;
  max-height: 52px !important;
  display: block !important;
  flex: 0 0 52px !important;
  padding: 0 !important;
  border: 0 !important;
  border-top: 1px solid #aab9c2 !important;
  background: #fff !important;
  overflow: hidden !important;
}

html body .fm-popup-grid .fm-custom-paginator {
  width: 100% !important;
  height: 52px !important;
  min-height: 52px !important;
  padding: 0 14px !important;
  font-size: 14px !important;
}

html body .fm-popup-grid .fm-grid-action,
html body .fm-popup-grid .fm-grid-action .pi,
html body .fm-popup-grid .p-button-icon {
  font-size: 20px !important;
}

html body .fm-popup-grid__cell {
  display: block !important;
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
</style>
