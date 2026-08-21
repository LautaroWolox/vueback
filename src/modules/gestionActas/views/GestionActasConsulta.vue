<template>
  <ActasWorkspaceDemo
    v-if="isActa && workspaceOpen"
    :actas="selectedRows"
    :initial-acta="String(selectedRows[0]?.nroActa || '')"
    @back="workspaceOpen = false"
  />

  <NotaDcWorkspace
    v-else-if="isNote && selectedNote"
    :type="documentType"
    :note="selectedNote"
    @back="selectedNote = null"
  />

  <div v-else class="fm-screen gestion-actas-module gestion-actas-consulta" :class="{ 'is-results-only': resultsOnly }">
    <header v-if="!resultsOnly" class="gestion-actas-heading">
      <div>
        <span>Gestión de Actas</span>
        <h1>{{ pageTitle }}</h1>
      </div>
      <div class="gestion-actas-heading__meta">
        <i class="pi pi-database" />
        <span>Field Manager</span>
      </div>
    </header>

    <nav v-if="isActa && !resultsOnly" class="gestion-main-stepper" aria-label="Flujo de Gestión de Actas">
      <button type="button" class="gestion-main-step is-active">
        <span>1</span>
        <div><strong>Seleccionar actas</strong><small>Buscar y elegir una o varias</small></div>
      </button>
      <span class="gestion-main-step__line" :class="{ 'is-complete': selectedRows.length }" />
      <button type="button" class="gestion-main-step" :class="{ 'is-ready': selectedRows.length }" :disabled="!selectedRows.length" @click="openWorkspace">
        <span>2</span>
        <div><strong>Actas seleccionadas</strong><small>{{ selectedRows.length ? `${selectedRows.length} disponibles` : 'Sin selección' }}</small></div>
      </button>
    </nav>

    <Accordion v-model:value="accordionValue" multiple class="fm-accordion gestion-actas-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <div class="gestion-actas-filters">
            <template v-if="!isOtsSinActa">
              <div class="gestion-filter-grid">
                <label class="gestion-field">
                  <span>Provincia</span>
                  <Select v-model="filters.provincia" :options="store.catalogs.provincia" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Contratista {{ isNote ? 'Nota' : 'Acta' }}</span>
                  <Select v-model="filters.contratista" :options="store.catalogs.contratista" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Sociedad {{ isNote ? 'Nota' : 'Acta' }}</span>
                  <Select v-model="filters.sociedad" :options="store.catalogs.sociedad" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Tipo de Contrato</span>
                  <Select v-model="filters.tipoContrato" :options="store.catalogs.tipoContrato" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field gestion-field--year">
                  <span>Año</span>
                  <Select v-model="filters.periodoAnio" :options="store.catalogs.periodoAnio" optionLabel="label" optionValue="value" showClear placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field gestion-field--period">
                  <span>Período</span>
                  <Select v-model="filters.periodoNombre" :options="periodOptions" optionLabel="label" optionValue="value" showClear placeholder="Seleccione..." :disabled="!filters.periodoAnio" />
                </label>
                <label class="gestion-field">
                  <span>Estado</span>
                  <Select v-model="filters.estadoActa" :options="store.catalogs.estadoActa" optionLabel="label" optionValue="value" showClear placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
              </div>

              <div class="gestion-reference-grid">
                <label class="gestion-field">
                  <span>{{ isDebit ? 'Nota de Débito' : isCredit ? 'Nota de Crédito' : 'Nro de Acta' }}</span>
                  <InputText v-model.trim="filters.nroActa" :placeholder="isNote ? 'Ingrese el número de nota' : 'Ingrese el número de acta'" @keyup.enter="requestSearch" />
                </label>
                <label class="gestion-field">
                  <span>N° de OT</span>
                  <InputText v-model.trim="filters.nroOt" placeholder="Ingrese el número de OT" @keyup.enter="requestSearch" />
                </label>
                <label v-if="isNote" class="gestion-field">
                  <span>Nro Acta Asociada</span>
                  <InputText v-model.trim="filters.nroActaAsoc" placeholder="Ingrese el acta asociada" @keyup.enter="requestSearch" />
                </label>
              </div>
            </template>

            <template v-else>
              <div class="gestion-filter-grid gestion-filter-grid--ots-sin-acta">
                <label class="gestion-field">
                  <span>Región</span>
                  <Select v-model="filters.region" :options="store.otsSinActaCatalogs.region" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Contratista</span>
                  <Select v-model="filters.contratista" :options="store.otsSinActaCatalogs.contratista" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Sociedad</span>
                  <Select v-model="filters.sociedad" :options="store.otsSinActaCatalogs.sociedad" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Tipo de Contrato</span>
                  <Select v-model="filters.tipoContrato" :options="store.otsSinActaCatalogs.tipoContrato" optionLabel="label" optionValue="value" showClear filter placeholder="Seleccione..." :loading="catalogLoading" />
                </label>
                <label class="gestion-field">
                  <span>Fecha Cierre Desde</span>
                  <InputText v-model.trim="filters.fechaCierreDesde" placeholder="dd/mm/aaaa" @keyup.enter="requestSearch" />
                </label>
                <label class="gestion-field">
                  <span>Fecha Cierre Hasta</span>
                  <InputText v-model.trim="filters.fechaCierreHasta" placeholder="dd/mm/aaaa" @keyup.enter="requestSearch" />
                </label>
              </div>
            </template>

            <div v-if="feedback" class="gestion-feedback" role="alert">
              <i class="pi pi-exclamation-triangle" />
              <span>{{ feedback }}</span>
            </div>

            <div class="fm-actions fm-filter-actions gestion-filter-actions">
              <FmButton label="BUSCAR" :loading="searchLoading" @click="requestSearch" />
              <FmButton label="LIMPIAR" variant="outline" :disabled="searchLoading" @click="clearFilters" />
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1" class="gestion-results-panel">
        <AccordionHeader>{{ resultsTitle.toUpperCase() }}</AccordionHeader>
        <AccordionContent>
          <div class="gestion-results-body">
            <ActasWorkspaceGrid
              v-model:selection="selectedRows"
              :rows="rows"
              :columns="columns"
              :data-key="dataKey"
              :title="resultsTitle"
              :selectable="isActa"
              show-export
              :export-filename="exportFilename"
              :rows-options="[100, 250, 500]"
              :empty-text="hasSearched ? 'No hay resultados' : 'Realice una búsqueda para visualizar resultados'"
            >
              <template v-if="isNote" #cell-nroActaDC="{ data }">
                <button type="button" class="gestion-actas-link" @click="selectedNote = data">{{ data.nroActaDC }}</button>
              </template>
              <template v-if="isActa" #cell-nroActa="{ data }">
                <span class="gestion-actas-link gestion-actas-link--static">{{ data.nroActa }}</span>
              </template>
              <template v-if="isActa" #cell-estadoActa="{ data }">
                <span class="gestion-actas-state" :class="stateClass(data.estadoActa)">{{ data.estadoActa || '-' }}</span>
              </template>
              <template v-if="isNote" #cell-estadoNota="{ data }">
                <span class="gestion-actas-state" :class="stateClass(data.estadoNota)">{{ data.estadoNota || '-' }}</span>
              </template>
            </ActasWorkspaceGrid>

            <footer v-if="isActa" class="gestion-actas-footer">
              <span>{{ selectedRows.length ? `${selectedRows.length} acta${selectedRows.length === 1 ? '' : 's'} seleccionada${selectedRows.length === 1 ? '' : 's'}` : 'Seleccioná una o más filas para continuar.' }}</span>
              <FmButton label="CONTINUAR" icon="pi-arrow-right" :disabled="!selectedRows.length" @click="openWorkspace" />
            </footer>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <Dialog
      v-model:visible="confirmNoFilters"
      modal
      header="Confirmar búsqueda"
      :draggable="false"
      class="fm-dialog"
      :style="{ '--fm-dialog-width': '32rem' }"
    >
      <div class="gestion-actas-confirm">
        <i class="pi pi-exclamation-triangle" />
        <p>Está a punto de realizar una búsqueda sin filtros. ¿Desea continuar?</p>
      </div>
      <template #footer>
        <FmButton label="CANCELAR" variant="outline" @click="confirmNoFilters = false" />
        <FmButton label="CONTINUAR" icon="pi-check" @click="confirmAndSearch" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import FmButton from '@/components/shared/FmButton.vue'
