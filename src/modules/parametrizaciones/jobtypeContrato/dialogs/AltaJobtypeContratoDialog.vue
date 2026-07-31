<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="false"
    :resizable="false"
    class="joco-alta-dialog"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="joco-alta-header">
        <h2 class="joco-alta-header__title">Alta Jobtype - Contrato</h2>
        <button
          type="button"
          class="joco-alta-header__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="joco-alta-body">
      <div class="joco-alta-form">
        <div class="joco-alta-field">
          <label for="joco-alta-pais">País</label>
          <Select
            id="joco-alta-pais"
            v-model="form.pais"
            :options="paisOptions"
            optionLabel="label"
            optionValue="value"
            overlayClass="joco-alta-select-overlay"
            class="joco-alta-control"
          />
        </div>

        <div class="joco-alta-field">
          <label for="joco-alta-jobtype">Jobtype</label>
          <AutoComplete
            id="joco-alta-jobtype"
            v-model="form.jobtype"
            :suggestions="jobtypeSuggestions"
            optionLabel="valor"
            :minLength="4"
            :disabled="!form.pais"
            class="joco-alta-control joco-alta-autocomplete"
            inputClass="joco-alta-input"
            @complete="buscarJobtypes"
            @item-select="onJobtypeSelect"
            @clear="jobtypeSelected = null"
          />
        </div>

        <div class="joco-alta-field">
          <label for="joco-alta-contrato">Contrato</label>
          <AutoComplete
            id="joco-alta-contrato"
            v-model="form.contrato"
            :suggestions="contratoSuggestions"
            optionLabel="valor"
            :minLength="4"
            :disabled="!form.pais"
            class="joco-alta-control joco-alta-autocomplete"
            inputClass="joco-alta-input"
            @complete="buscarContratos"
            @item-select="onContratoSelect"
            @clear="contratoSelected = null"
          />
        </div>

        <div class="joco-alta-field">
          <label for="joco-alta-origen">Origen</label>
          <Select
            id="joco-alta-origen"
            v-model="form.origen"
            :options="origenOptions"
            optionLabel="label"
            optionValue="value"
            :disabled="!form.pais"
            overlayClass="joco-alta-select-overlay"
            class="joco-alta-control"
          />
        </div>

        <div class="joco-alta-field joco-alta-field--button">
          <FmButton
            label="AGREGAR"
            class="joco-alta-add-button"
            @click="agregar"
          />
        </div>
      </div>

      <div class="joco-alta-grid-wrap">
        <DataTable
          v-model:selection="altaSelectedRow"
          v-model:first="altaFirst"
          v-model:rows="altaPageRows"
          class="joco-alta-grid fm-pass-grid"
          :value="altaRows"
          dataKey="id"
          tableStyle="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scrollHeight="flex"
          selectionMode="single"
          paginator
          :rowsPerPageOptions="[10]"
          showGridlines
          @row-click="onRowClick"
        >
          <template #empty>
            <div class="joco-alta-empty">No hay relaciones agregadas</div>
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

          <Column field="relCodigoTarea" header="CODIGO_TAREA" style="width: 20%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.relCodigoTarea">{{ data.relCodigoTarea }}</span>
            </template>
          </Column>
          <Column field="relTarea" header="TAREA" style="width: 20%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.relTarea">{{ data.relTarea }}</span>
            </template>
          </Column>
          <Column field="origen" header="ORIGEN" style="width: 20%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.origen">{{ data.origen }}</span>
            </template>
          </Column>
          <Column field="relContrato" header="NOMBRE_CONTRATO" style="width: 20%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.relContrato">{{ data.relContrato }}</span>
            </template>
          </Column>
          <Column field="paisLabel" header="PAIS" style="width: 20%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.paisLabel">{{ data.paisLabel }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <template #footer>
      <div class="joco-alta-footer">
        <FmButton
          label="RELACIONAR"
          class="joco-alta-relate-button"
          :disabled="altaRows.length === 0"
          @click="relacionar"
        />
      </div>
    </template>
  </Dialog>

  <FmConfirmDialog
    v-model:visible="showConfirmCierre"
    title="Confirmar acción"
    message="Hay datos ingresados. ¿Confirma que desea cancelar?"
    @accept="cerrar"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { PAIS_OPTIONS } from '../config/columns'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'relacionado'])
