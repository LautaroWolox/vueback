<template>
  <div class="jobtype-screen cmo-actividad-screen">
    <section class="jobtype-panel jobtype-panel--filters">
      <button
        type="button"
        class="jobtype-panel__header"
        :aria-expanded="filtersExpanded"
        @click="filtersExpanded = !filtersExpanded"
      >
        <span>FILTROS DE BÚSQUEDA</span>
        <span class="jobtype-panel__toggle">{{ filtersExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="filtersExpanded" class="jobtype-search-body">
        <FmButton label="BUSCAR" class="jobtype-search-button" @click="search" />
      </div>
    </section>

    <section class="jobtype-panel jobtype-panel--results" :class="{ 'is-expanded': resultsExpanded }">
      <button
        type="button"
        class="jobtype-panel__header"
        :aria-expanded="resultsExpanded"
        @click="resultsExpanded = !resultsExpanded"
      >
        <span>RELACIONES CMO-ACTIVIDAD</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <ParametrizacionGrid
          table-id="tabla-cmo-actividad"
          grid-class="jobtype-main-grid"
          :columns="columns"
          :rows="rows"
          :selected="selectedRow"
          :rows-per-page-options="[100, 250, 500]"
          :initial-rows="100"
          empty-text="No hay resultados"
          export-title="Descargar"
          delete-title="Desactivar"
          edit-title="Editar"
          add-title="Nueva relación"
          @update:selected="selectedRow = $event"
          @export="exportCsv"
          @delete="requestDelete"
          @edit="openEdit"
          @add="showAlta = true"
        />
      </div>
    </section>

    <AltaCmoActividadDialog
      v-model:visible="showAlta"
      @submit="createRelations"
    />

    <EditarCmoActividadDialog
      v-model:visible="showEdit"
      :actividad="editForm.actividad"
      :cmo-actual="editForm.cmo"
      @actualizar="updateRelation"
    />

    <ConfirmarAccionDialog
      v-model:visible="showDeleteConfirm"
      title="Confirmar acción"
      message="¿Confirma que desea desactivar la relación seleccionada?"
      @accept="confirmDelete"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/auth'
import { useCmoActividadStore } from '@/store/cmoActividad'
import ParametrizacionGrid from '../shared/ParametrizacionGrid.vue'
import ConfirmarAccionDialog from '../shared/ConfirmarAccionDialog.vue'
import AltaCmoActividadDialog from '../cmoActividad/AltaCmoActividadDialog.vue'
import EditarCmoActividadDialog from '../cmoActividad/EditarCmoActividadDialog.vue'
import { exportRowsToCsv } from '../shared/exportRowsToCsv'

const columns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '14.2857%' },
  { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '14.2857%' },
  { field: 'codigoS4', header: 'CODIGO_S4', width: '14.2857%' },
  { field: 'cmo', header: 'CMO', width: '14.2857%' },
  { field: 'usuarioModificacion', header: 'USUARIO_MODIFICACION', width: '14.2857%' },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '14.2857%' },
  { field: 'activo', header: 'ACTIVO', width: '14.2857%' }
]

const auth = useAuthStore()
const store = useCmoActividadStore()
const { rows } = storeToRefs(store)

const filtersExpanded = ref(true)
const resultsExpanded = ref(true)
const showAlta = ref(false)
const showEdit = ref(false)
const showDeleteConfirm = ref(false)
const selectedRow = ref(null)

const editForm = reactive({
  id: '',
  actividad: '',
  cmo: ''
})

const currentUser = () => auth.nombre || auth.legajo || 'usuario'

const search = () => {
  selectedRow.value = null
  resultsExpanded.value = true
}

const createRelations = (newRows) => {
  store.addMany(newRows, currentUser())
  selectedRow.value = null
  resultsExpanded.value = true
}

const openEdit = (row = selectedRow.value) => {
  if (!row) return

  editForm.id = row.id
  editForm.actividad = row.descActividad || row.codigoActividad || ''
  editForm.cmo = row.cmo || ''
  showEdit.value = true
}

const updateRelation = (nuevoCmo) => {
  if (!editForm.id) return

  const cmo = String(nuevoCmo ?? '').trim()
  if (!cmo) return

  selectedRow.value = store.updateById(editForm.id, { cmo }, currentUser())
  showEdit.value = false
}

const requestDelete = (row = selectedRow.value) => {
  if (!row) return
  selectedRow.value = row
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (!selectedRow.value) return
  selectedRow.value = store.deactivateById(selectedRow.value.id, currentUser())
}

const exportCsv = () => {
  exportRowsToCsv({
    filename: 'cmo-actividad.csv',
    columns,
    rows: rows.value
  })
}
</script>

<style scoped>
.cmo-actividad-screen {
  isolation: isolate;
}

.jobtype-results-body :deep(.parametrizacion-grid-shell) {
  width: 100%;
}
</style>
