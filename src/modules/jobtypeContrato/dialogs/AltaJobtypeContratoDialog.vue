<template>
  <!-- Dialog principal de alta -->
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="false"
    :resizable="false"
    class="jc-alta-dialog"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="jc-alta-header">
        <h2 class="jc-alta-header__title">Alta Jobtype - Contrato</h2>
        <button
          type="button"
          class="jc-alta-header__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="jc-alta-content">
      <!-- Formulario de carga -->
      <div class="jc-alta-form">
        <div class="jc-alta-field fm-field">
          <label for="jc-alta-pais">Pais</label>
          <Select
            id="jc-alta-pais"
            v-model="form.pais"
            :options="PAIS_OPTIONS"
            option-label="label"
            option-value="value"
            overlay-class="jc-alta-select-overlay"
            class="jc-alta-control"
          />
        </div>

        <div class="jc-alta-field fm-field">
          <label for="jc-alta-jobtype">Jobtype</label>
          <AutoComplete
            id="jc-alta-jobtype"
            v-model="form.jobtype"
            :suggestions="jobtypeSuggestions"
            option-label="valor"
            :min-length="4"
            :disabled="!form.pais"
            class="jc-alta-control"
            input-class="jc-alta-control"
            @complete="buscarJobtypes"
            @item-select="onJobtypeSelect"
            @clear="jobtypeSelected = null"
          />
        </div>

        <div class="jc-alta-field fm-field">
          <label for="jc-alta-contrato">Contrato</label>
          <AutoComplete
            id="jc-alta-contrato"
            v-model="form.contrato"
            :suggestions="contratoSuggestions"
            option-label="valor"
            :min-length="4"
            :disabled="!form.pais"
            class="jc-alta-control"
            input-class="jc-alta-control"
            @complete="buscarContratos"
            @item-select="onContratoSelect"
            @clear="contratoSelected = null"
          />
        </div>

        <FmButton
          label="AGREGAR"
          class="jc-add-btn"
          :disabled="!canAgregar"
          @click="agregar"
        />
      </div>

      <!-- Grid de preview -->
      <div class="jc-alta-grid-wrap">
        <DataTable
          v-model:selection="altaSelectedRow"
          v-model:first="altaFirst"
          v-model:rows="altaPageRows"
          class="jc-alta-grid fm-pass-grid"
          :value="altaRows"
          data-key="id"
          table-style="table-layout: fixed; width: 100%; min-width: 100%"
          scrollable
          scroll-height="flex"
          selection-mode="single"
          paginator
          :rows-per-page-options="[10]"
          show-gridlines
          @row-click="({ data }) => altaSelectedRow = data"
        >
          <template #empty>
            <FmEmptyState text="No hay relaciones agregadas" size="sm" />
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

          <Column
            v-for="col in ALTA_PREVIEW_COLUMNS"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :style="{ width: col.width }"
          >
            <template #body="{ data }">
              <span class="fm-cell-text" :title="String(data[col.field] ?? '')">
                {{ data[col.field] ?? '' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="RELACIONAR"
        class="jc-relate-btn"
        :disabled="altaRows.length === 0"
        @click="relacionar"
      />
    </template>
  </Dialog>

  <!-- Guard: datos sin guardar -->
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
import { ALTA_PREVIEW_COLUMNS, PAIS_OPTIONS } from '../config/columns'

defineProps({
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
  form.jobtype   = ''
  form.contrato  = ''
  jobtypeSelected.value  = null
  contratoSelected.value = null
})

const resetForm = () => {
  form.pais     = ''
  form.jobtype  = ''
  form.contrato = ''
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

  const paisLabel = PAIS_OPTIONS.find((o) => o.value === form.pais)?.label ?? ''

  altaRows.value = [...altaRows.value, {
    id:           `${Date.now()}-${codigo}`,
    relCodigoTarea: codigo,
    relTarea:       jobtypeSelected.value.nombre,
    relContratoId:  contratoSelected.value.contratoId,
    relContrato:    contratoSelected.value.nombre,
    pais:           paisLabel,
    paisLabel
  }]

  form.jobtype  = ''
  form.contrato = ''
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

<style scoped>
/* ── Header del dialog de alta ── */
.jc-alta-header {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 20px;
  box-sizing: border-box;
}

.jc-alta-header__title {
  margin: 0;
  color: var(--fm-text);
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
}

.jc-alta-header__close {
  width: 44px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--fm-radius-sm);
  background: transparent;
  color: #111;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: border-color var(--fm-transition-fast), color var(--fm-transition-fast);
}

.jc-alta-header__close:hover {
  border-color: var(--fm-cyan);
  color: var(--fm-cyan);
}

/* ── Contenido ── */
.jc-alta-content {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
  padding: 8px 16px 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.jc-alta-form {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) minmax(0, 1fr) 140px;
  align-items: end;
  gap: 14px;
  box-sizing: border-box;
}

.jc-alta-field { min-width: 0; }

/* fuerza el alto de controles dentro del formulario de alta */
.jc-alta-control,
.jc-alta-control.p-inputtext,
.jc-alta-control.p-select,
.jc-alta-control.p-autocomplete-input {
  width: 100% !important;
  min-width: 0 !important;
  height: 30px !important;
  min-height: 30px !important;
  box-sizing: border-box !important;
}

/* ── Grid de preview ── */
.jc-alta-grid-wrap {
  width: 100%;
  min-height: 0;
  display: flex;
  border: 1px solid var(--fm-border);
  border-left: 3px solid var(--fm-cyan);
  overflow: hidden;
  background: var(--fm-white);
  box-sizing: border-box;
}

.jc-alta-grid.p-datatable {
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.jc-alta-grid .p-datatable-table-container,
.jc-alta-grid .p-datatable-wrapper,
.jc-alta-grid [data-pc-section="tablecontainer"] {
  flex: 1 1 auto !important;
  overflow: auto !important;
}

/* Responsive: formulario de 1 columna en pantallas pequeñas */
@media (max-width: 860px) {
  .jc-alta-form {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto;
  }
}

@media (max-width: 560px) {
  .jc-alta-form {
    grid-template-columns: 1fr;
  }
}
</style>
