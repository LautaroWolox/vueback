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
        <span>RELACIONES JOBTYPE-CONTRATO</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <DataTable
          id="tabla-jobtype-contrato"
          ref="mainTable"
          v-model:filters="mainFilters"
          v-model:selection="selectedRow"
          v-model:first="mainFirst"
          v-model:rows="mainPageRows"
          class="jobtype-main-grid fm-pass-grid"
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
          :rowsPerPageOptions="[10, 50, 100, 500]"
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
              :rows-options="[10, 50, 100, 500]"
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
      class="jobtype-alta-dialog"
      :class="{ 'jobtype-alta-dialog--maximized': altaMaximized }"
      :style="altaDialogStyle"
      @hide="onAltaHide"
    >
      <template #header>
        <div class="jobtype-alta-header">
          <button
            type="button"
            class="jobtype-alta-header__close"
            title="Cerrar"
            aria-label="Cerrar"
            @click="cerrarAlta"
          >×</button>

          <h2 class="jobtype-alta-header__title">Alta Jobtype - Contrato</h2>

          <button
            type="button"
            class="jobtype-alta-header__maximize"
            :title="altaMaximized ? 'Restaurar' : 'Maximizar'"
            :aria-label="altaMaximized ? 'Restaurar' : 'Maximizar'"
            @click="altaMaximized = !altaMaximized"
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
      </template>

      <div class="jobtype-alta-content">
        <div class="jobtype-alta-form">
          <div class="jobtype-alta-field jobtype-alta-field--pais">
            <label for="alta-pais">Pais</label>
            <Select
              id="alta-pais"
              v-model="altaForm.pais"
              :options="paisOptions"
              optionLabel="label"
              optionValue="value"
              class="jobtype-alta-control"
            />
          </div>

          <div class="jobtype-alta-field jobtype-alta-field--jobtype">
            <label for="alta-jobtype">Jobtype</label>
            <InputText
              id="alta-jobtype"
              v-model="altaForm.jobtype"
              class="jobtype-alta-control"
              :disabled="!altaForm.pais"
            />
          </div>

          <div class="jobtype-alta-field jobtype-alta-field--contrato">
            <label for="alta-contrato">Contrato</label>
            <InputText
              id="alta-contrato"
              v-model="altaForm.contrato"
              class="jobtype-alta-control"
              :disabled="!altaForm.pais"
            />
          </div>

          <div class="jobtype-alta-field jobtype-alta-field--origen">
            <label for="alta-origen">Origen</label>
            <Select
              id="alta-origen"
              v-model="altaForm.origen"
              :options="origenOptions"
              optionLabel="label"
              optionValue="value"
              class="jobtype-alta-control"
              :disabled="!altaForm.pais"
            />
          </div>

          <FmButton
            label="AGREGAR"
            class="jobtype-add-button"
            :disabled="!canAgregar"
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

            <template #empty>
              <div class="fm-grid-empty jobtype-alta-empty"></div>
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
                <span class="jobtype-cell-text" :title="String(data[column.field] ?? '')">
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

const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const showAlta = ref(false)
const altaMaximized = ref(false)
const selectedRow = ref(null)
const altaSelectedRow = ref(null)
const mainFirst = ref(0)
const mainPageRows = ref(100)
const altaFirst = ref(0)
const altaPageRows = ref(10)
const mainRows = ref([])
const altaRows = ref([])

const altaDialogStyle = computed(() => altaMaximized.value
  ? 'width:100vw !important;height:100vh !important;max-width:100vw !important;max-height:100vh !important;margin:0 !important;border-radius:0 !important;'
  : 'width:min(1180px, calc(100vw - 48px)) !important;height:min(720px, calc(100vh - 48px)) !important;max-width:calc(100vw - 48px) !important;max-height:calc(100vh - 48px) !important;margin:0 !important;'
)

const mainColumns = [
  { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '12.5%' },
  { field: 'tarea', header: 'TAREA', width: '12.5%' },
  { field: 'origen', header: 'ORIGEN', width: '12.5%' },
  { field: 'nombreContrato', header: 'NOMBRE_CONTRATO', width: '12.5%' },
  { field: 'usuarioModificacion', header: 'USUARIO_MODIFICACION', width: '12.5%' },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '12.5%' },
  { field: 'activo', header: 'ACTIVO', width: '12.5%' },
  { field: 'pais', header: 'PAIS', width: '12.5%' }
]

const altaColumns = [
  { field: 'codigoTarea', header: 'CODIGO_TAREA', width: '20%' },
  { field: 'tarea', header: 'TAREA', width: '20%' },
  { field: 'origen', header: 'ORIGEN', width: '20%' },
  { field: 'nombreContrato', header: 'NOMBRE_CONTRATO', width: '20%' },
  { field: 'pais', header: 'PAIS', width: '20%' }
]

const buildFilters = (columns) => Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)

const mainFilters = ref(buildFilters(mainColumns))

const paisOptions = [
  { label: '', value: '' },
  { label: 'ARG/UY', value: 'ARG/UY' },
  { label: 'PY', value: 'PY' }
]

const origenOptions = computed(() => {
  if (altaForm.pais === 'PY') return [{ label: 'FAN', value: 'FAN' }]
  return [
    { label: '', value: '' },
    { label: 'FAN', value: 'FAN' },
    { label: 'MXM', value: 'MXM' }
  ]
})

const altaForm = reactive({
  pais: '',
  jobtype: '',
  contrato: '',
  origen: ''
})

watch(() => altaForm.pais, (pais) => {
  if (!pais) {
    altaForm.origen = ''
    return
  }
  if (pais === 'PY') altaForm.origen = 'FAN'
})

const canAgregar = computed(() => Boolean(
  altaForm.pais &&
  altaForm.jobtype.trim() &&
  altaForm.contrato.trim() &&
  altaForm.origen
))

const buscar = () => {
  resultsExpanded.value = true
  mainFirst.value = 0
}

const abrirAlta = () => {
  resetAlta()
  altaMaximized.value = false
  showAlta.value = true
}

const cerrarAlta = () => {
  showAlta.value = false
}

const onAltaHide = () => {
  altaMaximized.value = false
  resetAlta()
}

const resetAlta = () => {
  altaForm.pais = ''
  altaForm.jobtype = ''
  altaForm.contrato = ''
  altaForm.origen = ''
  altaRows.value = []
  altaSelectedRow.value = null
  altaFirst.value = 0
}

const agregarPreview = () => {
  if (!canAgregar.value) return

  const codigo = altaForm.jobtype.trim().toUpperCase()
  if (altaRows.value.some((row) => row.codigoTarea === codigo)) return

  const row = {
    id: `${Date.now()}-${codigo}`,
    codigoTarea: codigo,
    tarea: altaForm.jobtype.trim(),
    origen: altaForm.origen,
    nombreContrato: altaForm.contrato.trim(),
    pais: altaForm.pais
  }

  altaRows.value = [...altaRows.value, row]
  altaSelectedRow.value = row
  altaForm.jobtype = ''
  altaForm.contrato = ''
  altaForm.origen = altaForm.pais === 'PY' ? 'FAN' : ''
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
  altaForm.pais = selectedRow.value.pais
  altaForm.jobtype = selectedRow.value.tarea
  altaForm.contrato = selectedRow.value.nombreContrato
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
  const headers = mainColumns.map((column) => column.header)
  const lines = mainRows.value.map((row) =>
    mainColumns.map((column) => JSON.stringify(row[column.field] ?? '')).join(',')
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'jobtype-contrato.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>
