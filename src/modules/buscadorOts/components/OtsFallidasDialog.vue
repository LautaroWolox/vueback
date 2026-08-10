<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    header="Órdenes de Trabajo Fallidas"
    :closable="true"
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
    <FmGridShell class="buscador-ots-fallidas-grid-shell">
      <DataTable
        ref="tableRef"
        v-model:filters="filters"
        v-model:first="first"
        v-model:rows="pageRows"
        :value="rows"
        data-key="id"
        class="fm-pass-grid buscador-ots-fallidas-grid"
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
          <div class="fm-grid-empty">No hay órdenes de trabajo fallidas</div>
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
            <div class="fm-filter-cell">
              <span class="fm-filter-prefix">~</span>
              <InputText
                v-model="filterModel.value"
                class="fm-column-filter"
                type="text"
                @input="filterCallback()"
              />
              <button
                type="button"
                class="fm-filter-more"
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
const pageRows = ref(100)
const filters = ref(Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
))

const rows = computed(() => props.rows ?? [])

watch(() => props.visible, (isVisible) => {
  if (!isVisible) return
  first.value = 0
})

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
}

body .p-dialog.buscador-ots-fallidas-dialog .p-dialog-header-actions {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  margin-left: auto !important;
  align-items: center !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .p-dialog-close-button {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  align-items: center !important;
  justify-content: center !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .p-dialog-content {
  flex: 1 1 auto !important;
  width: 100% !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
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
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-table-container,
body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-wrapper {
  flex: 1 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: auto !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-paginator {
  flex: 0 0 auto !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .p-datatable-empty-message > td {
  height: 100% !important;
  vertical-align: middle !important;
}

body .p-dialog.buscador-ots-fallidas-dialog .buscador-ots-fallidas-grid .fm-grid-empty {
  min-height: 100% !important;
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
