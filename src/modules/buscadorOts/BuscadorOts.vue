<template>
  <div
    class="fm-screen fm-screen--pad busqueda-ots-page"
    :class="{
      'busqueda-ots-page--grid-expanded': gridExpanded,
      'busqueda-ots-page--failed-filter': store.failedOnly
    }"
  >
    <Accordion v-model:value="activePanels" multiple class="fm-accordion busqueda-ots-accordion">
      <AccordionPanel value="0" class="busqueda-ots-filter-panel">
        <AccordionHeader>LISTA DE ORDENES DE TRABAJO A BUSCAR</AccordionHeader>
        <AccordionContent>
          <FiltrosBusqueda />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1" class="busqueda-ots-results-panel">
        <AccordionHeader>DATOS DE LAS ORDENES DE TRABAJO</AccordionHeader>
        <AccordionContent>
          <Tabla
            :expanded="gridExpanded"
            @open-external="externalDialogVisible = true"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <OtsExternasDialog
      v-model:visible="externalDialogVisible"
      :rows="store.externalRows"
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
import OtsExternasDialog from './components/OtsExternasDialog.vue'
import { useBuscadorOtsStore } from './store/buscadorOtsStore'

const store = useBuscadorOtsStore()
const activePanels = ref([])
const externalDialogVisible = ref(false)

const gridExpanded = computed(() => {
  const active = (Array.isArray(activePanels.value) ? activePanels.value : [activePanels.value]).map(String)
  return !active.includes('0') && active.includes('1')
})

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
