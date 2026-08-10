<template>
  <div class="container-xl p-4">
    <Accordion :activeIndex="0">
      <AccordionTab header="Reporte SAS">
        <Message v-if="error" severity="error" class="mb-3">
          Error al cargar los datos del reporte SAS.
        </Message>

        <div class="card" v-if="!isFetching">
          <DataTable
            :value="processedData"
            ref="dt"
            paginator
            filterDisplay="row"
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50, 100, 200]"
            tableStyle="min-width: 80rem"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            :resizableColumns="true"
            columnResizeMode="expand"
            showGridlines
          >
            <template #paginatorstart>
              <Button
                type="button"
                icon="pi pi-download"
                text
                @click="exportarExcel"
              />
            </template>

            <Column
              v-for="(col, index) in selectedColumns"
              :key="col.field + '_' + index"
              :field="col.field"
              :header="col.header"
              :filter="col.filter"
              :filterField="col.field"
              filterPlaceholder="Buscar..."
              :filterMatchMode="'contains'"
              :resizable="true"
              :exportable="col.exportable"
              :style="getColumnStyle(col.field)"
            >
              <template #body="slotProps">
                <div
                  v-if="col.field === 'legajoNOLDAP'"
                  class="legajo-cell-wrapper"
                > 
                  <div
                    class="legajo-container"
                    :class="{ expanded: isExpanded(slotProps.index, col.field) }"
                  >
                    <div
                      v-if="!isExpanded(slotProps.index, col.field)"
                      class="legajo-preview"
                      tabindex="0"
                      @click="toggleExpand(slotProps.index, col.field)"
                      @keydown.enter="toggleExpand(slotProps.index, col.field)"
                    >
                      <span class="preview-text">
                        {{ getPreview(slotProps.data[col.field]) }}
                      </span>

                      <i
                        v-if="isExpandable(slotProps.data[col.field])"
                        class="pi pi-chevron-down expand-arrow"
                      />
                    </div>

                    <div v-else class="legajo-expanded">
                      <div
                        class="legajo-header"
                        tabindex="0"
                        @click="toggleExpand(slotProps.index, col.field)"
                        @keydown.enter="toggleExpand(slotProps.index, col.field)"
                      >
                        <span class="header-text">
                          Legajos ({{ getLegajosArray(slotProps.data[col.field]).length }})
                        </span>

                        <i class="pi pi-chevron-up collapse-arrow" />
                      </div>

                      <div class="legajo-list">
                        <div
                          v-for="(legajo, idx) in getLegajosArray(slotProps.data[col.field])"
                          :key="idx"
                          class="legajo-item"
                        >
                          {{ legajo }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <span v-else>
                  {{ slotProps.data[col.field] ?? '' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-else class="text-center">
          <ProgressSpinner class="inline-block" />
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, ref, watch } from 'vue'
import { useFetch } from '@vueuse/core'
import { useExcelExport } from '../../composables/useExportExcel'
import type { IDataReportSass } from './interfaces/index'
import { reporteSasColumns } from './columns/reporteSas'

interface ExpandedState { [key: string]: boolean }

const dt = ref()
const columns = ref(reporteSasColumns)
const selectedColumns = ref([...columns.value])
const expandedCells = ref<ExpandedState>({})

const { exportToExcel,parseDataFromTable } = useExcelExport()


const { data, isFetching, error } = useFetch('/pc/extraccionDatosGM/searchMatDescargados.html', {
  immediate: true,

  afterFetch(ctx) {
    console.log('Respuesta reporte SAS:', ctx.data)
    return ctx
  },

  onFetchError(ctx) {
    console.error('Error al cargar reporte SAS:', ctx.error)
    return ctx
  }
}).json<IDataReportSass[]>()

watch(data, newData => { console.log('Data actualizada:', newData) })

watch(error, newError => {
  if (newError) {
    console.error('Error detectado:', newError)
  }
})

const processedData = computed<IDataReportSass[]>(() => {
  return (data.value ?? []).map(item => {
    const processedItem = { ...item }

    if (
      processedItem.legajoNOLDAP &&
      typeof processedItem.legajoNOLDAP === 'string'
    ) {
      const legajos = processedItem.legajoNOLDAP
        .split(',')
        .map(legajo => legajo.trim())
        .filter(Boolean)
      processedItem.legajoNOLDAP = legajos.join(',')
    }

    return processedItem
  })
})

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
  if (field === 'legajoNOLDAP') {
    return {
      minWidth: '280px',
      maxWidth: '400px'
    }
  }

  return {
    minWidth: '100px'
  }
}

const getExpandKey = (
  rowIndex: number,
  fieldName: string
): string => {
  return `${rowIndex}_${fieldName}`
}

const isExpanded = (
  rowIndex: number,
  fieldName: string
): boolean => {
  const key = getExpandKey(rowIndex, fieldName)
  return expandedCells.value[key] || false
}

const toggleExpand = (
  rowIndex: number,
  fieldName: string
): void => {
  const key = getExpandKey(rowIndex, fieldName)
  expandedCells.value[key] = !expandedCells.value[key]
}

const isExpandable = (data: unknown): boolean => {
  if (!data) return false

  if (Array.isArray(data)) {
    return data.length > 2
  }

  if (typeof data === 'string') {
    const items = data
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)

    return items.length > 2
  }

  return false
}

