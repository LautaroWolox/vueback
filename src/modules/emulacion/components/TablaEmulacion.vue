<template>
  <FmGridShell
    class="emulation-grid-shell"
    :loading="store.toggleLoader"
    loading-title="Cargando operador"
    loading-message="Consultando perfiles disponibles"
  >
    <DataTable
      v-model:filters="filters"
      v-model:selection="operario"
      v-model:first="first"
      v-model:rows="pageRows"
      :value="data"
      dataKey="legajo"
      class="fm-pass-grid emulation-grid"
      tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
      scrollable
      scrollHeight="flex"
      sortMode="multiple"
      removableSort
      selectionMode="single"
      resizableColumns
      columnResizeMode="fit"
      paginator
      :rowsPerPageOptions="[10, 20, 30, 50]"
      filterDisplay="row"
      showGridlines
      @row-select="onRowSelect"
    >
      <template #empty>
        <div class="fm-grid-empty emulation-grid-empty">
          <i class="pi pi-users"></i>
          <span>No hay operadores para mostrar</span>
        </div>
      </template>

      <template
        #paginatorcontainer="{
          first: paginatorFirst,
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
          :first="paginatorFirst"
          :last="last"
          :page="page"
          :page-count="pageCount"
          :rows="rows"
          :total-records="totalRecords"
          :rows-options="[10, 20, 30, 50]"
          :counter-text="totalRecords === 0 ? 'No hay resultados' : ''"
          @first-page="firstPageCallback"
          @prev-page="prevPageCallback"
          @next-page="nextPageCallback"
          @last-page="lastPageCallback"
          @page-change="changePageCallback"
          @rows-change="rowChangeCallback"
        />
      </template>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        sortable
        filter
        :showFilterMenu="false"
        :style="{ width: column.width }"
        :headerStyle="{ width: column.width }"
        :bodyStyle="{ width: column.width }"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div class="fm-filter-cell">
            <span class="fm-filter-prefix">~</span>
            <InputText
              v-model="filterModel.value"
              type="text"
              class="fm-column-filter"
              @input="filterCallback()"
            />
            <button
              type="button"
              class="emulation-filter-clear"
              title="Limpiar filtro"
              aria-label="Limpiar filtro"
              @click="clearFilter(filterModel, filterCallback)"
            >×</button>
          </div>
        </template>

        <template #body="{ data: row }">
          <span class="fm-cell-text" :title="String(resolveCellValue(row, column.field))">
            {{ resolveCellValue(row, column.field) }}
          </span>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="showPopup"
      appendTo="body"
      modal
      :closable="false"
      :draggable="false"
      :resizable="false"
      class="fm-dialog emulation-confirm-dialog"
      :style="{ width: 'min(650px, calc(100vw - 32px))' }"
      @hide="cancelarConfirmacion"
    >
      <template #header>
        <div class="emulation-confirm-header">
          <div class="emulation-confirm-header__icon" aria-hidden="true">
            <i class="pi pi-user-edit"></i>
          </div>
          <div>
            <span class="emulation-confirm-header__eyebrow">EMULAR</span>
            <h2>Está por emular</h2>
          </div>
        </div>
      </template>

      <div class="emulation-confirm-body">
        <p class="emulation-confirm-message">
          Está por iniciar una sesión con los permisos del siguiente operador:
        </p>

        <div class="emulation-operator-card">
          <div class="emulation-operator-avatar" aria-hidden="true">
            <i class="pi pi-user"></i>
          </div>

          <div class="emulation-operator-data">
            <div class="emulation-operator-name">
              {{ selectedFullName }}
            </div>

            <dl class="emulation-operator-details">
              <div>
                <dt>Legajo</dt>
                <dd>{{ selectedLegajo || '—' }}</dd>
              </div>
              <div>
                <dt>Nombre</dt>
                <dd>{{ selectedName || '—' }}</dd>
              </div>
              <div>
                <dt>Apellido</dt>
                <dd>{{ selectedSurname || '—' }}</dd>
              </div>
            </dl>

            <div class="emulation-profiles">
              <span class="emulation-profiles__label">
                {{ selectedProfiles.length === 1 ? 'Perfil' : 'Perfiles' }}
              </span>
              <div class="emulation-profile-list">
                <span
                  v-for="profile in selectedProfiles"
                  :key="profile"
                  class="emulation-profile-chip"
                >
                  <i class="pi pi-shield"></i>
                  {{ profile }}
                </span>
                <span v-if="!selectedProfiles.length" class="emulation-profile-empty">
                  Sin perfil informado
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="emulation-confirm-warning">
          <i class="pi pi-info-circle"></i>
          <span>La sesión actual cambiará al perfil seleccionado.</span>
        </div>
      </div>

      <template #footer>
        <div class="emulation-confirm-actions">
          <FmButton
            label="CANCELAR"
            variant="outline"
            class="emulation-confirm-button"
            @click="cancelarConfirmacion"
          />
          <FmButton
            label="ACEPTAR"
            icon="pi-check"
            class="emulation-confirm-button"
            @click="emular"
          />
        </div>
      </template>
    </Dialog>

    <Toast position="top-center" />
  </FmGridShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import emulacionStore from '../store/emulacionStore.js'
