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
    <template #header>
      <div class="jobtype-contrato-edit-header">
        <h2>Edición Jobtype-Contrato</h2>
        <button
          type="button"
          class="jobtype-contrato-edit-close"
          title="Cerrar"
          aria-label="Cerrar"
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
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--select"
        />
      </div>
    </div>

    <template #footer>
      <FmButton
        label="ACTUALIZAR"
        class="jobtype-contrato-edit-update"
        :disabled="!puedeActualizar"
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import Select from 'primevue/select'
import FmButton from '@/components/shared/FmButton.vue'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const props = defineProps({
  visible: { type: Boolean, default: false },
  tareaContratoId: { type: Number, default: 0 },
  jobtype: { type: String, default: '' },
  contratoActual: { type: String, default: '' },
  pais: { type: String, default: '' }
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

const origenOptions = computed(() => {
  if (props.pais === 'PY') return [{ label: 'FAN', value: 'FAN' }]

  return [
    { label: '', value: '' },
    { label: 'FAN', value: 'FAN' },
    { label: 'MXM', value: 'MXM' }
  ]
})

const origenInicial = computed(() => props.pais === 'PY' ? 'FAN' : '')
const hayCambios = computed(() => Boolean(
  contratoSelectedItem.value || origenSeleccionado.value !== origenInicial.value
))
const puedeActualizar = computed(() => Boolean(contratoSelectedItem.value))

watch(() => props.visible, (val) => {
  if (val) {
    nuevoContrato.value = ''
    contratoSelectedItem.value = null
    origenSeleccionado.value = origenInicial.value
    showConfirmCierre.value = false
  }
})

const buscarContratos = async (event) => {
  contratoSuggestions.value = await store.buscarContratos(event.query)
}

const onContratoSelect = (event) => {
  contratoSelectedItem.value = event.value
}

const actualizar = async () => {
  if (!puedeActualizar.value) return

  try {
    await store.actualizarRelacion(props.tareaContratoId, contratoSelectedItem.value.contratoId)
    nuevoContrato.value = ''
    contratoSelectedItem.value = null
    origenSeleccionado.value = origenInicial.value
    emit('update:visible', false)
    emit('actualizado')
  } catch {
    // error already in store.error
  }
}

const solicitarCierre = () => {
  if (hayCambios.value) {
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
  nuevoContrato.value = ''
  contratoSelectedItem.value = null
  origenSeleccionado.value = origenInicial.value
  emit('update:visible', false)
}
</script>

<style scoped>
.jobtype-contrato-edit-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.jobtype-contrato-edit-header h2 {
  margin: 0;
  color: #263746;
  font-size: 18px;
  font-weight: 400;
}

.jobtype-contrato-edit-close,
.jobtype-contrato-unsaved__close {
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

.jobtype-contrato-edit-close:hover,
.jobtype-contrato-unsaved__close:hover {
  color: #00a9bd;
}

.jobtype-contrato-edit-content {
  min-height: 170px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'jobtype contrato pais'
    '. nuevo origen';
  align-items: start;
  column-gap: 20px;
  row-gap: 14px;
  padding: 16px 0 28px;
}

.jobtype-contrato-edit-field--jobtype { grid-area: jobtype; }
.jobtype-contrato-edit-field--contrato { grid-area: contrato; }
.jobtype-contrato-edit-field--pais { grid-area: pais; }
.jobtype-contrato-edit-field--nuevo { grid-area: nuevo; }
.jobtype-contrato-edit-field--origen { grid-area: origen; }

.jobtype-contrato-edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.jobtype-contrato-edit-field > label {
  color: #202020;
  font-size: 13px;
  font-weight: 600;
}

.jobtype-contrato-edit-control {
  width: 100%;
  height: 32px;
  min-height: 32px;
  box-sizing: border-box;
}

:global(.jobtype-contrato-edit-autocomplete) {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
}

:global(.jobtype-contrato-edit-autocomplete .p-autocomplete-input) {
  width: 100% !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

:global(.jobtype-contrato-edit-control--select.p-select) {
  width: 100% !important;
  min-width: 0 !important;
}

:global(.jobtype-contrato-edit-control--select .p-select-label) {
  display: flex;
  align-items: center;
  padding: 0 9px;
  font-size: 13px;
}

.jobtype-contrato-edit-control--readonly:disabled {
  border-color: #d1d1d1;
  background: #eeeeee;
  color: #444;
  opacity: 1;
}

:global(.p-dialog.jobtype-contrato-edit-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.jobtype-contrato-edit-dialog .p-dialog-header) {
  min-height: 56px;
  padding: 12px 16px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.jobtype-contrato-edit-dialog .p-dialog-content) {
  padding: 0 16px;
  background: #fff;
}

:global(.jobtype-contrato-edit-dialog .p-dialog-footer) {
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 16px;
  border-top: 1px solid #dedede;
  background: #fff;
}

:global(.jobtype-contrato-edit-dialog .jobtype-contrato-edit-update) {
  width: 108px !important;
  min-width: 108px !important;
  max-width: 108px !important;
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  border-radius: 16px !important;
  font-size: 12px !important;
}

.jobtype-contrato-unsaved__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.jobtype-contrato-unsaved__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.jobtype-contrato-unsaved__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8fa;
}

.jobtype-contrato-unsaved__header-icon {
  color: #11aabd;
  font-size: 23px;
}

.jobtype-contrato-unsaved__title {
  color: #252b33;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.jobtype-contrato-unsaved__content {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.jobtype-contrato-unsaved__message {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.35;
}

.jobtype-contrato-unsaved__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.jobtype-contrato-unsaved__button {
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

.jobtype-contrato-unsaved__button--cancel {
  background: #fff;
  color: #0097a7;
}

.jobtype-contrato-unsaved__button--accept {
  background: #00acc1;
  color: #fff;
}

:global(.p-dialog.jobtype-contrato-unsaved-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.jobtype-contrato-unsaved-dialog .p-dialog-header) {
  min-height: 68px;
  padding: 12px 18px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.jobtype-contrato-unsaved-dialog .p-dialog-content) {
  padding: 0 18px;
  background: #fff;
}

:global(.jobtype-contrato-unsaved-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid #dedede;
  background: #fff;
}

@media (max-width: 760px) {
  .jobtype-contrato-edit-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      'jobtype'
      'contrato'
      'pais'
      'nuevo'
      'origen';
    row-gap: 14px;
    padding: 16px 0 22px;
  }
}
</style>