import ActasWorkspaceDemo from '../components/ActasWorkspaceDemo.vue'
import ActasWorkspaceGrid from '../components/ActasWorkspaceGrid.vue'
import NotaDcWorkspace from './NotaDcWorkspace.vue'
import { DOCUMENT_TYPES, useGestionActasStore } from '@/store/gestionActas'

const props = defineProps({
  documentType: { type: String, default: DOCUMENT_TYPES.ACTA },
})

const store = useGestionActasStore()
const documentType = computed(() => props.documentType)
const isActa = computed(() => documentType.value === DOCUMENT_TYPES.ACTA)
const isDebit = computed(() => documentType.value === DOCUMENT_TYPES.NOTA_DEBITO)
const isCredit = computed(() => documentType.value === DOCUMENT_TYPES.NOTA_CREDITO)
const isNote = computed(() => isDebit.value || isCredit.value)
const isOtsSinActa = computed(() => documentType.value === DOCUMENT_TYPES.OT_SIN_ACTA)

const filters = reactive(createEmptyFilters())
const rows = ref([])
const selectedRows = ref([])
const selectedNote = ref(null)
const workspaceOpen = ref(false)
const hasSearched = ref(false)
const searchLoading = ref(false)
const feedback = ref('')
const confirmNoFilters = ref(false)
const accordionValue = ref(['0'])

