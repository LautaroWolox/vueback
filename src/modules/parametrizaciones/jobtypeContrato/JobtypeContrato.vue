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
              v-model:filters="filters"
              v-model:selection="selectedRow"
              v-model:first="pageFirst"
              v-model:rows="pageRows"
              class="fm-pass-grid jobtype-contrato-grid"
              :value="store.rows"
              dataKey="id"
              tableStyle="table-layout: fixed; width: max-content; min-width: 100%"
              scrollable
              scrollHeight="430px"
              removableSort
              sortMode="multiple"
              filterDisplay="row"
              selectionMode="single"
              :rowClass="rowClass"
              paginator
              :rowsPerPageOptions="[10, 50, 100, 500]"
              :resizableColumns="true"
              columnResizeMode="expand"
              showGridlines
              @row-click="onRowClick"
            >
              <template
                #paginatorcontainer="{
                  first,
                  last,
                  page,
                  pageCount,
                  rows,
                  totalRecords,
                  firstPageCallback,
                  lastPageCallback,
                  prevPageCallback,
                  nextPageCallback,
                  rowChangeCallback,
                  changePageCallback
                }"
              >
                <FmGridPaginator
                  :first="first"
                  :last="last"
                  :page="page"
                  :page-count="pageCount"
                  :rows="rows"
                  :total-records="totalRecords"
                  :rows-options="[10, 50, 100, 500]"
                  :disabled="store.loading"
                  @first-page="firstPageCallback"
                  @prev-page="prevPageCallback"
                  @next-page="nextPageCallback"
                  @last-page="lastPageCallback"
                  @page-change="changePageCallback"
                  @rows-change="rowChangeCallback"
                >
                  <template #actions>
                    <FmGridActions
                      size="large"
                      :show-refresh="false"
                      :show-edit="true"
                      :show-add="true"
                      :delete-disabled="!store.hasSelection"
                      :edit-disabled="!store.hasSelection"
                      delete-title="Eliminar"
                      edit-title="Editar"
                      add-title="Nueva Relación"
                      @export="exportarExcel"
                      @delete="eliminar"
                      @edit="abrirEdicion"
                      @add="abrirAlta"
                    />
                  </template>
                </FmGridPaginator>
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
                    <InputText
                      v-model="filterModel.value"
                      type="text"
                      class="fm-column-filter"
                      @input="filterCallback()"
                    />
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
      :modal="true"
      :draggable="true"
      :resizable="false"
      :closable="false"
      :style="{ width: '980px', maxWidth: 'calc(100vw - 48px)' }"
    >
      <template #header>
        <div class="jobtype-modal-header">
          <span class="jobtype-modal-title">Alta Jobtype - Contrato</span>
          <span
            role="button"
            tabindex="0"
            class="jobtype-modal-close"
            aria-label="Cerrar"
            @click="cerrarAlta"
            @keydown.enter.prevent="cerrarAlta"
            @keydown.space.prevent="cerrarAlta"
          >
            <i class="pi pi-times" aria-hidden="true"></i>
          </span>
        </div>
      </template>

      <div class="jobtype-modal-form jobtype-modal-form--origen">
        <div class="jobtype-modal-field jobtype-modal-field--pais">
          <label for="alta-pais">Pais</label>
          <Select
            id="alta-pais"
            v-model="altaForm.pais"
            :options="paisOptions"
            optionLabel="label"
            optionValue="value"
            class="jobtype-modal-select"
          />
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
          <Select
            id="alta-origen"
            v-model="altaForm.origen"
            :options="origenOptions"
            optionLabel="label"
            optionValue="value"
            class="jobtype-modal-select"
          />
        </div>

        <Button
          label="AGREGAR"
          class="jobtype-modal-button jobtype-modal-button--add"
          :disabled="!canAgregarRelacion"
          @click="agregarRelacionPreview"
        />
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
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  class="fm-column-filter"
                  @input="filterCallback()"
                />
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
        <Button
          label="RELACIONAR"
          class="jobtype-modal-button jobtype-modal-button--relacionar"
          :disabled="altaRows.length === 0 || store.loading"
          @click="relacionar"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showEdicion"
      class="jobtype-modal jobtype-modal--edicion jobtype-modal--edicion-origen"
      appendTo="body"
      :modal="true"
      :draggable="true"
      :resizable="false"
      :closable="false"
      :style="{ width: '940px', maxWidth: 'calc(100vw - 48px)' }"
    >
      <template #header>
        <div class="jobtype-modal-header">
          <span class="jobtype-modal-title">Edición Jobtype-Contrato</span>
          <span
            role="button"
            tabindex="0"
            class="jobtype-modal-close"
            aria-label="Cerrar"
            @click="showEdicion = false"
            @keydown.enter.prevent="showEdicion = false"
            @keydown.space.prevent="showEdicion = false"
          >
            <i class="pi pi-times" aria-hidden="true"></i>
          </span>
        </div>
      </template>

      <div class="jobtype-edit-form jobtype-edit-form--origen">
        <div class="jobtype-modal-field">
          <label for="edit-jobtype">JobType</label>
          <InputText id="edit-jobtype" v-model="editForm.jobtype" class="jobtype-modal-input" disabled />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-contrato-actual">Contrato</label>
          <InputText
            id="edit-contrato-actual"
            v-model="editForm.contratoActual"
            class="jobtype-modal-input"
            disabled
          />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-pais">País</label>
          <InputText id="edit-pais" v-model="editForm.pais" class="jobtype-modal-input" disabled />
        </div>

        <div class="jobtype-modal-field jobtype-edit-empty" aria-hidden="true"></div>

        <div class="jobtype-modal-field">
          <label for="edit-contrato-nuevo">Nuevo Contrato</label>
          <InputText
            id="edit-contrato-nuevo"
            v-model="editForm.contratoNuevo"
            class="jobtype-modal-input jobtype-input--active"
          />
        </div>

        <div class="jobtype-modal-field">
          <label for="edit-origen">Origen</label>
          <Select
            id="edit-origen"
            v-model="editForm.origen"
            :options="editOrigenOptions"
            optionLabel="label"
            optionValue="value"
            class="jobtype-modal-select jobtype-input--active"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="ACTUALIZAR"
          class="jobtype-modal-button jobtype-modal-button--update"
          :disabled="store.loading"
          @click="actualizarRelacion"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showEliminar"
      class="jobtype-delete-confirm"
      appendTo="body"
      :modal="true"
      :draggable="false"
      :resizable="false"
      :closable="false"
      :style="{ width: '560px', maxWidth: 'calc(100vw - 32px)' }"
    >
      <template #header>
        <div class="jobtype-delete-confirm__header">
          <span class="jobtype-delete-confirm__title">Alerta</span>
          <span
            role="button"
            tabindex="0"
            class="jobtype-delete-confirm__close"
            aria-label="Cerrar"
            @click="cancelarEliminar"
            @keydown.enter.prevent="cancelarEliminar"
            @keydown.space.prevent="cancelarEliminar"
          >
            <i class="pi pi-times" aria-hidden="true"></i>
          </span>
        </div>
      </template>

      <div class="jobtype-delete-confirm__body">
        <i class="pi pi-exclamation-triangle jobtype-delete-confirm__icon" aria-hidden="true"></i>
        <span class="jobtype-delete-confirm__message">
          ¿Confirma que desea desactivar la relación seleccionada?
        </span>
      </div>

      <template #footer>
        <div class="jobtype-delete-confirm__footer">
          <button
            type="button"
            class="jobtype-delete-confirm__button jobtype-delete-confirm__button--cancel"
            @click="cancelarEliminar"
          >
            CANCELAR
          </button>
          <button
            type="button"
            class="jobtype-delete-confirm__button jobtype-delete-confirm__button--accept"
            :disabled="store.loading"
            @click="confirmarEliminar"
          >
            ACEPTAR
          </button>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showMessage"
      class="jobtype-delete-confirm jobtype-duplicate-alert"
      appendTo="body"
      :modal="true"
      :draggable="false"
      :resizable="false"
      :closable="false"
      :style="{ width: '560px', maxWidth: 'calc(100vw - 32px)' }"
    >
      <template #header>
        <div class="jobtype-delete-confirm__header">
          <span class="jobtype-delete-confirm__title">Alerta</span>
          <span
            role="button"
            tabindex="0"
            class="jobtype-delete-confirm__close"
            aria-label="Cerrar"
            @click="cerrarMensaje"
            @keydown.enter.prevent="cerrarMensaje"
            @keydown.space.prevent="cerrarMensaje"
          >
            <i class="pi pi-times" aria-hidden="true"></i>
          </span>
        </div>
      </template>

      <div class="jobtype-delete-confirm__body">
        <i class="pi pi-exclamation-triangle jobtype-delete-confirm__icon" aria-hidden="true"></i>
        <span class="jobtype-delete-confirm__message">{{ messageText }}</span>
      </div>

      <template #footer>
        <div class="jobtype-delete-confirm__footer">
          <button
            type="button"
            class="jobtype-delete-confirm__button jobtype-delete-confirm__button--accept"
            @click="cerrarMensaje"
          >
            CERRAR
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { FilterMatchMode } from '@primevue/core/api'
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
const editForm = reactive({
  jobtype: '',
  contratoActual: '',
  pais: '',
  contratoNuevo: '',
  origen: ''
})

