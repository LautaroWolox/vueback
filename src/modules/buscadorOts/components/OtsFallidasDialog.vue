<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="fm-dialog buscador-ots-fallidas-dialog"
    :pt="{ root: { class: 'fm-dialog buscador-ots-fallidas-dialog' } }"
    :style="{
      '--fm-dialog-width': '1360px',
      height: 'min(610px, calc(100dvh - 72px))'
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="buscador-ots-fallidas-header">
        <span class="buscador-ots-fallidas-title">Órdenes de Trabajo Fallidas</span>
        <button
          type="button"
          class="buscador-ots-fallidas-close"
          title="Cerrar"
          aria-label="Cerrar Órdenes de Trabajo Fallidas"
          @click="closeDialog"
        >
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>
    </template>

    <FmGridShell class="buscador-ots-fallidas-grid-shell">
      <DataTable
        ref="tableRef"
        v-model:filters="filters"
        v-model:first="first"
        v-model:rows="pageRows"
        :value="rows"
        data-key="id"
        class="fm-pass-grid buscador-ots-fallidas-grid"
        :class="{ 'buscador-ots-fallidas-grid--empty': rows.length === 0 }"
        table-style="table-layout: fixed; width: 100%; min-width: 100%"
        paginator
        scrollable
        scroll-height="flex"
        show-gridlines
        removable-sort
        sort-mode="multiple"
        filter-display="row"
        resizable-columns
        column-resize-mode="fit"
        :rows-per-page-options="rowsOptions"
        :global-filter-fields="columnFields"
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
                :show-delete="false"
                :show-refresh="false"
                :export-disabled="rows.length === 0"
                export-title="Descargar órdenes fallidas"
                @export="download"
              />
            </template>
          </FmGridPaginator>
        </template>

        <template #empty>
          <div class="fm-grid-empty buscador-ots-fallidas-empty">
            No hay órdenes de trabajo fallidas
          </div>
        </template>

        <Column
          v-for="column in columns"
          :key="column.field"
          :field="column.field"
          :header="column.header"
          :show-filter-menu="false"
          :style="{ width: column.width }"
          :header-style="{ width: column.width }"
          :body-style="{ width: column.width }"
          sortable
        >
          <template #filter="{ filterModel, filterCallback }">
            <div class="fm-filter-cell buscador-ots-fallidas-filter">
              <span class="fm-filter-prefix">~</span>
              <InputText
                v-model="filterModel.value"
                class="fm-column-filter"
                type="text"
                @input="filterCallback()"
              />
              <button
                type="button"
                class="buscador-ots-fallidas-filter-clear"
                aria-label="Limpiar filtro"
                title="Limpiar filtro"
                @click="clearFilter(filterModel, filterCallback)"
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
    </FmGridShell>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridShell from '@/components/shared/FmGridShell.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'

interface OtFallidaRow {
  id?: string | number
  nroOt?: string
  codigoTarea?: string
  fechaUltimaModificacion?: string
  tecnicoNoLdap?: string
  sistemaOrigen?: string
  descripcionError?: string
  [key: string]: unknown
}

const props = defineProps<{
  visible: boolean
  rows: OtFallidaRow[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
}>()

const columns = [
  { field: 'nroOt', header: 'Nro. OT', width: '11%' },
  { field: 'codigoTarea', header: 'Cod. tarea', width: '12%' },
  { field: 'fechaUltimaModificacion', header: 'Fecha últ. mod. OT', width: '18%' },
  { field: 'tecnicoNoLdap', header: 'Técnico no LDAP', width: '17%' },
  { field: 'sistemaOrigen', header: 'Sistema origen', width: '14%' },
  { field: 'descripcionError', header: 'Descripción error', width: '28%' }
]

const rowsOptions = [100, 250, 500]
const columnFields = columns.map(({ field }) => field)
const tableRef = ref<InstanceType<typeof DataTable> | null>(null)
const first = ref(0)
const pageRows = ref(500)
const filters = ref(Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
))

const rows = computed(() => props.rows ?? [])

watch(() => props.visible, (isVisible) => {
  if (!isVisible) return
  first.value = 0
})

const closeDialog = () => {
  emit('update:visible', false)
}

const clearFilter = (filterModel: { value: unknown }, filterCallback: () => void) => {
  filterModel.value = null
  first.value = 0
  filterCallback()
}

const download = () => {
  if (!rows.value.length) return
  tableRef.value?.exportCSV?.()
}
</script>

