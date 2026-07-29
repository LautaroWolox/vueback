<template>
  <div class="parametrizacion-grid-shell fm-grid-shell">
    <DataTable
      :id="tableId"
      v-model:filters="filters"
      v-model:selection="selectedModel"
      v-model:first="first"
      v-model:rows="pageSize"
      :class="['parametrizacion-grid', gridClass]"
      :value="rows"
      :data-key="dataKey"
      table-style="table-layout: fixed; width: 100%; min-width: 100%"
      scrollable
      :scroll-height="scrollHeight"
      removable-sort
      sort-mode="multiple"
      :filter-display="filterable ? 'row' : undefined"
      selection-mode="single"
      :paginator="paginator"
      :rows-per-page-options="rowsPerPageOptions"
      :resizable-columns="resizableColumns"
      column-resize-mode="fit"
      show-gridlines
      @row-click="onRowClick"
    >
      <template #empty>
        <div class="parametrizacion-grid-empty">{{ emptyText }}</div>
      </template>

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
          :rows-options="rowsPerPageOptions"
          :show-rows-select="showRowsSelect"
          :show-counter="showCounter"
          :counter-text="totalRecords === 0 ? emptyText : ''"
          :page-label="pageLabel"
          @first-page="firstPageCallback"
          @prev-page="prevPageCallback"
          @next-page="nextPageCallback"
          @last-page="lastPageCallback"
          @page-change="changePageCallback"
          @rows-change="rowChangeCallback"
        >
          <template #actions>
            <FmGridActions
              :size="actionsSize"
              :show-export="showExport"
              :show-delete="showDelete"
              :show-edit="showEdit"
              :show-refresh="showRefresh"
              :show-add="showAdd"
              :export-disabled="exportDisabled"
              :delete-disabled="!selectedModel || deleteDisabled"
              :edit-disabled="!selectedModel || editDisabled"
              :refresh-disabled="refreshDisabled"
              :add-disabled="addDisabled"
              :export-title="exportTitle"
              :delete-title="deleteTitle"
              :edit-title="editTitle"
              :refresh-title="refreshTitle"
              :add-title="addTitle"
              @export="emit('export')"
              @delete="emit('delete', selectedModel)"
              @edit="emit('edit', selectedModel)"
              @refresh="emit('refresh')"
              @add="emit('add')"
            />
          </template>
        </FmGridPaginator>
      </template>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :sort-field="column.field"
        :filter-field="column.field"
        :header="column.header"
        :sortable="sortable"
        :filter="filterable"
        :show-filter-menu="false"
        :style="{ width: column.width }"
        :header-style="{ width: column.width }"
        :body-style="{ width: column.width }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div class="parametrizacion-filter-cell">
            <span class="parametrizacion-filter-symbol">~</span>
            <InputText
              v-model="filterModel.value"
              class="parametrizacion-filter-input"
              type="text"
              @input="filterCallback()"
            />
            <button
              type="button"
              class="parametrizacion-filter-clear"
              title="Limpiar filtro"
              aria-label="Limpiar filtro"
              @click="clearFilter(filterModel, filterCallback)"
            >×</button>
          </div>
        </template>

        <template #body="{ data }">
          <span class="parametrizacion-cell-text" :title="String(data[column.field] ?? '')">
            {{ data[column.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'

const props = defineProps({
  tableId: { type: String, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  selected: { type: Object, default: null },
  dataKey: { type: String, default: 'id' },
  gridClass: { type: [String, Array, Object], default: '' },
  scrollHeight: { type: String, default: 'flex' },
  rowsPerPageOptions: { type: Array, default: () => [100, 250, 500] },
  initialRows: { type: Number, default: 100 },
  paginator: { type: Boolean, default: true },
  filterable: { type: Boolean, default: true },
  sortable: { type: Boolean, default: true },
  resizableColumns: { type: Boolean, default: true },
  showRowsSelect: { type: Boolean, default: true },
  showCounter: { type: Boolean, default: true },
  showExport: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showEdit: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: false },
  showAdd: { type: Boolean, default: true },
  exportDisabled: { type: Boolean, default: false },
  deleteDisabled: { type: Boolean, default: false },
  editDisabled: { type: Boolean, default: false },
  refreshDisabled: { type: Boolean, default: false },
  addDisabled: { type: Boolean, default: false },
  actionsSize: { type: String, default: 'compact' },
  emptyText: { type: String, default: 'No hay resultados' },
  pageLabel: { type: String, default: 'Página' },
  exportTitle: { type: String, default: 'Descargar' },
  deleteTitle: { type: String, default: 'Eliminar' },
  editTitle: { type: String, default: 'Editar' },
  refreshTitle: { type: String, default: 'Actualizar' },
  addTitle: { type: String, default: 'Nueva relación' }
})

const emit = defineEmits([
  'update:selected',
  'row-click',
  'export',
  'delete',
  'edit',
  'refresh',
  'add'
])

const buildFilters = () => Object.fromEntries(
  props.columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)

const filters = ref(buildFilters())
const first = ref(0)
const pageSize = ref(props.initialRows)

const selectedModel = computed({
  get: () => props.selected,
  set: (value) => emit('update:selected', value)
})

watch(
  () => props.columns.map(({ field }) => field).join('|'),
  () => {
    filters.value = buildFilters()
    first.value = 0
  }
)

watch(() => props.initialRows, (value) => {
  pageSize.value = value
})

const onRowClick = ({ data }) => {
  selectedModel.value = data
  emit('row-click', data)
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const resetPage = () => {
  first.value = 0
}

defineExpose({ resetPage })
</script>

<style scoped>
.parametrizacion-grid-shell {
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.parametrizacion-grid {
  height: 100%;
  min-height: 0;
}

.parametrizacion-filter-cell {
  width: 100%;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 3px;
}

.parametrizacion-filter-symbol {
  color: #607d86;
  font-size: 12px;
  text-align: center;
}

.parametrizacion-filter-input {
  width: 100%;
  min-width: 0;
  height: 25px;
  padding: 2px 5px;
  font-size: 11px;
}

.parametrizacion-filter-clear {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #6d7d84;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.parametrizacion-filter-clear:hover {
  color: #00a9bd;
}

.parametrizacion-cell-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parametrizacion-grid-empty {
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #075f6d;
  background: #e8f9fc;
  font-size: 12px;
}

.parametrizacion-grid :deep(.p-datatable-tbody > tr.p-datatable-row-selected > td),
.parametrizacion-grid :deep(.p-datatable-tbody > tr[data-p-selected='true'] > td),
.parametrizacion-grid :deep(.p-datatable-tbody > tr[aria-selected='true'] > td) {
  background: #9ee7ee !important;
  color: #111 !important;
}

.parametrizacion-grid :deep(.p-datatable-tbody > tr.p-datatable-row-selected > td *),
.parametrizacion-grid :deep(.p-datatable-tbody > tr[data-p-selected='true'] > td *),
.parametrizacion-grid :deep(.p-datatable-tbody > tr[aria-selected='true'] > td *) {
  color: #111 !important;
}
</style>
