<template>
  <div
    class="jobtype-screen jobtype-contrato-screen"
    :class="{
      'jobtype-contrato-screen--grid-expanded': !filtersExpanded && resultsExpanded
    }"
  >
    <LoadingOverlay :loading="store.loading && !showAlta && !showEditar && !showDesactivar" />

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

      <div v-show="filtersExpanded" class="jobtype-panel__body jobtype-search-body">
        <FmButton label="BUSCAR" class="jobtype-search-button" @click="buscar" />
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
        <Tabla
          ref="tablaRef"
          v-model:filters="mainFilters"
          v-model:selected-row="selectedRow"
          v-model:first="mainFirst"
          v-model:rows="mainPageRows"
          :relaciones="store.relaciones"
          :columns="visibleColumns"
          @export="exportarExcel"
          @delete="solicitarDesactivacion"
          @edit="editarSeleccionado"
          @add="abrirAlta"
        />
      </div>
    </section>

    <AltaDialog
      v-model:visible="showAlta"
      @relacionado="onRelacionado"
    />

    <EditarDialog
      v-model:visible="showEditar"
      :tarea-contrato-id="editForm.tareaContratoId"
      :contrato-tipo-id="editForm.contratoTipoId"
      :jobtype-codigo="editForm.jobtypeCodigo"
      :jobtype="editForm.jobtype"
      :contrato-actual="editForm.contratoActual"
      :pais="editForm.pais"
      :origen-actual="editForm.origenActual"
      @actualizado="onActualizado"
    />

    <ConfirmarDesactivacionDialog
      v-model:visible="showDesactivar"
      @confirmar="onDesactivacionConfirmada"
    />

    <FmAlertDialog
      v-model:visible="showError"
      title="Error"
      :message="errorMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import FmButton from '@/components/shared/FmButton.vue'
import FmAlertDialog from '@/components/shared/FmAlertDialog.vue'
import LoadingOverlay from '@/modules/shared/components/LoadingOverlay.vue'
import Tabla from './components/Tabla.vue'
import AltaDialog from './components/AltaDialog.vue'
import EditarDialog from './components/EditarDialog.vue'
import ConfirmarDesactivacionDialog from './components/ConfirmarDesactivacionDialog.vue'
import { useJobtypeContratoStore } from './store/jobtypeContratoStore'
import { useExcelExport } from '@/composables/useExportExcel'

const store = useJobtypeContratoStore()
const tablaRef = ref(null)
const { exportToExcel } = useExcelExport()

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const selectedRow = ref(null)
const mainFirst = ref(0)
const mainPageRows = ref(100)
const showAlta = ref(false)
const showEditar = ref(false)
const showDesactivar = ref(false)
const showError = ref(false)
const localError = ref('')

let popupButtonObserver = null
let popupButtonFrame = null

const popupButtonSelector = [
  '.p-dialog .jobtype-add-button',
  '.p-dialog .jobtype-relate-button',
  '.p-dialog .jobtype-contrato-edit-update',
  '.jobtype-alta-unsaved-dialog .jobtype-alta-unsaved__button',
  '.jobtype-contrato-unsaved-dialog .jobtype-contrato-unsaved__button',
  '.jobtype-contrato-delete-confirm-dialog .jobtype-contrato-delete-confirm__button'
].join(', ')

const setImportantStyle = (element, property, value) => {
  if (
    element.style.getPropertyValue(property) === value &&
    element.style.getPropertyPriority(property) === 'important'
  ) return

  element.style.setProperty(property, value, 'important')
}

const applyPopupButtonDesign = () => {
  document.querySelectorAll(popupButtonSelector).forEach((button) => {
    if (!(button instanceof HTMLElement)) return

    const label = button.textContent?.trim().toUpperCase() ?? ''
    const isOutline = label.includes('CANCELAR') || label.includes('RECHAZAR')

    button.dataset.jobtypePopupButton = 'true'
    button.dataset.jobtypePopupButtonVariant = isOutline ? 'outline' : 'primary'

    setImportantStyle(button, 'width', 'auto')
    setImportantStyle(button, 'min-width', '110px')
    setImportantStyle(button, 'max-width', 'none')
    setImportantStyle(button, 'height', '34px')
    setImportantStyle(button, 'min-height', '34px')
    setImportantStyle(button, 'max-height', '34px')
    setImportantStyle(button, 'padding', '0 16px')
    setImportantStyle(button, 'border-radius', '8px')
    setImportantStyle(button, 'gap', '7px')
    setImportantStyle(button, 'font-size', '12px')
    setImportantStyle(button, 'font-weight', '600')
    setImportantStyle(button, 'line-height', '1')
    setImportantStyle(button, 'box-shadow', '0 4px 12px rgba(0, 73, 84, 0.13)')
    setImportantStyle(button, 'transform', 'none')
  })
}

