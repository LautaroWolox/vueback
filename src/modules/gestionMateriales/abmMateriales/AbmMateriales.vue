<template>
  <div
    class="fm-screen fm-screen--pad abm-materiales-page"
    :class="{
      'abm-materiales-page--grid-expanded': !filtersExpanded && resultsExpanded
    }"
  >
    <LoadingOverlay :loading="store.loading" />

    <section class="abm-materiales-panel abm-materiales-panel--filters">
      <button
        type="button"
        class="abm-materiales-panel__header"
        :aria-expanded="filtersExpanded"
        @click="filtersExpanded = !filtersExpanded"
      >
        <span>FILTROS DE BÚSQUEDA</span>
        <span class="abm-materiales-panel__toggle" aria-hidden="true">
          {{ filtersExpanded ? '−' : '+' }}
        </span>
      </button>

      <div v-show="filtersExpanded" class="abm-materiales-panel__body abm-materiales-search-body">
        <FmButton label="BUSCAR" @click="buscar" />
      </div>
    </section>

    <section
      class="abm-materiales-panel abm-materiales-panel--results"
      :class="{ 'is-expanded': resultsExpanded }"
    >
      <button
        type="button"
        class="abm-materiales-panel__header"
        :aria-expanded="resultsExpanded"
        @click="resultsExpanded = !resultsExpanded"
      >
        <span>MATERIALES</span>
        <span class="abm-materiales-panel__toggle" aria-hidden="true">
          {{ resultsExpanded ? '−' : '+' }}
        </span>
      </button>

      <div v-show="resultsExpanded" class="abm-materiales-results-body">
        <TablaMateriales
          v-model:filters="filters"
          v-model:selected-row="selectedRow"
          v-model:first="first"
          v-model:rows="pageRows"
          :materiales="store.materiales"
          :columns="materialColumns"
          @export="exportar"
          @edit="abrirEdicion"
          @add="showAddDialog = true"
        />
      </div>
    </section>

    <EditarMaterialDialog
      v-model:visible="showEditDialog"
      :material="selectedRow"
      @saved="onMaterialSaved"
    />

    <AltaMaterialDialog
      v-model:visible="showAddDialog"
      @created="onMaterialCreated"
    />

    <FmAlertDialog
      v-model:visible="alertVisible"
      title="Alerta"
      :message="alertMessage"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import FmButton from '@/components/shared/FmButton.vue'
import FmAlertDialog from '@/components/shared/FmAlertDialog.vue'
import LoadingOverlay from '@/modules/shared/components/LoadingOverlay.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import TablaMateriales from './components/TablaMateriales.vue'
import EditarMaterialDialog from './components/EditarMaterialDialog.vue'
import AltaMaterialDialog from './components/AltaMaterialDialog.vue'
import { materialColumns } from './components/columns'
import { useAbmMaterialesStore } from './store/abmMaterialesStore'

const store = useAbmMaterialesStore()
const { exportToExcel } = useExcelExport()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const selectedRow = ref(null)
const first = ref(0)
const pageRows = ref(100)
const showEditDialog = ref(false)
const showAddDialog = ref(false)
const alertVisible = ref(false)
const alertMessage = ref('')

const filters = ref(
  Object.fromEntries(
    materialColumns.map(({ field }) => [
      field,
      { value: null, matchMode: FilterMatchMode.CONTAINS }
    ])
  )
)

const buscar = async () => {
  resultsExpanded.value = true
  first.value = 0
  selectedRow.value = null

  try {
    await store.fetchMateriales()
  } catch {
    alertMessage.value = store.error || 'No fue posible consultar los materiales.'
    alertVisible.value = true
  }
}

const abrirEdicion = () => {
  if (!selectedRow.value || selectedRow.value.activo !== 'S') return
  showEditDialog.value = true
}

const exportar = async ({ rows, fields }) => {
  if (!rows.length) return

  const columnTypes = Object.fromEntries(
    materialColumns.map(({ field, type }) => [field, type])
  )

  await exportToExcel({
    rows,
    fields,
    columns: materialColumns,
    filename: 'ABM_Materiales.xlsx',
    columnTypes
  })
}

const onMaterialSaved = (material) => {
  selectedRow.value = material
}

const onMaterialCreated = () => {
  selectedRow.value = null
  first.value = 0
}
</script>

