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
  height: min(680px, calc(100dvh - 48px)) !important;
  max-height: calc(100dvh - 48px) !important;
  display: grid !important;
  grid-template-rows: 58px minmax(0, 1fr) 58px !important;
  overflow: hidden !important;
  border: 1px solid #d4dde2;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 55px rgba(20, 48, 59, .24);
  box-sizing: border-box;
}

.joco-alta-dialog .p-dialog-header {
  padding: 0 !important;
  border-bottom: 1px solid #d4dde2;
  background: #fff;
  overflow: hidden;
}

.joco-alta-dialog .p-dialog-content {
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #fff;
}

.joco-alta-dialog .p-dialog-footer {
  padding: 0 !important;
  border-top: 1px solid #d4dde2;
  background: #fff;
  overflow: hidden;
}

/* Controles del formulario */
.joco-alta-dialog .joco-alta-control.p-select,
.joco-alta-dialog .joco-alta-autocomplete.p-autocomplete {
  width: 100% !important;
}

.joco-alta-dialog .joco-alta-control.p-select,
.joco-alta-dialog .joco-alta-input {
  height: 30px !important;
  min-height: 30px !important;
  font-size: 12px !important;
  box-sizing: border-box !important;
}

.joco-alta-dialog .joco-alta-control.p-select .p-select-label {
  display: flex !important;
  align-items: center !important;
  padding: 0 8px !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
}

.joco-alta-dialog .joco-alta-input {
  width: 100% !important;
  padding: 0 8px !important;
}

.joco-alta-dialog .joco-alta-add-button.p-button {
  width: 100% !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 10px !important;
  border-radius: 2px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
}

.joco-alta-dialog .joco-alta-relate-button.p-button {
  width: 120px !important;
  min-width: 120px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 13px !important;
  border-radius: 2px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
}

/* Grilla de preview */
.joco-alta-dialog .joco-alta-grid.p-datatable {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  border: 0 !important;
  background: #fff !important;
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
  flex: 0 0 42px !important;
  height: 42px !important;
  min-height: 42px !important;
  border-top: 1px solid #d4dde2 !important;
  background: #fff !important;
  overflow: hidden !important;
}

.joco-alta-dialog .joco-alta-grid .fm-custom-paginator {
  min-height: 42px !important;
  height: 42px !important;
  padding: 2px 10px !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-thead > tr > th {
  height: 30px !important;
  padding: 0 7px !important;
  background: #f1f1f1 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-tbody > tr > td {
  height: 30px !important;
  padding: 0 7px !important;
  font-size: 11px !important;
}

.joco-alta-select-overlay { min-width: 140px !important; max-width: 200px !important; }
.joco-alta-select-overlay .p-select-list { padding: 2px 0 !important; }
.joco-alta-select-overlay .p-select-option {
  min-height: 28px !important;
  padding: 4px 10px !important;
  font-size: 12px !important;
}
</style>

<style scoped>
.joco-alta-header {
  width: 100%;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 20px;
  box-sizing: border-box;
}

.joco-alta-header__title {
  margin: 0;
  color: #263746;
  font-size: 20px;
  font-weight: 400;
}

.joco-alta-header__close {
  width: 44px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: #fff;
  color: #111;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: border-color .15s ease, color .15s ease;
}

.joco-alta-header__close:hover {
  border-color: #00a9bd;
  color: #00a9bd;
}

/* ── Body: display:grid igual que el dialog-content interno ── */
.joco-alta-body {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: 58px minmax(0, 1fr);
  gap: 14px;
  padding: 8px 16px 10px;
  overflow: hidden;
  box-sizing: border-box;
}

/* ── Formulario ── */
.joco-alta-form {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 120px minmax(200px, 1fr) minmax(200px, 1fr) 120px 140px;
  align-items: end;
  gap: 14px;
  box-sizing: border-box;
}

.joco-alta-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.joco-alta-field > label {
  color: #171717;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.joco-alta-field--button {
  justify-content: flex-end;
}

/* ── Grid wrap ── */
.joco-alta-grid-wrap {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #d4dde2;
  border-left: 3px solid #00a9bd;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
}

.joco-alta-empty {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f6475;
  font-size: 12px;
  background: #e8f9fc;
}

.joco-cell-text {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Footer ── */
.joco-alta-footer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
  box-sizing: border-box;
}

/* Responsive 900–1440: form cabe en menos espacio */
@media (max-width: 1050px) {
  .joco-alta-form {
    grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1fr) 110px 130px;
    gap: 10px;
  }
}

@media (max-width: 760px) {
  .joco-alta-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .joco-alta-field--button {
    grid-column: 2;
  }
}

@media (max-width: 520px) {
  .joco-alta-form {
    grid-template-columns: 1fr;
  }

  .joco-alta-field--button {
    grid-column: 1;
  }
}
</style>
