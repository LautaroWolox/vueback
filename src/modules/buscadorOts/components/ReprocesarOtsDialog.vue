<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    header="Ordenes de Trabajo a Reprocesar"
    :closable="true"
    :draggable="false"
    :resizable="false"
    class="fm-dialog fm-responsive-dialog"
    :style="{ '--fm-dialog-width': '78rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #closeicon>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M6 6L18 18" />
        <path d="M18 6L6 18" />
      </svg>
    </template>

    <FmGridShell>
      <DataTable
        v-model:first="first"
        v-model:rows="pageRows"
        :value="rows"
        data-key="id"
        :row-class="rowClass"
        class="fm-pass-grid"
        table-style="table-layout: fixed; min-width: 1180px; width: 100%"
        paginator
        scrollable
        scroll-height="min(60dvh, 540px)"
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
          header-style="width: 46px; min-width: 46px; max-width: 46px; text-align: center; padding-left: 0; padding-right: 0"
          body-style="width: 46px; min-width: 46px; max-width: 46px; text-align: center; padding-left: 0; padding-right: 0"
        >
          <template #header>
            <Checkbox
              binary
              :model-value="allSelected"
              aria-label="Seleccionar todas las ordenes"
              @update:model-value="toggleAll"
            />
          </template>
          <template #body="{ data }">
            <Checkbox
              binary
              :model-value="isSelected(data)"
              :aria-label="`Seleccionar OT ${data.nroOt}`"
              @update:model-value="(checked) => toggleRow(data, checked)"
            />
          </template>
        </Column>
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
import { computed, ref, shallowRef, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'
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

const selectedIds = shallowRef<Set<string>>(new Set())
const first = ref(0)
const pageRows = ref(500)
const rowsOptions = [100, 250, 500]

const rowId = (row: BuscadorOtRow) => String(row.id ?? row.nroOt ?? '')

const selectedRows = computed(() => (
  props.rows.filter((row) => selectedIds.value.has(rowId(row)))
))

const allSelected = computed(() => (
  props.rows.length > 0 && selectedIds.value.size === props.rows.length
))

const isSelected = (row: BuscadorOtRow) => selectedIds.value.has(rowId(row))

const toggleRow = (row: BuscadorOtRow, checked: boolean) => {
  const next = new Set(selectedIds.value)
  const id = rowId(row)

  if (checked) next.add(id)
  else next.delete(id)

  selectedIds.value = next
}

const toggleAll = (checked: boolean) => {
  selectedIds.value = checked
    ? new Set(props.rows.map(rowId))
    : new Set()
}

const rowClass = (row: BuscadorOtRow) => (
  isSelected(row) ? 'fm-selected-row' : ''
)

watch(() => props.visible, (visible) => {
  if (!visible) return
  selectedIds.value = new Set()
  first.value = 0
  pageRows.value = 500
})

watch(() => props.rows, (rows) => {
  const availableIds = new Set(rows.map(rowId))
  selectedIds.value = new Set(
    [...selectedIds.value].filter((id) => availableIds.has(id))
  )
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