const filters = ref(Object.fromEntries(
  columns.value.map((col) => [
    col.field,
    { value: null, matchMode: FilterMatchMode.CONTAINS }
  ])
))

const altaTableFilters = ref(Object.fromEntries(
  altaColumns.value.map((col) => [
    col.field,
    { value: null, matchMode: FilterMatchMode.CONTAINS }
  ])
))

const selectedRow = computed({
  get: () => store.selectedRow,
  set: (value) => store.setSelectedRow(value)
})

const origenOptions = computed(() =>
  altaForm.pais === 'PY' ? origenPyOptions : origenAllOptions
)

const editOrigenOptions = computed(() =>
  editForm.pais === 'PY' ? origenPyOptions : origenAllOptions
)

const canAgregarRelacion = computed(() => Boolean(
  altaForm.jobtype.trim() &&
  altaForm.contrato.trim() &&
  altaForm.pais &&
  altaForm.origen
))

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

const columnStyle = (col) => ({
  width: col.width || '140px',
  minWidth: col.minWidth || col.width || '100px',
  maxWidth: 'none'
})

const altaColumnStyle = (col) => ({
  width: col.width || '140px',
  minWidth: col.minWidth || col.width || '100px',
  maxWidth: col.width || 'none'
})

const rowClass = (data) => ({
  'fm-selected-row': store.selectedRow?.id === data?.id,
  'jobtype-row-selected': store.selectedRow?.id === data?.id
})

const altaRowClass = (data) => ({
  'fm-selected-row': altaSelectedRow.value?.id === data?.id,
  'jobtype-row-selected': altaSelectedRow.value?.id === data?.id
})

const onRowClick = (event) => {
  if (event?.data) store.setSelectedRow(event.data)
}

const onAltaRowClick = (event) => {
  if (event?.data) altaSelectedRow.value = event.data
}

const exportarExcel = () => {
  const parsed = parseDataFromTable(dt)

  exportToExcel({
    rows: parsed.rows,
    fields: parsed.fields,
    columns: columns.value,
    filename: 'jobtype_contrato.xlsx',
    columnTypes: {},
    groupField: null
  })
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
  const duplicado = altaRows.value.some(
    (row) => normalizarJobtype(row.codigoTarea || '') === codigoTarea
  )

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
    const response = await store.createRelations(
      altaRows.value.map(({ id, ...row }) => row)
    )

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
  editForm.origen = normalizarOrigenPorPais(
    editForm.pais,
    store.selectedRow.origen || ''
  )
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
