<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="false"
    :resizable="false"
    class="jobtype-alta-dialog"
    :style="altaDialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="jobtype-alta-header">
        <h2 class="jobtype-alta-header__title">Alta Jobtype - Contrato</h2>
        <button
          type="button"
          class="jobtype-alta-header__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="jobtype-alta-content">
      <div class="jobtype-alta-form">
        <div class="jobtype-alta-field">
          <label for="alta-pais">Pais</label>
          <Select
            id="alta-pais"
            v-model="form.pais"
            :options="paisOptions"
            optionLabel="label"
            optionValue="value"
            overlayClass="jobtype-alta-select-overlay"
            class="jobtype-alta-control"
            style="width: 120px !important; min-width: 120px !important; max-width: 120px !important"
          />
        </div>

        <div class="jobtype-alta-field">
          <label for="alta-jobtype">Jobtype</label>
          <AutoComplete
            id="alta-jobtype"
            v-model="form.jobtype"
            :suggestions="jobtypeSuggestions"
            optionLabel="valor"
            :minLength="4"
            class="jobtype-alta-autocomplete"
            :class="{ 'jobtype-alta-autocomplete--invalid': jobtypeInvalid }"
            :inputClass="jobtypeInputClass"
            :aria-invalid="jobtypeInvalid"
            @complete="buscarJobtypes"
            @item-select="onJobtypeSelect"
            @clear="jobtypeSelected = null"
          />
        </div>

        <div class="jobtype-alta-field">
          <label for="alta-contrato">Contrato</label>
          <AutoComplete
            id="alta-contrato"
            v-model="form.contrato"
            :suggestions="contratoSuggestions"
            optionLabel="valor"
            :minLength="4"
            class="jobtype-alta-autocomplete"
            :class="{ 'jobtype-alta-autocomplete--invalid': contratoInvalid }"
            :inputClass="contratoInputClass"
            :aria-invalid="contratoInvalid"
            @complete="buscarContratos"
            @item-select="onContratoSelect"
            @clear="contratoSelected = null"
          />
        </div>

        <div class="jobtype-alta-field">
          <label for="alta-origen">Origen</label>
          <Select
            id="alta-origen"
            v-model="form.origen"
            :options="origenOptions"
            optionLabel="label"
            optionValue="value"
            overlayClass="jobtype-alta-select-overlay"
            class="jobtype-alta-control"
            style="width: 120px !important; min-width: 120px !important; max-width: 120px !important"
          />
        </div>

        <FmButton
          label="AGREGAR"
          class="jobtype-add-button"
          style="width: 120px !important; min-width: 120px !important; max-width: 120px !important; border-radius: 0 !important"
          @click="agregar"
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

          <Column field="relCodigoTarea" header="CODIGO_TAREA" :style="{ width: '20%' }">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.relCodigoTarea">{{ data.relCodigoTarea }}</span>
            </template>
          </Column>
          <Column field="relTarea" header="TAREA" :style="{ width: '20%' }">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.relTarea">{{ data.relTarea }}</span>
            </template>
          </Column>
          <Column field="origen" header="ORIGEN" :style="{ width: '20%' }">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.origen">{{ data.origen }}</span>
            </template>
          </Column>
          <Column field="relContrato" header="NOMBRE_CONTRATO" :style="{ width: '20%' }">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.relContrato">{{ data.relContrato }}</span>
            </template>
          </Column>
          <Column field="paisLabel" header="PAIS" :style="{ width: '20%' }">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.paisLabel">{{ data.paisLabel }}</span>
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

  <Dialog
    v-model:visible="showConfirmCierre"
    appendTo="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="true"
    :resizable="false"
    class="jobtype-alta-unsaved-dialog"
    :style="confirmDialogStyle"
  >
    <template #header>
      <div class="jobtype-alta-unsaved__header">
        <div class="jobtype-alta-unsaved__header-main">
          <span class="jobtype-alta-unsaved__icon-circle">
            <i class="pi pi-bell jobtype-alta-unsaved__header-icon" aria-hidden="true" />
          </span>
          <span class="jobtype-alta-unsaved__title">Confirmar Accion</span>
        </div>
        <button
          type="button"
          class="jobtype-alta-unsaved__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cancelarCierre"
        >×</button>
      </div>
    </template>

    <div class="jobtype-alta-unsaved__content">
      <span class="jobtype-alta-unsaved__message">
        Hay datos ingresados, confirma que desea cancelar?
      </span>
    </div>

    <template #footer>
      <div class="jobtype-alta-unsaved__actions">
        <button
          type="button"
          class="jobtype-alta-unsaved__button jobtype-alta-unsaved__button--cancel"
          @click="cancelarCierre"
        >CANCELAR</button>
        <button
          type="button"
          class="jobtype-alta-unsaved__button jobtype-alta-unsaved__button--accept"
          @click="confirmarCierre"
        >ACEPTAR</button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import AutoComplete from 'primevue/autocomplete'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import FmButton from '@/components/shared/FmButton.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmGridActions from '@/components/shared/FmGridActions.vue'
