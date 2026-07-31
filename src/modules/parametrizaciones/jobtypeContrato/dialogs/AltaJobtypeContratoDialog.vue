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
      <!-- Formulario de carga -->
      <div class="jobtype-alta-form">
        <div class="jobtype-alta-field fm-field">
          <label for="alta-pais">Pais</label>
          <Select
            id="alta-pais"
            v-model="form.pais"
            :options="paisOptions"
            optionLabel="label"
            optionValue="value"
            overlayClass="jobtype-alta-select-overlay"
            class="jobtype-alta-control"
          />
        </div>

        <div class="jobtype-alta-field fm-field">
          <label for="alta-jobtype">Jobtype</label>
          <AutoComplete
            id="alta-jobtype"
            v-model="form.jobtype"
            :suggestions="jobtypeSuggestions"
            optionLabel="valor"
            :minLength="4"
            :disabled="!form.pais"
            class="jobtype-alta-control"
            inputClass="jobtype-alta-control"
            @complete="buscarJobtypes"
            @item-select="onJobtypeSelect"
            @clear="jobtypeSelected = null"
          />
        </div>

        <div class="jobtype-alta-field fm-field">
          <label for="alta-contrato">Contrato</label>
          <AutoComplete
            id="alta-contrato"
            v-model="form.contrato"
            :suggestions="contratoSuggestions"
            optionLabel="valor"
            :minLength="4"
            :disabled="!form.pais"
            class="jobtype-alta-control"
            inputClass="jobtype-alta-control"
            @complete="buscarContratos"
            @item-select="onContratoSelect"
            @clear="contratoSelected = null"
          />
        </div>

        <FmButton
          label="AGREGAR"
          class="jobtype-add-button"
          :disabled="!canAgregar"
          @click="agregar"
        />
      </div>

      <!-- Grid de preview -->
      <div class="jobtype-alta-grid-wrap">
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
          @row-click="({ data }) => altaSelectedRow = data"
        >
          <template #empty>
            <div class="fm-grid-empty jobtype-alta-empty">No hay relaciones agregadas</div>
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
              <span class="jobtype-cell-text" :title="data.relCodigoTarea">{{ data.relCodigoTarea }}</span>
            </template>
          </Column>
          <Column field="relTarea" header="TAREA" style="width: 25%">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.relTarea">{{ data.relTarea }}</span>
            </template>
          </Column>
          <Column field="relContrato" header="NOMBRE_CONTRATO" style="width: 30%">
            <template #body="{ data }">
              <span class="jobtype-cell-text" :title="data.relContrato">{{ data.relContrato }}</span>
            </template>
          </Column>
          <Column field="paisLabel" header="PAIS" style="width: 25%">
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
