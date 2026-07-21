<template>
  <FmGridShell
    class="emulation-grid-shell"
    :loading="store.toggleLoader"
    loading-title="Cargando perfil"
    loading-message="Procesando la emulación"
  >
    <DataTable
      v-model:filters="filters"
      v-model:selection="operario"
      :value="data"
      dataKey="legajo"
      class="fm-pass-grid emulation-grid"
      tableStyle="table-layout: fixed; width: max-content; min-width: 100%"
      scrollable
      scrollHeight="390px"
      sortMode="multiple"
      removableSort
      selectionMode="single"
      resizableColumns
      columnResizeMode="expand"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 30, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords}"
      filterDisplay="row"
      showGridlines
      @row-select="onRowSelect"
    >
      <template #empty>
        <div class="fm-grid-empty">No hay resultados</div>
      </template>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        sortable
        :style="column.style"
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
            <span class="fm-filter-more">...</span>
          </div>
        </template>
        <template #body="{ data: row }">
          <span class="fm-cell-text" :title="String(row[column.field] ?? '')">
            {{ row[column.field] ?? '' }}
          </span>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="showPopup"
      modal
      header="Confirmar emulación"
      class="fm-dialog emulation-dialog"
      :style="{ width: '38rem' }"
    >
      <div class="fm-dialog-body emulation-dialog-body">
        <div class="emulation-dialog-icon">
          <i class="pi pi-user-edit"></i>
        </div>
        <div>
          <h3>Emular operador</h3>
          <p>Se iniciará una sesión con el legajo <strong>{{ selectedLegajo }}</strong>.</p>
        </div>
      </div>

      <template #footer>
        <FmButton label="CANCELAR" variant="outline" @click="showPopup = false" />
        <FmButton label="ACEPTAR" icon="pi-check" @click="emular" />
      </template>
    </Dialog>

    <Toast position="top-center" />
  </FmGridShell>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import emulacionStore from '../store/emulacionStore.js'
import router from '@/router'

const store = emulacionStore()
const data = ref([])
const showPopup = ref(false)
const selectedLegajo = ref('')
const operario = ref(null)
const toast = useToast()

const columns = [
  { field: 'legajo', header: 'LEGAJO', style: 'width: 155px; min-width: 120px' },
  { field: 'nombre', header: 'NOMBRE', style: 'width: 220px; min-width: 140px' },
  { field: 'apellido', header: 'APELLIDO', style: 'width: 220px; min-width: 140px' },
  { field: 'perfil', header: 'PERFIL', style: 'width: 220px; min-width: 140px' }
]

const filters = ref({
  legajo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  apellido: { value: null, matchMode: FilterMatchMode.CONTAINS },
  perfil: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const onRowSelect = (event) => {
  selectedLegajo.value = event.data.legajo
  store.$setlegajoSelected(event.data.legajo)
  showPopup.value = true
}

const emular = async () => {
  showPopup.value = false
  store.toggleLoader = true

  await store.$emulate()

  if (store.error_message !== '') {
    toast.add({
      severity: 'error',
      summary: 'No se pudo emular',
      detail: 'No se pudo emular al operario seleccionado'
    })
    store.toggleLoader = false
    return
  }

  await router.push({ name: 'main' })
  window.location.reload()
}

watch(() => store.data, (newValue) => {
  data.value = Array.isArray(newValue) ? newValue : []
}, { immediate: true })
</script>

<style scoped>
.emulation-grid-shell {
  min-height: 250px;
}

.emulation-grid :deep(.p-datatable-table-container) {
  min-height: 190px;
  background: #eafcff;
}

.emulation-dialog-body {
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.emulation-dialog-icon {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #008fa1;
}

.emulation-dialog-icon i {
  font-size: 24px;
}

.emulation-dialog-body h3 {
  margin: 0 0 6px;
  color: #203947;
  font-size: 16px;
}

.emulation-dialog-body p {
  margin: 0;
  color: #607887;
}
</style>
