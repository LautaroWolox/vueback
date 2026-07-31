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
      <!-- ── Formulario: País | Jobtype | Contrato | AGREGAR ── -->
      <div class="joco-alta-form">
        <div class="joco-alta-field">
          <label for="joco-alta-pais">Pais</label>
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

        <!-- El botón AGREGAR está en el flujo del grid, alineado al final -->
        <div class="joco-alta-field joco-alta-field--btn">
          <FmButton
            label="AGREGAR"
            class="joco-alta-add-btn"
            :disabled="!canAgregar"
            @click="agregar"
          />
        </div>
      </div>

      <!-- ── Grid de preview ── -->
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
          scroll-height="flex"
          selectionMode="single"
          paginator
          :rowsPerPageOptions="[10]"
          showGridlines
          @row-click="({ data }) => altaSelectedRow = data"
        >
          <template #empty>
            <div class="joco-alta-empty">No hay relaciones agregadas</div>
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
              :total-records="totalRecords" :rows-options="[10]"
              :show-rows-select="false" :show-counter="false"
              page-label="Página"
              @first-page="firstPageCallback" @prev-page="prevPageCallback"
              @next-page="nextPageCallback"   @last-page="lastPageCallback"
              @page-change="changePageCallback" @rows-change="rowChangeCallback"
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
          <Column field="relTarea" header="TAREA" style="width: 25%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.relTarea">{{ data.relTarea }}</span>
            </template>
          </Column>
          <Column field="relContrato" header="NOMBRE_CONTRATO" style="width: 30%">
            <template #body="{ data }">
              <span class="joco-cell-text" :title="data.relContrato">{{ data.relContrato }}</span>
            </template>
          </Column>
          <Column field="paisLabel" header="PAIS" style="width: 25%">
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
          class="joco-alta-relate-btn"
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
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const paisOptions = [
  { label: '',       value: '' },
  { label: 'ARG/UY', value: '1' },
  { label: 'PY',     value: '2' }
]

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'relacionado'])

const store = useJobtypeContratoStore()

const form = reactive({ pais: '', jobtype: '', contrato: '' })
const jobtypeSuggestions  = ref([])
const contratoSuggestions = ref([])
const jobtypeSelected     = ref(null)
const contratoSelected    = ref(null)
const altaRows            = ref([])
const altaSelectedRow     = ref(null)
const altaFirst           = ref(0)
const altaPageRows        = ref(10)
const showConfirmCierre   = ref(false)

const canAgregar = computed(() => Boolean(jobtypeSelected.value && contratoSelected.value))

const hayDatos = computed(() =>
  Boolean(form.jobtype || form.contrato || jobtypeSelected.value || contratoSelected.value || altaRows.value.length)
)

watch(() => form.pais, () => {
  form.jobtype           = ''
  form.contrato          = ''
  jobtypeSelected.value  = null
  contratoSelected.value = null
})

watch(() => props.visible, (val) => {
  if (val) resetForm()
})

const resetForm = () => {
  form.pais              = ''
  form.jobtype           = ''
  form.contrato          = ''
  jobtypeSelected.value  = null
  contratoSelected.value = null
  altaRows.value         = []
  altaSelectedRow.value  = null
  altaFirst.value        = 0
  showConfirmCierre.value = false
}

const buscarJobtypes = async (event) => {
  jobtypeSuggestions.value = await store.buscarJobtypes(event.query, form.pais)
}

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onJobtypeSelect  = (e) => { jobtypeSelected.value  = e.value }
const onContratoSelect = (e) => { contratoSelected.value = e.value }

const agregar = () => {
  if (!jobtypeSelected.value || !contratoSelected.value) return
  const codigo = jobtypeSelected.value.codigo
  if (altaRows.value.some((r) => r.relCodigoTarea === codigo)) return

  const paisLabel = paisOptions.find((o) => o.value === form.pais)?.label ?? ''

  altaRows.value = [...altaRows.value, {
    id:             `${Date.now()}-${codigo}`,
    relCodigoTarea: codigo,
    relTarea:       jobtypeSelected.value.nombre,
    relContratoId:  contratoSelected.value.contratoId,
    relContrato:    contratoSelected.value.nombre,
    pais:           paisLabel,
    paisLabel
  }]

  form.jobtype           = ''
  form.contrato          = ''
  jobtypeSelected.value  = null
  contratoSelected.value = null
}

const eliminarPreview = () => {
  if (!altaSelectedRow.value) return
  altaRows.value = altaRows.value.filter((r) => r.id !== altaSelectedRow.value.id)
  altaSelectedRow.value = null
}

const relacionar = async () => {
  if (!altaRows.value.length) return
  try {
    await store.crearRelaciones(
      altaRows.value.map(({ relCodigoTarea, relTarea, relContratoId, relContrato, pais }) => ({
        relCodigoTarea, relTarea, relContratoId, relContrato, pais
      }))
    )
    cerrar()
    emit('relacionado')
  } catch { /* error en store.error */ }
}

const solicitarCierre = () => {
  if (hayDatos.value) { showConfirmCierre.value = true; return }
  cerrar()
}

const onVisibleChange = (val) => { if (!val) solicitarCierre() }

const cerrar = () => {
  resetForm()
  emit('update:visible', false)
}
</script>

