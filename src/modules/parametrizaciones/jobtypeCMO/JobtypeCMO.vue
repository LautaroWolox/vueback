<template>
  <div class="cmo-actividad-screen">
    <JobtypeRelacion relation="cmo" />
  </div>
</template>

<script setup>
import JobtypeRelacion from '../jobtypeRelacion/JobtypeRelacion.vue'
</script>

<style scoped>
/* La variante Jobtype-CMO se presenta funcionalmente como CMO-Actividad. */
.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child) {
  font-size: 0;
}

.cmo-actividad-screen :deep(.jobtype-panel--results .jobtype-panel__header > span:first-child)::after {
  content: 'RELACIONES CMO-ACTIVIDAD';
  font-size: 12px;
}

/*
 * En CMO-Actividad la grilla no utiliza ORIGEN ni PAÍS.
 * Se eliminan visualmente sus columnas y se redistribuye el ancho entre
 * las seis columnas restantes sin modificar Jobtype-Contrato.
 */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(3)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(3)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(3)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(8)) {
  display: none !important;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:not(:nth-child(3)):not(:nth-child(8))),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:not(:nth-child(3)):not(:nth-child(8))) {
  width: 16.6667% !important;
  min-width: 0 !important;
  max-width: 16.6667% !important;
}
</style>
