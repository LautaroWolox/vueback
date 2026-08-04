<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="true"
    :resizable="false"
    class="joco-edit-dialog"
    @update:visible="onVisibleChange"
  >
    <FmTypingLoader
      v-if="store.loading"
      overlay
      title="Actualizando relación"
      message="Guardando los cambios"
    />

    <template #header>
      <div class="joco-edit-header">
        <h2 class="joco-edit-header__title">Edición Jobtype-Contrato</h2>
        <button
          type="button"
          class="joco-edit-header__close"
          title="Cerrar"
          aria-label="Cerrar"
          :disabled="store.loading"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="joco-edit-body">
      <div class="joco-edit-form">
        <div class="joco-edit-field joco-edit-field--jobtype">
          <label for="joco-edit-jobtype">Jobtype</label>
          <InputText
            id="joco-edit-jobtype"
            :model-value="jobtype"
            :title="jobtype"
            disabled
            class="joco-edit-control joco-edit-control--readonly"
          />
        </div>

        <div class="joco-edit-field joco-edit-field--contrato">
          <label for="joco-edit-contrato-actual">Contrato</label>
          <InputText
            id="joco-edit-contrato-actual"
            :model-value="contratoActual"
            :title="contratoActual"
            disabled
            class="joco-edit-control joco-edit-control--readonly"
          />
        </div>

        <div class="joco-edit-field joco-edit-field--pais">
          <label for="joco-edit-pais">País</label>
          <InputText
            id="joco-edit-pais"
            :model-value="pais"
            :title="pais"
            disabled
            class="joco-edit-control joco-edit-control--readonly"
          />
        </div>

        <div class="joco-edit-field joco-edit-field--nuevo">
          <label for="joco-edit-nuevo-contrato">Nuevo Contrato</label>
          <AutoComplete
            id="joco-edit-nuevo-contrato"
            v-model="nuevoContrato"
            :suggestions="contratoSuggestions"
            optionLabel="valor"
            :minLength="4"
            :disabled="store.loading"
            class="joco-edit-autocomplete"
            inputClass="joco-edit-input"
            @complete="buscarContratos"
            @item-select="onContratoSelect"
            @clear="limpiarContratoSeleccionado"
          />
        </div>

        <div class="joco-edit-field joco-edit-field--origen">
          <label for="joco-edit-origen">Origen</label>
          <Select
            id="joco-edit-origen"
            v-model="origenSeleccionado"
            :options="origenOptions"
            optionLabel="label"
            optionValue="value"
            :disabled="store.loading || esParaguay"
            overlayClass="joco-edit-select-overlay"
            class="joco-edit-select"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="joco-edit-footer">
        <FmButton
          label="ACTUALIZAR"
          class="joco-edit-update-button"
          :disabled="!puedeActualizar || store.loading"
          @click="actualizar"
        />
      </div>
    </template>
  </Dialog>

  <FmConfirmDialog
    v-model:visible="showConfirmCierre"
    title="Confirmar acción"
    message="Hay cambios sin guardar. ¿Confirma que desea cancelar?"
    @accept="confirmarCierre"
    @cancel="cancelarCierre"
  />

  <FmAlertDialog
    v-model:visible="showError"
    title="Error"
    :message="errorMessage"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const props = defineProps({
  visible: { type: Boolean, default: false },
  tareaContratoId: { type: Number, default: 0 },
  contratoTipoId: { type: Number, default: 0 },
  jobtypeCodigo: { type: String, default: '' },
  jobtype: { type: String, default: '' },
  contratoActual: { type: String, default: '' },
  pais: { type: String, default: '' },
  origenActual: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'actualizado'])
const store = useJobtypeContratoStore()

const nuevoContrato = ref('')
const contratoSuggestions = ref([])
const contratoSelectedItem = ref(null)
const origenSeleccionado = ref('')
const showConfirmCierre = ref(false)
const showError = ref(false)
const localError = ref('')

const normalize = (value) => String(value ?? '').trim().toUpperCase()
const normalizeCountry = (value) => {
  const country = normalize(value)
  if (country === '1' || country === 'ARG' || country === 'AR' || country === 'ARGENTINA') return 'ARG'
  if (country === '2' || country === 'PY' || country === 'PAR' || country === 'PARAGUAY') return 'PY'
  if (country === '3' || country === 'UY' || country === 'URU' || country === 'URUGUAY') return 'UY'
  return country
}

const esParaguay = computed(() => normalizeCountry(props.pais) === 'PY')
const origenInicial = computed(() => {
  if (esParaguay.value) return 'FAN'
  return normalize(props.origenActual)
})
const origenOptions = computed(() => {
  const values = esParaguay.value ? ['FAN'] : ['FAN', 'MXM']
  const actual = normalize(props.origenActual)
  if (actual && !values.includes(actual)) values.push(actual)
  return values.map((value) => ({ label: value, value }))
})

const contratoFinalId = computed(() =>
  Number(contratoSelectedItem.value?.contratoId ?? props.contratoTipoId ?? 0)
)
const contratoFinalNombre = computed(() =>
  contratoSelectedItem.value?.nombre ?? props.contratoActual
)
const cambioContrato = computed(() => Boolean(contratoSelectedItem.value))
const cambioOrigen = computed(() => normalize(origenSeleccionado.value) !== normalize(origenInicial.value))
const hayCambios = computed(() => cambioContrato.value || cambioOrigen.value)
const puedeActualizar = computed(() => Boolean(
  hayCambios.value && contratoFinalId.value > 0 && origenSeleccionado.value
))
const errorMessage = computed(() => localError.value || store.error || 'Error de conexión. Contacte al administrador')

watch(() => props.visible, (visible) => {
  if (visible) resetForm()
  else showConfirmCierre.value = false
})

const resetForm = () => {
  nuevoContrato.value = ''
  contratoSelectedItem.value = null
  origenSeleccionado.value = origenInicial.value
  showConfirmCierre.value = false
  showError.value = false
  localError.value = ''
  store.clearError()
}

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onContratoSelect = (event) => {
  contratoSelectedItem.value = event.value
}

const limpiarContratoSeleccionado = () => {
  contratoSelectedItem.value = null
}

const existeDuplicado = () => store.relaciones.some((row) => {
  if (Number(row.tareaContratoId) === Number(props.tareaContratoId)) return false
  if (normalize(row.activo) !== 'S') return false

  const rowCountry = normalizeCountry(row.pais)
  const currentCountry = normalizeCountry(props.pais)
  const rowJobtype = normalize(row.tareaCodigo || row.tareaNombre)
  const currentJobtype = normalize(props.jobtypeCodigo || props.jobtype)
  const sameContract = Number(row.contratoTipoId) === contratoFinalId.value ||
    normalize(row.contratoNombre) === normalize(contratoFinalNombre.value)
  const sameOrigin = normalize(row.origen) === normalize(origenSeleccionado.value)

  return rowCountry === currentCountry && rowJobtype === currentJobtype && sameContract && sameOrigin
})

const actualizar = async () => {
  if (!puedeActualizar.value || store.loading) return

  localError.value = ''
  store.clearError()

  if (existeDuplicado()) {
    localError.value = 'La relación Jobtype / Contrato / País / Origen ya existe y se encuentra activa.'
    showError.value = true
    return
  }

  try {
    await store.actualizarRelacion(
      props.tareaContratoId,
      contratoFinalId.value,
      origenSeleccionado.value
    )
    cerrar()
    emit('actualizado')
  } catch {
    showError.value = true
  }
}

const solicitarCierre = () => {
  if (store.loading) return
  if (hayCambios.value) {
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
