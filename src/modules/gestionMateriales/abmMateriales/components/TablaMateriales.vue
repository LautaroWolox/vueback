<template>
  <DataTable
    ref="tableRef"
    id="tabla-abm-materiales"
    v-model:filters="filtersModel"
    v-model:selection="selectionModel"
    v-model:first="firstModel"
    v-model:rows="rowsModel"
    class="abm-materiales-grid fm-pass-grid fm-pt-datatable"
    :value="materiales"
    dataKey="codigoMaterial"
    tableStyle="table-layout: fixed; width: 100%; min-width: 1120px"
    scrollable
    scrollHeight="flex"
    removableSort
    sortMode="multiple"
    filterDisplay="row"
    selectionMode="single"
    :metaKeySelection="false"
    :isDataSelectable="isDataSelectable"
    :rowClass="rowClass"
    paginator
    :rowsPerPageOptions="[50, 100, 250, 500]"
    :resizableColumns="true"
    columnResizeMode="fit"
    showGridlines
    @row-click="onRowClick"
    @row-select="onRowSelect"
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
      <FmGridPaginator
        :first="first"
        :last="last"
        :page="page"
        :page-count="pageCount"
        :rows="rows"
        :total-records="totalRecords"
        :rows-options="[50, 100, 250, 500]"
        :show-rows-select="true"
        :show-counter="true"
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
            :show-delete="false"
            :show-refresh="false"
            :show-edit="true"
            :show-add="true"
            :export-disabled="materiales.length === 0"
            :edit-disabled="!canEdit"
            export-title="Exportar materiales"
            edit-title="Editar umbrales"
            edit-disabled-title="Seleccione un material activo"
            add-title="Agregar material"
            @export="emitExport"
            @edit="emit('edit')"
            @add="emit('add')"
          />
        </template>
      </FmGridPaginator>
    </template>

    <Column
      v-for="column in columns"
      :key="column.field"
      :field="column.field"
      :sortField="column.field"
      :filterField="column.field"
      :header="column.header"
      :sortable="column.sort"
      :filter="column.filter"
      :showFilterMenu="false"
      :style="{ width: column.width }"
      :headerStyle="{ width: column.width }"
      :bodyStyle="{ width: column.width }"
      :exportable="column.exportable"
    >
      <template #filter="{ filterModel, filterCallback }">
        <div class="abm-materiales-filter-cell fm-filter-cell">
          <span class="abm-materiales-filter-symbol">~</span>
          <InputText
            v-model="filterModel.value"
            class="abm-materiales-filter-input"
            type="text"
            @input="filterCallback()"
          />
          <button
            type="button"
            class="abm-materiales-filter-clear"
            title="Limpiar filtro"
            aria-label="Limpiar filtro"
            @click="clearFilter(filterModel, filterCallback)"
          >×</button>
        </div>
      </template>

      <template #body="{ data }">
        <span
          class="abm-materiales-cell-text fm-cell-text"
          :title="String(data[column.field] ?? '')"
        >
          {{ data[column.field] ?? '' }}
        </span>
      </template>
    </Column>

    <template #empty>
      <div class="fm-grid-empty abm-materiales-empty-state">
        No hay materiales para mostrar.
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { computed, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'
import { useExcelExport } from '@/composables/useExportExcel'

const props = defineProps({
  materiales: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  filters: { type: Object, required: true },
  selectedRow: { type: Object, default: null },
  first: { type: Number, default: 0 },
  rows: { type: Number, default: 100 }
})

const emit = defineEmits([
  'update:filters',
  'update:selectedRow',
  'update:first',
  'update:rows',
  'export',
  'edit',
  'add'
])

const tableRef = ref(null)
const { parseDataFromTable } = useExcelExport()

const filtersModel = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})

const selectionModel = computed({
  get: () => props.selectedRow,
  set: (value) => emit('update:selectedRow', value?.activo === 'S' ? value : null)
})

const firstModel = computed({
  get: () => props.first,
  set: (value) => emit('update:first', value)
})

const rowsModel = computed({
  get: () => props.rows,
  set: (value) => emit('update:rows', value)
})

const canEdit = computed(() => props.selectedRow?.activo === 'S')
const isDataSelectable = (row) => row?.activo === 'S'
const rowClass = (row) => row?.activo === 'S' ? '' : 'abm-materiales-row--inactive'

const onRowClick = ({ data }) => {
  emit('update:selectedRow', isDataSelectable(data) ? data : null)
}

const onRowSelect = ({ data }) => {
  if (!isDataSelectable(data)) emit('update:selectedRow', null)
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const emitExport = () => {
  const parsed = parseDataFromTable(tableRef)
  emit('export', parsed)
}
</script>
