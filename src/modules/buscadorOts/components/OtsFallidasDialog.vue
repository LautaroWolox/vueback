<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="jobtype-alta-dialog cmo-alta-dialog buscador-ots-fallidas-dialog"
    :pt="{ root: { class: 'buscador-ots-fallidas-dialog' } }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="jobtype-alta-header">
        <span>Órdenes de Trabajo Fallidas</span>
        <button
          type="button"
          class="jobtype-alta-close"
          aria-label="Cerrar"
          title="Cerrar"
          @click="close"
        >
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>
    </template>

    <div class="jobtype-alta-content">
      <FmGridShell class="buscador-ots-fallidas-grid-shell">
        <DataTable
          ref="tableRef"
          v-model:filters="filters"
          :value="rows"
          data-key="id"
          class="fm-pass-grid"
          paginator
          scrollable
          scroll-height="flex"
          show-gridlines
          removable-sort
          filter-display="row"
          :rows="100"
          :rows-per-page-options="[100, 250, 500]"
          :global-filter-fields="columnFields"
        >
          <template #empty>
            <div class="fm-grid-empty">No hay órdenes de trabajo fallidas</div>
          </template>

          <Column
            v-for="column in columns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
            :show-filter-menu="false"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <div class="fm-column-filter">
                <span class="fm-filter-prefix">~</span>
                <InputText
                  v-model="filterModel.value"
                  class="fm-column-filter__input"
                  type="text"
                  @input="filterCallback()"
                />
                <button
                  type="button"
                  class="fm-filter-more"
                  aria-label="Limpiar filtro"
                  title="Limpiar filtro"
                  @click="clearFilter(filterModel, filterCallback)"
                >×</button>
              </div>
            </template>

            <template #body="{ data }">
              <span class="fm-cell-text" :title="String(data[column.field] ?? '')">
                {{ data[column.field] ?? '' }}
              </span>
            </template>
          </Column>

          <template #paginatorstart>
            <button
              type="button"
              class="busqueda-ots-grid-action"
              :disabled="rows.length === 0"
              aria-label="Descargar"
              title="Descargar"
              @click="download"
            >
              <i class="pi pi-download" aria-hidden="true"></i>
            </button>
          </template>
        </DataTable>
      </FmGridShell>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import FmGridShell from '@/components/shared/FmGridShell.vue'

interface OtFallidaRow {
  id?: string | number
  nroOt?: string
  codigoTarea?: string
  fechaUltimaModificacion?: string
  tecnicoNoLdap?: string
  sistemaOrigen?: string
  descripcionError?: string
  [key: string]: unknown
}

const props = defineProps<{
  visible: boolean
  rows: OtFallidaRow[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
}>()

const columns = [
  { field: 'nroOt', header: 'Nro. OT' },
  { field: 'codigoTarea', header: 'Cod. tarea' },
  { field: 'fechaUltimaModificacion', header: 'Fecha últ. mod. OT' },
  { field: 'tecnicoNoLdap', header: 'Técnico no LDAP' },
  { field: 'sistemaOrigen', header: 'Sistema origen' },
  { field: 'descripcionError', header: 'Descripción error' }
]

const columnFields = columns.map(({ field }) => field)
const tableRef = ref<InstanceType<typeof DataTable> | null>(null)
const filters = ref(Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
))

const rows = computed(() => props.rows ?? [])

const clearFilter = (filterModel: { value: unknown }, filterCallback: () => void) => {
  filterModel.value = null
  filterCallback()
}

const download = () => {
  if (!rows.value.length) return
  tableRef.value?.exportCSV?.()
}

const close = () => emit('update:visible', false)
</script>
