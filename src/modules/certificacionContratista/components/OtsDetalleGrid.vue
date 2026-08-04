<template>
  <div class="fm-grid-shell certificacion-contratista-detail-grid-shell">
    <DataTable
      v-model:selection="selection"
      v-model:expandedRows="expandedRows"
      :value="rows"
      :loading="loading"
      dataKey="numeroOT"
      scrollable
      scrollHeight="flex"
      removableSort
      class="fm-pass-grid certificacion-contratista-grid certificacion-contratista-detail-grid"
      @rowExpand="$emit('expand', $event.data)"
    >
      <template #empty><div class="fm-grid-empty">No hay órdenes asociadas al documento.</div></template>
      <Column expander style="width: 42px; min-width: 42px" :exportable="false" />
      <Column selectionMode="multiple" style="width: 42px; min-width: 42px" :exportable="false" />
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        sortable
        :frozen="column.frozen"
        :style="{ width: column.width, minWidth: column.width }"
      >
        <template #body="slotProps">
          <span v-if="column.field === 'excluida'" :class="['certificacion-contratista-boolean-tag', isExcluded(slotProps.data[column.field]) ? 'is-danger' : 'is-success']">
            {{ isExcluded(slotProps.data[column.field]) ? 'SÍ' : 'NO' }}
          </span>
          <span v-else-if="column.field === 'validado'" :class="['certificacion-contratista-flow-tag', flowClass(slotProps.data[column.field])]">
            {{ slotProps.data[column.field] || '-' }}
          </span>
          <span v-else class="fm-cell-text" :title="displayValue(slotProps.data[column.field])">{{ displayValue(slotProps.data[column.field]) }}</span>
        </template>
      </Column>
      <Column header="ACCIONES" frozen alignFrozen="right" style="width: 126px; min-width: 126px" :exportable="false">
        <template #body="slotProps">
          <div class="certificacion-contratista-row-actions">
            <button type="button" class="fm-grid-action-final" title="Ver actividades y detalle" aria-label="Ver actividades y detalle" @click.stop="$emit('open-detail', slotProps.data)"><i class="pi pi-eye" /></button>
            <button v-if="hasNote(slotProps.data)" type="button" class="fm-grid-action-final" title="Ver nota" aria-label="Ver nota" @click.stop="$emit('open-note', slotProps.data)"><i class="pi pi-file-edit" /></button>
            <button v-if="isExcluded(slotProps.data.excluida)" type="button" class="fm-grid-action-final" title="Incluir OT" aria-label="Incluir OT" @click.stop="$emit('include', slotProps.data)"><i class="pi pi-plus-circle" /></button>
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="certificacion-contratista-row-expansion">
          <div v-if="detailLoading[slotProps.data.numeroOT]" class="certificacion-contratista-inline-loader">
            <ProgressSpinner style="width: 26px; height: 26px" strokeWidth="4" />
            <span>Cargando actividades…</span>
          </div>
          <template v-else>
            <div class="certificacion-contratista-row-expansion__header">
              <div>
                <strong>Actividades resultantes</strong>
                <span>{{ detailByOt[slotProps.data.numeroOT]?.actividadesResultantes?.length ?? 0 }} registros</span>
              </div>
              <FmButton label="ABRIR DETALLE COMPLETO" icon="pi-external-link" variant="outline" @click="$emit('open-detail', slotProps.data)" />
            </div>
            <DataTable :value="detailByOt[slotProps.data.numeroOT]?.actividadesResultantes ?? []" class="fm-pass-grid certificacion-contratista-nested-grid" scrollable>
              <template #empty><div class="fm-grid-empty">No hay actividades resultantes.</div></template>
              <Column field="codActividad" header="CÓDIGO" style="min-width: 100px" />
              <Column field="actividad" header="ACTIVIDAD" style="min-width: 240px" />
              <Column field="codCMO" header="CMO" style="min-width: 100px" />
              <Column field="cantidadOriginal" header="ORIGINAL" style="min-width: 95px" />
              <Column field="cantidadResultante" header="RESULTANTE" style="min-width: 105px" />
              <Column field="reglaAplicada" header="REGLA" style="min-width: 160px" />
              <Column field="validada" header="VALIDADA" style="min-width: 100px" />
            </DataTable>
          </template>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  rows: { type: Array, default: () => [] }, columns: { type: Array, default: () => [] }, selected: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, detailByOt: { type: Object, default: () => ({}) }, detailLoading: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:selected', 'open-detail', 'open-note', 'expand', 'include'])
const expandedRows = ref({})
const selection = computed({ get: () => props.selected, set: (value) => emit('update:selected', value ?? []) })
const displayValue = (value) => value === null || value === undefined || value === '' ? '-' : String(value)
const hasNote = (row) => Boolean(String(row?.notaTraspasoTexto ?? row?.nota ?? '').trim()) || ['S', 'SI', 'SÍ', 'TRUE', '1'].includes(String(row?.tieneNota ?? '').toUpperCase())
const isExcluded = (value) => ['S', 'SI', 'SÍ', 'TRUE', '1'].includes(String(value ?? '').toUpperCase())
const flowClass = (value) => {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized.includes('validad')) return 'is-success'
  if (normalized.includes('aplicad') || normalized.includes('verific')) return 'is-progress'
  if (normalized.includes('error')) return 'is-danger'
  return 'is-neutral'
}
</script>
