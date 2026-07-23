<template>
  <div ref="screenRoot" class="cmo-actividad-screen">
    <JobtypeRelacion relation="cmo" />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import JobtypeRelacion from '../jobtypeRelacion/JobtypeRelacion.vue'

const screenRoot = ref(null)

const openResultsAccordion = async () => {
  await nextTick()

  const resultsHeader = screenRoot.value?.querySelector(
    '.jobtype-panel--results .jobtype-panel__header'
  )

  if (resultsHeader?.getAttribute('aria-expanded') !== 'true') {
    resultsHeader?.click()
  }
}

onMounted(openResultsAccordion)
</script>

<style scoped>
/*
 * CMO-Actividad reutiliza el popup y la grilla común aprobados.
 * Esta capa adapta únicamente el título, las columnas visibles y el estado
 * inicial del segundo acordeón, sin afectar Jobtype-Contrato.
 */
.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child) {
  font-size: 0;
}

.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child)::after {
  content: 'RELACIONES CMO-ACTIVIDAD';
  font-size: 12px;
}

/* CMO-Actividad no muestra la columna PAIS heredada de la grilla común. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(8)) {
  display: none !important;
}

/* Las siete columnas visibles ocupan todo el ancho de la grilla. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(-n + 7)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(-n + 7)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(-n + 7)) {
  width: 14.2857% !important;
  min-width: 0 !important;
  max-width: 14.2857% !important;
}

/*
 * PrimeVue 4 usa .p-datatable-column-title. Se conserva también
 * .p-column-title por compatibilidad con cualquier tema anterior.
 */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(-n + 7) .p-datatable-column-title),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(-n + 7) .p-column-title) {
  font-size: 0 !important;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1) .p-column-title)::after {
  content: 'CODIGO_ACTIVIDAD';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2) .p-column-title)::after {
  content: 'DESC_ACTIVIDAD';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3) .p-column-title)::after {
  content: 'CODIGO_S4';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(4) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(4) .p-column-title)::after {
  content: 'CMO';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(5) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(5) .p-column-title)::after {
  content: 'USUARIO_MODIFICACION';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(6) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(6) .p-column-title)::after {
  content: 'FECHA_MODIFICACION';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(7) .p-datatable-column-title)::after,
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(7) .p-column-title)::after {
  content: 'ACTIVO';
  font-size: 11px;
}
</style>