const store = useJobtypeContratoStore()

const paisOptions = PAIS_OPTIONS
const form = reactive({ pais: '', jobtype: '', contrato: '', origen: '' })
const jobtypeSuggestions = ref([])
const contratoSuggestions = ref([])
const jobtypeSelected = ref(null)
const contratoSelected = ref(null)
const altaRows = ref([])
const altaSelectedRow = ref(null)
const altaFirst = ref(0)
const altaPageRows = ref(10)
const showConfirmCierre = ref(false)

const origenOptions = computed(() => {
  if (form.pais === '2') return [{ label: 'FAN', value: 'FAN' }]
  return [
    { label: '', value: '' },
    { label: 'FAN', value: 'FAN' },
    { label: 'MXM', value: 'MXM' }
  ]
})

const canAgregar = computed(() => Boolean(
  form.pais && form.origen && jobtypeSelected.value && contratoSelected.value
))

const hayDatos = computed(() => Boolean(
  form.pais || form.jobtype || form.contrato || form.origen ||
  jobtypeSelected.value || contratoSelected.value || altaRows.value.length
))

watch(() => form.pais, (pais) => {
  form.jobtype = ''
  form.contrato = ''
  jobtypeSelected.value = null
  contratoSelected.value = null
  form.origen = pais === '2' ? 'FAN' : ''
})

watch(() => props.visible, (visible) => {
  if (visible) resetForm()
})

const resetForm = () => {
  form.pais = ''
  form.jobtype = ''
  form.contrato = ''
  form.origen = ''
  jobtypeSelected.value = null
  contratoSelected.value = null
  altaRows.value = []
  altaSelectedRow.value = null
  altaFirst.value = 0
  showConfirmCierre.value = false
}

const buscarJobtypes = async (event) => {
  jobtypeSuggestions.value = await store.buscarJobtypes(event.query, form.pais)
}

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onJobtypeSelect = (event) => { jobtypeSelected.value = event.value }
const onContratoSelect = (event) => { contratoSelected.value = event.value }
const onRowClick = ({ data }) => { altaSelectedRow.value = data }

const agregar = () => {
  if (!canAgregar.value) return

  const codigo = jobtypeSelected.value.codigo
  if (altaRows.value.some((row) => row.relCodigoTarea === codigo)) return

  const paisLabel = paisOptions.find((option) => option.value === form.pais)?.label ?? ''
  const nuevaFila = {
    id: `${Date.now()}-${codigo}`,
    relCodigoTarea: codigo,
    relTarea: jobtypeSelected.value.nombre,
    relContratoId: contratoSelected.value.contratoId,
    relContrato: contratoSelected.value.nombre,
    origen: form.origen,
    pais: paisLabel,
    paisLabel
  }

  altaRows.value = [...altaRows.value, nuevaFila]
  altaSelectedRow.value = nuevaFila
  form.jobtype = ''
  form.contrato = ''
  jobtypeSelected.value = null
  contratoSelected.value = null
  form.origen = form.pais === '2' ? 'FAN' : ''
}

const eliminarPreview = () => {
  if (!altaSelectedRow.value) return
  altaRows.value = altaRows.value.filter((row) => row.id !== altaSelectedRow.value.id)
  altaSelectedRow.value = null
}

const relacionar = async () => {
  if (!altaRows.value.length) return

  try {
    await store.crearRelaciones(
      altaRows.value.map(({ relCodigoTarea, relTarea, relContratoId, relContrato, origen, pais }) => ({
        relCodigoTarea,
        relTarea,
        relContratoId,
        relContrato,
        origen,
        pais
      }))
    )
    cerrar()
    emit('relacionado')
  } catch {
    // El mensaje queda disponible en store.error.
  }
}

const solicitarCierre = () => {
  if (hayDatos.value) {
    showConfirmCierre.value = true
    return
  }
  cerrar()
}

const onVisibleChange = (visible) => {
  if (!visible) solicitarCierre()
}

const cerrar = () => {
  resetForm()
  emit('update:visible', false)
}
</script>

