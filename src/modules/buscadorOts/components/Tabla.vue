<template>
  <div
    class="busqueda-ots-grid-shell"
    :class="{ 'busqueda-ots-grid-shell--expanded': expanded }"
  >
    <DataTable
      :key="expanded ? 'expanded-grid' : 'standard-grid'"
      ref="gridRef"
      v-model:filters="columnFilters"
      v-model:selection="store.selectedRow"
      v-model:first="store.first"
      v-model:rows="store.pageRows"
      :value="store.visibleRows"
      data-key="id"
      selection-mode="single"
      :meta-key-selection="false"
      :row-class="rowClass"
      class="fm-pass-grid busqueda-ots-grid"
      table-style="table-layout: fixed; min-width: 1880px; width: 100%"
      paginator
      scrollable
      scroll-height="flex"
      removable-sort
      sort-mode="multiple"
      resizable-columns
      column-resize-mode="fit"
      show-gridlines
      :filter-display="store.showColumnFilters ? 'row' : undefined"
      :rows-per-page-options="rowsOptions"
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
          :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
          @first-page="firstPageCallback"
          @prev-page="prevPageCallback"
          @next-page="nextPageCallback"
          @last-page="lastPageCallback"
          @page-change="changePageCallback"
          @rows-change="rowChangeCallback"
        >
          <template #actions>
            <div class="busqueda-ots-grid-actions">
              <button
                type="button"
                class="busqueda-ots-grid-action"
                title="Descargar"
                aria-label="Descargar"
                :disabled="store.visibleRows.length === 0"
                @click="downloadResults"
              >
                <i class="pi pi-download" aria-hidden="true"></i>
              </button>

              <button
                type="button"
                class="busqueda-ots-grid-action"
                title="Reprocesar / cambiar técnico"
                aria-label="Reprocesar / cambiar técnico"
                @click="emit('open-reprocess')"
              >
                <i class="pi pi-filter" aria-hidden="true"></i>
              </button>

              <button
                type="button"
                class="busqueda-ots-grid-action"
                title="Órdenes de Trabajo Fallidas"
                aria-label="Órdenes de Trabajo Fallidas"
                @click="emit('open-failed')"
              >
                <i class="pi pi-times" aria-hidden="true"></i>
              </button>

              <button
                type="button"
                class="busqueda-ots-grid-action"
                title="Buscar OTs externas"
                aria-label="Buscar OTs externas"
                @click="emit('open-external')"
              >
                <i class="pi pi-search" aria-hidden="true"></i>
              </button>
            </div>
          </template>
        </FmGridPaginator>
      </template>

      <template #empty>
        <div class="busqueda-ots-grid-empty">No hay resultados</div>
      </template>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :filter-field="column.field"
        :filter="store.showColumnFilters"
        :show-filter-menu="false"
        :style="{ width: column.width }"
        :header-style="{ width: column.width }"
        :body-style="{ width: column.width }"
        sortable
      >
        <template #filter="{ filterModel, filterCallback }">
          <div v-if="store.showColumnFilters" class="busqueda-ots-column-filter">
            <span class="busqueda-ots-column-filter__prefix">~</span>
            <InputText
              v-model="filterModel.value"
              type="text"
              class="busqueda-ots-column-filter__input"
              @input="filterCallback()"
            />
            <button
              type="button"
              class="busqueda-ots-column-filter__clear"
              title="Limpiar filtro"
              aria-label="Limpiar filtro"
              @click="clearColumnFilter(filterModel, filterCallback)"
            >×</button>
          </div>
        </template>

        <template #body="{ data }">
          <span class="fm-cell-text" :title="String(data[column.field] ?? '')">
            {{ data[column.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import { columns, createColumnFilters, rowsOptions } from './columns'
import { useBuscadorOtsStore } from '../store/buscadorOtsStore'

defineProps({
  expanded: { type: Boolean, default: false }
})

const emit = defineEmits(['open-external', 'open-failed', 'open-reprocess'])
const store = useBuscadorOtsStore()
const gridRef = ref(null)
const columnFilters = ref(createColumnFilters())

watch(() => store.resetToken, () => {
  columnFilters.value = createColumnFilters()
})

const rowIdentity = (row) => String(row?.id ?? row?.nroOt ?? '')

const rowClass = (row) => (
  store.selectedRow && rowIdentity(store.selectedRow) === rowIdentity(row)
    ? 'fm-selected-row'
    : ''
)

const clearColumnFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const downloadResults = () => {
  if (!store.visibleRows.length) return
  gridRef.value?.exportCSV?.()
}
</script>

<style scoped>
.busqueda-ots-grid-shell {
  width: 100%;
  height: 590px;
  min-height: 360px;
  display: flex;
  overflow: hidden;
  border-left: 4px solid #00a9bd;
  background: #fff;
}

.busqueda-ots-grid-shell--expanded {
  height: 100%;
  min-height: 0;
  flex: 1 1 0;
}

.busqueda-ots-grid,
.busqueda-ots-grid.p-datatable {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  border: 0;
}

.busqueda-ots-grid :deep(.p-datatable-table-container),
.busqueda-ots-grid :deep(.p-datatable-wrapper),
.busqueda-ots-grid :deep([data-pc-section='tablecontainer']) {
  width: 100% !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 0 !important;
  overflow: auto !important;
  background: #fff;
}

.busqueda-ots-grid :deep(.p-datatable-paginator-bottom),
.busqueda-ots-grid :deep(> .p-paginator) {
  flex: 0 0 39px !important;
  width: 100% !important;
  min-height: 39px !important;
  margin-top: 0 !important;
}

.busqueda-ots-grid :deep(.p-datatable-thead > tr > th) {
  height: 34px;
  min-height: 34px;
  padding: 0 8px;
  background: #f1f4f6;
  color: #102b3a;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.busqueda-ots-grid :deep(.p-datatable-tbody > tr > td) {
  height: 32px;
  min-height: 32px;
  padding: 0 8px;
  background: #fff;
  color: #111;
  font-size: 11px;
}

.busqueda-ots-grid :deep(.p-datatable-emptymessage > td),
.busqueda-ots-grid :deep(.p-datatable-empty-message > td) {
  height: 100%;
  padding: 0;
  background: #fff;
  color: transparent;
}

.busqueda-ots-grid-empty {
  min-height: 500px;
  color: transparent;
}

.busqueda-ots-grid-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.busqueda-ots-grid-action {
  width: 20px;
  min-width: 20px;
  height: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 2px;
  background: transparent;
  color: #173142;
  font-size: 13px;
  cursor: pointer;
}

.busqueda-ots-grid-action:hover:not(:disabled),
.busqueda-ots-grid-action--active {
  background: #d9f8fa;
  color: #007e8f;
}

.busqueda-ots-grid-action:disabled {
  color: #c7d3d8;
  cursor: default;
}

.busqueda-ots-column-filter {
  width: 100%;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 2px;
}

.busqueda-ots-column-filter__prefix {
  color: #111;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.busqueda-ots-column-filter__input,
.busqueda-ots-column-filter__input.p-inputtext {
  width: 100%;
  min-width: 0;
  height: 26px;
  min-height: 26px;
  padding: 1px 5px;
  border: 1px solid #cdcdcd;
  border-radius: 2px;
  background: #fff;
  color: #111;
  font-size: 11px;
  box-shadow: none;
}

.busqueda-ots-column-filter__clear {
  width: 14px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 13px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .busqueda-ots-grid-shell,
  .busqueda-ots-grid-shell--expanded {
    height: 520px;
    min-height: 520px;
  }
}
</style>
