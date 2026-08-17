<template>
  <div
    class="fm-screen fm-screen--pad busqueda-ots-page"
    :class="{
      'busqueda-ots-page--grid-expanded': gridExpanded,
      'busqueda-ots-page--both-open': bothPanelsOpen
    }"
  >
    <Accordion v-model:value="activePanels" multiple class="fm-accordion busqueda-ots-accordion">
      <AccordionPanel value="0" class="busqueda-ots-filter-panel">
        <AccordionHeader>LISTA DE ORDENES DE TRABAJO A BUSCAR</AccordionHeader>
        <AccordionContent>
          <FiltrosBusqueda
            @search-start="prepareSearchLayout"
            @searched="finishSearchLayout"
          />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1" class="busqueda-ots-results-panel">
        <AccordionHeader>DATOS DE LAS ORDENES DE TRABAJO</AccordionHeader>
        <AccordionContent>
          <ReprocesoStepper
            v-if="reprocessFlowActive"
            :rows="store.eligibleRows"
            @cancel="closeReprocessFlow"
            @execute="executeStepperReprocess"
          />

          <Tabla
            v-else
            :expanded="gridExpanded"
            @open-external="externalDialogVisible = true"
            @open-failed="openFailedOrders"
            @open-reprocess="openReprocessFlow"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <OtsExternasDialog
      v-model:visible="externalDialogVisible"
      :rows="store.externalRows"
    />

    <OtsFallidasDialog
      v-model:visible="failedDialogVisible"
      :rows="failedRows"
    />

    <BuscadorAlertDialog
      v-model:visible="alertVisible"
      :message="alertMessage"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import FiltrosBusqueda from './components/FiltrosBusqueda.vue'
import Tabla from './components/Tabla.vue'
import ReprocesoStepper from './components/ReprocesoStepper.vue'
import OtsExternasDialog from './components/OtsExternasDialog.vue'
import OtsFallidasDialog from './components/OtsFallidasDialog.vue'
import BuscadorAlertDialog from './components/BuscadorAlertDialog.vue'
import { useBuscadorOtsStore } from './store/buscadorOtsStore'

const store = useBuscadorOtsStore()
const activePanels = ref(['0', '1'])
const externalDialogVisible = ref(false)
const failedDialogVisible = ref(false)
const failedRows = ref([])
const reprocessFlowActive = ref(false)
const alertVisible = ref(false)
const alertMessage = ref('')

const activePanelValues = computed(() => (
  Array.isArray(activePanels.value) ? activePanels.value : [activePanels.value]
).map(String))

const gridExpanded = computed(() => (
  !activePanelValues.value.includes('0') && activePanelValues.value.includes('1')
))

const bothPanelsOpen = computed(() => (
  activePanelValues.value.includes('0') && activePanelValues.value.includes('1')
))

const prepareSearchLayout = () => {
  reprocessFlowActive.value = false
  activePanels.value = ['1']
}

const finishSearchLayout = () => {
  if (store.rows.length) {
    activePanels.value = ['1']
  }
}

const showAlert = (message) => {
  alertMessage.value = message
  alertVisible.value = true
}

const openReprocessFlow = () => {
  reprocessFlowActive.value = true
  activePanels.value = ['1']
}

const closeReprocessFlow = () => {
  reprocessFlowActive.value = false
}

const executeStepperReprocess = ({ rows, technician }) => {
  store.applyMockReprocess(rows, technician)
  reprocessFlowActive.value = false
}

const normalizeFailedRow = (value, parent, index) => {
  const source = value && typeof value === 'object' ? value : {}

  return {
    id: source.id ?? `${String(parent?.id ?? parent?.nroOt ?? 'ot')}-${index}`,
    nroOt: String(source.nroOt ?? source.nroOrdenTrabajo ?? parent?.nroOt ?? ''),
    codigoTarea: String(source.codigoTarea ?? source.codTarea ?? source.tareaCodigo ?? ''),
    fechaUltimaModificacion: String(
      source.fechaUltimaModificacion ??
      source.fechaUltModOt ??
      source.fechaModificacion ??
      ''
    ),
    tecnicoNoLdap: String(
      source.tecnicoNoLdap ??
      source.tecnicoNoLDAP ??
      source.tecnico ??
      ''
    ),
    sistemaOrigen: String(source.sistemaOrigen ?? source.origen ?? ''),
    descripcionError: String(
      source.descripcionError ??
      source.errorDescripcion ??
      source.mensaje ??
      ''
    )
  }
}

const getFailedRows = (row) => {
  const nestedRows = Array.isArray(row?.ordenesFallidas)
    ? row.ordenesFallidas
    : Array.isArray(row?.fallidas)
      ? row.fallidas
      : []

  return nestedRows.map((item, index) => normalizeFailedRow(item, row, index))
}

const openFailedOrders = () => {
  failedRows.value = store.rows.flatMap((row) => getFailedRows(row))
  failedDialogVisible.value = true
}

onBeforeUnmount(() => {
  store.resetStore()
})
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

/* El panel de búsqueda nunca debe comprimirse: sus botones forman parte de su altura real. */
.busqueda-ots-filter-panel {
  flex: 0 0 auto !important;
  flex-shrink: 0 !important;
  overflow: visible !important;
}

.busqueda-ots-page--both-open .busqueda-ots-filter-panel {
  margin-bottom: 14px;
}

/* Si ambos están abiertos, el que puede ceder altura es el panel de resultados. */
.busqueda-ots-page--both-open .busqueda-ots-results-panel {
  min-height: 0;
  flex-shrink: 1 !important;
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

@media (max-width: 900px) {
  .busqueda-ots-page {
    height: auto;
    min-height: calc(100vh - 82px);
    overflow: visible;
  }
}
</style>
