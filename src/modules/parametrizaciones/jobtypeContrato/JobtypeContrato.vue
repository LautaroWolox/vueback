<template>
  <div class="fm-screen fm-screen--pad jobtype-contrato-page">
    <Accordion v-model:value="activePanels" multiple class="fm-accordion jobtype-contrato-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <div class="jobtype-contrato-filters">
            <FmButton
              label="BUSCAR"
              icon="pi-search"
              :loading="store.loading"
              loading-label="BUSCANDO..."
              @click="buscar"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel v-if="store.searched || store.loading" value="1">
        <AccordionHeader>RELACIONES JOBTYPE-CONTRATO</AccordionHeader>
        <AccordionContent>
          <FmGridShell
            :loading="store.loading"
            loading-title="Cargando Jobtype-Contrato"
            loading-message="Consultando relaciones jobtype-contrato"
          >
            <DataTable
              id="tabla-jobtype-contrato"
              ref="dt"
              class="fm-pass-grid jobtype-contrato-grid"
              :value="store.rows"
              dataKey="id"
              tableStyle="table-layout: fixed; width: max-content; min-width: 100%"
              scrollable
              scrollHeight="430px"
              removableSort
              sortMode="multiple"
              filterDisplay="row"
              v-model:filters="filters"
              v-model:selection="selectedRow"
              selectionMode="single"
              :rowClass="rowClass"
              paginator
              :first="pageFirst"
              :rows="pageRows"
              :rowsPerPageOptions="[10, 20, 50, 100]"
              paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              currentPageReportTemplate="Pagina {currentPage} de {totalPages}"
              :resizableColumns="true"
              columnResizeMode="expand"
              showGridlines
              @page="onPage"
              @row-click="onRowClick"
            >
              <template #paginatorstart>
                <div class="jobtype-grid-actions" aria-label="Acciones de grilla">
                  <Button icon="pi pi-download" text rounded class="fm-grid-action-final jobtype-grid-action" title="Exportar" aria-label="Exportar" v-tooltip.top="'Exportar'" @click="exportarExcel" />
                  <Button icon="pi pi-trash" text rounded class="fm-grid-action-final jobtype-grid-action" :disabled="!store.hasSelection" title="Eliminar" aria-label="Eliminar" v-tooltip.top="'Eliminar'" @click="eliminar" />
                  <Button icon="pi pi-pencil" text rounded class="fm-grid-action-final jobtype-grid-action" :disabled="!store.hasSelection" title="Editar" aria-label="Editar" v-tooltip.top="'Editar'" @click="abrirEdicion" />
                  <Button icon="pi pi-plus" text rounded class="fm-grid-action-final jobtype-grid-action" title="Nueva Relación" aria-label="Nueva Relación" v-tooltip.top="'Nueva Relación'" @click="abrirAlta" />
                </div>
              </template>

              <template #paginatorend>
                <span class="fm-grid-counter">
                  Mostrando {{ shownStart }} - {{ shownEnd }} de {{ store.rows.length }}
                </span>
              </template>

              <template #empty>
                <div class="fm-grid-empty">No hay resultados</div>
              </template>

              <Column
                v-for="col in columns"
                :key="col.field"
                :field="col.field"
                :sortField="col.field"
                :filterField="col.field"
                :header="col.header"
                sortable
                filter
                :showFilterMenu="false"
                :exportable="col.exportable"
                :style="columnStyle(col)"
                :headerStyle="columnStyle(col)"
                :bodyStyle="columnStyle(col)"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <div class="fm-filter-cell jobtype-filter-cell">
                    <span class="fm-filter-prefix">~</span>
                    <InputText v-model="filterModel.value" type="text" class="fm-column-filter" @input="filterCallback()" />
                    <span class="fm-filter-more">...</span>
                  </div>
                </template>

                <template #body="{ data }">
                  <span class="fm-cell-text jobtype-cell-text" :title="String(data[col.field] ?? '')">
                    {{ data[col.field] ?? '' }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </FmGridShell>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <Dialog
      v-model:visible="showAlta"
      class="jobtype-modal jobtype-modal--alta"
      appendTo="body"
      modal
      draggable
      :resizable="false"
      :closable="false"
      :style="{ width: '980px', maxWidth: 'calc(100vw - 32px)' }"
    >
      <template #header>
        <div class="jobtype-modal-header">
          <span class="jobtype-modal-title">Alta Jobtype - Contrato</span>
          <button type="button" class="jobtype-modal-close" aria-label="Cerrar" @click="cerrarAlta">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </template>

      <div class="jobtype-modal-form jobtype-modal-form--origen">
        <div class="jobtype-modal-field jobtype-modal-field--pais">
          <label for="alta-pais">País</label>
          <FmCompactSelect id="alta-pais" v-model="altaForm.pais" :options="paisOptions" option-label="label" option-value="value" class="jobtype-modal-select" />
        </div>

        <div class="jobtype-modal-field">
          <label for="alta-jobtype">Jobtype</label>
          <InputText id="alta-jobtype" v-model="altaForm.jobtype" class="jobtype-modal-input" />
        </div>

        <div class="jobtype-modal-field">
          <label for="alta-contrato">Contrato</label>
          <InputText id="alta-contrato" v-model="altaForm.contrato" class="jobtype-modal-input" />
        </div>

        <div class="jobtype-modal-field">
          <label for="alta-origen">Origen</label>
          <FmCompactSelect id="alta-origen" v-model="altaForm.origen" :options="origenOptions" option-label="label" option-value="value" class="jobtype-modal-select" />
        </div>

        <FmButton label="AGREGAR" class="jobtype-modal-button jobtype-modal-button--add" :disabled="!canAgregarRelacion" @click="agregarRelacionPreview" />
      </div>

      <div class="jobtype-alta-grid-shell">
        <DataTable
          id="tabla-jobtype-alta"
          class="fm-pass-grid jobtype-alta-datatable"
          :value="altaRows"
          dataKey="id"
          tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scrollHeight="210px"
          removableSort
          sortMode="multiple"
          filterDisplay="row"
          v-model:filters="altaTableFilters"
          v-model:selection="altaSelectedRow"
          selectionMode="single"
          :rowClass="altaRowClass"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="Página {currentPage} de {totalPages}"
          :resizableColumns="true"
          columnResizeMode="expand"
          showGridlines
          @row-click="onAltaRowClick"
        >
          <template #empty>
            <div class="fm-grid-empty jobtype-alta-empty">No hay relaciones agregadas</div>
          </template>

          <Column
            v-for="col in altaColumns"
            :key="col.field"
            :field="col.field"
            :sortField="col.field"
            :filterField="col.field"
            :header="col.header"
            sortable
            filter
            :showFilterMenu="false"
            :style="altaColumnStyle(col)"
            :headerStyle="altaColumnStyle(col)"
            :bodyStyle="altaColumnStyle(col)"
          >
            <template #filter="{ filterModel, filterCallback }">
              <div class="fm-filter-cell jobtype-filter-cell jobtype-filter-cell--alta">
                <span class="fm-filter-prefix">~</span>
                <InputText v-model="filterModel.value" type="text" class="fm-column-filter" @input="filterCallback()" />
                <span class="fm-filter-more">...</span>
              </div>
            </template>

            <template #body="{ data }">
              <span class="fm-cell-text jobtype-cell-text" :title="String(data[col.field] ?? '')">
                {{ data[col.field] ?? '' }}
              </span>
            </template>
          </Column>
        </DataTable>

        <button
          type="button"
          class="jobtype-alta-trash-left"
          :disabled="!altaSelectedRow"
          title="Eliminar"
          aria-label="Eliminar"
          v-tooltip.top="'Eliminar'"
          @click="eliminarAltaPreview"
        >
          <i class="pi pi-trash" aria-hidden="true"></i>
        </button>
      </div>

      <template #footer>
        <FmButton label="RELACIONAR" class="jobtype-modal-button jobtype-modal-button--relacionar" :disabled="altaRows.length === 0 || store.loading" :loading="store.loading" @click="relacionar" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showEdicion"
      class="jobtype-modal jobtype-modal--edicion"
      appendTo="body"
      modal
      draggable
      :resizable="false"
      :closable="false"
      :style="{ width: '940px', maxWidth: 'calc(100vw - 32px)' }"
    >
      <template #header>
        <div class="jobtype-modal-header">
          <span class="jobtype-modal-title">Edición Jobtype-Contrato</span>
          <button type="button" class="jobtype-modal-close" aria-label="Cerrar" @click="showEdicion = false">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </template>

      <div class="jobtype-edit-form">
        <div class="jobtype-modal-field">
          <label for="edit-jobtype">JobType</label>
          <InputText id="edit-jobtype" v-model="editForm.jobtype" class="jobtype-modal-input" disabled />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-contrato-actual">Contrato</label>
          <InputText id="edit-contrato-actual" v-model="editForm.contratoActual" class="jobtype-modal-input" disabled />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-pais">País</label>
          <InputText id="edit-pais" v-model="editForm.pais" class="jobtype-modal-input" disabled />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-contrato-nuevo">Nuevo Contrato</label>
          <InputText id="edit-contrato-nuevo" v-model="editForm.contratoNuevo" class="jobtype-modal-input jobtype-input--active" />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-origen">Origen</label>
          <FmCompactSelect id="edit-origen" v-model="editForm.origen" :options="editOrigenOptions" option-label="label" option-value="value" class="jobtype-modal-select jobtype-input--active" />
        </div>
      </div>

      <template #footer>
        <FmButton label="ACTUALIZAR" class="jobtype-modal-button jobtype-modal-button--update" :loading="store.loading" @click="actualizarRelacion" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showEliminar"
      class="jobtype-confirm-dialog"
      appendTo="body"
      modal
      :draggable="false"
      :resizable="false"
      :closable="false"
      :style="{ width: '560px', maxWidth: 'calc(100vw - 24px)' }"
    >
      <template #header>
        <div class="jobtype-confirm-header">
          <span>Alerta</span>
          <button type="button" class="jobtype-modal-close" aria-label="Cerrar" @click="cancelarEliminar">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </template>

      <div class="jobtype-confirm-body">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        <span>¿Confirma que desea desactivar la relación seleccionada?</span>
      </div>

      <template #footer>
        <FmButton label="CANCELAR" variant="outline" class="jobtype-confirm-button" @click="cancelarEliminar" />
        <FmButton label="ACEPTAR" class="jobtype-confirm-button" :loading="store.loading" @click="confirmarEliminar" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showMessage"
      class="jobtype-message-dialog"
      appendTo="body"
      modal
      :draggable="false"
      :resizable="false"
      :closable="false"
      :style="{ width: '520px', maxWidth: 'calc(100vw - 24px)' }"
    >
      <template #header>
        <div class="jobtype-confirm-header">
          <span>Alerta</span>
          <button type="button" class="jobtype-modal-close" aria-label="Cerrar" @click="cerrarMensaje">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>
      </template>

      <div class="jobtype-message-body">{{ messageText }}</div>

      <template #footer>
        <FmButton label="CERRAR" class="jobtype-confirm-button" @click="cerrarMensaje" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'
import FmCompactSelect from '@/components/shared/FmCompactSelect.vue'
import { useExcelExport } from '@/composables/useExportExcel'
import { jobtypeContratoColumns } from './columns'
import { useJobtypeContratoStore } from './store'

const store = useJobtypeContratoStore()
const dt = ref()
const activePanels = ref(['0'])
const columns = ref(jobtypeContratoColumns)
const { exportToExcel, parseDataFromTable } = useExcelExport()
const showAlta = ref(false)
const showEdicion = ref(false)
const showEliminar = ref(false)
const showMessage = ref(false)
const messageText = ref('')
const altaRows = ref([])
const altaSelectedRow = ref(null)
const pageFirst = ref(0)
const pageRows = ref(10)

const altaColumns = ref([
  { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '20%', minWidth: '145px' },
  { field: 'tarea', header: 'TAREA', width: '24%', minWidth: '180px' },
  { field: 'origen', header: 'ORIGEN', width: '16%', minWidth: '130px' },
  { field: 'nombreContrato', header: 'NOMBRE_CONTRATO', width: '24%', minWidth: '180px' },
  { field: 'pais', header: 'PAIS', width: '16%', minWidth: '120px' }
])

const paisOptions = [
  { label: '', value: '' },
  { label: 'ARG/UY', value: 'ARG/UY' },
  { label: 'PY', value: 'PY' }
]

const origenAllOptions = [
  { label: '', value: '' },
  { label: 'FAN', value: 'FAN' },
  { label: 'MXM', value: 'MXM' }
]

const origenPyOptions = [{ label: 'FAN', value: 'FAN' }]

const altaForm = reactive({ pais: '', jobtype: '', contrato: '', origen: '' })
const editForm = reactive({ jobtype: '', contratoActual: '', pais: '', contratoNuevo: '', origen: '' })

const filters = ref(Object.fromEntries(columns.value.map((col) => [col.field, { value: null, matchMode: FilterMatchMode.CONTAINS }])))
const altaTableFilters = ref(Object.fromEntries(altaColumns.value.map((col) => [col.field, { value: null, matchMode: FilterMatchMode.CONTAINS }])))

const selectedRow = computed({
  get: () => store.selectedRow,
  set: (value) => store.setSelectedRow(value)
})

const origenOptions = computed(() => (altaForm.pais === 'PY' ? origenPyOptions : origenAllOptions))
const editOrigenOptions = computed(() => (editForm.pais === 'PY' ? origenPyOptions : origenAllOptions))
const canAgregarRelacion = computed(() => Boolean(altaForm.jobtype.trim() && altaForm.contrato.trim() && altaForm.pais && altaForm.origen))
const shownStart = computed(() => (store.rows.length ? pageFirst.value + 1 : 0))
const shownEnd = computed(() => Math.min(pageFirst.value + pageRows.value, store.rows.length))

const normalizarOrigenPorPais = (pais, origen) => {
  if (pais === 'PY') return 'FAN'
  return ['FAN', 'MXM'].includes(origen) ? origen : ''
}

watch(() => altaForm.pais, (pais) => {
  altaForm.origen = normalizarOrigenPorPais(pais, altaForm.origen)
})

watch(() => editForm.pais, (pais) => {
  editForm.origen = normalizarOrigenPorPais(pais, editForm.origen)
})

const mostrarMensaje = (message) => {
  messageText.value = message || 'Ocurrió un error inesperado.'
  showMessage.value = true
}

const cerrarMensaje = () => {
  showMessage.value = false
  messageText.value = ''
  store.clearError()
}

const validarRespuesta = (response) => {
  if (response?.status === false) {
    throw new Error(response?.respuesta || response?.message || 'La operación no pudo completarse.')
  }
}

const buscar = async () => {
  activePanels.value = ['0', '1']
  pageFirst.value = 0
  try {
    await store.search()
  } catch (error) {
    mostrarMensaje(store.errorMessage || error?.message)
  }
  activePanels.value = ['0', '1']
}

const onPage = (event) => {
  pageFirst.value = event.first
  pageRows.value = event.rows
}

const columnStyle = (col) => ({ width: col.width || '140px', minWidth: col.minWidth || col.width || '100px', maxWidth: 'none' })
const altaColumnStyle = (col) => ({ width: col.width || '140px', minWidth: col.minWidth || col.width || '100px', maxWidth: col.width || 'none' })
const rowClass = (data) => ({ 'fm-selected-row': store.selectedRow?.id === data?.id, 'jobtype-row-selected': store.selectedRow?.id === data?.id })
const altaRowClass = (data) => ({ 'fm-selected-row': altaSelectedRow.value?.id === data?.id, 'jobtype-row-selected': altaSelectedRow.value?.id === data?.id })

const onRowClick = (event) => {
  if (event?.data) store.setSelectedRow(event.data)
}

const onAltaRowClick = (event) => {
  if (event?.data) altaSelectedRow.value = event.data
}

const exportarExcel = () => {
  const parsed = parseDataFromTable(dt)
  exportToExcel({ rows: parsed.rows, fields: parsed.fields, columns: columns.value, filename: 'jobtype_contrato.xlsx', columnTypes: {}, groupField: null })
}

const limpiarAlta = () => {
  altaForm.pais = ''
  altaForm.jobtype = ''
  altaForm.contrato = ''
  altaForm.origen = ''
  altaRows.value = []
  altaSelectedRow.value = null
  Object.values(altaTableFilters.value).forEach((filter) => {
    filter.value = null
  })
}

const abrirAlta = () => {
  limpiarAlta()
  showAlta.value = true
}

const cerrarAlta = () => {
  showAlta.value = false
  limpiarAlta()
}

const normalizarJobtype = (value) => value.trim().toUpperCase()

const agregarRelacionPreview = () => {
  if (!canAgregarRelacion.value) return
  const codigoTarea = normalizarJobtype(altaForm.jobtype)
  const duplicado = altaRows.value.some((row) => normalizarJobtype(row.codigoTarea || '') === codigoTarea)

  if (duplicado) {
    mostrarMensaje('El Jobtype seleccionado ya está cargado.')
    return
  }

  const newRow = {
    id: `${Date.now()}-${codigoTarea}`,
    codigoTarea,
    tarea: altaForm.jobtype.trim(),
    origen: altaForm.origen,
    nombreContrato: altaForm.contrato.trim(),
    pais: altaForm.pais
  }

  altaRows.value = [...altaRows.value, newRow]
  altaSelectedRow.value = newRow
  altaForm.jobtype = ''
  altaForm.contrato = ''
  altaForm.origen = altaForm.pais === 'PY' ? 'FAN' : ''
}

const eliminarAltaPreview = () => {
  if (!altaSelectedRow.value) return
  altaRows.value = altaRows.value.filter((row) => row.id !== altaSelectedRow.value.id)
  altaSelectedRow.value = null
}

const relacionar = async () => {
  if (!altaRows.value.length) return
  try {
    const response = await store.createRelations(altaRows.value.map(({ id, ...row }) => row))
    validarRespuesta(response)
    showAlta.value = false
    limpiarAlta()
    await store.search()
  } catch (error) {
    mostrarMensaje(store.errorMessage || error?.message)
  }
}

const abrirEdicion = () => {
  if (!store.selectedRow) return
  editForm.jobtype = store.selectedRow.tarea || store.selectedRow.codigoTarea || ''
  editForm.contratoActual = store.selectedRow.nombreContrato || ''
  editForm.pais = store.selectedRow.pais || ''
  editForm.contratoNuevo = ''
  editForm.origen = normalizarOrigenPorPais(editForm.pais, store.selectedRow.origen || '')
  showEdicion.value = true
}

const actualizarRelacion = async () => {
  if (!store.selectedRow) return
  try {
    const response = await store.updateRelation({
      ...store.selectedRow,
      contratoActual: editForm.contratoActual,
      contratoNuevo: editForm.contratoNuevo.trim(),
      origen: editForm.origen,
      pais: editForm.pais
    })
    validarRespuesta(response)
    showEdicion.value = false
    await store.search()
  } catch (error) {
    mostrarMensaje(store.errorMessage || error?.message)
  }
}

const eliminar = () => {
  if (store.selectedRow) showEliminar.value = true
}

const cancelarEliminar = () => {
  showEliminar.value = false
}

const confirmarEliminar = async () => {
  if (!store.selectedRow) return
  try {
    const response = await store.deactivateRelation(store.selectedRow)
    validarRespuesta(response)
    showEliminar.value = false
    await store.search()
  } catch (error) {
    mostrarMensaje(store.errorMessage || error?.message)
  }
}
</script>

<style scoped>
.jobtype-contrato-page {
  width: 100%;
}

.jobtype-contrato-accordion {
  gap: 14px !important;
}

.jobtype-contrato-filters {
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
}

.jobtype-contrato-grid :deep(.p-datatable-table),
.jobtype-alta-datatable :deep(.p-datatable-table) {
  table-layout: fixed !important;
}

.jobtype-contrato-grid :deep(.p-datatable-thead > tr > th),
.jobtype-contrato-grid :deep(.p-datatable-tbody > tr > td),
.jobtype-alta-datatable :deep(.p-datatable-thead > tr > th),
.jobtype-alta-datatable :deep(.p-datatable-tbody > tr > td) {
  overflow: hidden !important;
  vertical-align: middle !important;
}

.jobtype-contrato-grid :deep(.p-datatable-tbody > tr),
.jobtype-alta-datatable :deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

.jobtype-contrato-grid :deep(.p-datatable-tbody > tr:hover > td),
.jobtype-alta-datatable :deep(.p-datatable-tbody > tr:hover > td) {
  background: rgba(0, 180, 181, .06) !important;
}

.jobtype-contrato-grid :deep(.p-datatable-tbody > tr.jobtype-row-selected > td),
.jobtype-contrato-grid :deep(.p-datatable-tbody > tr.p-highlight > td),
.jobtype-alta-datatable :deep(.p-datatable-tbody > tr.jobtype-row-selected > td),
.jobtype-alta-datatable :deep(.p-datatable-tbody > tr.p-highlight > td) {
  background: #e8f8fb !important;
  color: #0f2f3d !important;
}

.jobtype-cell-text {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobtype-grid-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.jobtype-grid-actions :deep(.jobtype-grid-action) {
  width: 18px !important;
  min-width: 18px !important;
  height: 18px !important;
  min-height: 18px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #001f2f !important;
  box-shadow: none !important;
}

.jobtype-grid-actions :deep(.jobtype-grid-action:hover),
.jobtype-grid-actions :deep(.jobtype-grid-action:focus) {
  background: transparent !important;
  color: #008fa1 !important;
}

.jobtype-grid-actions :deep(.jobtype-grid-action:disabled) {
  opacity: .35 !important;
  cursor: not-allowed !important;
}

.jobtype-grid-actions :deep(.jobtype-grid-action .pi) {
  font-size: 13px !important;
}

.jobtype-modal-header,
.jobtype-confirm-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.jobtype-modal-title,
.jobtype-confirm-header > span {
  color: #263746;
  font-size: 18px;
  font-weight: 400;
}

.jobtype-modal-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8da0aa;
  cursor: pointer;
}

.jobtype-modal-close:hover {
  color: #00a9bd;
}

.jobtype-modal-form {
  display: grid;
  grid-template-columns: 125px minmax(0, 1fr) minmax(0, 1fr) 125px 112px;
  gap: 12px;
  align-items: end;
  padding: 4px 2px 18px;
}

.jobtype-edit-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 22px;
  padding: 8px 4px 28px;
}

