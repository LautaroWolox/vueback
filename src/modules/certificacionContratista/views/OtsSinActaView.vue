<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-ots-sin-acta">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion">
      <AccordionPanel value="filters">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <form class="certificacion-contratista-filters" @submit.prevent="requestSearch">
            <div class="fm-filter-grid certificacion-contratista-filters__grid">
              <div class="fm-field">
                <label for="otsa-region">Región</label>
                <Select id="otsa-region" v-model="filters.region" :options="catalogs.region" optionLabel="label" optionValue="value" placeholder="Todas" showClear filter class="fm-select" />
              </div>
              <div class="fm-field">
                <label for="otsa-contratista">Contratista</label>
                <Select id="otsa-contratista" v-model="filters.contratista" :options="catalogs.contratista" optionLabel="label" optionValue="value" placeholder="Todos" showClear filter class="fm-select" />
              </div>
              <div class="fm-field">
                <label for="otsa-sociedad">Sociedad</label>
                <Select id="otsa-sociedad" v-model="filters.sociedad" :options="catalogs.sociedad" optionLabel="label" optionValue="value" placeholder="Todas" showClear filter class="fm-select" />
              </div>
              <div class="fm-field">
                <label for="otsa-tipo">Tipo de contrato</label>
                <Select id="otsa-tipo" v-model="filters.tipoContrato" :options="catalogs.tipoContrato" optionLabel="label" optionValue="value" placeholder="Todos" showClear filter class="fm-select" />
              </div>
              <div class="fm-field">
                <label for="otsa-desde">Fecha de cierre desde</label>
                <DatePicker id="otsa-desde" v-model="filters.fechaCierreDesde" dateFormat="dd/mm/yy" showIcon showButtonBar />
              </div>
              <div class="fm-field">
                <label for="otsa-hasta">Fecha de cierre hasta</label>
                <DatePicker id="otsa-hasta" v-model="filters.fechaCierreHasta" dateFormat="dd/mm/yy" showIcon showButtonBar />
              </div>
            </div>
            <div class="fm-actions certificacion-contratista-filters__actions">
              <FmButton label="LIMPIAR" variant="outline" type="button" :disabled="loading" @click="clear" />
              <FmButton label="BUSCAR" type="submit" :loading="loading" />
            </div>
          </form>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="results">
        <AccordionHeader>ÓRDENES DE TRABAJO SIN ACTA</AccordionHeader>
        <AccordionContent>
          <div class="fm-grid-shell certificacion-contratista-grid-shell">
            <DataTable :value="pagedRows" :loading="loading" scrollable scrollHeight="flex" removableSort class="fm-pass-grid certificacion-contratista-grid">
              <template #empty><div class="fm-grid-empty">{{ searched ? 'No se encontraron OTs.' : 'Ingresá filtros y presioná BUSCAR.' }}</div></template>
              <Column v-for="column in columns" :key="column.field" :field="column.field" :header="column.header" sortable :style="{ width: column.width, minWidth: column.width }">
                <template #body="slotProps"><span class="fm-cell-text">{{ slotProps.data[column.field] ?? '-' }}</span></template>
              </Column>
            </DataTable>
            <FmGridPaginator
              :page="page"
              :pageCount="pageCount"
              :rows="rowsPerPage"
              :totalRecords="rows.length"
              :first="page * rowsPerPage"
              :last="Math.min((page + 1) * rowsPerPage, rows.length)"
              :rowsOptions="[10, 20, 50, 100, 500]"
              :autoMaxRows="false"
              @first-page="page = 0"
              @prev-page="page = Math.max(page - 1, 0)"
              @next-page="page = Math.min(page + 1, pageCount - 1)"
              @last-page="page = Math.max(pageCount - 1, 0)"
              @page-change="page = $event"
              @rows-change="changeRows"
            >
              <template #actions><FmButton label="EXPORTAR" icon="pi-file-excel" variant="outline" :disabled="!rows.length" @click="exportRows" /></template>
            </FmGridPaginator>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <ConfirmActionDialog
      v-model:visible="noFiltersVisible"
      title="Búsqueda sin filtros"
      message="No ingresaste filtros. ¿Querés consultar las OTs cerradas durante los últimos 30 días?"
      confirmLabel="BUSCAR"
      @confirm="confirmSearchWithoutFilters"
    />
    <FmAlertDialog v-model:visible="alertVisible" title="Órdenes sin acta" :message="error" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import DatePicker from 'primevue/datepicker'
