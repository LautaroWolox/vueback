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
        <span>RELACIONES JOBTYPE-{{ relationUpper }}</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <DataTable
          :id="`tabla-jobtype-${relationSlug}`"
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
            {{ altaTitle }}
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
        <div class="jobtype-alta-form" :style="isActividad ? activityFormStyle : undefined">
          <template v-if="isActividad">
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
          </template>

          <template v-else>
            <div class="jobtype-alta-field fm-field">
              <label :for="`alta-pais-${relationSlug}`">Pais</label>
              <Select
                :id="`alta-pais-${relationSlug}`"
                v-model="altaForm.pais"
                :options="paisOptions"
                optionLabel="label"
                optionValue="value"
                overlayClass="jobtype-alta-select-overlay"
                :pt="compactSelectPt"
                class="jobtype-alta-control"
                style="width: 100px !important; min-width: 100px !important; max-width: 100px !important"
              />
            </div>

            <div class="jobtype-alta-field fm-field">
              <label :for="`alta-jobtype-${relationSlug}`">Jobtype</label>
              <InputText
                :id="`alta-jobtype-${relationSlug}`"
                v-model="altaForm.jobtype"
                class="jobtype-alta-control"
                aria-required="true"
                :aria-invalid="jobtypeInvalid"
                :style="jobtypeInvalid ? invalidFieldStyle : ''"
              />
            </div>

            <div class="jobtype-alta-field fm-field">
              <label :for="`alta-relacion-${relationSlug}`">{{ relationLabel }}</label>
              <InputText
                :id="`alta-relacion-${relationSlug}`"
                v-model="altaForm.relacion"
                class="jobtype-alta-control"
                aria-required="true"
                :aria-invalid="relationInvalid"
                :style="relationInvalid ? invalidFieldStyle : ''"
              />
            </div>

            <div class="jobtype-alta-field fm-field">
              <label :for="`alta-origen-${relationSlug}`">Origen</label>
              <Select
                :id="`alta-origen-${relationSlug}`"
                v-model="altaForm.origen"
                :options="origenOptions"
                optionLabel="label"
                optionValue="value"
                overlayClass="jobtype-alta-select-overlay"
                :pt="compactSelectPt"
                class="jobtype-alta-control"
                style="width: 100px !important; min-width: 100px !important; max-width: 100px !important"
              />
            </div>
          </template>

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
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { FilterMatchMode } from '@primevue/core/api'

const props = defineProps({
  relation: {
    type: String,
    default: 'contrato',
    validator: (value) => ['contrato', 'cmo'].includes(value)
  }
})

const isActividad = computed(() => props.relation === 'cmo')
const relationSlug = computed(() => props.relation.toLowerCase())
const relationLabel = computed(() => props.relation === 'cmo' ? 'CMO' : 'Contrato')
const relationUpper = computed(() => relationLabel.value.toUpperCase())
const relationColumnHeader = computed(() => props.relation === 'cmo' ? 'CMO' : 'NOMBRE_CONTRATO')
const altaTitle = computed(() => isActividad.value ? 'Alta CMO - Actividad' : `Alta Jobtype - ${relationLabel.value}`)

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const showAlta = ref(false)
const selectedRow = ref(null)
const altaSelectedRow = ref(null)
const mainFirst = ref(0)
const mainPageRows = ref(100)
const altaFirst = ref(0)
const altaPageRows = ref(10)
const mainRows = ref([])
const altaRows = ref([])
const altaValidationAttempted = ref(false)

const altaDialogStyle = 'width: calc(100vw - 48px) !important; max-width: 1440px !important; height: min(680px, calc(100dvh - 48px)) !important; max-height: calc(100dvh - 48px) !important; margin: 0 !important;'
const activityFormStyle = 'grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr) 120px !important; max-width: 860px !important; align-items: end !important;'
const invalidFieldStyle = 'border-color: #d32f2f !important; box-shadow: 0 0 0 1px #d32f2f inset !important;'
const compactSelectPt = {
  label: { style: 'font-size: 10px !important; padding: 0 6px !important;' },
  list: { style: 'padding: 1px 0 !important;' },
  option: { style: 'font-size: 10px !important; min-height: 26px !important; padding: 3px 8px !important; line-height: 1.1 !important;' }
}

const mainColumns = computed(() => [
  { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '12.5%' },
  { field: 'tarea', header: 'TAREA', width: '12.5%' },
  { field: 'origen', header: 'ORIGEN', width: '12.5%' },
  { field: 'relacion', header: relationColumnHeader.value, width: '12.5%' },
  { field: 'usuarioModificacion', header: 'USUARIO_MODIFICACION', width: '12.5%' },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '12.5%' },
  { field: 'activo', header: 'ACTIVO', width: '12.5%' },
  { field: 'pais', header: 'PAIS', width: '12.5%' }
])

const altaColumns = computed(() => {
  if (isActividad.value) {
    return [
      { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '25%' },
      { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '25%' },
      { field: 'codigoS4', header: 'CODIGO_S4', width: '25%' },
      { field: 'cmo', header: 'CMO', width: '25%' }
    ]
  }

  return [
    { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '20%' },
    { field: 'tarea', header: 'TAREA', width: '20%' },
    { field: 'origen', header: 'ORIGEN', width: '20%' },
    { field: 'relacion', header: relationColumnHeader.value, width: '20%' },
    { field: 'pais', header: 'PAIS', width: '20%' }
  ]
})

