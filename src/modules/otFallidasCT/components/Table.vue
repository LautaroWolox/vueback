<template>
  <div class="card">
    <DataTable id="tabla" 
          :value=store.rows
          dataKey="id" 
          ref="dt"
          tableStyle="table-layout: fixed; width: 100%"
          scrollable
          scrollHeight="400px"
          :rowClass="rowClass"
          :resizableColumns="true" 
          columnResizeMode="expand"
          removableSort
          sortMode="multiple"
          filterDisplay="row" 
          v-model:filters="filters" 
          v-model:selection="selectedRows" 
          selectionMode="multiple"
          paginator :rows="10" 
          :rowsPerPageOptions="[100, 250, 500]" 
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}" 
          showGridlines>
      <template #paginatorstart>
          <Button id="btnExportar" type="button" icon="pi pi-download" size="large" style="height:3rem; color: black;" class="icon-button"
            v-tooltip.top="'Exportar a Excel'" text @click="exportarExcel"/>        
          <Button id="btnExcluir" type="btn" icon="pi pi-trash" size="large" style="height:3rem" class="icon-button"
            v-tooltip.top="'Excluir'" text @click="excluir" />
          <Button id="btnReprocesar" type="button" icon="pi pi-external-link" size="large" style="height:3rem;" class="icon-button" 
            v-tooltip.top="'Reprocesar'" text  @click="reprocesar" /> 
      </template>
      <template #empty> <p class="py-1 pl-8 text-xl"> No se encontraron resultados. </p></template>
      <Column selectionMode="multiple" headerStyle="width: 3rem"/>
      <Column
        v-for="(col, index) in cols"
        :key=col.field
        :field=col.field
        :header=col.header
        :sortable=col.sort
        :filter=col.filter
        :filterField=col.field
        :showFilterMenu=col.filter
        :hidden=col.hidden
        :exportable=col.exportable
      >
        <template #filter="{ filterModel, filterCallback }">
          <InputText 
            v-if="col.filter"
            type="text" 
            v-model="filterModel.value" 
            @input="filterCallback()" 
            class="p-column-filter" 
            :placeholder="`Search`"
          />
        </template>
        <template #body="{ data }">
          <div :class="{ 'disabled-content': isDisabled(data) }">
            <div v-if="col.field === 'tieneNota'" >
              <div v-if="data['nota'] && data['nota'] !== ''"> 
                <span @click.stop="handleAction(data,'nota')" :class="{ 'disabled-click': isDisabled(data) }">
                  <img alt="nota" src="@/assets/icons/notes.png" class="image">
                </span> 
              </div>
              <div v-else></div>
            </div>
            <div v-if="col.field === 'incluir'" >
              <div v-if="data['excluida'] === 'S'" > 
                <span @click="handleAction(data,'incluir')" :class="{ 'disabled-click': isDisabled(data) }">
                  <img alt="nota" src="@/assets/icons/inclusion-icon.png" class="image">
                </span> 
              </div>
              <div v-else></div>
            </div>
            <div v-else>
              {{ data[col.field] ?? '' }}
            </div>
          </div>
        </template>   
      </Column>
    </DataTable>

    <ExcluirDialog
      v-model:visibleExc="showExcluir"
      :selected-rows="selectedRows"
    />

    <IncluirDialog
      v-model:visibleInc="showIncluir"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import InputText from 'primevue/inputtext';
import { FilterMatchMode } from '@primevue/core/api';
import { columns } from './columns'
import { useFallidasCtStore } from '../store/CtFallidaStore';
import ExcluirDialog from './ExcluirDialog.vue';
import IncluirDialog from './IncluirDialog.vue';
import { useExcelExport } from '@/composables/useExportExcel';

const store = useFallidasCtStore()
const cols = ref(columns)
const dt = ref()
const showExcluir = ref(false)
const showIncluir = ref(false)
let rowId = null
const { exportToExcel, parseDataFromTable } = useExcelExport()

const filters = ref({
    nroOrdenTrabajo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    tareaCodigo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    tecnicoCierre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    contratista: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    // Agregar el resto
});

const selectedRows = computed({
  get: () => store.rows.filter(row =>
    store.selectedRows.includes(row.id)
  ),
  set: (value) => store.setSelectedRows(value.map(v => v.id))
})

const isDisabled = (rowData) => {
  return rowData?.excluida === 'S'
}

const rowClass = (data) => {
  return {
    'disabled-row': data?.excluida === 'S',
    'enabled-row': data?.excluida === 'N'
  }
}

const handleAction = (data,actionType) => {
  if (isDisabled(data) && actionType !== 'incluir') {
    console.log('WO excluida')
    return
  } 
  if (actionType === 'nota') {
    alert("nota")
  } else if (actionType === 'incluir') {
    store.nroOT = data.nroOrdenTrabajo
    showIncluir.value = true
  }
}

const excluir = () => {
  console.log(store.selectedRows.length)
  if(store.selectedRows.length > 0){
    showExcluir.value = true
  } else {
    alert("agregar toast")
  }
}


const reprocesar = () => {
  store.sendReproceso()
}

const exportarExcel = () => {
  let { rows, fields } = parseDataFromTable(dt)
  let exportedFields = fields.filter((f) => {
    let col = cols.value.find((c) => c.field === f)
    return col && col.exportable !== false
  })
  exportToExcel({
    rows,
    fields: exportedFields,
    columns: cols.value,
    filename: 'Ot_FallidasReproceso.xlsx',
    columnTypes: {},
    groupField: null,
  })
}

</script>

<style scoped>
/* 1. Modify the height rule to ONLY target data rows and main header titles */
.p-datatable .p-datatable-thead > tr:not(.p-filter-row) > th,
.p-datatable .p-datatable-tbody > tr > td {
  height: 60px;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* 2. Give the filter row container its own relaxed, padded breathing room */
.p-datatable .p-datatable-thead > tr.p-filter-row > th {
  /* padding: 0.5rem 1rem; */
  height: auto; /* Allows input fields to scale without squishing */
}

/* 3. Ensure the custom input element scales fluidly within your resizable columns */
.p-column-filter {
  width: 100%;
  box-sizing: border-box;
  height: 25px;
}

.image {
  max-width: 20px;
  height: auto;
  padding-top: auto;
  padding-bottom: auto;
}

/* Row styling */
.disabled-row {
  background-color: rgb(58, 52, 52) !important;
  opacity: 0.7;
  pointer-events: none; 
  cursor: not-allowed;
}

.enabled-row {
  background-color: #ffffff;
}

/* Style for buttons */
:deep(.p-datatable .disabled-row .status-column) {
  pointer-events: auto;
}

:deep(.p-button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
