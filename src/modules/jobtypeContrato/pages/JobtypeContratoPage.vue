<template>
  <div class="jc-screen">
    <!-- Loader de pantalla completa -->
    <FmTypingLoader
      v-if="store.loading"
      overlay
      title="Cargando relaciones"
      message="Consultando Jobtype-Contrato"
    />

    <!-- ── Panel: Filtros ── -->
    <section
      class="jc-panel jc-panel--filters"
      :class="{ 'is-expanded': filtersExpanded }"
    >
      <button
        type="button"
        class="jc-panel__header"
        :aria-expanded="filtersExpanded"
        @click="filtersExpanded = !filtersExpanded"
      >
        <span>FILTROS DE BÚSQUEDA</span>
        <span class="jc-panel__toggle" aria-hidden="true">{{ filtersExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="filtersExpanded" class="jc-search-body">
        <FmButton
          label="BUSCAR"
          class="jc-search-button"
          :loading="store.loading"
          @click="buscar"
        />
      </div>
    </section>

    <!-- ── Panel: Resultados ── -->
    <section
      class="jc-panel jc-panel--results"
      :class="{ 'is-expanded': resultsExpanded }"
    >
      <button
        type="button"
        class="jc-panel__header"
        :aria-expanded="resultsExpanded"
        @click="resultsExpanded = !resultsExpanded"
      >
        <span>RELACIONES JOBTYPE-CONTRATO</span>
        <span class="jc-panel__toggle" aria-hidden="true">{{ resultsExpanded ? '−' : '+' }}</span>
      </button>

      <div v-show="resultsExpanded" class="jc-results-body">
        <DataTable
          id="tabla-jobtype-contrato"
          v-model:filters="mainFilters"
          v-model:selection="selectedRow"
          v-model:first="mainFirst"
          v-model:rows="mainPageRows"
          class="jc-main-grid fm-pass-grid"
          :value="store.relaciones"
          data-key="tareaContratoId"
          table-style="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scroll-height="flex"
          removable-sort
          sort-mode="multiple"
          filter-display="row"
          selection-mode="single"
          paginator
          :rows-per-page-options="ROWS_OPTIONS"
          :resizable-columns="true"
          column-resize-mode="fit"
          show-gridlines
          @row-click="({ data }) => selectedRow = data"
        >
          <template #empty>
            <FmEmptyState text="No hay resultados" />
          </template>

          <template
            #paginatorcontainer="{
              first, last, page, pageCount, rows, totalRecords,
              firstPageCallback, lastPageCallback, prevPageCallback,
              nextPageCallback, rowChangeCallback, changePageCallback
            }"
          >
            <FmGridPaginator
              :first="first" :last="last" :page="page"
              :page-count="pageCount" :rows="rows"
              :total-records="totalRecords"
              :rows-options="ROWS_OPTIONS"
              :show-rows-select="true"
              :show-counter="true"
              :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
              @first-page="firstPageCallback" @prev-page="prevPageCallback"
              @next-page="nextPageCallback"   @last-page="lastPageCallback"
              @page-change="changePageCallback" @rows-change="rowChangeCallback"
            >
              <template #actions>
                <FmGridActions
                  :show-refresh="false"
                  :show-edit="true"
                  :show-add="true"
                  :delete-disabled="!selectedRow"
                  :edit-disabled="!selectedRow"
                  export-title="Descargar"
                  delete-title="Desactivar"
                  edit-title="Editar"
                  add-title="Nueva relación"
                  @export="exportarExcel"
                  @delete="showDesactivar = true"
                  @edit="editarSeleccionado"
                  @add="showAlta = true"
                />
              </template>
            </FmGridPaginator>
          </template>

          <Column
            v-for="col in visibleColumns"
            :key="col.field"
            :field="col.field"
            :sort-field="col.field"
            :filter-field="col.field"
            :header="col.header"
            :sortable="col.sort"
            :filter="col.filter"
            :show-filter-menu="false"
            :style="{ width: col.width }"
            :header-style="{ width: col.width }"
            :body-style="{ width: col.width }"
          >
            <template v-if="col.filter" #filter="{ filterModel, filterCallback }">
              <FmColumnFilter
                v-model="filterModel.value"
                @filter="filterCallback()"
                @clear="filterCallback()"
              />
            </template>

            <template #body="{ data }">
              <span class="fm-cell-text" :title="String(data[col.field] ?? '')">
                {{ data[col.field] ?? '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </section>

    <!-- ── Dialogs ── -->
    <AltaJobtypeContratoDialog
      v-model:visible="showAlta"
      @relacionado="onRelacionado"
    />

    <EditarJobtypeContratoDialog
      v-model:visible="showEditar"
      :tarea-contrato-id="editForm.tareaContratoId"
      :jobtype="editForm.jobtype"
      :contrato-actual="editForm.contratoActual"
      :pais="editForm.pais"
      @actualizado="onActualizado"
    />

    <ConfirmarDesactivacionDialog
      v-model:visible="showDesactivar"
      @confirmar="onDesactivacionConfirmada"
    />

    <!-- Error genérico -->
    <FmAlertDialog
      v-model:visible="showError"
      title="Error"
      :message="store.error ?? ''"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import AltaJobtypeContratoDialog    from '../dialogs/AltaJobtypeContratoDialog.vue'
import EditarJobtypeContratoDialog  from '../dialogs/EditarJobtypeContratoDialog.vue'
import ConfirmarDesactivacionDialog from '../dialogs/ConfirmarDesactivacionDialog.vue'
import { useJobtypeContratoStore }  from '../store/jobtypeContratoStore'
import { JOBTYPE_CONTRATO_COLUMNS, ROWS_OPTIONS } from '../config/columns'

const store = useJobtypeContratoStore()

/* ── Estado de UI ── */
const filtersExpanded = ref(true)
const resultsExpanded = ref(false)
const selectedRow     = ref(null)
const mainFirst       = ref(0)
const mainPageRows    = ref(100)
const showAlta        = ref(false)
const showEditar      = ref(false)
const showDesactivar  = ref(false)
const showError       = ref(false)

const editForm = ref({
  tareaContratoId: 0,
  jobtype:         '',
  contratoActual:  '',
  pais:            ''
})

/* ── Columnas ── */
const visibleColumns = computed(() =>
  JOBTYPE_CONTRATO_COLUMNS.filter((col) => !col.hidden)
)

const mainFilters = ref(
  Object.fromEntries(
    visibleColumns.value
      .filter((col) => col.filter)
      .map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
  )
)

/* ── Acciones ── */
const buscar = async () => {
  resultsExpanded.value = true
  mainFirst.value       = 0
  selectedRow.value     = null
  try {
    await store.fetchRelaciones()
  } catch {
    showError.value = true
  }
}

const editarSeleccionado = () => {
  if (!selectedRow.value) return
  editForm.value = {
    tareaContratoId: selectedRow.value.tareaContratoId,
    jobtype:         selectedRow.value.tareaNombre,
    contratoActual:  selectedRow.value.contratoNombre,
    pais:            selectedRow.value.pais
  }
  showEditar.value = true
}

const onDesactivacionConfirmada = async () => {
  if (!selectedRow.value) return
  try {
    await store.desactivarRelacion(selectedRow.value.tareaContratoId)
    selectedRow.value = null
    await store.fetchRelaciones()
  } catch {
    showError.value = true
  }
}

const onRelacionado = async () => {
  selectedRow.value = null
  await store.fetchRelaciones()
}

const onActualizado = async () => {
  selectedRow.value = null
  await store.fetchRelaciones()
}

const exportarExcel = () => {
  if (!store.relaciones.length) return
  const exportCols = JOBTYPE_CONTRATO_COLUMNS.filter((c) => c.exportable)
  const headers    = exportCols.map((c) => c.header)
  const lines      = store.relaciones.map((row) =>
    exportCols.map((c) => JSON.stringify(row[c.field] ?? '')).join(',')
  )
  const csv  = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'Jobtype_Contrato.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped src="../styles/jobtype-contrato.css" />