function createEmptyFilters() {
  return {
    provincia: '', contratista: '', sociedad: '', tipoContrato: '', periodoAnio: '', periodoNombre: '', estadoActa: '',
    nroActa: '', nroOt: '', nroActaAsoc: '', region: '', fechaCierreDesde: '', fechaCierreHasta: '',
  }
}

const pageTitle = computed(() => {
  if (isDebit.value) return 'Consultar Nota de Débito'
  if (isCredit.value) return 'Consultar Nota de Crédito'
  if (isOtsSinActa.value) return 'Órdenes de Trabajo sin Acta'
  return 'Consultar Actas'
})
const resultsTitle = computed(() => {
  if (isDebit.value) return 'Notas de Débito'
  if (isCredit.value) return 'Notas de Crédito'
  if (isOtsSinActa.value) return 'Órdenes de Trabajo'
  return 'Actas'
})
const exportFilename = computed(() => {
  if (isDebit.value) return 'Consulta_de_Notas_Debito.xlsx'
  if (isCredit.value) return 'Consulta_de_Notas_Credito.xlsx'
  if (isOtsSinActa.value) return 'OrdenesTrabajoSinActa.xlsx'
  return 'Consulta_de_Actas.xlsx'
})
const dataKey = computed(() => isNote.value ? 'actaDCId' : isOtsSinActa.value ? 'idOrdenTrabajo' : 'nroActa')
const catalogLoading = computed(() => isOtsSinActa.value ? store.otsSinActaCatalogStatus === 'loading' : store.catalogStatus === 'loading')
const resultsOnly = computed(() => accordionValue.value.includes('1') && !accordionValue.value.includes('0'))

const periodOptions = computed(() => {
  const year = String(filters.periodoAnio || '')
  if (!year) return []
  const all = store.catalogs.periodoNombre || []
  const matched = all.filter((item) => !item.year || String(item.year) === year)
  return matched.length ? matched : all
})

