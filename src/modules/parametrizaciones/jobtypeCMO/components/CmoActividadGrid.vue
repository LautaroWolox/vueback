<template>
  <div class="jobtype-screen">
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
        <span>RELACIONES JOBTYPE-CMO</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <DataTable
          id="tabla-jobtype-cmo"
          v-model:filters="mainFilters"
          v-model:selection="selectedRow"
          v-model:first="mainFirst"
          v-model:rows="mainPageRows"
          class="jobtype-main-grid"
          :value="mainRows"
          dataKey="id"
          tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scrollHeight="flex"
          removableSort
          sortMode="multiple"
          filterDisplay="row"
          selectionMode="single"
          paginator
          :rowsPerPageOptions="[100, 250, 500]"
          :resizableColumns="true"
          columnResizeMode="fit"
          showGridlines
          @row-click="onMainRowClick"
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
              :rows-options="[100, 250, 500]"
              :show-rows-select="true"
              :show-counter="true"
              :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
              @first-page="firstPageCallback"
              @prev-page="prevPageCallback"
              @next-page="nextPageCallback"
              @last-page="lastPageCallback"
              @page-change="changePageCallback"
              @rows-change="rowChangeCallback"
            >
              <template #actions>
                <FmGridActions
                  :show-refresh="false"
                  :show-edit="true"
                  :show-add="true"
                  :delete-disabled="!selectedRow"
                  :edit-disabled="!selectedRow"
                  export-title="Descargar"
                  delete-title="Eliminar"
                  edit-title="Editar"
                  add-title="Nueva relación"
                  @export="exportarCsv"
                  @delete="eliminarSeleccionado"
                  @edit="editarSeleccionado"
                  @add="abrirAlta"
                />
              </template>
            </FmGridPaginator>
          </template>

          <Column
            v-for="column in mainColumns"
            :key="column.field"
            :field="column.field"
            :sortField="column.field"
            :filterField="column.field"
            :header="column.header"
            sortable
            filter
            :showFilterMenu="false"
            :style="{ width: column.width }"
            :headerStyle="{ width: column.width }"
            :bodyStyle="{ width: column.width }"
          >
            <template #filter="{ filterModel, filterCallback }">
              <div class="jobtype-filter-cell">
                <span class="jobtype-filter-symbol">~</span>
                <InputText
                  v-model="filterModel.value"
                  class="jobtype-filter-input"
                  type="text"
                  @input="filterCallback()"
                />
                <span class="jobtype-filter-clear" @click="clearFilter(filterModel, filterCallback)">x</span>
              </div>
            </template>

            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="String(data[column.field] ?? '')">
                {{ data[column.field] ?? '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </section>

    <!-- Dialog de Alta CMO-Actividad -->
    <Dialog
      v-model:visible="showAlta"
      appendTo="body"
      modal
      :closable="false"
      :draggable="false"
      :resizable="false"
      :style="altaDialogStyle"
      class="jobtype-alta-dialog"
      @hide="onAltaHide"
    >
      <template #header>
        <div class="jobtype-alta-header" style="grid-template-columns: minmax(0, 1fr) 52px">
          <h2 class="jobtype-alta-header__title" style="margin-left: 20px">
            Alta CMO - Actividad
          </h2>

          <button
            type="button"
            class="jobtype-alta-header__close"
            style="justify-self: center; margin-left: 0"
            title="Cerrar"
            aria-label="Cerrar"
            @click="cerrarAlta"
          >×</button>
        </div>
      </template>

      <div class="jobtype-alta-content">
        <div class="jobtype-alta-form" :style="activityFormStyle">
          <div
            class="jobtype-alta-field fm-field"
            style="width: 100% !important; min-width: 0 !important; max-width: none !important"
          >
            <label for="alta-actividad-cmo">Actividad</label>
            <InputText
              id="alta-actividad-cmo"
              v-model="altaForm.actividad"
              class="jobtype-alta-control"
              aria-required="true"
              :aria-invalid="actividadInvalid"
              :style="actividadInvalid ? invalidFieldStyle : ''"
            />
          </div>

          <div
            class="jobtype-alta-field fm-field"
            style="width: 100% !important; min-width: 0 !important; max-width: none !important"
          >
            <label for="alta-cmo-actividad">CMO</label>
            <InputText
              id="alta-cmo-actividad"
              v-model="altaForm.cmo"
              class="jobtype-alta-control"
              aria-required="true"
              :aria-invalid="cmoInvalid"
              :style="cmoInvalid ? invalidFieldStyle : ''"
            />
          </div>

          <FmButton
            label="AGREGAR"
            class="jobtype-add-button"
            style="width: 120px !important; min-width: 120px !important; max-width: 120px !important; border-radius: 0 !important"
            @click="agregarPreview"
          />
        </div>

        <div class="jobtype-alta-grid-wrap fm-grid-shell">
          <DataTable
            v-model:selection="altaSelectedRow"
            v-model:first="altaFirst"
            v-model:rows="altaPageRows"
            class="jobtype-alta-grid fm-pass-grid"
            :value="altaRows"
            dataKey="id"
            tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
            scrollable
            scrollHeight="flex"
            selectionMode="single"
            paginator
            :rowsPerPageOptions="[10]"
            showGridlines
            @row-click="onAltaRowClick"
          >
            <template #empty>
              <div class="fm-grid-empty jobtype-alta-empty">No hay relaciones agregadas</div>
            </template>

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
                :rows-options="[10]"
                :show-rows-select="false"
                :show-counter="false"
                page-label="Página"
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
                    :show-export="false"
                    :show-delete="true"
                    :show-refresh="false"
                    :delete-disabled="!altaSelectedRow"
                    delete-title="Eliminar"
                    @delete="eliminarPreview"
                  />
                </template>
              </FmGridPaginator>
            </template>

            <Column
              v-for="column in altaColumns"
              :key="column.field"
              :field="column.field"
              :header="column.header"
              :style="{ width: column.width }"
              :headerStyle="{ width: column.width }"
              :bodyStyle="{ width: column.width }"
            >
              <template #body="{ data }">
                <span class="fm-cell-text" :title="String(data[column.field] ?? '')">
                  {{ data[column.field] ?? '' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <FmButton
          label="RELACIONAR"
          class="jobtype-relate-button"
          style="width: 120px !important; min-width: 120px !important; max-width: 120px !important; border-radius: 0 !important"
          :disabled="altaRows.length === 0"
          @click="relacionar"
        />
      </template>
    </Dialog>

    <!-- Dialog de Edición CMO-Actividad -->
    <EditarCmoActividadDialog
      v-model:visible="showEditActividad"
      :actividad="editActividadForm.actividad"
      :cmo-actual="editActividadForm.cmoActual"
      @actualizar="actualizarCmoActividad"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import EditarCmoActividadDialog from '../../cmoActividad/EditarCmoActividadDialog.vue'

/* ── Constantes ── */
const altaDialogStyle  = 'width: calc(100vw - 48px) !important; max-width: 1440px !important; height: min(680px, calc(100dvh - 48px)) !important; max-height: calc(100dvh - 48px) !important; margin: 0 !important;'
const activityFormStyle = 'grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr) 120px !important; max-width: 860px !important; align-items: end !important;'
const invalidFieldStyle = 'border-color: #d32f2f !important; box-shadow: 0 0 0 1px #d32f2f inset !important;'

/* ── Columnas ── */
const mainColumns = [
  { field: 'codigoTarea',          header: 'CODIGO_TAREA',          width: '14.28%' },
  { field: 'tarea',                header: 'TAREA',                 width: '14.28%' },
  { field: 'origen',               header: 'ORIGEN',                width: '14.28%' },
  { field: 'relacion',             header: 'CMO',                   width: '14.28%' },
  { field: 'usuarioModificacion',  header: 'USUARIO_MODIFICACION',  width: '14.28%' },
  { field: 'fechaModificacion',    header: 'FECHA_MODIFICACION',    width: '14.28%' },
  { field: 'activo',               header: 'ACTIVO',                width: '14.28%' }
]

const altaColumns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '25%' },
  { field: 'descActividad',   header: 'DESC_ACTIVIDAD',   width: '25%' },
  { field: 'codigoS4',        header: 'CODIGO_S4',        width: '25%' },
  { field: 'cmo',             header: 'CMO',              width: '25%' }
]

/* ── Estado ── */
const filtersExpanded     = ref(true)
const resultsExpanded     = ref(false)
const showAlta            = ref(false)
const showEditActividad   = ref(false)
const selectedRow         = ref(null)
const altaSelectedRow     = ref(null)
const mainFirst           = ref(0)
const mainPageRows        = ref(100)
const altaFirst           = ref(0)
const altaPageRows        = ref(10)
const mainRows            = ref([])
const altaRows            = ref([])
const altaValidationAttempted = ref(false)

const editActividadForm = reactive({ id: '', actividad: '', cmoActual: '' })
const altaForm = reactive({ actividad: '', cmo: '' })

/* ── Filtros ── */
const buildFilters = (columns) => Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)
const mainFilters = ref(buildFilters(mainColumns))

/* ── Validaciones ── */
const actividadInvalid = computed(() => altaValidationAttempted.value && !altaForm.actividad.trim())
const cmoInvalid       = computed(() => altaValidationAttempted.value && !altaForm.cmo.trim())

const canAgregar = computed(() => Boolean(altaForm.actividad.trim() && altaForm.cmo.trim()))

/* ── Acciones grilla principal ── */
const buscar = () => {
  resultsExpanded.value = true
  mainFirst.value = 0
}

const onMainRowClick = ({ data }) => { selectedRow.value = data }

const eliminarSeleccionado = () => {
  if (!selectedRow.value) return
  mainRows.value = mainRows.value.filter((row) => row.id !== selectedRow.value.id)
  selectedRow.value = null
}

const editarSeleccionado = () => {
  if (!selectedRow.value) return
  editActividadForm.id       = selectedRow.value.id
  editActividadForm.actividad = selectedRow.value.descActividad || selectedRow.value.tarea || ''
  editActividadForm.cmoActual = selectedRow.value.cmo || selectedRow.value.relacion || ''
  showEditActividad.value = true
}

const actualizarCmoActividad = (nuevoCmo) => {
  const normalizedCmo = String(nuevoCmo ?? '').trim()
  if (!editActividadForm.id || !normalizedCmo) return

  const now = new Date().toLocaleString('es-AR')
  let updatedRow = null

  mainRows.value = mainRows.value.map((row) => {
    if (row.id !== editActividadForm.id) return row
    updatedRow = { ...row, cmo: normalizedCmo, relacion: normalizedCmo, usuarioModificacion: 'usuario', fechaModificacion: now }
    return updatedRow
  })

  selectedRow.value = updatedRow
  showEditActividad.value = false
  editActividadForm.id = ''
  editActividadForm.actividad = ''
  editActividadForm.cmoActual = ''
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const exportarCsv = () => {
  if (!mainRows.value.length) return
  const headers = mainColumns.map((c) => c.header)
  const lines   = mainRows.value.map((row) =>
    mainColumns.map((c) => JSON.stringify(row[c.field] ?? '')).join(',')
  )
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'jobtype-cmo.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Acciones dialog de alta ── */
const abrirAlta  = () => { resetAlta(); showAlta.value = true }
const cerrarAlta = () => { showAlta.value = false }
const onAltaHide = () => { resetAlta() }
const onAltaRowClick = ({ data }) => { altaSelectedRow.value = data }

const resetAlta = () => {
  altaForm.actividad = ''
  altaForm.cmo       = ''
  altaRows.value         = []
  altaSelectedRow.value  = null
  altaFirst.value        = 0
  altaValidationAttempted.value = false
}

const agregarPreview = () => {
  altaValidationAttempted.value = true
  if (actividadInvalid.value || cmoInvalid.value || !canAgregar.value) return

  const codigoActividad = altaForm.actividad.trim().toUpperCase()
  if (altaRows.value.some((row) => row.codigoActividad === codigoActividad && row.cmo === altaForm.cmo.trim())) return

  const row = {
    id:            `${Date.now()}-${codigoActividad}`,
    codigoActividad,
    descActividad: altaForm.actividad.trim(),
    codigoS4:      '',
    cmo:           altaForm.cmo.trim(),
    codigoTarea:   codigoActividad,
    tarea:         altaForm.actividad.trim(),
    origen:        '',
    relacion:      altaForm.cmo.trim(),
    pais:          ''
  }

  altaRows.value = [...altaRows.value, row]
  altaSelectedRow.value = row
  altaForm.actividad = ''
  altaForm.cmo       = ''
  altaValidationAttempted.value = false
}

const eliminarPreview = () => {
  if (!altaSelectedRow.value) return
  altaRows.value = altaRows.value.filter((row) => row.id !== altaSelectedRow.value.id)
  altaSelectedRow.value = null
}

const relacionar = () => {
  const now = new Date().toLocaleString('es-AR')
  const createdRows = altaRows.value.map((row) => ({
    ...row,
    usuarioModificacion: 'usuario',
    fechaModificacion:   now,
    activo:              'S'
  }))
  mainRows.value = [...mainRows.value, ...createdRows]
  showAlta.value = false
  resultsExpanded.value = true
  resetAlta()
}
</script>
