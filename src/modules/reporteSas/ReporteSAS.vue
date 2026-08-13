<template>
  <div class="fm-screen fm-screen--pad report-sas-page report-sas-page--fullscreen">
    <Accordion
      v-model:value="activePanels"
      multiple
      class="fm-accordion report-sas-accordion"
    >
      <AccordionPanel value="0" class="report-sas-results-panel">
        <AccordionHeader>REPORTE SAS</AccordionHeader>

        <AccordionContent>
          <div v-if="store.error" class="report-sas-error" role="alert">
            <i class="pi pi-exclamation-triangle" aria-hidden="true" />
            <span>{{ store.error }}</span>
          </div>

          <FmGridShell
            class="report-sas-grid-shell"
            :loading="store.loading"
            loading-title="Cargando reporte"
            loading-message="Consultando materiales descargados"
          >
            <Tabla
              :export-to-excel="exportToExcel"
              :parse-data-from-table="parseDataFromTable"
            />
          </FmGridShell>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useExcelExport } from '@/composables/useExportExcel'
import Tabla from './components/Tabla.vue'
import { useReporteSasStore } from './store/reporteSasStore'

const store = useReporteSasStore()
const activePanels = ref(['0'])
const { exportToExcel, parseDataFromTable } = useExcelExport()

onMounted(() => {
  store.fetchRows().catch(() => {
    // El mensaje de error queda disponible en el store y se muestra en pantalla.
  })
})

onBeforeUnmount(() => {
  store.clearStore()
})
</script>

<style scoped>
.report-sas-page,
.report-sas-page--fullscreen {
  position: relative;
  inset: auto;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #fff;
  color: #111;
  font-family: Arial, Helvetica, sans-serif;
}

.report-sas-accordion,
.report-sas-results-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.report-sas-page :deep(.report-sas-accordion.p-accordion) {
  gap: 0 !important;
}

.report-sas-page :deep(.report-sas-results-panel.p-accordionpanel) {
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.report-sas-page :deep(.report-sas-results-panel .p-accordionheader) {
  flex: 0 0 auto !important;
}

.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent),
.report-sas-page :deep(.report-sas-results-panel .p-accordioncontent-content) {
  height: 100% !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff !important;
}

.report-sas-grid-shell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.report-sas-page :deep(.reporte-sas-table-shell),
.report-sas-page :deep(.reporte-sas-main-grid) {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: 100% !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.report-sas-page :deep(.reporte-sas-main-grid .p-datatable-table-container),
.report-sas-page :deep(.reporte-sas-main-grid .p-datatable-wrapper),
.report-sas-page :deep(.reporte-sas-main-grid [data-pc-section="tablecontainer"]) {
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
}

.report-sas-error {
  min-height: 44px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 9px 12px;
  border: 1px solid #efd2d6;
  background: #fff6f7;
  color: #a12c38;
  font-size: 13px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .report-sas-page,
  .report-sas-page--fullscreen {
    width: 100%;
    height: calc(100dvh - 64px);
    min-height: 420px;
  }
}
</style>