const actaColumns = [
  { field: 'nroActa', header: 'NRO_ACTA', width: '126px' },
  { field: 'hayND', header: 'ND ASOCIADA', width: '112px' },
  { field: 'hayNC', header: 'NC ASOCIADA', width: '112px' },
  { field: 'estadoActa', header: 'ESTADO_ACTA', width: '132px' },
  { field: 'periodo', header: 'PERIODO', width: '128px' },
  { field: 'anio', header: 'AÑO', width: '78px' },
  { field: 'fechaCreacion', header: 'FECHA_CREACIÓN', width: '142px' },
  { field: 'fechaCierre', header: 'FECHA_CIERRE', width: '136px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'pais', header: 'PAÍS', width: '100px' },
  { field: 'provincia', header: 'PROVINCIA', width: '132px' },
  { field: 'region', header: 'REGIÓN', width: '122px' },
  { field: 'tipoContrato', header: 'TIPO_CONTRATO', width: '150px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '122px' },
  { field: 'usuarioCierre', header: 'USUARIO_CIERRE', width: '142px' },
  { field: 'valoracion', header: 'VALORACIÓN', width: '112px' },
]
const noteColumns = [
  { field: 'nroActaDC', header: 'NRO_NOTA', width: '130px' },
  { field: 'nroActa', header: 'NUMERO DE ACTA', width: '135px' },
  { field: 'estadoNota', header: 'ESTADO_NOTA', width: '125px' },
  { field: 'periodo', header: 'PERIODO', width: '135px' },
  { field: 'anio', header: 'AÑO', width: '80px' },
  { field: 'fechaCreacionDC', header: 'FECHA_CREACION_NOTA', width: '160px' },
  { field: 'fechaCierreDC', header: 'FECHA_CIERRE_NOTA', width: '155px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'pais', header: 'PAIS', width: '100px' },
  { field: 'provincia', header: 'PROVINCIA', width: '130px' },
  { field: 'region', header: 'REGION', width: '120px' },
  { field: 'contrato', header: 'TIPO_CONTRATO', width: '150px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '120px' },
  { field: 'usuarioCierre', header: 'USUARIO_CIERRE', width: '140px' },
  { field: 'calificacion', header: 'VALORACION_ACTA', width: '130px' },
]
const otsSinActaColumns = [
  { field: 'nroOT', header: 'NRO OT', width: '130px' },
  { field: 'fechaCierre', header: 'FECHA CIERRE', width: '145px' },
  { field: 'codigoTarea', header: 'CODIGO TAREA', width: '150px' },
  { field: 'direccion', header: 'DIRECCION', width: '220px' },
  { field: 'ciudad', header: 'CIUDAD', width: '135px' },
  { field: 'region', header: 'REGION', width: '125px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
  { field: 'tipoContrato', header: 'TIPO CONTRATO', width: '150px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '125px' },
  { field: 'tecnicoCierre', header: 'TECNICO CIERRE', width: '150px' },
  { field: 'actividades', header: 'ACTIVIDADES', width: '220px' },
]
const columns = computed(() => isNote.value ? noteColumns : isOtsSinActa.value ? otsSinActaColumns : actaColumns)

const normalizeState = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
const stateClass = (value) => {
  const state = normalizeState(value)
  if (state.includes('CERT') || state.includes('CERR')) return 'is-success'
  if (state.includes('CURSO') || state.includes('PROCES') || state.includes('EJEC')) return 'is-info'
  if (state.includes('PEND') || state.includes('ABIERT') || state.includes('INICI')) return 'is-warning'
  if (state.includes('ANUL') || state.includes('RECHAZ') || state.includes('ERROR') || state.includes('FALL')) return 'is-danger'
  return 'is-neutral'
}

const commonFilterKeys = ['provincia', 'contratista', 'sociedad', 'tipoContrato', 'periodoAnio', 'periodoNombre', 'estadoActa']
const hasAnyFilter = () => {
  const keys = isOtsSinActa.value
    ? ['region', 'contratista', 'sociedad', 'tipoContrato', 'fechaCierreDesde', 'fechaCierreHasta']
    : [...commonFilterKeys, 'nroActa', 'nroOt', ...(isNote.value ? ['nroActaAsoc'] : [])]
  return keys.some((key) => String(filters[key] || '').trim())
}
const hasCommonFilter = () => commonFilterKeys.some((key) => String(filters[key] || '').trim())

const validateNotes = () => {
  if (!hasAnyFilter()) return 'Al menos un dato es obligatorio.'
  const nroNota = String(filters.nroActa || '').trim()
  const nroOt = String(filters.nroOt || '').trim()
  const nroActaAsoc = String(filters.nroActaAsoc || '').trim()
  if (nroNota && (nroOt || nroActaAsoc || hasCommonFilter())) return 'La búsqueda por Nro de Nota es independiente de otros filtros.'
  if (nroOt && (nroActaAsoc || hasCommonFilter())) return 'La búsqueda por Nro de OT es independiente de otros filtros.'
  if (nroActaAsoc && hasCommonFilter()) return 'La búsqueda por Nro de Acta Asociada es independiente de otros filtros.'
  return ''
}

const requestSearch = () => {
  feedback.value = ''
  if (isNote.value) {
    const message = validateNotes()
    if (message) { feedback.value = message; return }
    runSearch(false)
    return
  }
  if (!hasAnyFilter()) {
    confirmNoFilters.value = true
    return
  }
  runSearch(false)
}

const confirmAndSearch = () => {
  confirmNoFilters.value = false
  runSearch(true)
}

const runSearch = async (sinFiltros) => {
  searchLoading.value = true
  feedback.value = ''
  try {
    let result
    if (isActa.value) {
      result = await store.searchActas(filters, { page: 0, size: 500 })
      rows.value = result.elements
    } else if (isNote.value) {
      result = await store.searchNotes(documentType.value, filters, { page: 0, size: 500 })
      rows.value = result.elements
    } else {
      result = await store.searchOtsSinActa({ ...filters, sinFiltros })
      rows.value = result
    }
    selectedRows.value = []
    selectedNote.value = null
    hasSearched.value = true
    accordionValue.value = ['1']
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : String(error)
    accordionValue.value = ['0']
  } finally {
    searchLoading.value = false
  }
}

const clearFilters = () => {
  Object.assign(filters, createEmptyFilters())
  rows.value = []
  selectedRows.value = []
  selectedNote.value = null
  feedback.value = ''
  hasSearched.value = false
  accordionValue.value = ['0']
}

const openWorkspace = () => {
  if (!selectedRows.value.length) return
  store.setSelectedActas(selectedRows.value)
  workspaceOpen.value = true
}

const loadCatalogs = async () => {
  feedback.value = ''
  try {
    if (isOtsSinActa.value) await store.loadOtsSinActaCatalogs()
    else await store.loadActasCatalogs()
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : String(error)
  }
}

watch(() => filters.periodoAnio, () => { filters.periodoNombre = '' })
watch(documentType, () => {
  store.setDocumentType(documentType.value)
  clearFilters()
  workspaceOpen.value = false
  loadCatalogs()
})

onMounted(() => {
  store.setDocumentType(documentType.value)
  loadCatalogs()
})
</script>
