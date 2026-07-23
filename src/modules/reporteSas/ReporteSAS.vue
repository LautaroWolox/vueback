<template>
  <div class="fm-screen fm-screen--pad report-sas-page">
    <Accordion value="0" class="fm-accordion report-sas-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>REPORTE SAS</AccordionHeader>
        <AccordionContent>
          <div v-if="error" class="report-error">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Error al cargar los datos del reporte SAS.</span>
          </div>

          <div class="report-sas-toolbar">
            <div class="report-column-field fm-field">
              <label for="report-sas-columns">Columnas visibles</label>
              <MultiSelect
                id="report-sas-columns"
                v-model="selectedColumnFields"
                :options="reporteSasColumns"
                optionLabel="header"
                optionValue="field"
                dataKey="field"
                filter
                filterPlaceholder="Buscar columna"
                placeholder="Seleccionar columnas"
                :maxSelectedLabels="1"
                selectedItemsLabel="{0} columnas seleccionadas"
                class="report-column-selector"
                appendTo="body"
                @change="onColumnSelectionChange"
              />
            </div>

            <FmButton
              label="RESTABLECER"
              class="report-reset-columns"
              @click="resetColumns"
            />
          </div>

          <FmGridShell
            class="report-sas-grid-shell"
            :loading="isFetching"
            loading-title="Cargando reporte"
            loading-message="Consultando materiales descargados"
          >
            <DataTable
              ref="dt"
              v-model:filters="filters"
              v-model:first="first"
              v-model:rows="pageRows"
              :value="processedData"
              class="fm-pass-grid report-sas-grid"
              dataKey="nroOT"
              paginator
              filterDisplay="row"
              :rowsPerPageOptions="rowsOptions"
              scrollable
              scrollHeight="flex"
              resizableColumns
              columnResizeMode="expand"
              removableSort
              sortMode="multiple"
              showGridlines
              :tableStyle="gridTableStyle"
            >
              <template
                #paginatorcontainer="{
                  first: paginatorFirst,
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
                  :first="paginatorFirst"
                  :last="last"
                  :page="page"
                  :page-count="pageCount"
                  :rows="rows"
                  :total-records="totalRecords"
                  :rows-options="rowsOptions"
                  @first-page="firstPageCallback"
                  @prev-page="prevPageCallback"
                  @next-page="nextPageCallback"
                  @last-page="lastPageCallback"
                  @page-change="changePageCallback"
                  @rows-change="rowChangeCallback"
                >
                  <template #actions>
                    <FmGridActions
                      size="large"
                      :show-delete="false"
                      :show-refresh="false"
                      export-title="Descargar reporte"
                      @export="exportarExcel"
                    />
                  </template>
                </FmGridPaginator>
              </template>

              <template #empty>
                <div class="fm-grid-empty">No hay resultados</div>
              </template>

              <Column
                v-for="column in visibleColumns"
                :key="column.field"
                :field="column.field"
                :header="column.header"
                :filterField="column.field"
                :showFilterMenu="false"
                :exportable="column.exportable !== false"
                :style="getColumnStyle(column.field)"
                :headerStyle="getColumnStyle(column.field)"
                :bodyStyle="getColumnStyle(column.field)"
                sortable
                filter
              >
                <template #filter="{ filterModel, filterCallback }">
                  <div class="fm-filter-cell">
                    <span class="fm-filter-prefix">~</span>
                    <InputText
                      v-model="filterModel.value"
                      type="text"
                      class="fm-column-filter"
                      @input="filterCallback()"
                    />
                    <button
                      type="button"
                      class="report-filter-clear"
                      title="Limpiar filtro"
                      aria-label="Limpiar filtro"
                      @click="clearColumnFilter(filterModel, filterCallback)"
                    >×</button>
                  </div>
                </template>

                <template #body="{ data: row, index }">
                  <div v-if="column.field === 'legajoNOLDAP'" class="legajo-cell-wrapper">
                    <button
                      type="button"
                      class="legajo-preview"
                      :class="{ expanded: isExpanded(index, column.field) }"
                      @click="toggleExpand(index, column.field)"
                    >
                      <span v-if="!isExpanded(index, column.field)">
                        {{ getPreview(row[column.field]) }}
                      </span>
                      <span v-else>
                        {{ getLegajosArray(row[column.field]).join(', ') }}
                      </span>
                      <i
                        v-if="isExpandable(row[column.field])"
                        class="pi"
                        :class="isExpanded(index, column.field) ? 'pi-chevron-up' : 'pi-chevron-down'"
                      ></i>
                    </button>
                  </div>

                  <span v-else class="fm-cell-text" :title="String(row[column.field] ?? '')">
                    {{ row[column.field] ?? '' }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </FmGridShell>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from '@vueuse/core'
import { FilterMatchMode } from '@primevue/core/api'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import type { IDataReportSass } from './interfaces/index'
import { reporteSasColumns } from './columns/reporteSas'
import { useExcelExport } from '../../composables/useExportExcel'

interface ExpandedState {
  [key: string]: boolean
}

interface ColumnFilterModel {
  value: string | null
}

type ReportColumn = (typeof reporteSasColumns)[number]

const rowsOptions = [10, 20, 50, 100, 200]
const first = ref(0)
const pageRows = ref(10)
const dt = ref()
const selectedColumnFields = ref<string[]>(reporteSasColumns.map((column) => column.field))
const expandedCells = ref<ExpandedState>({})
const { exportToExcel, parseDataFromTable } = useExcelExport()

const columnWidths: Record<string, number> = {
  nroOT: 125,
  estadoOT: 110,
  gestionada: 105,
  codTarea: 120,
  localidad: 145,
  codPostal: 115,
  legajoOperadorDescarga: 165,
  nomApeOperadorDescarga: 210,
  fechaDescarga: 155,
  legajoNOLDAP: 260,
  fechaCierreOT: 155,
  centro: 100,
  almacen: 105,
  serialCodMaterial: 175,
  descMaterial: 220,
  cantidadMaterial: 105,
  tipoDescarga: 130,
  mensajeSAP: 240,
  fechaNotificacionSAP: 175
}

const visibleColumns = computed<ReportColumn[]>(() => {
  const selectedFields = new Set(selectedColumnFields.value)
  return reporteSasColumns.filter((column) => selectedFields.has(column.field))
})

const gridTableStyle = computed(() => {
  const selectedWidth = visibleColumns.value.reduce(
    (total, column) => total + (columnWidths[column.field] ?? 130),
    0
  )

  return {
    width: '100%',
    minWidth: `${Math.max(selectedWidth, 900)}px`,
    tableLayout: 'fixed'
  }
})

const filters = ref(
  Object.fromEntries(
    reporteSasColumns.map((column) => [
      column.field,
      { value: null, matchMode: FilterMatchMode.CONTAINS }
    ])
  )
)

const { data, isFetching, error } = useFetch(
  '/pc/extraccionDatosGM/searchMatDescargados.html',
  { immediate: true }
).json<IDataReportSass[]>()

const processedData = computed<IDataReportSass[]>(() =>
  (data.value ?? []).map((item) => {
    const processedItem = { ...item }
    if (processedItem.legajoNOLDAP && typeof processedItem.legajoNOLDAP === 'string') {
      processedItem.legajoNOLDAP = processedItem.legajoNOLDAP
        .split(',')
        .map((legajo) => legajo.trim())
        .filter(Boolean)
        .join(',')
    }
    return processedItem
  })
)

const onColumnSelectionChange = (event: { value: string[] }) => {
  if (!event.value.length) {
    selectedColumnFields.value = [reporteSasColumns[0].field]
  }

  const visibleFields = new Set(selectedColumnFields.value)
  reporteSasColumns.forEach((column) => {
    if (!visibleFields.has(column.field) && filters.value[column.field]) {
      filters.value[column.field].value = null
    }
  })

  first.value = 0
}

const resetColumns = () => {
  selectedColumnFields.value = reporteSasColumns.map((column) => column.field)
  first.value = 0
}

const clearColumnFilter = (
  filterModel: ColumnFilterModel,
  filterCallback: () => void
) => {
  filterModel.value = null
  filterCallback()
}

const exportarExcel = () => {
  const { rows, fields } = parseDataFromTable(dt)
  exportToExcel({
    rows,
    fields,
    columns: visibleColumns.value,
    filename: 'reporteSAS.xlsx',
    columnTypes: {},
    groupField: 'codTarea'
  })
}

const getColumnStyle = (field: string) => {
  const width = columnWidths[field] ?? 130
  return {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`
  }
}

const getExpandKey = (rowIndex: number, fieldName: string) => `${rowIndex}_${fieldName}`
const isExpanded = (rowIndex: number, fieldName: string) => Boolean(expandedCells.value[getExpandKey(rowIndex, fieldName)])
const toggleExpand = (rowIndex: number, fieldName: string) => {
  const key = getExpandKey(rowIndex, fieldName)
  expandedCells.value[key] = !expandedCells.value[key]
}

const getLegajosArray = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return [String(value)]
}

const isExpandable = (value: unknown) => getLegajosArray(value).length > 2
const getPreview = (value: unknown) => {
  const items = getLegajosArray(value)
  if (items.length <= 2) return items.join(', ')
  return `${items.slice(0, 2).join(', ')} (+${items.length - 2} más)`
}
</script>

<style scoped>
.report-sas-page {
  height: calc(100dvh - 82px);
  min-height: 520px;
  overflow: hidden;
}

.report-sas-accordion,
.report-sas-accordion :deep(.p-accordionpanel) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.report-sas-accordion :deep(.p-accordioncontent) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.report-sas-accordion :deep(.p-accordioncontent-content) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.report-sas-toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: end;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 0 4px;
}

.report-column-field {
  width: min(360px, 100%);
}

.report-column-selector {
  width: 100%;
  height: 30px;
  min-height: 30px;
}

.report-column-selector :deep(.p-multiselect-label) {
  display: flex;
  align-items: center;
  min-height: 28px;
  padding: 0 8px;
  font-size: 11px;
}

.report-reset-columns,
.report-reset-columns.p-button {
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 12px !important;
  border-radius: 2px !important;
  font-size: 11px !important;
}

.report-sas-grid-shell {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.report-sas-grid,
.report-sas-grid.p-datatable {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.report-sas-grid :deep(.p-datatable-table-container),
.report-sas-grid :deep(.p-datatable-wrapper),
.report-sas-grid :deep([data-pc-section="tablecontainer"]) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  background: #fff;
}

.report-sas-grid :deep(.p-datatable-thead > tr > th) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-sas-grid :deep(.p-datatable-paginator-bottom),
.report-sas-grid :deep(> .p-paginator) {
  flex: 0 0 40px;
  height: 40px;
  min-height: 40px;
  padding: 0;
  overflow: hidden;
}

.report-filter-clear {
  width: 16px;
  min-width: 16px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.report-filter-clear:hover {
  color: #00a9bd;
}

.report-error {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 9px 12px;
  border: 1px solid #efd2d6;
  background: #fff6f7;
  color: #a12c38;
}

.legajo-preview {
  width: 100%;
  min-height: 27px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 7px;
  border: 1px solid #cfe1e6;
  border-radius: 4px;
  background: #fff;
  color: #314957;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.legajo-preview:hover,
.legajo-preview.expanded {
  border-color: #00a9bd;
  background: #edfbfd;
  color: #006f7d;
}

.legajo-preview span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legajo-preview.expanded span {
  white-space: normal;
}

@media (max-width: 700px) {
  .report-sas-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .report-column-field,
  .report-reset-columns,
  .report-reset-columns.p-button {
    width: 100% !important;
  }
}
</style>