.jobtype-modal-field {
  min-width: 0;
}

.jobtype-modal-field label {
  display: block;
  margin-bottom: 5px;
  color: #101820;
  font-size: 12px;
  font-weight: 600;
}

.jobtype-modal-input,
.jobtype-modal-select {
  width: 100%;
  height: 34px;
  min-height: 34px;
}

.jobtype-modal-input:disabled {
  background: #edf1f3 !important;
  color: #84939c !important;
}

.jobtype-modal-button {
  min-width: 104px !important;
  height: 34px !important;
  min-height: 34px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

.jobtype-alta-grid-shell {
  position: relative;
  width: 100%;
}

.jobtype-alta-trash-left {
  position: absolute;
  left: 14px;
  bottom: 8px;
  z-index: 5;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #001f2f;
  cursor: pointer;
}

.jobtype-alta-trash-left:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.jobtype-alta-empty {
  height: 148px;
  min-height: 148px;
}

.jobtype-confirm-body {
  min-height: 120px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 28px;
  color: #2c3e4d;
  font-size: 17px;
}

.jobtype-confirm-body .pi {
  color: #e5393f;
  font-size: 42px;
}

.jobtype-message-body {
  min-height: 90px;
  display: flex;
  align-items: center;
  padding: 20px 24px;
  color: #2c3e4d;
  font-size: 15px;
}

.jobtype-confirm-button {
  min-width: 118px !important;
  height: 36px !important;
  min-height: 36px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

:global(.jobtype-modal.p-dialog),
:global(.jobtype-confirm-dialog.p-dialog),
:global(.jobtype-message-dialog.p-dialog) {
  border-radius: 2px !important;
  overflow: visible !important;
}

:global(.jobtype-modal .p-dialog-header),
:global(.jobtype-confirm-dialog .p-dialog-header),
:global(.jobtype-message-dialog .p-dialog-header) {
  min-height: 52px !important;
  padding: 0 16px !important;
  border-bottom: 1px solid #d8e0e5 !important;
}

:global(.jobtype-modal .p-dialog-content) {
  padding: 18px 18px 20px !important;
  overflow: visible !important;
}

:global(.jobtype-modal .p-dialog-footer),
:global(.jobtype-confirm-dialog .p-dialog-footer),
:global(.jobtype-message-dialog .p-dialog-footer) {
  min-height: 56px !important;
  padding: 10px 16px !important;
  border-top: 1px solid #d8e0e5 !important;
}

@media (max-width: 900px) {
  .jobtype-modal-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .jobtype-edit-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .jobtype-contrato-filters {
    min-height: 68px;
    padding: 10px;
  }

  .jobtype-modal-form,
  .jobtype-edit-form {
    grid-template-columns: 1fr;
  }

  .jobtype-modal-button,
  .jobtype-confirm-button {
    width: 100% !important;
  }

  .jobtype-confirm-body {
    align-items: flex-start;
    gap: 16px;
    padding: 18px;
    font-size: 15px;
  }

  .jobtype-confirm-body .pi {
    font-size: 34px;
  }
}
</style>
