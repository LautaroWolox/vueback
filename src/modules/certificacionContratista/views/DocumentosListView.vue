<template>
  <div class="fm-screen certificacion-contratista-page certificacion-contratista-consulta">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion">
      <AccordionPanel value="filters">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <DocumentosFiltros
            v-model="store.filters"
            :fields="store.config.filters"
            :catalogs="store.catalogs"
            :loading="store.loading || store.catalogsLoading"
            @search="requestSearch"
            @clear="store.clearFilters()"
            @year-change="store.loadPeriods"
          />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="results">
        <AccordionHeader>{{ store.config.title.toUpperCase() }}</AccordionHeader>
        <AccordionContent>
          <DocumentosGrid
            v-model:selected="store.selectedRow"
            :rows="rowsWithKeys"
            :columns="store.config.columns"
            :loading="store.loading"
            :searched="store.searched"
            :page="store.page"
            :pageCount="store.totalPages"
            :pageSize="store.size"
            :totalRecords="store.totalElements"
            @open="openDetail"
            @page-change="store.changePage"
            @rows-change="store.changeRows"
            @export="exportRows"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <ConfirmActionDialog
      v-model:visible="noFiltersVisible"
      title="Búsqueda sin filtros"
      message="No ingresaste filtros de búsqueda. ¿Querés consultar igualmente?"
      detail="La consulta puede devolver una gran cantidad de registros."
      confirmLabel="BUSCAR"
      @confirm="confirmSearchWithoutFilters"
    />

    <FmAlertDialog
      v-model:visible="alertVisible"
      title="Certificación Contratista"
      :message="store.error"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExcelExport } from '@/composables/useExportExcel'
import DocumentosFiltros from '../components/DocumentosFiltros.vue'
import DocumentosGrid from '../components/DocumentosGrid.vue'
import ConfirmActionDialog from '../dialogs/ConfirmActionDialog.vue'
import { useConsultaDocumentosStore } from '../stores/consultaDocumentosStore'

const props = defineProps({
  documentType: { type: String, required: true }
})

const router = useRouter()
const store = useConsultaDocumentosStore()
const activePanels = ref(['filters', 'results'])
const noFiltersVisible = ref(false)
const alertVisible = computed({
  get: () => Boolean(store.error),
  set: (value) => { if (!value) store.error = '' }
})
const rowsWithKeys = computed(() => store.rows.map((row, index) => ({
  ...row,
  __rowKey: `${row[store.config.idField] ?? row[store.config.numberField] ?? index}-${index}`
})))

const hasSearchFilters = computed(() => Object.entries(store.filters).some(([key, value]) => (
  !['page', 'size', 'sinFiltros'].includes(key) && value !== '' && value !== null && value !== undefined
)))

const requestSearch = () => {
  store.filters.sinFiltros = false
  if (!hasSearchFilters.value) {
    noFiltersVisible.value = true
    return
  }
  store.search({ page: 0 })
}

const confirmSearchWithoutFilters = async () => {
  noFiltersVisible.value = false
  store.filters.sinFiltros = true
  await store.search({ page: 0 })
}

const configure = async () => {
  store.configure(props.documentType)
  await store.loadCatalogs()
}

onMounted(configure)
watch(() => props.documentType, configure)

const openDetail = (row) => {
  const number = row?.[store.config.numberField] ?? row?.nroActaDC ?? row?.nroActa
  if (!number) {
    store.error = 'El registro seleccionado no posee un número de documento válido.'
    return
  }
  router.push({
    name: store.config.detailRouteName,
    params: {
      tipo: store.config.detailTypeParam,
      numero: String(number)
    }
  })
}

const exportRows = async () => {
  const { exportToExcel } = useExcelExport()
  await exportToExcel({
    rows: store.rows,
    fields: store.config.columns.map((column) => column.field),
    columns: store.config.columns,
    filename: `${store.config.title.replace(/\s+/g, '_')}.xlsx`,
    columnTypes: Object.fromEntries(
      store.config.columns.filter((column) => column.numeric).map((column) => [column.field, 'number'])
    )
  })
}
</script>
