<template>
  <div
    class="fm-screen fm-screen--pad abm-materiales-page"
    :class="{ 'abm-materiales-page--grid-expanded': resultsExpanded }"
  >
    <Accordion
      v-model:value="activePanels"
      multiple
      class="fm-accordion abm-materiales-accordion"
    >
      <AccordionPanel value="0" class="abm-materiales-filters-panel">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <div class="abm-materiales-search-body">
            <FmButton label="BUSCAR" @click="buscar" />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1" class="abm-materiales-results-panel">
        <AccordionHeader>MATERIALES</AccordionHeader>
        <AccordionContent>
          <FmGridShell
            class="abm-materiales-grid-shell"
            :loading="store.loading"
            loading-title="Cargando Información"
            loading-message="Preparando Grilla"
          >
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
          </FmGridShell>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

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
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import FmButton from '@/components/shared/FmButton.vue'
import FmGridShell from '@/components/shared/FmGridShell.vue'
import FmAlertDialog from '@/components/shared/FmAlertDialog.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import TablaMateriales from './components/TablaMateriales.vue'
import EditarMaterialDialog from './components/EditarMaterialDialog.vue'
import AltaMaterialDialog from './components/AltaMaterialDialog.vue'
import { materialColumns } from './components/columns'
import { useAbmMaterialesStore } from './store/abmMaterialesStore'
import './abm-materiales.css'

const store = useAbmMaterialesStore()
const { exportToExcel } = useExcelExport()

const activePanels = ref(['0'])
const selectedRow = ref(null)
const first = ref(0)
const pageRows = ref(500)
const showEditDialog = ref(false)
const showAddDialog = ref(false)
const alertVisible = ref(false)
const alertMessage = ref('')

const resultsExpanded = computed(() => {
  const values = Array.isArray(activePanels.value)
    ? activePanels.value
    : [activePanels.value]

  return values.map(String).includes('1')
})

const filters = ref(
  Object.fromEntries(
    materialColumns.map(({ field }) => [
      field,
      { value: null, matchMode: FilterMatchMode.CONTAINS }
    ])
  )
)

const buscar = async () => {
  // Mismo flujo visual que el resto de las pantallas migradas:
  // al consultar se contraen los filtros y la grilla toma todo el alto disponible.
  activePanels.value = ['1']
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