import router from '@/router'

const store = emulacionStore()
const data = ref([])
const showPopup = ref(false)
const operario = ref(null)
const first = ref(0)
const pageRows = ref(10)
const toast = useToast()

const columns = [
  { field: 'legajo', header: 'LEGAJO', width: '18%' },
  { field: 'nombre', header: 'NOMBRE', width: '24%' },
  { field: 'apellido', header: 'APELLIDO', width: '24%' },
  { field: 'perfil', header: 'PERFIL', width: '34%' }
]

const filters = ref({
  legajo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  apellido: { value: null, matchMode: FilterMatchMode.CONTAINS },
  perfil: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const selectedOperator = computed(() => store.selectedOperator || operario.value || {})
const selectedLegajo = computed(() => String(selectedOperator.value.legajo ?? ''))
const selectedName = computed(() => String(
  selectedOperator.value.nombre ??
  selectedOperator.value.name ??
  ''
))
const selectedSurname = computed(() => String(
  selectedOperator.value.apellido ??
  selectedOperator.value.surname ??
  ''
))
const selectedFullName = computed(() => {
  const fullName = `${selectedName.value} ${selectedSurname.value}`.trim()
  return fullName || `Operador ${selectedLegajo.value}`.trim()
})

const selectedProfiles = computed(() => {
  const rawProfiles =
    selectedOperator.value.perfiles ??
    selectedOperator.value.perfil ??
    selectedOperator.value.profile ??
    []

  const values = Array.isArray(rawProfiles)
    ? rawProfiles
    : String(rawProfiles || '').split(/[,;|]/)

  return values
    .map((profile) => {
      if (typeof profile === 'object' && profile !== null) {
        return profile.nombre ?? profile.descripcion ?? profile.label ?? profile.codigo ?? ''
      }
      return String(profile)
    })
    .map((profile) => profile.trim())
    .filter(Boolean)
})

const resolveCellValue = (row, field) => {
  if (field !== 'perfil') return row[field] ?? ''

  const raw = row.perfiles ?? row.perfil ?? row.profile ?? ''
  if (!Array.isArray(raw)) return raw

  return raw
    .map((profile) => typeof profile === 'object'
      ? profile.nombre ?? profile.descripcion ?? profile.label ?? profile.codigo ?? ''
      : profile
    )
    .filter(Boolean)
    .join(', ')
}

const clearFilter = (filterModel, filterCallback) => {
  filterModel.value = null
  filterCallback()
}

const abrirConfirmacion = (operator) => {
  if (!operator) return
  operario.value = operator
  store.$requestConfirmation(operator)
  showPopup.value = true
}

const onRowSelect = ({ data: selectedRow }) => {
  abrirConfirmacion(selectedRow)
}

const cancelarConfirmacion = () => {
  showPopup.value = false
  store.$clearConfirmation()
}

const emular = async () => {
  const operator = selectedOperator.value
  if (!operator?.legajo) return

  store.$setlegajoSelected(operator.legajo)
  showPopup.value = false
  store.toggleLoader = true

  await store.$emulate()

  if (store.error_message) {
    toast.add({
      severity: 'error',
      summary: 'No se pudo emular',
      detail: store.error_message || 'No se pudo emular al operador seleccionado',
      life: 5000
    })
    store.toggleLoader = false
    return
  }

  await router.push({ name: 'main' })
  window.location.reload()
}

watch(() => store.data, (newValue) => {
  data.value = Array.isArray(newValue) ? newValue : []
  first.value = 0
}, { immediate: true, deep: true })

watch(() => store.confirmationVersion, () => {
  if (!store.selectedOperator) return
  operario.value = store.selectedOperator
  showPopup.value = true
})
</script>

<style scoped>
.emulation-grid-shell {
  height: min(520px, calc(100vh - 320px));
  min-height: 330px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 3px solid #00a9bd;
}

.emulation-grid,
.emulation-grid :deep(.p-datatable) {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.emulation-grid :deep(.p-datatable-table-container),
.emulation-grid :deep(.p-datatable-wrapper),
.emulation-grid :deep([data-pc-section="tablecontainer"]) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  background: #fff;
}

.emulation-grid :deep(.p-datatable-table) {
  width: 100%;
  min-width: 100%;
  table-layout: fixed;
}

.emulation-grid-empty {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.emulation-grid-empty i {
  color: #7ba0af;
  font-size: 26px;
}

.emulation-filter-clear {
  width: 16px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.emulation-filter-clear:hover {
  color: #00a9bd;
}

:global(.emulation-confirm-dialog) {
  border-radius: 7px !important;
  overflow: hidden !important;
}

:global(.emulation-confirm-dialog .p-dialog-header) {
  padding: 18px 22px 12px !important;
  border-bottom: 1px solid #d8e3e7 !important;
  background: #fff !important;
}

:global(.emulation-confirm-dialog .p-dialog-content) {
  padding: 0 22px 20px !important;
  background: #fff !important;
}

:global(.emulation-confirm-dialog .p-dialog-footer) {
  padding: 12px 22px 18px !important;
  border-top: 1px solid #d8e3e7 !important;
  background: #fff !important;
}

.emulation-confirm-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.emulation-confirm-header__icon {
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #00a9bd;
}

.emulation-confirm-header__icon i {
  font-size: 23px;
}

.emulation-confirm-header__eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #00a9bd;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
}

.emulation-confirm-header h2 {
  margin: 0;
  color: #203947;
  font-size: 20px;
  font-weight: 600;
}

.emulation-confirm-body {
  padding-top: 18px;
}

.emulation-confirm-message {
  margin: 0 0 16px;
  color: #526c79;
  font-size: 13px;
}

.emulation-operator-card {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  border: 1px solid #cfe0e6;
  border-left: 4px solid #00a9bd;
  border-radius: 4px;
  background: #f9fcfd;
}

.emulation-operator-avatar {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dff7fa;
  color: #007f90;
}

.emulation-operator-avatar i {
  font-size: 27px;
}

.emulation-operator-name {
  margin-bottom: 12px;
  color: #203947;
  font-size: 17px;
  font-weight: 700;
}

.emulation-operator-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.emulation-operator-details div {
  min-width: 0;
}

.emulation-operator-details dt,
.emulation-profiles__label {
  margin-bottom: 3px;
  color: #718894;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.emulation-operator-details dd {
  margin: 0;
  color: #203947;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emulation-profiles {
  margin-top: 14px;
}

.emulation-profile-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.emulation-profile-chip {
  min-height: 25px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border: 1px solid #a9dce3;
  border-radius: 13px;
  background: #eafcff;
  color: #176171;
  font-size: 11px;
  font-weight: 600;
  box-sizing: border-box;
}

.emulation-profile-chip i {
  color: #00a9bd;
  font-size: 10px;
}

.emulation-profile-empty {
  color: #718894;
  font-size: 11px;
  font-style: italic;
}

.emulation-confirm-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 9px 11px;
  border-radius: 3px;
  background: #fff8e5;
  color: #745c16;
  font-size: 11px;
}

.emulation-confirm-warning i {
  font-size: 14px;
}

.emulation-confirm-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.emulation-confirm-button,
.emulation-confirm-button :deep(.p-button) {
  min-width: 110px;
  height: 32px;
  min-height: 32px;
  border-radius: 3px;
}

@media (max-width: 700px) {
  .emulation-grid-shell {
    height: 430px;
  }

  .emulation-operator-card {
    grid-template-columns: 1fr;
  }

  .emulation-operator-avatar {
    width: 50px;
    height: 50px;
  }

  .emulation-operator-details {
    grid-template-columns: 1fr;
  }
}
</style>
