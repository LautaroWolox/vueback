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
 * Columnas de la grilla CMO-Actividad:
 * 1 CODIGO_ACTIVIDAD
 * 2 DESC_ACTIVIDAD
 * 3 CODIGO_S4
 * 4 CMO
 * 5 USUARIO_MODIFICACION
 * 6 FECHA_MODIFICACION
 * 7 ACTIVO
 *
 * La última columna de la estructura común corresponde a PAÍS y no aplica
 * a esta pantalla, por eso se elimina solamente en esta variante.
 */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:nth-child(8)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:nth-child(8)) {
  display: none !important;
}

/* Reemplazo de los encabezados propios de la relación común. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3)),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(4)) {
  font-size: 0 !important;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(1))::before {
  content: 'CODIGO_ACTIVIDAD';
  font-size: 10px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(2))::before {
  content: 'DESC_ACTIVIDAD';
  font-size: 10px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(3))::before {
  content: 'CODIGO_S4';
  font-size: 10px;
}

.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr:first-child > th:nth-child(4))::before {
  content: 'CMO';
  font-size: 10px;
}

/* Las siete columnas visibles ocupan todo el ancho disponible. */
.cmo-actividad-screen :deep(#tabla-jobtype-cmo col:not(:nth-child(8))),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-thead > tr > th:not(:nth-child(8))),
.cmo-actividad-screen :deep(#tabla-jobtype-cmo .p-datatable-tbody > tr > td:not(:nth-child(8))) {
  width: 14.2857% !important;
  min-width: 0 !important;
  max-width: 14.2857% !important;
}
</style>
