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
        <span>RELACIONES CMO-ACTIVIDAD</span>
        <span class="jobtype-panel__toggle">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jobtype-results-body">
        <DataTable
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
          <template #empty>
            <div class="fm-grid-empty">No hay resultados</div>
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

          <h2 class="jobtype-alta-header__title">Alta CMO - Actividad</h2>

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
        <div
          class="jobtype-alta-form"
          style="grid-template-columns:minmax(0,1fr) minmax(0,1fr) 170px"
        >
          <div class="jobtype-alta-field fm-field">
            <label for="alta-actividad">Actividad</label>
            <InputText
              id="alta-actividad"
              v-model="altaForm.actividad"
              class="jobtype-alta-control"
            />
          </div>

          <div class="jobtype-alta-field fm-field">
            <label for="alta-cmo">CMO</label>
            <InputText
              id="alta-cmo"
              v-model="altaForm.cmo"
              class="jobtype-alta-control"
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
          :disabled="altaRows.length === 0"
          @click="relacionar"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
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
  : 'width:calc(100vw - 22px) !important;height:calc(100vh - 12px) !important;max-width:none !important;max-height:none !important;margin:0 !important;'
)

const mainColumns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '14.285%' },
  { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '14.285%' },
  { field: 'codigoS4', header: 'CODIGO_S4', width: '14.285%' },
  { field: 'cmo', header: 'CMO', width: '14.285%' },
  { field: 'usuarioModificacion', header: 'USUARIO_MODIFICACION', width: '14.285%' },
  { field: 'fechaModificacion', header: 'FECHA_MODIFICACION', width: '14.285%' },
  { field: 'activo', header: 'ACTIVO', width: '14.29%' }
]

const altaColumns = [
  { field: 'codigoActividad', header: 'CODIGO_ACTIVIDAD', width: '25%' },
  { field: 'descActividad', header: 'DESC_ACTIVIDAD', width: '25%' },
  { field: 'codigoS4', header: 'CODIGO_S4', width: '25%' },
  { field: 'cmo', header: 'CMO', width: '25%' }
]

const buildFilters = (columns) => Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)

const mainFilters = ref(buildFilters(mainColumns))

const altaForm = reactive({
  actividad: '',
  cmo: ''
})

const canAgregar = computed(() => Boolean(
  altaForm.actividad.trim() && altaForm.cmo.trim()
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
  altaForm.actividad = ''
  altaForm.cmo = ''
  altaRows.value = []
  altaSelectedRow.value = null
  altaFirst.value = 0
}

const agregarPreview = () => {
  if (!canAgregar.value) return

  const actividad = altaForm.actividad.trim()
  const codigo = actividad.toUpperCase().replace(/\s+/g, '_')

  if (altaRows.value.some((row) => row.codigoActividad === codigo && row.cmo === altaForm.cmo.trim())) return

  const row = {
    id: `${Date.now()}-${codigo}`,
    codigoActividad: codigo,
    descActividad: actividad,
    codigoS4: codigo,
    cmo: altaForm.cmo.trim()
  }

  altaRows.value = [...altaRows.value, row]
  altaSelectedRow.value = row
  altaForm.actividad = ''
  altaForm.cmo = ''
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
  altaForm.actividad = selectedRow.value.descActividad
  altaForm.cmo = selectedRow.value.cmo
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
  anchor.download = 'cmo-actividad.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>