const buildFilters = (columns) => Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)

const mainFilters = ref(buildFilters(mainColumns.value))

const paisOptions = [
  { label: '', value: '' },
  { label: 'ARG/UY', value: 'ARG/UY' },
  { label: 'PY', value: 'PY' }
]

const altaForm = reactive({
  pais: '',
  jobtype: '',
  relacion: '',
  origen: '',
  actividad: '',
  cmo: ''
})

const jobtypeInvalid = computed(() => altaValidationAttempted.value && !altaForm.jobtype.trim())
const relationInvalid = computed(() => altaValidationAttempted.value && !altaForm.relacion.trim())
const actividadInvalid = computed(() => altaValidationAttempted.value && !altaForm.actividad.trim())
const cmoInvalid = computed(() => altaValidationAttempted.value && !altaForm.cmo.trim())

const origenOptions = computed(() => {
  if (altaForm.pais === 'PY') return [{ label: 'FAN', value: 'FAN' }]
  return [
    { label: '', value: '' },
    { label: 'FAN', value: 'FAN' },
    { label: 'MXM', value: 'MXM' }
  ]
})

watch(() => altaForm.pais, (pais) => {
  if (!pais) {
    altaForm.origen = ''
    return
  }
  if (pais === 'PY') altaForm.origen = 'FAN'
})

const canAgregar = computed(() => {
  if (isActividad.value) {
    return Boolean(altaForm.actividad.trim() && altaForm.cmo.trim())
  }

  return Boolean(
    altaForm.pais &&
    altaForm.jobtype.trim() &&
    altaForm.relacion.trim() &&
    altaForm.origen
  )
})

const buscar = () => {
  resultsExpanded.value = true
  mainFirst.value = 0
}

const abrirAlta = () => {
  resetAlta()
  showAlta.value = true
}

const cerrarAlta = () => {
  showAlta.value = false
}

const onAltaHide = () => {
  resetAlta()
}

const resetAlta = () => {
  altaForm.pais = ''
  altaForm.jobtype = ''
  altaForm.relacion = ''
  altaForm.origen = ''
  altaForm.actividad = ''
  altaForm.cmo = ''
  altaRows.value = []
  altaSelectedRow.value = null
  altaFirst.value = 0
  altaValidationAttempted.value = false
}

const agregarPreview = () => {
  altaValidationAttempted.value = true

  if (isActividad.value) {
    if (actividadInvalid.value || cmoInvalid.value || !canAgregar.value) return

    const codigoActividad = altaForm.actividad.trim().toUpperCase()
    if (altaRows.value.some((row) => row.codigoActividad === codigoActividad && row.cmo === altaForm.cmo.trim())) return

    const row = {
      id: `${Date.now()}-${codigoActividad}`,
      codigoActividad,
      descActividad: altaForm.actividad.trim(),
      codigoS4: '',
      cmo: altaForm.cmo.trim(),
      codigoTarea: codigoActividad,
      tarea: altaForm.actividad.trim(),
      origen: '',
      relacion: altaForm.cmo.trim(),
      pais: ''
    }

    altaRows.value = [...altaRows.value, row]
    altaSelectedRow.value = row
    altaForm.actividad = ''
    altaForm.cmo = ''
    altaValidationAttempted.value = false
    return
  }

  if (jobtypeInvalid.value || relationInvalid.value || !canAgregar.value) return

  const codigo = altaForm.jobtype.trim().toUpperCase()
  if (altaRows.value.some((row) => row.codigoTarea === codigo)) return

  const row = {
    id: `${Date.now()}-${codigo}`,
    codigoTarea: codigo,
    tarea: altaForm.jobtype.trim(),
    origen: altaForm.origen,
    relacion: altaForm.relacion.trim(),
    pais: altaForm.pais
  }

  altaRows.value = [...altaRows.value, row]
  altaSelectedRow.value = row
  altaForm.jobtype = ''
  altaForm.relacion = ''
  altaForm.origen = altaForm.pais === 'PY' ? 'FAN' : ''
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
    fechaModificacion: now,
    activo: 'S'
  }))

  mainRows.value = [...mainRows.value, ...createdRows]
  showAlta.value = false
  resultsExpanded.value = true
  resetAlta()
}

const eliminarSeleccionado = () => {
  if (!selectedRow.value) return
  mainRows.value = mainRows.value.filter((row) => row.id !== selectedRow.value.id)
  selectedRow.value = null
}

const editarSeleccionado = () => {
  if (!selectedRow.value) return
  abrirAlta()

  if (isActividad.value) {
    altaForm.actividad = selectedRow.value.descActividad || selectedRow.value.tarea || ''
    altaForm.cmo = selectedRow.value.cmo || selectedRow.value.relacion || ''
    return
  }

  altaForm.pais = selectedRow.value.pais
  altaForm.jobtype = selectedRow.value.tarea
  altaForm.relacion = selectedRow.value.relacion
  altaForm.origen = selectedRow.value.origen
}

const onMainRowClick = ({ data }) => {
  selectedRow.value = data
}

const onAltaRowClick = ({ data }) => {
  altaSelectedRow.value = data
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const exportarCsv = () => {
  if (!mainRows.value.length) return
  const headers = mainColumns.value.map((column) => column.header)
  const lines = mainRows.value.map((row) =>
    mainColumns.value.map((column) => JSON.stringify(row[column.field] ?? '')).join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `jobtype-${relationSlug.value}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>
