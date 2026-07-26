<template>
  <div
    class="fm-screen fm-screen--pad busqueda-ots-page"
    :class="{
      'busqueda-ots-page--grid-expanded': gridExpanded,
      'busqueda-ots-page--failed-filter': failedOnly
    }"
  >
    <Accordion v-model:value="activePanels" multiple class="fm-accordion busqueda-ots-accordion">
      <AccordionPanel value="0" class="busqueda-ots-filter-panel">
        <AccordionHeader>LISTA DE ORDENES DE TRABAJO A BUSCAR</AccordionHeader>
        <AccordionContent>
          <div class="busqueda-ots-filter-content">
            <textarea
              v-model="otListText"
              class="busqueda-ots-textarea"
              rows="7"
              placeholder="ESCRIBA LAS OTS SEPARADAS POR COMA"
              aria-label="Lista de órdenes de trabajo separadas por coma"
            ></textarea>

            <div class="busqueda-ots-filter-actions">
              <FmButton
                label="BUSCAR"
                :loading="searching"
                @click="searchOts"
              />
              <FmButton
                label="LIMPIAR"
                variant="outline"
                :disabled="searching"
                @click="clearSearch"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1" class="busqueda-ots-results-panel">
        <AccordionHeader>DATOS DE LAS ORDENES DE TRABAJO</AccordionHeader>
        <AccordionContent>
          <div class="busqueda-ots-grid-shell">
            <DataTable
              ref="gridRef"
              v-model:filters="columnFilters"
              v-model:first="first"
              v-model:rows="pageRows"
              :value="visibleRows"
              data-key="id"
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
              :filter-display="showColumnFilters ? 'row' : undefined"
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
                        :disabled="visibleRows.length === 0"
                        @click="downloadResults"
                      >
                        <i class="pi pi-download" aria-hidden="true"></i>
                      </button>

                      <button
                        type="button"
                        class="busqueda-ots-grid-action"
                        :class="{ 'busqueda-ots-grid-action--active': showColumnFilters }"
                        title="Mostrar filtros de columnas"
                        aria-label="Mostrar filtros de columnas"
                        :aria-pressed="showColumnFilters"
                        @click="toggleColumnFilters"
                      >
                        <i class="pi pi-filter" aria-hidden="true"></i>
                      </button>

                      <button
                        type="button"
                        class="busqueda-ots-grid-action busqueda-ots-grid-action--failed"
                        :class="{ 'busqueda-ots-grid-action--active': failedOnly }"
                        title="Filtrar fallidas"
                        aria-label="Filtrar fallidas"
                        :aria-pressed="failedOnly"
                        @click="toggleFailedFilter"
                      >
                        <FilterFailedIcon />
                      </button>

                      <button
                        type="button"
                        class="busqueda-ots-grid-action"
                        title="Buscar OTs externas"
                        aria-label="Buscar OTs externas"
                        @click="externalDialogVisible = true"
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
                :filter="showColumnFilters"
                :show-filter-menu="false"
                :style="{ width: column.width }"
                :header-style="{ width: column.width }"
                :body-style="{ width: column.width }"
                sortable
              >
                <template #filter="{ filterModel, filterCallback }">
                  <div v-if="showColumnFilters" class="busqueda-ots-column-filter">
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
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <OtsExternasDialog
      v-model:visible="externalDialogVisible"
      :rows="externalRows"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'
import FmButton from '@/components/shared/FmButton.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FilterFailedIcon from './components/FilterFailedIcon.vue'
import OtsExternasDialog from './components/OtsExternasDialog.vue'

const columns = [
  { field: 'nroOt', header: 'Nro de OT', width: '135px' },
  { field: 'nroOtSfs', header: 'Nro OT SFS', width: '135px' },
  { field: 'statusOt', header: 'Status de la OT', width: '145px' },
  { field: 'statusOtWfx', header: 'Status OT WFX', width: '145px' },
  { field: 'fechaUltimaModificacion', header: 'Fecha Última Modificación', width: '185px' },
  { field: 'nroTech', header: 'Nro Tech', width: '135px' },
  { field: 'nombreTech', header: 'Nombre del Tech', width: '165px' },
  { field: 'codigoSolucion', header: 'Código de Solución', width: '150px' },
  { field: 'empresaContratista', header: 'Empresa Contratista', width: '175px' },
  { field: 'baseTecnica', header: 'Base Técnica', width: '145px' },
  { field: 'pais', header: 'Pais', width: '135px' },
  { field: 'actividades', header: 'Actividades', width: '150px' },
  { field: 'ubicacionOt', header: 'Ubicación de la OT', width: '170px' }
]

const createColumnFilters = () => Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)

const activePanels = ref([])
const otListText = ref('')
const rows = ref([])
const externalRows = ref([])
const searching = ref(false)
const failedOnly = ref(false)
const showColumnFilters = ref(false)
const externalDialogVisible = ref(false)
const first = ref(0)
const pageRows = ref(100)
const rowsOptions = [10, 50, 100]
const columnFilters = ref(createColumnFilters())
const gridRef = ref(null)

const gridExpanded = computed(() => {
  const active = (Array.isArray(activePanels.value) ? activePanels.value : [activePanels.value]).map(String)
  return !active.includes('0') && active.includes('1')
})

