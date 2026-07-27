<template>
  <FmDialog
    :visible="visible"
    modal
    header="Órdenes de Trabajo Externas"
    append-to="body"
    base-class="fm-dialog"
    dialog-class="busqueda-ots-external-dialog"
    :draggable="false"
    :resizable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="external-dialog-body">
      <DataTable
        v-model:first="first"
        v-model:rows="pageRows"
        :value="rows"
        data-key="id"
        class="fm-pass-grid external-grid"
        table-style="table-layout: fixed; min-width: 1220px; width: 1220px"
        paginator
        scrollable
        scroll-height="flex"
        removable-sort
        sort-mode="multiple"
        show-gridlines
        :rows-per-page-options="[10, 50, 100]"
      >
        <template
          #paginatorcontainer="{
            first: paginatorFirst,
            last,
            page,
            pageCount,
            rows: paginatorRows,
            totalRecords,
            firstPageCallback,
            lastPageCallback,
            prevPageCallback,
            nextPageCallback,
            rowChangeCallback,
            changePageCallback
          }"
        >
          <FmGridPaginator
            :first="paginatorFirst"
            :last="last"
            :page="page"
            :page-count="Math.max(pageCount, 1)"
            :rows="paginatorRows"
            :total-records="totalRecords"
            :rows-options="[10, 50, 100]"
            :show-rows-select="false"
            :show-counter="true"
            :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
            @first-page="firstPageCallback"
            @prev-page="prevPageCallback"
            @next-page="nextPageCallback"
            @last-page="lastPageCallback"
            @page-change="changePageCallback"
            @rows-change="rowChangeCallback"
          >
            <template #actions>
              <button
                type="button"
                class="external-download-action"
                title="Descargar"
                aria-label="Descargar"
                :disabled="rows.length === 0"
              >
                <i class="pi pi-download" aria-hidden="true"></i>
              </button>
            </template>
          </FmGridPaginator>
        </template>

        <template #empty>
          <div class="external-grid-empty">No hay resultados</div>
        </template>

        <Column
          v-for="column in columns"
          :key="column.field"
          :field="column.field"
          :header="column.header"
          :style="{ width: column.width }"
          :header-style="{ width: column.width }"
          :body-style="{ width: column.width }"
          sortable
        >
          <template #body="{ data }">
            <span class="fm-cell-text" :title="String(data[column.field] ?? '')">
              {{ data[column.field] ?? '' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <FmButton
        label="CERRAR"
        variant="outline"
        @click="emit('update:visible', false)"
      />
    </template>
  </FmDialog>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import FmButton from '@/components/shared/FmButton.vue'
import FmDialog from '@/components/shared/FmDialog.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible'])

const first = ref(0)
const pageRows = ref(10)

const columns = [
  { field: 'nroOt', header: 'Nro de OT', width: '140px' },
  { field: 'nroOtSfs', header: 'Nro OT SFS', width: '140px' },
  { field: 'statusOtWfx', header: 'Status OT WFX', width: '160px' },
  { field: 'fechaUltimaModificacion', header: 'Fecha Última Modificación de OT', width: '220px' },
  { field: 'nroTech', header: 'Nro Tech', width: '130px' },
  { field: 'nombreTech', header: 'Nombre del Tech', width: '180px' },
  { field: 'codigoSolucion', header: 'Código de Solución', width: '160px' },
  { field: 'ubicacionOt', header: 'Ubicación de la OT', width: '190px' }
]
</script>

<style scoped>
.external-dialog-body {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.external-grid,
.external-grid.p-datatable {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.external-grid :deep(.p-datatable-table-container),
.external-grid :deep(.p-datatable-wrapper) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  background: #e8f9fc;
}

.external-grid :deep(.p-datatable-thead > tr > th) {
  height: 36px;
  padding: 0 14px;
  background: #f4f6f7;
  color: #111;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.external-grid :deep(.p-datatable-tbody > tr > td) {
  height: 32px;
  padding: 0 10px;
  background: #e8f9fc;
  color: #111;
  font-size: 11px;
}

.external-grid :deep(.p-datatable-emptymessage > td),
.external-grid :deep(.p-datatable-empty-message > td) {
  height: 100%;
  padding: 0;
  border: 0;
  background: #e8f9fc;
  color: transparent;
}

.external-grid-empty {
  min-height: 430px;
  color: transparent;
}

.external-download-action {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #008fa1;
  cursor: pointer;
}

.external-download-action:disabled {
  color: #c5d2d8;
  cursor: default;
}

:global(.p-dialog.busqueda-ots-external-dialog) {
  width: min(810px, calc(100vw - 24px)) !important;
  height: min(738px, calc(100dvh - 24px)) !important;
  max-width: calc(100vw - 24px) !important;
  max-height: calc(100dvh - 24px) !important;
  display: grid !important;
  grid-template-rows: 52px minmax(0, 1fr) 60px !important;
  overflow: hidden !important;
}

:global(.busqueda-ots-external-dialog .p-dialog-header) {
  height: 52px !important;
  min-height: 52px !important;
  padding: 0 16px !important;
  border-bottom: 1px solid #d7dfe3 !important;
  font-size: 18px !important;
  font-weight: 400 !important;
}

:global(.busqueda-ots-external-dialog .p-dialog-content) {
  height: 100% !important;
  min-height: 0 !important;
  padding: 14px 16px 0 !important;
  overflow: hidden !important;
}

:global(.busqueda-ots-external-dialog .p-dialog-footer) {
  min-height: 60px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  padding: 10px 16px !important;
  border-top: 1px solid #d7dfe3 !important;
}

@media (max-width: 600px) {
  :global(.p-dialog.busqueda-ots-external-dialog) {
    width: calc(100vw - 12px) !important;
    height: calc(100dvh - 12px) !important;
    max-width: calc(100vw - 12px) !important;
    max-height: calc(100dvh - 12px) !important;
  }
}
</style>