<!-- ─── Estilos del Dialog que se teletransporta a body ─── -->
<style>
/* Contenedor del diálogo */
.p-dialog.joco-alta-dialog {
  width: min(980px, calc(100dvw - 32px)) !important;
  max-width: calc(100dvw - 32px) !important;
  max-height: calc(100dvh - 32px) !important;
  /* No fijamos height: el diálogo crece con su contenido hasta el max */
  overflow: hidden;
  border: 1px solid #d4dde2;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 55px rgba(20, 48, 59, .24);
  box-sizing: border-box;
}

.joco-alta-dialog .p-dialog-header {
  flex: 0 0 auto;
  padding: 0 !important;
  border-bottom: 1px solid #d4dde2;
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
  flex: 0 0 auto;
  padding: 0 !important;
  border-top: 1px solid #d4dde2;
  background: #fff;
}

/* Botón RELACIONAR en footer */
.joco-alta-dialog .joco-alta-relate-btn.p-button {
  width: 120px !important;
  min-width: 120px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 13px !important;
  border-radius: 2px !important;
  font-size: 12px !important;
}

/* Botón AGREGAR */
.joco-alta-dialog .joco-alta-add-btn.p-button {
  width: 100% !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0 10px !important;
  border-radius: 2px !important;
  font-size: 12px !important;
}

/* Controles del formulario */
.joco-alta-dialog .joco-alta-control.p-select {
  width: 100% !important;
  height: 30px !important;
  min-height: 30px !important;
}

.joco-alta-dialog .joco-alta-control.p-select .p-select-label {
  display: flex !important;
  align-items: center !important;
  padding: 0 8px !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
}

.joco-alta-dialog .joco-alta-autocomplete.p-autocomplete {
  width: 100% !important;
}

.joco-alta-dialog .joco-alta-input {
  width: 100% !important;
  height: 30px !important;
  min-height: 30px !important;
  font-size: 12px !important;
  box-sizing: border-box !important;
}

/* Overlay del select */
.joco-alta-select-overlay {
  min-width: 140px !important;
  max-width: 200px !important;
}

.joco-alta-select-overlay .p-select-list { padding: 2px 0 !important; }
.joco-alta-select-overlay .p-select-option {
  min-height: 30px !important;
  padding: 5px 10px !important;
  font-size: 12px !important;
}

/* Grilla de preview */
.joco-alta-dialog .joco-alta-grid.p-datatable {
  width: 100% !important;
  height: 100% !important;
  border: 0 !important;
  background: #fff !important;
  display: flex !important;
  flex-direction: column !important;
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
}

.joco-alta-dialog .joco-alta-grid .fm-custom-paginator {
  min-height: 42px !important;
  height: 42px !important;
  padding: 2px 10px !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-tbody > tr > td {
  font-size: 11px !important;
  height: 30px !important;
  padding: 0 7px !important;
}

.joco-alta-dialog .joco-alta-grid .p-datatable-thead > tr > th {
  font-size: 10px !important;
  height: 30px !important;
  padding: 0 7px !important;
  background: #f1f1f1 !important;
}
</style>

<!-- ─── Estilos scoped para el layout interno ─── -->
<style scoped>
/* ── Header ── */
.joco-alta-header {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 20px;
  box-sizing: border-box;
}

.joco-alta-header__title {
  margin: 0;
  color: #263746;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.joco-alta-header__close {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #9aa4aa;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: border-color .14s ease, color .14s ease;
}

.joco-alta-header__close:hover {
  border-color: #00a9bd;
  color: #00a9bd;
}

/* ── Body ── */
.joco-alta-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px 10px;
  /* El body no tiene altura fija — se ajusta al contenido */
}

/* ── Formulario: 4 columnas en escritorio ── */
.joco-alta-form {
  display: grid;
  grid-template-columns:
    minmax(150px, 180px)
    minmax(220px, 1fr)
    minmax(220px, 1fr)
    120px;
  align-items: end;
  gap: 10px;
  box-sizing: border-box;
}

.joco-alta-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.joco-alta-field > label {
  color: #202020;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

/* El campo del botón no necesita label pero debe alinearse al final */
.joco-alta-field--btn {
  justify-content: flex-end;
}

/* ── Grid wrap con altura acotada ── */
.joco-alta-grid-wrap {
  width: 100%;
  height: clamp(260px, 40dvh, 380px);
  min-height: 260px;
  display: flex;
  flex-direction: column;
  border: 1px solid #d4dde2;
  border-left: 3px solid #00a9bd;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
}

/* Estado vacío */
.joco-alta-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #075f6d;
  font-size: 12px;
  background: #eafcff;
}

/* Celda de texto */
.joco-cell-text {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Footer ── */
.joco-alta-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 16px;
  min-height: 52px;
  box-sizing: border-box;
}

/* ────────────────────────────
   Responsive
   ──────────────────────────── */

/* 700–1100 px: 2 columnas */
@media (max-width: 1100px) {
  .joco-alta-form {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto;
  }

  /* Botón en celda 2×1 al final de la segunda fila */
  .joco-alta-field--btn {
    grid-column: 2 / 3;
  }
}

/* < 700 px: 1 columna */
@media (max-width: 700px) {
  .joco-alta-form {
    grid-template-columns: 1fr;
  }

  .joco-alta-field--btn {
    grid-column: 1;
  }
}
</style>