import { useJobtypeContratoStore } from './jobtypeContratoStore'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'relacionado'])

const store = useJobtypeContratoStore()

const altaDialogStyle = 'width: calc(100vw - 48px) !important; max-width: 1440px !important; height: min(680px, calc(100dvh - 48px)) !important; max-height: calc(100dvh - 48px) !important; margin: 0 !important;'
const confirmDialogStyle = 'width: min(540px, calc(100vw - 32px)); max-width: 540px;'

const paisOptions = [
  { label: '', value: '' },
  { label: 'ARG/UY', value: '1' },
  { label: 'PY', value: '2' }
]

const form = reactive({
  pais: '1',
  jobtype: '',
  contrato: '',
  origen: 'FAN'
})

const origenOptions = computed(() => {
  if (form.pais === '2') return [{ label: 'FAN', value: 'FAN' }]

  return [
    { label: '', value: '' },
    { label: 'FAN', value: 'FAN' },
    { label: 'MXM', value: 'MXM' }
  ]
})

const jobtypeSuggestions = ref([])
const contratoSuggestions = ref([])
const jobtypeSelected = ref(null)
const contratoSelected = ref(null)
const altaRows = ref([])
const altaSelectedRow = ref(null)
const altaFirst = ref(0)
const altaPageRows = ref(10)
const showConfirmCierre = ref(false)
const validationRequested = ref(false)

const canAgregar = computed(() => Boolean(
  form.pais && jobtypeSelected.value && contratoSelected.value && form.origen
))

const jobtypeInvalid = computed(() => validationRequested.value && !jobtypeSelected.value)
const contratoInvalid = computed(() => validationRequested.value && !contratoSelected.value)

const jobtypeInputClass = computed(() => [
  'jobtype-alta-control',
  { 'jobtype-alta-control--invalid': jobtypeInvalid.value }
])

const contratoInputClass = computed(() => [
  'jobtype-alta-control',
  { 'jobtype-alta-control--invalid': contratoInvalid.value }
])

const hayDatosCargados = computed(() => {
  return Boolean(
    form.jobtype ||
    form.contrato ||
    jobtypeSelected.value ||
    contratoSelected.value ||
    altaRows.value.length
  )
})

watch(() => form.pais, (pais) => {
  form.jobtype = ''
  form.contrato = ''
  form.origen = pais ? 'FAN' : ''
  jobtypeSelected.value = null
  contratoSelected.value = null
})

watch(() => form.jobtype, (value) => {
  if (jobtypeSelected.value && value !== jobtypeSelected.value) jobtypeSelected.value = null
})

watch(() => form.contrato, (value) => {
  if (contratoSelected.value && value !== contratoSelected.value) contratoSelected.value = null
})

watch(() => props.visible, (val) => {
  if (val) resetForm()
})

const resetForm = () => {
  form.pais = '1'
  form.jobtype = ''
  form.contrato = ''
  form.origen = 'FAN'
  jobtypeSelected.value = null
  contratoSelected.value = null
  altaRows.value = []
  altaSelectedRow.value = null
  altaFirst.value = 0
  showConfirmCierre.value = false
  validationRequested.value = false
}

const buscarJobtypes = async (event) => {
  jobtypeSuggestions.value = await store.buscarJobtypes(event.query, form.pais)
}

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onJobtypeSelect = (event) => {
  jobtypeSelected.value = event.value
}

const onContratoSelect = (event) => {
  contratoSelected.value = event.value
}

