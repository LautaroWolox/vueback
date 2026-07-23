<template>
  <div class="cmo-actividad-screen">
    <JobtypeRelacion relation="cmo" />
  </div>
</template>

<script setup>
import JobtypeRelacion from '../jobtypeRelacion/JobtypeRelacion.vue'
</script>

<style scoped>
/*
 * CMO-Actividad reutiliza el popup y la grilla común aprobados.
 * Esta capa adapta únicamente los títulos y la distribución de su grilla
 * sin afectar Jobtype-Contrato ni duplicar la estructura del componente.
 */
.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child) {
  font-size: 0;
}

.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child)::after {
  content: 'RELACIONES CMO-ACTIVIDAD';
  font-size: 12px;
}

/* CMO-Actividad no muestra la columna PAIS. */
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

/* Nombres funcionales requeridos para CMO-Actividad. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1) .p-column-title),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2) .p-column-title),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3) .p-column-title) {
  font-size: 0;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1) .p-column-title)::after {
  content: 'CODIGO_ACTIVIDAD';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2) .p-column-title)::after {
  content: 'DESC_ACTIVIDAD';
  font-size: 11px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3) .p-column-title)::after {
  content: 'CODIGO_S4';
  font-size: 11px;
}
</style>