<style>
body .p-dialog.buscador-ots-fallidas-dialog {
  width: min(1360px, calc(100vw - 48px)) !important;
  max-width: calc(100vw - 48px) !important;
  height: min(610px, calc(100dvh - 72px)) !important;
  max-height: calc(100dvh - 72px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .p-dialog-header {
  flex: 0 0 auto !important;
  width: 100% !important;
  min-height: 52px !important;
  padding: 10px 16px !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-header {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-title {
  min-width: 0;
  color: #263746;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-close {
  width: 30px;
  min-width: 30px;
  height: 30px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #56707e;
  cursor: pointer;
  box-shadow: none;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-close .pi {
  font-size: 16px;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-close:hover {
  background: #dff8fb;
  color: #007e8f;
}

body .p-dialog.buscador-ots-fallidas-dialog .p-dialog-content {
  flex: 1 1 auto !important;
  width: 100% !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 16px 18px !important;
  overflow: hidden !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid-shell {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  border-left: 3px solid #00a9bd !important;
  background: #fff !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid.p-datatable {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  border: 0 !important;
  background: #fff !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-table-container,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-wrapper {
  flex: 1 1 auto !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: auto !important;
  border: 1px solid #d1d1d1 !important;
  border-left: 0 !important;
  background: #fff !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: fixed !important;
  border-collapse: collapse !important;
  font-size: 12px !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-thead > tr > th,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-tbody > tr > td {
  box-sizing: border-box !important;
  border-right: 1px solid #c9d3da !important;
  border-bottom: 1px solid #dce3e8 !important;
  vertical-align: middle !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-thead > tr > th {
  position: relative !important;
  height: 34px !important;
  min-height: 34px !important;
  padding: 4px 7px !important;
  overflow: visible !important;
  background: #f4f7f9 !important;
  color: #263f50 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-column-header-content,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-column-title {
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-thead > tr.p-datatable-filter-row > th,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-thead > tr.p-filter-row > th {
  height: 33px !important;
  min-height: 33px !important;
  padding: 3px 5px !important;
  overflow: visible !important;
  background: #fff !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-tbody > tr > td {
  height: 35px !important;
  min-height: 35px !important;
  padding: 5px 8px !important;
  overflow: hidden !important;
  color: #263238 !important;
  font-size: 12px !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter {
  width: 100% !important;
  min-width: 0 !important;
  display: grid !important;
  grid-template-columns: 10px minmax(20px, 1fr) 18px !important;
  align-items: center !important;
  gap: 3px !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter .fm-filter-prefix {
  color: #000 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-align: center !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter .fm-column-filter,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter .fm-column-filter.p-inputtext {
  width: 100% !important;
  min-width: 20px !important;
  height: 25px !important;
  min-height: 25px !important;
  padding: 3px 5px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  background: #fff !important;
  color: #263238 !important;
  font-size: 11px !important;
  box-shadow: none !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter .fm-column-filter:focus {
  outline: none !important;
  border-color: #00a9bd !important;
  box-shadow: 0 0 0 2px rgba(0, 188, 212, .14) !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter-clear {
  width: 18px !important;
  min-width: 18px !important;
  height: 25px !important;
  min-height: 25px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #263746 !important;
  font-family: Arial, sans-serif !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  cursor: pointer !important;
  box-shadow: none !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-filter-clear:hover {
  color: #00a9bd !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .fm-cell-text {
  width: 100% !important;
  min-width: 0 !important;
  display: block !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-empty-message > td,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-emptymessage > td {
  padding: 0 !important;
  background: #eafcff !important;
  color: #407080 !important;
  text-align: center !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid--empty .p-datatable-table {
  height: 100% !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid--empty .p-datatable-tbody,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid--empty .p-datatable-empty-message,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid--empty .p-datatable-emptymessage {
  height: 100% !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid--empty .p-datatable-empty-message > td,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid--empty .p-datatable-emptymessage > td,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-empty {
  height: 100% !important;
  min-height: 110px !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-empty {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #eafcff !important;
  color: #407080 !important;
  font-size: 12px !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-paginator {
  flex: 0 0 auto !important;
  min-height: 39px !important;
  padding: 0 !important;
  border: 1px solid #d1d1d1 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
}

@media (max-width: 760px) {
  body .p-dialog.buscador-ots-fallidas-dialog {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    height: calc(100dvh - 74px) !important;
    max-height: calc(100dvh - 74px) !important;
  }
}
</style>