const getPreview = (data: unknown): string => {
  if (!data) return ''

  let items: string[] = []

  if (Array.isArray(data)) {
    items = data.map(item => String(item))
  } else if (typeof data === 'string') {
    items = data
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  } else {
    return String(data)
  }

  if (items.length <= 2) {
    return items.join(', ')
  }

  return `${items.slice(0, 2).join(', ')} (+${items.length - 2} más)`
}

const getLegajosArray = (data: unknown): string[] => {
  if (!data) return []

  if (Array.isArray(data)) {
    return data.map(item => String(item))
  }

  if (typeof data === 'string') {
    return data
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  return [String(data)]
}
</script>

<style scoped>
.legajo-cell-wrapper {
  width: 100%;
  height: 100%;
}

.legajo-container {
  width: 100%;
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.legajo-container.expanded {
  background-color: #f0f8f0;
  border-color: #4caf50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
}

/* Vista colapsada */
.legajo-preview {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  transition: background-color 0.2s ease;
}

.legajo-preview:hover {
  background-color: #f5f5f5;
}

.preview-text {
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
}

.expand-arrow {
  color: #1976d2;
  font-size: 14px;
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.expand-arrow:hover {
  transform: scale(1.2);
}

/* Vista expandida */
.legajo-expanded {
  width: 100%;
}

.legajo-header {
  padding: 8px 12px;
  background-color: #e8f5e8;
  border-bottom: 1px solid #c8e6c9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;
}

.legajo-header:hover {
  background-color: #dcedc8;
}

.header-text {
  font-weight: 600;
  color: #2e7d32;
  font-size: 13px;
}

.collapse-arrow {
  color: #4caf50;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.collapse-arrow:hover {
  transform: scale(1.2);
}

.legajo-list {
  padding: 8px;
  background-color: #ffffff;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.legajo-item {
  padding: 6px 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease;
  cursor: default;
}

.legajo-item:hover {
  background-color: #e3f2fd;
  border-color: #90caf9;
  color: #1565c0;
  transform: translateX(2px);
}

.container-xl {
  max-width: 100%;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilos para la tabla con resize y filtros */
:deep(.p-datatable) {
  border: 1px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 12px 8px;
  font-weight: 600;
  color: #495057;
  position: relative;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: 1px solid #dee2e6;
  padding: 4px;
  vertical-align: top;
  overflow: visible;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #e3f2fd;
}

/* Estilos para el resize de columnas */
:deep(.p-datatable .p-column-resizer) {
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  width: 4px;
  height: 100%;
  padding: 0;
  cursor: col-resize;
  border: none;
  background-color: transparent;
}

:deep(.p-datatable .p-column-resizer:hover) {
  background-color: #2196f3;
}

/* Estilos para los filtros en las filas */
:deep(.p-datatable .p-datatable-thead > tr:last-child > th) {
  border-bottom: 2px solid #2196f3;
}

:deep(.p-datatable .p-column-filter) {
  width: 100%;
  max-width: none;
}

:deep(.p-datatable .p-column-filter .p-inputtext) {
  width: 100%;
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

:deep(.p-datatable .p-column-filter .p-inputtext:focus) {
  border-color: #2196f3;
  box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
}

/* Estilos para los botones del header */
:deep(.p-button.p-button-rounded) {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

:deep(.p-button.p-button-text) {
  border: 1px solid transparent;
}

:deep(.p-button.p-button-text:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Estilos para el MultiSelect */
:deep(.p-multiselect) {
  min-width: 300px;
}

:deep(.p-multiselect-label) {
  padding: 8px 12px;
}

/* Scrollbar personalizado para la lista de legajos */
.legajo-list::-webkit-scrollbar {
  width: 6px;
}

.legajo-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.legajo-list::-webkit-scrollbar-thumb {
  background: #4caf50;
  border-radius: 3px;
}

.legajo-list::-webkit-scrollbar-thumb:hover {
  background: #388e3c;
}

/* Estilos responsive */
@media (max-width: 768px) {
  .legajo-container {
    font-size: 13px;
  }

  .legajo-item {
    font-size: 11px;
    padding: 4px 8px;
  }

  .legajo-preview {
    padding: 8px 10px;
    min-height: 36px;
  }

  .legajo-header {
    padding: 6px 10px;
  }

  .header-text {
    font-size: 12px;
  }

  :deep(.p-multiselect) {
    min-width: 250px;
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 8px 6px;
    font-size: 13px;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 3px;
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  :deep(.p-multiselect) {
    min-width: 200px;
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 6px 4px;
    font-size: 12px;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 2px;
    font-size: 12px;
  }
}

/* Animaciones suaves */
.legajo-expanded {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }

  to {
    opacity: 1;
    max-height: 250px;
  }
}

/* Estilos para mejorar la accesibilidad */
.legajo-preview:focus,
.legajo-header:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.legajo-preview:focus-visible,
.legajo-header:focus-visible {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

/* Asegurar que la celda expandida no afecte el layout de la tabla */
:deep(.p-datatable .p-datatable-tbody > tr > td:has(.legajo-container.expanded)) {
  vertical-align: top;
  position: relative;
}

/* Fijar altura mínima para celdas con legajos */
:deep(.p-datatable .p-datatable-tbody > tr > td:has(.legajo-cell-wrapper)) {
  min-height: 50px;
  height: auto;
}
</style>