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
n  selectedRow.value = null

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

<style>
#tabla-abm-materiales .p-datatable-tbody > tr.p-highlight > td,
#tabla-abm-materiales .p-datatable-tbody > tr.p-datatable-row-selected > td {
  border-color: #78c5cf !important;
  background: #a9e0e7 !important;
  color: #143d45 !important;
  font-weight: 700 !important;
}

#tabla-abm-materiales .p-datatable-tbody > tr.p-highlight .abm-materiales-cell-text,
#tabla-abm-materiales .p-datatable-tbody > tr.p-datatable-row-selected .abm-materiales-cell-text {
  color: #143d45 !important;
  font-weight: 700 !important;
}

.abm-materiales-dialog.p-dialog {
  border: 1px solid #b7c4ca !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 9px !important;
  box-shadow: 0 18px 42px rgba(22, 47, 59, .22) !important;
}

.abm-materiales-dialog .p-dialog-header {
  min-height: 56px !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 20px !important;
}

.abm-materiales-dialog .p-dialog-title,
.abm-materiales-dialog__header {
  font-size: 18px !important;
  font-weight: 700 !important;
}

.abm-materiales-dialog .p-dialog-header-actions {
  width: auto !important;
  min-width: 0 !important;
  height: auto !important;
  margin-left: auto !important;
  padding: 0 !important;
}

.abm-materiales-dialog .p-dialog-close-button,
.abm-materiales-dialog .p-dialog-header-close-button {
  width: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 1px solid #d7e0e4 !important;
  border-radius: 8px !important;
  background: #fff !important;
  color: #111820 !important;
  box-shadow: 0 4px 12px rgba(18, 48, 60, .08) !important;
  transform: none !important;
  transition:
    border-color .15s ease,
    color .15s ease,
    background-color .15s ease,
    box-shadow .15s ease !important;
}

.abm-materiales-dialog .p-dialog-close-button:hover,
.abm-materiales-dialog .p-dialog-header-close-button:hover,
.abm-materiales-dialog .p-dialog-close-button:focus-visible,
.abm-materiales-dialog .p-dialog-header-close-button:focus-visible {
  border-color: #00a9bd !important;
  background: #fff !important;
  color: #008fa1 !important;
  box-shadow: 0 0 0 1px rgba(0, 169, 189, .12) !important;
  outline: none !important;
}

.abm-materiales-dialog-close-icon {
  width: 18px !important;
  height: 18px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: currentColor !important;
  font-family: Arial, sans-serif !important;
  font-size: 21px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.abm-materiales-dialog__form {
  gap: 15px !important;
  padding: 22px 22px 24px !important;
}

.abm-materiales-dialog__form--edit {
  grid-template-columns: minmax(0, 1fr) !important;
}

.abm-materiales-dialog__form--add {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 16px 14px !important;
}

.abm-materiales-dialog__field--code,
.abm-materiales-dialog__field--full {
  grid-column: 1 / -1 !important;
}

.abm-materiales-dialog__field {
  gap: 6px !important;
}

.abm-materiales-dialog__field label {
  font-size: 11px !important;
}

.abm-materiales-dialog__field > .p-inputtext,
.abm-materiales-dialog__field .p-inputnumber-input {
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 12px !important;
  border-radius: 6px !important;
  font-size: 13px !important;
}

.abm-materiales-dialog .p-dialog-footer {
  min-height: 68px !important;
  padding: 12px 20px !important;
  background: #f9fbfc !important;
}

.abm-materiales-dialog__footer .fm-action-button,
.abm-materiales-dialog__footer .fm-ui-button {
  min-width: 120px !important;
  height: 36px !important;
  min-height: 36px !important;
  padding: 0 18px !important;
  border-radius: 7px !important;
}

@media (max-width: 700px) {
  .abm-materiales-dialog__form--add,
  .abm-materiales-dialog__form--edit {
    grid-template-columns: 1fr !important;
  }

  .abm-materiales-dialog__field--code,
  .abm-materiales-dialog__field--full {
    grid-column: auto !important;
  }
}
</style>