const isFailedRow = (row) => {
  const status = [row?.statusOt, row?.statusOtWfx]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()

  return /FALLID|ERROR|FAILED|RECHAZ/.test(status)
}

const visibleRows = computed(() => (
  failedOnly.value ? rows.value.filter(isFailedRow) : rows.value
))

const parsedOtNumbers = computed(() => (
  [...new Set(
    otListText.value
      .split(/[\s,;]+/)
      .map((value) => value.trim())
      .filter(Boolean)
  )]
))

const searchOts = async () => {
  if (!parsedOtNumbers.value.length || searching.value) return

  searching.value = true
  first.value = 0

  try {
    // La conexión con el endpoint legacy se agrega cuando se confirme su
    // contrato de request/response. La pantalla y sus interacciones quedan
    // preparadas sin inventar datos ni URLs.
    rows.value = []
    externalRows.value = []
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  otListText.value = ''
  rows.value = []
  externalRows.value = []
  failedOnly.value = false
  showColumnFilters.value = false
  columnFilters.value = createColumnFilters()
  first.value = 0
}

const toggleColumnFilters = () => {
  showColumnFilters.value = !showColumnFilters.value

  if (!showColumnFilters.value) {
    columnFilters.value = createColumnFilters()
  }
}

const toggleFailedFilter = () => {
  failedOnly.value = !failedOnly.value
  first.value = 0
}

const clearColumnFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const downloadResults = () => {
  if (!visibleRows.value.length) return
  gridRef.value?.exportCSV?.()
}
</script>

<style scoped>
.busqueda-ots-page {
  height: calc(100vh - 82px);
  min-height: 560px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f4f6f8;
  color: #111;
  font-family: Arial, Helvetica, sans-serif;
}

.busqueda-ots-accordion {
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.busqueda-ots-page--grid-expanded .busqueda-ots-accordion,
.busqueda-ots-page--grid-expanded .busqueda-ots-results-panel {
  flex: 1 1 auto;
  min-height: 0;
}

.busqueda-ots-page :deep(.p-accordionpanel) {
  border: 1px solid #d7d7d7;
  background: #fff;
}

.busqueda-ots-page :deep(.p-accordionheader) {
  min-height: 30px;
  padding: 5px 10px;
  border: 0;
  border-radius: 0;
  background: linear-gradient(#fafafa, #f4f4f4);
  color: #111;
  font-size: 12px;
  font-weight: 400;
}

.busqueda-ots-page :deep(.p-accordionheader-toggle-icon) {
  width: 12px;
  height: 12px;
  color: #111;
}

.busqueda-ots-page :deep(.p-accordioncontent-content) {
  padding: 0;
  border: 0;
  background: #fff;
}

.busqueda-ots-page--grid-expanded :deep(.busqueda-ots-results-panel),
.busqueda-ots-page--grid-expanded :deep(.busqueda-ots-results-panel .p-accordioncontent),
.busqueda-ots-page--grid-expanded :deep(.busqueda-ots-results-panel .p-accordioncontent-content) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.busqueda-ots-filter-content {
  min-height: 252px;
  padding: 12px 20px 16px;
  border-left: 4px solid #00a9bd;
  background: #fff;
}

.busqueda-ots-textarea {
  width: 100%;
  min-height: 178px;
  max-height: 320px;
  padding: 12px;
  resize: vertical;
  border: 1px solid #c7c7c7;
  border-radius: 2px;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 12px;
  line-height: 1.4;
  box-sizing: border-box;
}

.busqueda-ots-textarea::placeholder {
  color: #426f87;
  opacity: 1;
}

.busqueda-ots-textarea:focus {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .12);
}

.busqueda-ots-filter-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 14px;
}

.busqueda-ots-filter-actions :deep(.fm-action-button),
.busqueda-ots-filter-actions :deep(.fm-ui-button) {
  min-width: 80px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 14px !important;
  border-radius: 15px !important;
  font-size: 11px !important;
  font-weight: 400 !important;
  box-shadow: none !important;
}

.busqueda-ots-grid-shell {
  width: 100%;
  height: 590px;
  min-height: 360px;
  display: flex;
  overflow: hidden;
  border-left: 4px solid #00a9bd;
  background: #fff;
}

.busqueda-ots-page--grid-expanded .busqueda-ots-grid-shell {
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
}

.busqueda-ots-grid,
.busqueda-ots-grid.p-datatable {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 0;
}

.busqueda-ots-grid :deep(.p-datatable-table-container),
.busqueda-ots-grid :deep(.p-datatable-wrapper) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  background: #fff;
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

.busqueda-ots-grid-action--failed {
  width: 24px;
  min-width: 24px;
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
  .busqueda-ots-page {
    height: auto;
    min-height: calc(100vh - 82px);
    overflow: visible;
  }

  .busqueda-ots-filter-content {
    padding: 10px;
  }

  .busqueda-ots-filter-actions {
    flex-wrap: wrap;
  }

  .busqueda-ots-grid-shell,
  .busqueda-ots-page--grid-expanded .busqueda-ots-grid-shell {
    height: 520px;
    min-height: 520px;
  }
}
</style>