import { buscarOtsSinActa, fetchLegacyCatalogs } from '../api/certificacionApi'
import { useExcelExport } from '@/composables/useExportExcel'
import ConfirmActionDialog from '../dialogs/ConfirmActionDialog.vue'

const activePanels = ref(['filters', 'results'])
const loading = ref(false)
const searched = ref(false)
const noFiltersVisible = ref(false)
const error = ref('')
const alertVisible = computed({ get: () => Boolean(error.value), set: (value) => { if (!value) error.value = '' } })
const rows = ref([])
const page = ref(0)
const rowsPerPage = ref(20)
const catalogs = reactive({ region: [], contratista: [], sociedad: [], tipoContrato: [] })
const filters = reactive({ region: '', contratista: '', sociedad: '', tipoContrato: '', fechaCierreDesde: null, fechaCierreHasta: null, sinFiltros: false })
const columns = [
  { field: 'nroOT', header: 'N.º OT', width: '125px' },
  { field: 'fechaCierre', header: 'FECHA CIERRE', width: '140px' },
  { field: 'codigoTarea', header: 'TAREA', width: '170px' },
  { field: 'direccion', header: 'DIRECCIÓN', width: '210px' },
  { field: 'ciudad', header: 'CIUDAD', width: '140px' },
  { field: 'region', header: 'REGIÓN', width: '130px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '180px' },
  { field: 'tipoContrato', header: 'TIPO CONTRATO', width: '155px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '130px' },
  { field: 'tecnicoCierre', header: 'TÉCNICO CIERRE', width: '145px' },
  { field: 'actividades', header: 'ACTIVIDADES', width: '240px' }
]
const pageCount = computed(() => Math.ceil(rows.value.length / rowsPerPage.value))
const pagedRows = computed(() => rows.value.slice(page.value * rowsPerPage.value, (page.value + 1) * rowsPerPage.value))

onMounted(async () => {
  try {
    const loaded = await fetchLegacyCatalogs('/pc/consultarOtSinACTA.html')
    catalogs.region = loaded.region
    catalogs.contratista = loaded.contratista
    catalogs.sociedad = loaded.sociedad
    catalogs.tipoContrato = loaded.tipoContrato
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'No fue posible cargar los filtros.'
  }
})

const executeSearch = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await buscarOtsSinActa(filters)
    rows.value = Array.isArray(response) ? response : response?.elements ?? response?.content ?? []
    searched.value = true
    page.value = 0
  } catch (cause) {
    rows.value = []
    searched.value = true
    error.value = cause instanceof Error ? cause.message : 'No fue posible buscar las OTs.'
  } finally {
    loading.value = false
  }
}

const hasSearchFilters = computed(() => (
  filters.region || filters.contratista || filters.sociedad || filters.tipoContrato
  || filters.fechaCierreDesde || filters.fechaCierreHasta
))

const requestSearch = () => {
  filters.sinFiltros = false
  if (!hasSearchFilters.value) {
    noFiltersVisible.value = true
    return
  }
  executeSearch()
}

const confirmSearchWithoutFilters = async () => {
  noFiltersVisible.value = false
  filters.sinFiltros = true
  await executeSearch()
}

const clear = () => {
  Object.assign(filters, { region: '', contratista: '', sociedad: '', tipoContrato: '', fechaCierreDesde: null, fechaCierreHasta: null, sinFiltros: false })
  rows.value = []
  searched.value = false
  page.value = 0
}
const changeRows = (value) => { rowsPerPage.value = value; page.value = 0 }
const exportRows = async () => {
  const { exportToExcel } = useExcelExport()
  await exportToExcel({ rows: rows.value, fields: columns.map((column) => column.field), columns, filename: 'OTs_sin_acta.xlsx' })
}
</script>
