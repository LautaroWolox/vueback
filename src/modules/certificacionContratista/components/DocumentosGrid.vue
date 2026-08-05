<template>
  <div class="fm-grid-shell certificacion-contratista-grid-shell">
    <DataTable
      ref="tableRef"
      v-model:selection="selection"
      :value="rows"
      :loading="loading"
      selectionMode="single"
      dataKey="__rowKey"
      scrollable
      scrollHeight="flex"
      filterDisplay="row"
      removableSort
      class="fm-pass-grid certificacion-contratista-grid"
      :rowClass="rowClass"
      @row-dblclick="$emit('open', $event.data)"
    >
      <template #empty>
        <div class="fm-grid-empty">
          {{ searched ? 'No se encontraron resultados para los filtros ingresados.' : 'Ingresá filtros y presioná BUSCAR.' }}
        </div>
      </template>

      <Column selectionMode="single" headerStyle="width: 38px" :exportable="false" />
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        sortable
        :style="{ width: column.width, minWidth: column.width }"
        :bodyClass="column.numeric ? 'certificacion-contratista-cell--numeric' : ''"
      >
        <template #body="slotProps">
          <span class="fm-cell-text" :title="displayValue(slotProps.data[column.field])">
            {{ displayValue(slotProps.data[column.field]) }}
          </span>
        </template>
      </Column>

      <Column header="ACCIONES" frozen alignFrozen="right" :exportable="false" style="width: 76px; min-width: 76px">
        <template #body="slotProps">
          <button
            type="button"
            class="fm-grid-action-final certificacion-contratista-grid__open"
            title="Abrir detalle"
            aria-label="Abrir detalle"
            @click.stop="$emit('open', slotProps.data)"
          >
            <i class="pi pi-external-link" aria-hidden="true" />
          </button>
        </template>
      </Column>
    </DataTable>

    <FmGridPaginator
      :page="page"
      :pageCount="pageCount"
      :rows="pageSize"
      :totalRecords="totalRecords"
      :first="page * pageSize"
      :last="Math.min((page + 1) * pageSize, totalRecords)"
      :disabled="loading"
      :rowsOptions="[10, 20, 50, 100, 500]"
      :autoMaxRows="false"
      @first-page="$emit('page-change', 0)"
      @prev-page="$emit('page-change', Math.max(page - 1, 0))"
      @next-page="$emit('page-change', Math.min(page + 1, Math.max(pageCount - 1, 0)))"
      @last-page="$emit('page-change', Math.max(pageCount - 1, 0))"
      @page-change="$emit('page-change', $event)"
      @rows-change="$emit('rows-change', $event)"
    >
      <template #actions>
        <FmButton label="EXPORTAR" icon="pi-file-excel" variant="outline" :disabled="!rows.length" @click="$emit('export')" />
      </template>
    </FmGridPaginator>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  selected: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  searched: { type: Boolean, default: false },
  page: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  pageSize: { type: Number, default: 20 },
  totalRecords: { type: Number, default: 0 }
})

const emit = defineEmits(['update:selected', 'open', 'page-change', 'rows-change', 'export'])
const tableRef = ref(null)

const selection = computed({
  get: () => props.selected,
  set: (value) => emit('update:selected', value)
})

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return String(value)
}

const rowClass = (row) => ({
  'fm-selected-row': props.selected && row.__rowKey === props.selected.__rowKey
})

defineExpose({ tableRef })
</script>
