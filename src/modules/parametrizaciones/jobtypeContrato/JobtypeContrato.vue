<template>
  <div class="jobtype-screen jobtype-contrato-screen">
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
        <ParametrizacionButton label="BUSCAR" size="search" @click="search" />
      </div>
    </section>

    <section class="jobtype-panel jobtype-panel--results" :class="{ 'is-expanded': resultsExpanded }">
      <button
        type="button"
        class="jobtype-panel__header"
        :aria-expanded="resultsExpanded"
        @click="resultsExpanded = !resultsExpanded"
      >
        <span>RELACIONES JOBTYPE-CONTRATO</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <ParametrizacionGrid
          ref="gridRef"
          table-id="tabla-jobtype-contrato"
          grid-class="jobtype-main-grid"
          :columns="columns"
          :rows="rows"
          :selected="selectedRow"
          :rows-per-page-options="[100, 250, 500]"
          :initial-rows="100"
          empty-text="No hay resultados"
          export-title="Descargar Excel"
          delete-title="Eliminar"
          edit-title="Editar"
          add-title="Nueva relación"
          @update:selected="selectedRow = $event"
          @export="exportExcel"
          @delete="requestDelete"
          @edit="openEdit"
          @add="showAlta = true"
        />
      </div>
    </section>

    <AltaJobtypeContratoDialog
      v-model:visible="showAlta"
      @submit="createRelations"
    />

    <EditarJobtypeContratoDialog
      v-model:visible="showEdit"
      :jobtype="editForm.jobtype"
      :contrato-actual="editForm.nombreContrato"
      :pais="editForm.pais"
      :origen-actual="editForm.origen"
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
import { useJobtypeContratoStore } from './jobtypeContrato.store'
import ParametrizacionGrid from '../shared/ParametrizacionGrid.vue'
import ParametrizacionButton from '../shared/ParametrizacionButton.vue'
import ConfirmarAccionDialog from '../shared/ConfirmarAccionDialog.vue'
import AltaJobtypeContratoDialog from './AltaJobtypeContratoDialog.vue'
import EditarJobtypeContratoDialog from './EditarJobtypeContratoDialog.vue'
import { exportRowsToExcel } from '../shared/exportRowsToExcel'

const columns = [
  { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '12.5%' },
  { field: 'tarea', header: 'TAREA', width: '12.5%' },
  { field: 'origen', header: 'ORIGEN', width: '12.5%' },
  { field: 'nombreContrato', header: 'NOMBRE_CONTRATO', width: '12.5%' },
  { field: 'usuarioModificacion', header: 'USUARIO_MODIFICACION', width: '12.5%' },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '12.5%' },
  { field: 'activo', header: 'ACTIVO', width: '12.5%' },
  { field: 'pais', header: 'PAIS', width: '12.5%' }
]

const auth = useAuthStore()
const store = useJobtypeContratoStore()
const { rows } = storeToRefs(store)

const gridRef = ref(null)
const filtersExpanded = ref(true)
const resultsExpanded = ref(true)
const showAlta = ref(false)
const showEdit = ref(false)
const showDeleteConfirm = ref(false)
const selectedRow = ref(null)

const editForm = reactive({
  id: '',
  jobtype: '',
  nombreContrato: '',
  pais: '',
  origen: ''
})

const currentUser = () => auth.nombre || auth.legajo || 'usuario'

const search = () => {
  selectedRow.value = null
  resultsExpanded.value = true
  gridRef.value?.resetPage()
}

const createRelations = (newRows) => {
  store.addMany(newRows, currentUser())
  selectedRow.value = null
  resultsExpanded.value = true
}

const openEdit = (row = selectedRow.value) => {
  if (!row) return

  editForm.id = row.id
  editForm.jobtype = row.tarea || row.codigoTarea || ''
  editForm.nombreContrato = row.nombreContrato || ''
  editForm.pais = row.pais || ''
  editForm.origen = row.origen || ''
  showEdit.value = true
}

const updateRelation = (changes = {}) => {
  if (!editForm.id) return

  const nombreContrato = String(changes.contrato ?? editForm.nombreContrato).trim()
  const origen = String(changes.origen ?? editForm.origen).trim()
  if (!nombreContrato || !origen) return

  selectedRow.value = store.updateById(
    editForm.id,
    { nombreContrato, origen },
    currentUser()
  )
  showEdit.value = false
}

const requestDelete = (row = selectedRow.value) => {
  if (!row) return
  selectedRow.value = row
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (!selectedRow.value) return
  store.removeById(selectedRow.value.id)
  selectedRow.value = null
}

const exportExcel = async () => {
  await exportRowsToExcel({
    filename: 'jobtype-contrato.xlsx',
    sheetName: 'Jobtype Contrato',
    columns,
    rows: rows.value
  })
}
</script>

<style scoped>
.jobtype-contrato-screen {
  isolation: isolate;
}

.jobtype-results-body :deep(.parametrizacion-grid-shell) {
  width: 100%;
}
</style>
