<template>
  <div class="fm-screen fm-screen--pad report-sas-page">
    <Accordion value="0" class="fm-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>REPORTE SAS</AccordionHeader>
        <AccordionContent>
          <div v-if="error" class="report-error">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Error al cargar los datos del reporte SAS.</span>
          </div>

          <FmGridShell
            :loading="isFetching"
            loading-title="Cargando reporte"
            loading-message="Consultando materiales descargados"
          >
            <DataTable
              ref="dt"
              v-model:filters="filters"
              :value="processedData"
              class="fm-pass-grid report-sas-grid"
              dataKey="nroOT"
              paginator
              filterDisplay="row"
              :rows="10"
              :rowsPerPageOptions="[10, 20, 50, 100, 200]"
              paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords}"
              scrollable
              scrollHeight="430px"
              resizableColumns
              columnResizeMode="expand"
              showGridlines
            >
              <template #paginatorstart>
                <FmGridActions
                  size="large"
                  :show-delete="false"
                  :show-refresh="false"
                  @export="exportarExcel"
                />
              </template>

              <template #empty>
                <div class="fm-grid-empty">No hay resultados</div>
              </template>

              <Column
                v-for="column in selectedColumns"
                :key="column.field"
                :field="column.field"
                :header="column.header"
                :filterField="column.field"
                :showFilterMenu="false"
                :exportable="column.exportable"
                :style="getColumnStyle(column.field)"
                sortable
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
                    <span class="fm-filter-more">...</span>
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
import type { IDataReportSass } from './interfaces/index'
import { reporteSasColumns } from './columns/reporteSas'
import { useExcelExport } from '../../composables/useExportExcel'

interface ExpandedState { [key: string]: boolean }

const dt = ref()
const selectedColumns = ref([...reporteSasColumns])
const expandedCells = ref<ExpandedState>({})
const { exportToExcel, parseDataFromTable } = useExcelExport()

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

const exportarExcel = () => {
  const { rows, fields } = parseDataFromTable(dt)
  exportToExcel({
    rows,
    fields,
    columns: reporteSasColumns,
    filename: 'reporteSAS.xlsx',
    columnTypes: {},
    groupField: 'codTarea'
  })
}

const getColumnStyle = (field: string) => {
  const widths: Record<string, string> = {
    nroOT: 'width: 125px',
    estadoOT: 'width: 110px',
    gestionada: 'width: 105px',
    codTarea: 'width: 120px',
    localidad: 'width: 145px',
    codPostal: 'width: 115px',
    legajoOperadorDescarga: 'width: 165px',
    nomApeOperadorDescarga: 'width: 210px',
    fechaDescarga: 'width: 155px',
    legajoNOLDAP: 'width: 260px',
    fechaCierreOT: 'width: 155px',
    centro: 'width: 100px',
    almacen: 'width: 105px',
    serialCodMaterial: 'width: 175px',
    descMaterial: 'width: 220px',
    cantidadMaterial: 'width: 105px',
    tipoDescarga: 'width: 130px',
    mensajeSAP: 'width: 240px',
    fechaNotificacionSAP: 'width: 175px'
  }
  return widths[field] || 'width: 130px'
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
  min-height: calc(100vh - 82px);
}

.report-sas-grid :deep(.p-datatable-table-container) {
  min-height: 230px;
  background: #eafcff;
}

.report-error {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
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
</style>
