<template>
  <DataTable
    id="tabla-jobtype-contrato"
    v-model:filters="filtersModel"
    v-model:selection="selectionModel"
    v-model:first="firstModel"
    v-model:rows="rowsModel"
    class="jobtype-main-grid jobtype-contrato-main-grid"
    :value="relaciones"
    dataKey="tareaContratoId"
    tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
    scrollable
    scrollHeight="flex"
    removableSort
    sortMode="multiple"
    filterDisplay="row"
    selectionMode="single"
    paginator
    :rowsPerPageOptions="[100, 250, 500]"
    :resizableColumns="true"
    columnResizeMode="fit"
    showGridlines
    @row-click="onRowClick"
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
        :rows-options="[100, 250, 500]"
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
            :show-refresh="false"
            :show-edit="true"
            :show-add="true"
            :delete-disabled="!selectionModel"
            :edit-disabled="!selectionModel"
            export-title="Descargar"
            delete-title="Desactivar"
            edit-title="Editar"
            add-title="Nueva relación"
            @export="emit('export')"
            @delete="emit('delete')"
            @edit="emit('edit')"
            @add="emit('add')"
          />
        </template>
      </FmGridPaginator>
    </template>

    <Column
      v-for="col in columns"
      :key="col.field"
      :field="col.field"
      :sortField="col.field"
      :filterField="col.field"
      :header="col.header"
      :sortable="col.sort"
      :filter="col.filter"
      :showFilterMenu="false"
      :style="{ width: col.width }"
      :headerStyle="{ width: col.width }"
      :bodyStyle="{ width: col.width }"
    >
      <template #filter="{ filterModel, filterCallback }">
        <div class="jobtype-filter-cell">
          <span class="jobtype-filter-symbol">~</span>
          <InputText
            v-model="filterModel.value"
            class="jobtype-filter-input"
            type="text"
            @input="filterCallback()"
          />
          <span class="jobtype-filter-clear" @click="clearFilter(filterModel, filterCallback)">x</span>
        </div>
      </template>

      <template #body="{ data }">
        <span class="jobtype-cell-text" :title="String(data[col.field] ?? '')">
          {{ data[col.field] ?? '' }}
        </span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'

const props = defineProps({
  relaciones: { type: Array, default: () => [] },
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
  'delete',
  'edit',
  'add'
])

const filtersModel = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})

const selectionModel = computed({
  get: () => props.selectedRow,
  set: (value) => emit('update:selectedRow', value)
})

const firstModel = computed({
  get: () => props.first,
  set: (value) => emit('update:first', value)
})

const rowsModel = computed({
  get: () => props.rows,
  set: (value) => emit('update:rows', value)
})

const onRowClick = ({ data }) => {
  emit('update:selectedRow', data)
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}
</script>