const schedulePopupButtonDesign = () => {
  if (popupButtonFrame !== null) return

  popupButtonFrame = requestAnimationFrame(() => {
    popupButtonFrame = null
    applyPopupButtonDesign()
  })
}

const editForm = ref({
  tareaContratoId: 0,
  contratoTipoId: 0,
  jobtypeCodigo: '',
  jobtype: '',
  contratoActual: '',
  pais: '',
  origenActual: ''
})

const columns = [
  { field: 'tareaContratoId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'tareaId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'contratoTipoId', header: '', width: '0', hidden: true, exportable: false, filter: false, sort: false },
  { field: 'tareaCodigo', header: 'CODIGO_TAREA', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'tareaNombre', header: 'TAREA', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'contratoNombre', header: 'NOMBRE_CONTRATO', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'origen', header: 'ORIGEN', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'legajoModificacion', header: 'USUARIO_MODIFICACION', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'activo', header: 'ACTIVO', width: '12.5%', exportable: true, filter: true, sort: true },
  { field: 'pais', header: 'PAIS', width: '12.5%', exportable: true, filter: true, sort: true }
]

const visibleColumns = computed(() => columns.filter((col) => !col.hidden))
const errorMessage = computed(() => localError.value || store.error || 'Error de conexión. Contacte al administrador')

const mainFilters = ref(
  Object.fromEntries(
    visibleColumns.value.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

const normalize = (value) => String(value ?? '').trim().toUpperCase()
const isRowActive = (row) => normalize(row?.activo) !== 'N'
const puedeOperarSeleccion = computed(() => Boolean(selectedRow.value && isRowActive(selectedRow.value)))

const reportError = (error) => {
  localError.value = error instanceof Error
    ? error.message
    : (store.error || 'Error de conexión. Contacte al administrador')
  showError.value = true
}

const buscar = async () => {
  resultsExpanded.value = true
  mainFirst.value = 0
  selectedRow.value = null
  localError.value = ''

  try {
    await store.fetchRelaciones()
  } catch (error) {
    reportError(error)
  }
}

const abrirAlta = async () => {
  localError.value = ''
  try {
    await store.fetchRelaciones()
    showAlta.value = true
  } catch (error) {
    reportError(error)
  }
}

const editarSeleccionado = () => {
  if (!puedeOperarSeleccion.value) return

  editForm.value = {
    tareaContratoId: selectedRow.value.tareaContratoId,
    contratoTipoId: selectedRow.value.contratoTipoId,
    jobtypeCodigo: selectedRow.value.tareaCodigo ?? '',
    jobtype: selectedRow.value.tareaNombre ?? '',
    contratoActual: selectedRow.value.contratoNombre ?? '',
    pais: selectedRow.value.pais ?? '',
    origenActual: selectedRow.value.origen ?? ''
  }
  showEditar.value = true
}

const solicitarDesactivacion = () => {
  if (!puedeOperarSeleccion.value) return
  showDesactivar.value = true
}

const onDesactivacionConfirmada = async () => {
  if (!puedeOperarSeleccion.value) return

  try {
    await store.desactivarRelacion(selectedRow.value.tareaContratoId)
    selectedRow.value = null
    await store.fetchRelaciones()
  } catch (error) {
    reportError(error)
  }
}

const refrescarDespuesDeCambio = async () => {
  selectedRow.value = null
  mainFirst.value = 0
  resultsExpanded.value = true
  try {
    await store.fetchRelaciones()
  } catch (error) {
    reportError(error)
  }
}

const onRelacionado = () => refrescarDespuesDeCambio()
const onActualizado = () => refrescarDespuesDeCambio()

const exportarExcel = async () => {
  const exportData = tablaRef.value?.getExportData?.()
  const rows = exportData?.rows ?? []
  const fields = exportData?.fields ?? []
  if (!rows.length || !fields.length) return

  const exportColumns = columns.filter((column) => fields.includes(column.field))

  try {
    await exportToExcel({
      rows,
      fields,
      columns: exportColumns,
      filename: 'Jobtype_Contrato.xlsx'
    })
  } catch (error) {
    reportError(error)
  }
}

onMounted(async () => {
  await nextTick()
  applyPopupButtonDesign()

  popupButtonObserver = new MutationObserver(schedulePopupButtonDesign)
  popupButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  })
})

onBeforeUnmount(() => {
  popupButtonObserver?.disconnect()
  popupButtonObserver = null

  if (popupButtonFrame !== null) {
    cancelAnimationFrame(popupButtonFrame)
    popupButtonFrame = null
  }
})
</script>