<style>
.p-dialog.joco-alta-dialog {
  width: calc(100dvw - 48px) !important;
  max-width: 1440px !important;
  height: min(760px, calc(100dvh - 48px)) !important;
  max-height: calc(100dvh - 48px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden;
  border: 1px solid #cdd8de;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 22px 58px rgba(18, 43, 53, .28);
}

.joco-alta-dialog .p-dialog-header {
  flex: 0 0 80px;
  padding: 0 !important;
  border-bottom: 1px solid #d5dfe4;
  background: #fff;
}

.joco-alta-dialog .p-dialog-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff;
}

.joco-alta-dialog .p-dialog-footer {
  flex: 0 0 80px;
  padding: 0 !important;
  border-top: 1px solid #d5dfe4;
  background: #fff;
}

.joco-alta-dialog .joco-alta-control.p-select,
.joco-alta-dialog .joco-alta-autocomplete.p-autocomplete {
  width: 100% !important;
}

.joco-alta-dialog .joco-alta-control.p-select,
.joco-alta-dialog .joco-alta-input {
  height: 42px !important;
  min-height: 42px !important;
  font-size: 13px !important;
  box-sizing: border-box !important;
}

.joco-alta-dialog .joco-alta-control.p-select .p-select-label {
  display: flex !important;
  align-items: center !important;
  padding: 0 12px !important;
}

.joco-alta-dialog .joco-alta-input {
  width: 100% !important;
  padding: 0 12px !important;
}

.joco-alta-dialog .joco-alta-add-button.p-button,
.joco-alta-dialog .joco-alta-relate-button.p-button {
  height: 42px !important;
  min-height: 42px !important;
  border-radius: 7px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
}

.joco-alta-dialog .joco-alta-add-button.p-button {
  width: 100% !important;
  min-width: 138px !important;
}

.joco-alta-dialog .joco-alta-relate-button.p-button {
  min-width: 150px !important;
}

.joco-alta-dialog .joco-alta-grid.p-datatable {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  border: 0 !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-table-container,
.joco-alta-dialog .joco-alta-grid .p-datatable-wrapper,
.joco-alta-dialog .joco-alta-grid [data-pc-section="tablecontainer"] {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow: auto !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-paginator-bottom,
.joco-alta-dialog .joco-alta-grid > .p-paginator {
  flex: 0 0 58px !important;
  min-height: 58px !important;
  border-top: 1px solid #d5dfe4 !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-thead > tr > th {
  height: 48px !important;
  padding: 0 12px !important;
  background: #f2f6f8 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-tbody > tr > td {
  height: 34px !important;
  padding: 0 12px !important;
  font-size: 12px !important;
}

.joco-alta-select-overlay { min-width: 140px !important; }
</style>

<style scoped>
.joco-alta-header {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 42px 0 50px;
  box-sizing: border-box;
}

.joco-alta-header__title {
  margin: 0;
  color: #263746;
  font-size: 24px;
  font-weight: 400;
}

.joco-alta-header__close {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 25px;
  font-weight: 700;
  cursor: pointer;
}

.joco-alta-header__close:hover { color: #00a9bd; }

.joco-alta-body {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px 48px 36px;
  box-sizing: border-box;
}

.joco-alta-form {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 140px minmax(180px, 1fr) minmax(180px, 1fr) 140px 160px;
  align-items: end;
  gap: 16px;
}

.joco-alta-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.joco-alta-field > label {
  color: #171717;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.joco-alta-field--button { justify-content: flex-end; }

.joco-alta-grid-wrap {
  flex: 1 1 auto;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #cfdbe1;
  border-left: 4px solid #00a9bd;
  background: #fff;
}

.joco-alta-empty {
  min-height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f6475;
  font-size: 14px;
  background: #e8f9fc;
}

.joco-cell-text {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.joco-alta-footer {
  width: 100%;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 48px;
  box-sizing: border-box;
}

@media (max-width: 1050px) {
  .joco-alta-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .joco-alta-field--button { grid-column: 2; }
  .joco-alta-body { overflow-y: auto; }
  .joco-alta-grid-wrap { flex: 0 0 330px; }
}

@media (max-width: 680px) {
  .joco-alta-header { padding: 0 16px 0 20px; }
  .joco-alta-header__title { font-size: 20px; }
  .joco-alta-body { padding: 22px 18px 26px; }
  .joco-alta-form { grid-template-columns: 1fr; }
  .joco-alta-field--button { grid-column: 1; }
  .joco-alta-footer { padding: 0 18px; }
}
</style>
