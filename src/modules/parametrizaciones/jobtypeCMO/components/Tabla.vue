<template>
  <FmGridShell
    class="cmo-grid-shell"
    :loading="store.loading"
    loading-title="Cargando relaciones"
    loading-message="Consultando CMO-Actividad"
  >
    <DataTable
      id="tabla-cmo-actividad"
      ref="dt"
      v-model:filters="filters"
      v-model:selection="selectedRow"
      v-model:first="mainFirst"
      v-model:rows="mainPageRows"
      class="jobtype-main-grid fm-pass-grid cmo-main-grid"
      :value="store.rows"
      dataKey="actividadManoObraId"
      tableStyle="table-layout: fixed; min-width: 100%; width: 100%"
      scrollable
      scrollHeight="flex"
      :rowClass="rowClass"
      removableSort
      sortMode="single"
      sortField="codigoActividad"
      :sortOrder="-1"
      filterDisplay="row"
      selectionMode="single"
      paginator
      :rowsPerPageOptions="[100, 250, 500]"
      :resizableColumns="true"
      columnResizeMode="fit"
      showGridlines
      @row-click="onRowClick"
    >
      <template #empty>
        <div class="fm-grid-empty">No hay resultados</div>
      </template>

      <template
        #paginatorcontainer="{
          first,
          last,
          page,
          pageCount,
          rows,
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
          :first="first"
          :last="last"
          :page="page"
          :page-count="pageCount"
          :rows="rows"
          :total-records="totalRecords"
          :rows-options="[100, 250, 500]"
          :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
          @first-page="firstPageCallback"
          @prev-page="prevPageCallback"
          @next-page="nextPageCallback"
          @last-page="lastPageCallback"
          @page-change="changePageCallback"
          @rows-change="rowChangeCallback"
        >
          <template #actions>
            <FmGridActions
              :show-refresh="false"
              :show-edit="true"
              :show-add="true"
              :delete-disabled="!store.selectedRow"
              :edit-disabled="!store.selectedRow"
              export-title="Descargar"
              delete-title="Desactivar"
              edit-title="Modificar"
              add-title="Nueva relación"
              @export="exportarExcel"
              @delete="onDelete"
              @edit="onEdit"
              @add="onAdd"
            />
          </template>
        </FmGridPaginator>
      </template>

      <Column
        v-for="column in mainColumns"
        :key="column.field"
        :field="column.field"
        :sortField="column.field"
        :filterField="column.field"
        :header="column.header"
        sortable
        filter
        :showFilterMenu="false"
        :style="{ width: column.width }"
        :headerStyle="{ width: column.width }"
        :bodyStyle="{ width: column.width }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div class="fm-filter-cell">
            <span class="fm-filter-prefix">~</span>
            <InputText
              v-model="filterModel.value"
              class="fm-column-filter"
              type="text"
              @input="filterCallback()"
            />
            <span class="fm-filter-more">...</span>
          </div>
        </template>
        <template #body="{ data }">
          <span class="fm-cell-text" :title="String(data[column.field] ?? '')">
            {{ data[column.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>

    <AltaDialog
      v-model:visible="showAltaDialog"
      @saved="onDialogSaved"
    />

    <ModificarDialog
      v-model:visible="showModificarDialog"
      :relacion="store.selectedRow"
      @saved="onDialogSaved"
    />

    <ConfirmDialog />
    <Toast />
  </FmGridShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import { useExcelExport } from '@/composables/useExportExcel'

import { useCmoActividadStore } from '../store/cmoActividadStore'
import { mainColumns } from './columns'
import AltaDialog from './AltaDialog.vue'
import ModificarDialog from './ModificarDialog.vue'
import type { RelCmoActividad } from '../store/types'

const store = useCmoActividadStore()
const confirm = useConfirm()
const toast = useToast()
const { exportToExcel } = useExcelExport()

const dt = ref()
const mainFirst = ref(0)
const mainPageRows = ref(500)
const showAltaDialog = ref(false)
const showModificarDialog = ref(false)

const filters = ref(
  Object.fromEntries(
    mainColumns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

const rowClass = (data: RelCmoActividad) => ({
  'row-inactive': data?.activo !== 'S',
})

const selectedRow = ref<RelCmoActividad | null>(null)

const onRowClick = ({ data }: { data: RelCmoActividad }) => {
  selectedRow.value = data
  store.setSelectedRow(data)
}

const onAdd = () => {
  showAltaDialog.value = true
}

const onEdit = () => {
  if (!store.selectedRow) return
  showModificarDialog.value = true
}

const onDelete = () => {
  if (!store.selectedRow) return

  confirm.require({
    message: 'Confirma que desea desactivar la relación seleccionada?',
    header: 'Confirmar desactivación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Aceptar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await store.desactivarRelacion(store.selectedRow!.actividadManoObraId)
        toast.add({
          severity: 'success',
          summary: 'Relación desactivada',
          detail: 'La relación fue desactivada correctamente',
          life: 3000,
        })
        store.setSelectedRow(null)
        selectedRow.value = null
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo desactivar la relación',
          life: 5000,
        })
      }
    },
  })
}

const onDialogSaved = () => {
  store.fetchData()
}

const exportarExcel = () => {
  if (!store.rows.length) return

  const fields = mainColumns.map((c) => c.field)

  exportToExcel({
    rows: store.rows,
    fields,
    columns: mainColumns,
    filename: 'Configuracion_CMO_Actividad.xlsx',
  })
}
</script>

<style scoped>
.row-inactive {
  opacity: 0.5;
}

:global(.cmo-grid-shell) {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

:global(#tabla-cmo-actividad),
:global(#tabla-cmo-actividad.p-datatable) {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

:global(#tabla-cmo-actividad .p-datatable-table-container),
:global(#tabla-cmo-actividad .p-datatable-wrapper),
:global(#tabla-cmo-actividad [data-pc-section="tablecontainer"]) {
  width: 100% !important;
  height: auto !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
}

:global(#tabla-cmo-actividad .p-datatable-table) {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: fixed !important;
}

:global(#tabla-cmo-actividad .p-sortable-column-badge),
:global(#tabla-cmo-actividad .p-datatable-sort-badge),
:global(#tabla-cmo-actividad [data-pc-section="sortbadge"]) {
  display: none !important;
}

:global(#tabla-cmo-actividad .p-datatable-thead > tr > th) {
  font-size: 12px !important;
}

:global(#tabla-cmo-actividad .p-datatable-tbody > tr > td) {
  font-size: 13px !important;
}

:global(#tabla-cmo-actividad .p-datatable-emptymessage > td),
:global(#tabla-cmo-actividad .p-datatable-empty-message > td) {
  height: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
  vertical-align: middle !important;
  background: #eafcff !important;
}

:global(#tabla-cmo-actividad .p-datatable-emptymessage .fm-grid-empty),
:global(#tabla-cmo-actividad .p-datatable-empty-message .fm-grid-empty) {
  width: 100% !important;
  height: 48px !important;
  min-height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  background: #eafcff !important;
  box-sizing: border-box !important;
}

:global(#tabla-cmo-actividad .fm-filter-cell),
:global(#tabla-cmo-actividad .fm-column-filter),
:global(#tabla-cmo-actividad .fm-filter-prefix),
:global(#tabla-cmo-actividad .fm-filter-more) {
  font-size: 12px !important;
}

:global(#tabla-cmo-actividad .fm-grid-paginator),
:global(#tabla-cmo-actividad .fm-grid-paginator *) {
  font-size: 13px !important;
}
</style>
