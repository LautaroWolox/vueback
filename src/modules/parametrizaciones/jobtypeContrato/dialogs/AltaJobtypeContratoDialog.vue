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
    <FmTypingLoader
      v-if="submitting"
      overlay
      title="Relacionando"
      message="Guardando relaciones Jobtype-Contrato"
    />

    <template #header>
      <div class="joco-alta-header">
        <h2 class="joco-alta-header__title">Alta Jobtype - Contrato</h2>
        <button
          type="button"
          class="joco-alta-header__close"
          title="Cerrar"
          aria-label="Cerrar"
          :disabled="submitting"
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
            :disabled="submitting"
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
            :disabled="!form.pais || submitting"
            class="joco-alta-control joco-alta-autocomplete"
            inputClass="joco-alta-input"
            @complete="buscarJobtypes"
            @item-select="onJobtypeSelect"
            @clear="limpiarJobtype"
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
            :disabled="!form.pais || submitting"
            class="joco-alta-control joco-alta-autocomplete"
            inputClass="joco-alta-input"
            @complete="buscarContratos"
            @item-select="onContratoSelect"
            @clear="limpiarContrato"
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
            :disabled="!form.pais || esParaguay || submitting"
            overlayClass="joco-alta-select-overlay"
            class="joco-alta-control"
          />
        </div>

        <div class="joco-alta-field joco-alta-field--button">
          <FmButton
            label="AGREGAR"
            class="joco-alta-add-button"
            :disabled="!canAgregar || submitting"
            @click="agregar"
          />
        </div>

        <div v-if="duplicateMessage" class="joco-alta-notice" role="alert">
          {{ duplicateMessage }}
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
          :rowsPerPageOptions="ALTA_ROWS_OPTIONS"
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
              :rows-options="ALTA_ROWS_OPTIONS"
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
                  :delete-disabled="!altaSelectedRow || submitting"
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
          :disabled="altaRows.length === 0 || submitting"
          @click="relacionar"
        />
      </div>
    </template>
  </Dialog>

  <FmConfirmDialog
    v-model:visible="showConfirmCierre"
    title="Confirmar acción"
    message="Hay datos ingresados. ¿Confirma que desea cancelar?"
    @accept="confirmarCierre"
    @cancel="cancelarCierre"
  />

  <FmAlertDialog
    v-model:visible="showAlert"
    title="Atención"
    :message="alertMessage"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ALTA_ROWS_OPTIONS, PAIS_OPTIONS } from '../config/columns'
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
const altaPageRows = ref(ALTA_ROWS_OPTIONS[0])
const showConfirmCierre = ref(false)
const duplicateMessage = ref('')
const showAlert = ref(false)
const alertMessage = ref('')
const submitting = ref(false)

const normalize = (value) => String(value ?? '').trim().toUpperCase()
const normalizeCountry = (value) => {
  const country = normalize(value).replaceAll(' ', '')
  if (['1', 'ARG/UY', 'ARGUY', 'ARGENTINA/URUGUAY'].includes(country)) return 'ARG/UY'
  if (['2', 'PY', 'PARAGUAY'].includes(country)) return 'PY'
  return normalize(value)
}

const esParaguay = computed(() => normalizeCountry(form.pais) === 'PY')
const origenOptions = computed(() => (
  esParaguay.value
    ? [{ label: 'FAN', value: 'FAN' }]
    : [
        { label: '', value: '' },
        { label: 'FAN', value: 'FAN' },
        { label: 'MXM', value: 'MXM' }
      ]
))
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
  duplicateMessage.value = ''
  form.origen = normalizeCountry(pais) === 'PY' ? 'FAN' : ''
})

