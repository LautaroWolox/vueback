<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="fm-dialog fm-responsive-dialog"
    :style="{ '--fm-dialog-width': '78rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <span class="p-dialog-title">Ordenes de Trabajo a Reprocesar</span>
      <div class="p-dialog-header-actions">
        <button
          type="button"
          class="fm-icon-button"
          title="Cerrar"
          aria-label="Cerrar Ordenes de Trabajo a Reprocesar"
          @click="closeDialog"
        >
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>
    </template>

    <FmGridShell>
      <DataTable
        v-model:selection="selectedRows"
        v-model:first="first"
        v-model:rows="pageRows"
        :value="rows"
        data-key="id"
        class="fm-pass-grid"
        table-style="table-layout: fixed; min-width: 1180px; width: 100%"
        paginator
        scrollable
        scroll-height="flex"
        :virtual-scroller-options="virtualScrollerOptions"
        show-gridlines
        removable-sort
        sort-mode="multiple"
        :rows-per-page-options="rowsOptions"
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
            :rows-options="rowsOptions"
            :show-rows-select="true"
            :show-counter="true"
            :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
            :auto-max-rows="false"
            @first-page="firstPageCallback"
            @prev-page="prevPageCallback"
            @next-page="nextPageCallback"
            @last-page="lastPageCallback"
            @page-change="changePageCallback"
            @rows-change="rowChangeCallback"
          >
            <template #actions>
              <FmGridActions
                :show-export="false"
                :show-delete="false"
                :show-edit="false"
                :show-back="true"
                :show-refresh="true"
                :show-add="false"
                back-title="Volver a la grilla principal"
                refresh-title="Reprocesar / cambiar técnico"
                @back="closeDialog"
                @refresh="requestReprocess"
              />
            </template>
          </FmGridPaginator>
        </template>

        <template #empty>
          <div class="fm-grid-empty">No hay resultados</div>
        </template>

        <Column
          selection-mode="multiple"
          header-style="width: 42px; text-align: center"
          body-style="width: 42px; text-align: center"
        />
        <Column field="nroOt" header="Nro de OT" sortable style="width: 130px" />
        <Column field="nroOtSfs" header="Nro OT SFS" sortable style="width: 130px" />
        <Column field="statusOt" header="Status de la OT" sortable style="width: 135px" />
        <Column field="statusOtWfx" header="Status OT WFX" sortable style="width: 125px" />
        <Column field="fechaUltimaModificacion" header="Fecha Última Modificación" sortable style="width: 180px" />
        <Column field="nroTech" header="Nro Tech" sortable style="width: 120px" />
        <Column field="nombreTech" header="Nombre del Tech" sortable style="width: 165px" />
        <Column field="actividades" header="Actividades" sortable style="width: 105px" />
        <Column field="ubicacionOt" header="Ubicación de la OT" sortable style="width: 135px" />
        <Column field="origenOt" header="Origen OT" sortable style="width: 105px" />
      </DataTable>
    </FmGridShell>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import FmGridShell from '@/components/shared/FmGridShell.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'
import type { BuscadorOtRow } from '../store/types'

const props = defineProps<{
  visible: boolean
  rows: BuscadorOtRow[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'alert', message: string): void
  (event: 'proceed', rows: BuscadorOtRow[]): void
}>()

const selectedRows = shallowRef<BuscadorOtRow[]>([])
const first = ref(0)
const pageRows = ref(500)
const rowsOptions = [100, 250, 500]
const virtualScrollerOptions = {
  itemSize: 38,
  numToleratedItems: 12,
  delay: 0,
  showLoader: false
}

watch(() => props.visible, (visible) => {
  if (!visible) return
  selectedRows.value = []
  first.value = 0
  pageRows.value = 500
})

watch(() => props.rows, (rows) => {
  const availableIds = new Set(rows.map((row) => String(row.id ?? row.nroOt ?? '')))
  selectedRows.value = selectedRows.value.filter((row) => (
    availableIds.has(String(row.id ?? row.nroOt ?? ''))
  ))
})

const closeDialog = () => {
  emit('update:visible', false)
}

const requestReprocess = () => {
  if (selectedRows.value.length === 0) {
    emit('alert', 'Debes seleccionar al menos una fila')
    return
  }

  emit('proceed', [...selectedRows.value])
}
</script>
