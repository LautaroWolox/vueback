<template>
  <FmGridShell
    :loading="store.loading"
    loading-title="Cargando relaciones"
    loading-message="Consultando CMO-Actividad"
  >
    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:selection="selectedRow"
      v-model:first="mainFirst"
      v-model:rows="mainPageRows"
      class="jobtype-main-grid fm-pass-grid"
      :value="store.rows"
      dataKey="actividadManoObraId"
      tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
      scrollable
      scrollHeight="flex"
      :rowClass="rowClass"
      removableSort
      sortMode="multiple"
      :multiSortMeta="multiSortMeta"
      filterDisplay="row"
      selectionMode="single"
      paginator
      :rowsPerPageOptions="[10, 50, 100, 500]"
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
          :rows-options="[10, 50, 100, 500]"
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
          <div class="jobtype-filter-cell">
            <span class="jobtype-filter-symbol">~</span>
            <InputText
              v-model="filterModel.value"
              class="jobtype-filter-input"
              type="text"
              @input="filterCallback()"
            />
            <span class="jobtype-filter-clear" @click="clearFilter(filterModel, filterCallback)">x</span>
          </div>
        </template>
        <template #body="{ data }">
          <span class="jobtype-cell-text" :title="String(data[column.field] ?? '')">
            {{ data[column.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>

    <!-- Dialogs -->
    <AltaDialog
      v-model:visible="showAltaDialog"
      @saved="onDialogSaved"
    />

    <ModificarDialog
      v-model:visible="showModificarDialog"
      :relacion="store.selectedRow"
      @saved="onDialogSaved"
    />

    <!-- PrimeVue services -->
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
const mainPageRows = ref(100)
const showAltaDialog = ref(false)
const showModificarDialog = ref(false)

// Sort default: codigoActividad descendente
const multiSortMeta = ref([{ field: 'codigoActividad', order: -1 }])

// Filtros inline client-side
const filters = ref(
  Object.fromEntries(
    mainColumns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

// Filas inactivas con estilo visual diferenciado
const rowClass = (data: RelCmoActividad) => ({
  'row-inactive': data?.activo !== 'S',
})

// Selección de fila
const selectedRow = ref<RelCmoActividad | null>(null)

const onRowClick = ({ data }: { data: RelCmoActividad }) => {
  selectedRow.value = data
  store.setSelectedRow(data)
}

// ─── Acciones de botones ──────────────────────────────────────────

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

// ─── Callback tras éxito de Alta o Modificar ──────────────────────

const onDialogSaved = () => {
  store.fetchData()
}

// ─── Export Excel ─────────────────────────────────────────────────

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

// ─── Filtros ──────────────────────────────────────────────────────

const clearFilter = (
  filterModel: { value: string | null },
  filterCallback: () => void
) => {
  filterModel.value = null
  filterCallback()
}
</script>

<style scoped>
.row-inactive {
  opacity: 0.5;
}
</style>