const agregar = () => {
  validationRequested.value = true

  if (!canAgregar.value) return

  const codigo = jobtypeSelected.value.codigo
  if (altaRows.value.some((row) => row.relCodigoTarea === codigo)) return

  const paisLabel = form.pais === '1' ? 'ARG/UY' : form.pais === '2' ? 'PY' : ''

  altaRows.value = [...altaRows.value, {
    id: `${Date.now()}-${codigo}`,
    relCodigoTarea: codigo,
    relTarea: jobtypeSelected.value.nombre,
    relContratoId: contratoSelected.value.contratoId,
    relContrato: contratoSelected.value.nombre,
    origen: form.origen,
    pais: paisLabel,
    paisLabel
  }]

  form.jobtype = ''
  form.contrato = ''
  form.origen = form.pais ? 'FAN' : ''
  jobtypeSelected.value = null
  contratoSelected.value = null
  validationRequested.value = false
}

const eliminarPreview = () => {
  if (!altaSelectedRow.value) return
  altaRows.value = altaRows.value.filter((row) => row.id !== altaSelectedRow.value.id)
  altaSelectedRow.value = null
}

const onAltaRowClick = ({ data }) => {
  altaSelectedRow.value = data
}

const relacionar = async () => {
  if (!altaRows.value.length) return

  const payload = altaRows.value.map((row) => ({
    relCodigoTarea: row.relCodigoTarea,
    relTarea: row.relTarea,
    relContratoId: row.relContratoId,
    relContrato: row.relContrato,
    pais: row.pais
  }))

  try {
    const errores = await store.crearRelaciones(payload)

    if (errores.length === 0) {
      emit('update:visible', false)
      emit('relacionado')
    } else if (errores.length === 1) {
      // Single error message — could show in an alert
      console.warn(errores[0].mensaje)
      emit('update:visible', false)
      emit('relacionado')
    } else {
      // Multiple errors
      const msgs = errores.map((e) => e.tareaCodigo).join(', ')
      console.warn('Ya existe relación para los jobtypes:', msgs)
      emit('update:visible', false)
      emit('relacionado')
    }
  } catch {
    // error already in store.error
  }
}

const solicitarCierre = () => {
  if (hayDatosCargados.value) {
    showConfirmCierre.value = true
    return
  }
  cerrar()
}

const onVisibleChange = (val) => {
  if (!val) solicitarCierre()
}

const cancelarCierre = () => {
  showConfirmCierre.value = false
}

const confirmarCierre = () => {
  showConfirmCierre.value = false
  cerrar()
}

const cerrar = () => {
  resetForm()
  emit('update:visible', false)
}
</script>

<style scoped>
.jobtype-alta-unsaved__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.jobtype-alta-unsaved__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.jobtype-alta-unsaved__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8fa;
}

.jobtype-alta-unsaved__header-icon {
  color: #11aabd;
  font-size: 23px;
}

.jobtype-alta-unsaved__title {
  color: #252b33;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.jobtype-alta-unsaved__close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c7c7c7;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.jobtype-alta-unsaved__close:hover {
  color: #00a9bd;
}

.jobtype-alta-unsaved__content {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.jobtype-alta-unsaved__message {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.35;
}

.jobtype-alta-unsaved__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.jobtype-alta-unsaved__button {
  appearance: none;
  width: 100px;
  min-width: 100px;
  height: 30px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid #00acc1;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  box-shadow: none;
  outline: none;
  cursor: pointer;
}

.jobtype-alta-unsaved__button--cancel {
  background: #fff;
  color: #0097a7;
}

.jobtype-alta-unsaved__button--accept {
  background: #00acc1;
  color: #fff;
}

:global(.p-dialog.jobtype-alta-unsaved-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.jobtype-alta-unsaved-dialog .p-dialog-header) {
  min-height: 68px;
  padding: 12px 18px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.jobtype-alta-unsaved-dialog .p-dialog-content) {
  padding: 0 18px;
  background: #fff;
}

:global(.jobtype-alta-unsaved-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid #dedede;
  background: #fff;
}

:global(.p-dialog.jobtype-alta-dialog input.jobtype-alta-control--invalid),
:global(.p-dialog.jobtype-alta-dialog input.jobtype-alta-control--invalid:hover),
:global(.p-dialog.jobtype-alta-dialog input.jobtype-alta-control--invalid:focus) {
  border: 1px solid #e57373 !important;
  background-color: #fffafa !important;
  box-shadow: 0 0 0 1px rgba(229, 115, 115, .28) inset !important;
  outline: none !important;
}
</style>