watch(() => [form.origen, form.jobtype, form.contrato], () => {
  duplicateMessage.value = ''
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
  duplicateMessage.value = ''
  showAlert.value = false
  alertMessage.value = ''
  submitting.value = false
}

const buscarJobtypes = async (event) => {
  jobtypeSuggestions.value = await store.buscarJobtypes(event.query, form.pais)
}

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onJobtypeSelect = (event) => { jobtypeSelected.value = event.value }
const onContratoSelect = (event) => { contratoSelected.value = event.value }
const limpiarJobtype = () => { jobtypeSelected.value = null }
const limpiarContrato = () => { contratoSelected.value = null }
const onRowClick = ({ data }) => { altaSelectedRow.value = data }

const previewKey = (row) => [
  normalize(row.relCodigoTarea),
  Number(row.relContratoId || 0),
  normalize(row.origen),
  normalizeCountry(row.paisLabel || row.pais)
].join('|')

const agregar = () => {
  if (!canAgregar.value) return

  const paisLabel = normalizeCountry(form.pais)
  const nuevaFila = {
    id: `${Date.now()}-${jobtypeSelected.value.codigo}-${contratoSelected.value.contratoId}`,
    relCodigoTarea: jobtypeSelected.value.codigo,
    relTarea: jobtypeSelected.value.nombre,
    relContratoId: Number(contratoSelected.value.contratoId),
    relContrato: contratoSelected.value.nombre,
    origen: form.origen,
    pais: paisLabel,
    paisLabel
  }

  if (altaRows.value.some((row) => previewKey(row) === previewKey(nuevaFila))) {
    duplicateMessage.value = `La relación ${nuevaFila.relCodigoTarea} / ${nuevaFila.relContrato} / ${nuevaFila.origen} ya fue agregada.`
    return
  }

  duplicateMessage.value = ''
  altaRows.value = [...altaRows.value, nuevaFila]
  altaSelectedRow.value = nuevaFila
  form.jobtype = ''
  form.contrato = ''
  jobtypeSelected.value = null
  contratoSelected.value = null
  form.origen = esParaguay.value ? 'FAN' : ''
}

const eliminarPreview = () => {
  if (!altaSelectedRow.value || submitting.value) return
  altaRows.value = altaRows.value.filter((row) => row.id !== altaSelectedRow.value.id)
  altaSelectedRow.value = null
}

const isExistingActiveRelation = (preview) => store.relaciones.some((row) => {
  if (normalize(row.activo) === 'N') return false

  const sameTask = normalize(row.tareaCodigo) === normalize(preview.relCodigoTarea)
  const sameContract = Number(row.contratoTipoId || 0) === Number(preview.relContratoId || 0) ||
    normalize(row.contratoNombre) === normalize(preview.relContrato)
  const sameOrigin = normalize(row.origen) === normalize(preview.origen)
  const sameCountry = normalizeCountry(row.pais) === normalizeCountry(preview.paisLabel || preview.pais)

  return sameTask && sameContract && sameOrigin && sameCountry
})

const relacionar = async () => {
  if (!altaRows.value.length || submitting.value) return

  const duplicates = altaRows.value.filter(isExistingActiveRelation)
  if (duplicates.length) {
    alertMessage.value = `Ya existe una relación activa para: ${duplicates.map((row) => row.relCodigoTarea).join(', ')}.`
    showAlert.value = true
    return
  }

  submitting.value = true
  try {
    const errors = await store.crearRelaciones(
      altaRows.value.map(({ relCodigoTarea, relTarea, relContratoId, relContrato, origen, pais }) => ({
        relCodigoTarea,
        relTarea,
        relContratoId,
        relContrato,
        origen,
        pais
      }))
    )

    if (errors.length) {
      alertMessage.value = errors
        .map((error) => error.mensaje || `No se pudo relacionar ${error.tareaCodigo}`)
        .join('\n')
      showAlert.value = true
      return
    }

    cerrar()
    emit('relacionado')
  } catch (error) {
    alertMessage.value = error instanceof Error
      ? error.message
      : (store.error || 'Error de conexión. Contacte al administrador')
    showAlert.value = true
  } finally {
    submitting.value = false
  }
}

const solicitarCierre = () => {
  if (submitting.value) return
  if (hayDatos.value) {
    showConfirmCierre.value = true
    return
  }
  cerrar()
}

const onVisibleChange = (visible) => {
  if (!visible) solicitarCierre()
}

const cancelarCierre = () => { showConfirmCierre.value = false }
const confirmarCierre = () => {
  showConfirmCierre.value = false
  cerrar()
}

const cerrar = () => {
  resetForm()
  emit('update:visible', false)
}
</script>
