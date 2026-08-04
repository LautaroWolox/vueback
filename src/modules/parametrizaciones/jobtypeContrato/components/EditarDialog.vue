<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="true"
    :resizable="false"
    class="jobtype-contrato-edit-dialog"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <FmTypingLoader
      v-if="store.loading"
      overlay
      title="Actualizando relación"
      message="Guardando los cambios"
    />
    <template #header>
      <div class="jobtype-contrato-edit-header">
        <h2>Edición Jobtype-Contrato</h2>
        <button
          type="button"
          class="jobtype-contrato-edit-close"
          title="Cerrar"
          aria-label="Cerrar"
          :disabled="store.loading"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="jobtype-contrato-edit-content">
      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--jobtype">
        <label for="edit-jobtype">JobType</label>
        <InputText
          id="edit-jobtype"
          :model-value="jobtype"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--contrato">
        <label for="edit-contrato-actual">Contrato</label>
        <InputText
          id="edit-contrato-actual"
          :model-value="contratoActual"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--pais">
        <label for="edit-pais">País</label>
        <InputText
          id="edit-pais"
          :model-value="pais"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--nuevo">
        <label for="edit-nuevo-contrato">Nuevo Contrato</label>
        <AutoComplete
          id="edit-nuevo-contrato"
          v-model="nuevoContrato"
          :suggestions="contratoSuggestions"
          optionLabel="valor"
          :minLength="4"
          :disabled="store.loading"
          class="jobtype-contrato-edit-autocomplete"
          inputClass="jobtype-contrato-edit-control"
          @complete="buscarContratos"
          @item-select="onContratoSelect"
          @clear="contratoSelectedItem = null"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--origen">
        <label for="edit-origen">Origen</label>
        <Select
          id="edit-origen"
          v-model="origenSeleccionado"
          :options="origenOptions"
          optionLabel="label"
          optionValue="value"
          overlayClass="jobtype-contrato-edit-select-overlay"
          :disabled="store.loading || esParaguay"
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--select"
        />
      </div>
    </div>

    <template #footer>
      <FmButton
        label="ACTUALIZAR"
        class="jobtype-contrato-edit-update"
        :disabled="!puedeActualizar || store.loading"
        @click="actualizar"
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
    class="jobtype-contrato-unsaved-dialog"
    :style="confirmDialogStyle"
  >
    <template #header>
      <div class="jobtype-contrato-unsaved__header">
        <div class="jobtype-contrato-unsaved__header-main">
          <span class="jobtype-contrato-unsaved__icon-circle">
            <i class="pi pi-bell jobtype-contrato-unsaved__header-icon" aria-hidden="true" />
          </span>
          <span class="jobtype-contrato-unsaved__title">Confirmar Accion</span>
        </div>
        <button
          type="button"
          class="jobtype-contrato-unsaved__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cancelarCierre"
        >×</button>
      </div>
    </template>

    <div class="jobtype-contrato-unsaved__content">
      <span class="jobtype-contrato-unsaved__message">
        Hay cambios sin guardar. ¿Confirma que desea cancelar?
      </span>
    </div>

    <template #footer>
      <div class="jobtype-contrato-unsaved__actions">
        <button
          type="button"
          class="jobtype-contrato-unsaved__button jobtype-contrato-unsaved__button--cancel"
          @click="cancelarCierre"
        >CANCELAR</button>
        <button
          type="button"
          class="jobtype-contrato-unsaved__button jobtype-contrato-unsaved__button--accept"
          @click="confirmarCierre"
        >ACEPTAR</button>
      </div>
    </template>
  </Dialog>

  <FmAlertDialog
    v-model:visible="showError"
    title="Error"
    :message="errorMessage"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import Select from 'primevue/select'
import FmButton from '@/components/shared/FmButton.vue'
import FmAlertDialog from '@/components/shared/FmAlertDialog.vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'
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

const dialogStyle = 'width: min(900px, calc(100vw - 32px)); max-width: 900px;'
const confirmDialogStyle = 'width: min(540px, calc(100vw - 32px)); max-width: 540px;'

const nuevoContrato = ref('')
const contratoSuggestions = ref([])
const contratoSelectedItem = ref(null)
const origenSeleccionado = ref('')
const showConfirmCierre = ref(false)
const showError = ref(false)
const localError = ref('')

const normalize = (value) => String(value ?? '').trim().toUpperCase()
const normalizeCountry = (value) => {
  const country = normalize(value).replaceAll(' ', '')
  if (['1', 'ARG/UY', 'ARGUY', 'ARGENTINA/URUGUAY', 'ARG', 'AR', 'UY'].includes(country)) return 'ARG/UY'
  if (['2', 'PY', 'PAR', 'PARAGUAY'].includes(country)) return 'PY'
  return normalize(value)
}

const esParaguay = computed(() => normalizeCountry(props.pais) === 'PY')
const origenInicial = computed(() => esParaguay.value ? 'FAN' : normalize(props.origenActual))
const origenOptions = computed(() => {
  const values = esParaguay.value ? ['FAN'] : ['', 'FAN', 'MXM']
  const actual = normalize(props.origenActual)
  if (actual && !values.includes(actual)) values.push(actual)
  return values.map((value) => ({ label: value, value }))
})
const contratoFinalId = computed(() => Number(
  contratoSelectedItem.value?.contratoId ?? props.contratoTipoId ?? 0
))
const contratoFinalNombre = computed(() =>
  contratoSelectedItem.value?.nombre ?? props.contratoActual
)
const cambioContrato = computed(() => Boolean(
  contratoSelectedItem.value && contratoFinalId.value !== Number(props.contratoTipoId)
))
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

const existeDuplicado = () => store.relaciones.some((row) => {
  if (Number(row.tareaContratoId) === Number(props.tareaContratoId)) return false
  if (normalize(row.activo) === 'N') return false

  const sameCountry = normalizeCountry(row.pais) === normalizeCountry(props.pais)
  const rowJobtype = normalize(row.tareaCodigo || row.tareaNombre)
  const currentJobtype = normalize(props.jobtypeCodigo || props.jobtype)
  const sameContract = Number(row.contratoTipoId) === contratoFinalId.value ||
    normalize(row.contratoNombre) === normalize(contratoFinalNombre.value)
  const sameOrigin = normalize(row.origen) === normalize(origenSeleccionado.value)

  return sameCountry && rowJobtype === currentJobtype && sameContract && sameOrigin
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
