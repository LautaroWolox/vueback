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
    @update:visible="manejarCambioVisible"
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
        <label for="jobtype-contrato-edit-jobtype">JobType</label>
        <InputText
          id="jobtype-contrato-edit-jobtype"
          :model-value="jobtype"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--contrato">
        <label for="jobtype-contrato-edit-actual">Contrato</label>
        <InputText
          id="jobtype-contrato-edit-actual"
          :model-value="contratoActual"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--pais">
        <label for="jobtype-contrato-edit-pais">País</label>
        <InputText
          id="jobtype-contrato-edit-pais"
          :model-value="pais"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--nuevo">
        <div
          class="jobtype-contrato-edit-float-field"
          :class="{
            'jobtype-contrato-edit-float-field--active':
              nuevoContratoFocused || nuevoContrato.length > 0
          }"
        >
          <InputText
            id="jobtype-contrato-edit-nuevo"
            v-model="nuevoContrato"
            class="jobtype-contrato-edit-control jobtype-contrato-edit-control--new"
            aria-label="Nuevo Contrato"
            @focus="nuevoContratoFocused = true"
            @blur="nuevoContratoFocused = false"
            @keyup.enter="actualizar"
          />
          <label for="jobtype-contrato-edit-nuevo">Nuevo Contrato</label>
        </div>
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--origen">
        <label for="jobtype-contrato-edit-origen">Origen</label>
        <Select
          id="jobtype-contrato-edit-origen"
          v-model="origenSeleccionado"
          :options="origenOptions"
          option-label="label"
          option-value="value"
          overlay-class="jobtype-contrato-edit-select-overlay"
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
    v-model:visible="mostrarConfirmacionCierre"
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
        >
          CANCELAR
        </button>
        <button
          type="button"
          class="jobtype-contrato-unsaved__button jobtype-contrato-unsaved__button--accept"
          @click="confirmarCierre"
        >
          ACEPTAR
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

const props = defineProps({
  visible: { type: Boolean, default: false },
  jobtype: { type: String, default: '' },
  contratoActual: { type: String, default: '' },
  pais: { type: String, default: '' },
  origenActual: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'actualizar'])
const nuevoContrato = ref('')
const nuevoContratoFocused = ref(false)
const origenSeleccionado = ref('')
const mostrarConfirmacionCierre = ref(false)

const dialogStyle = 'width: min(900px, calc(100vw - 32px)); max-width: 900px;'
const confirmDialogStyle = 'width: min(540px, calc(100vw - 32px)); max-width: 540px;'

const origenOptions = computed(() => {
  const values = props.pais === 'PY' ? ['FAN'] : ['', 'FAN', 'MXM']
  const actual = props.origenActual.trim()

  if (actual && !values.includes(actual)) values.push(actual)

  return values.map((value) => ({ label: value, value }))
})

const contratoIngresado = computed(() => nuevoContrato.value.trim())
const contratoFinal = computed(() => contratoIngresado.value || props.contratoActual.trim())
const cambioContrato = computed(() => Boolean(
  contratoIngresado.value && contratoIngresado.value !== props.contratoActual.trim()
))
const cambioOrigen = computed(() => origenSeleccionado.value !== props.origenActual.trim())
const hayCambios = computed(() => cambioContrato.value || cambioOrigen.value)
const puedeActualizar = computed(() => Boolean(
  hayCambios.value && contratoFinal.value && origenSeleccionado.value
))

const limpiarFormulario = () => {
  nuevoContrato.value = ''
  nuevoContratoFocused.value = false
  origenSeleccionado.value = props.origenActual.trim()
  mostrarConfirmacionCierre.value = false
}

watch(() => props.visible, (visible) => {
  if (visible) limpiarFormulario()
  else mostrarConfirmacionCierre.value = false
})

const cerrarSinConfirmar = () => {
  limpiarFormulario()
  emit('update:visible', false)
}

const solicitarCierre = () => {
  if (hayCambios.value) {
    mostrarConfirmacionCierre.value = true
    return
  }

  cerrarSinConfirmar()
}

const manejarCambioVisible = (visible) => {
  if (!visible) solicitarCierre()
}

const cancelarCierre = () => {
  mostrarConfirmacionCierre.value = false
}

const confirmarCierre = () => {
  mostrarConfirmacionCierre.value = false
  cerrarSinConfirmar()
}

const actualizar = () => {
  if (!puedeActualizar.value) return

  emit('actualizar', {
    contrato: contratoFinal.value,
    origen: origenSeleccionado.value
  })

  limpiarFormulario()
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

.jobtype-contrato-edit-control--readonly:disabled {
  border-color: #d1d1d1;
  background: #eeeeee;
  color: #444;
  opacity: 1;
}

.jobtype-contrato-edit-float-field {
  position: relative;
  margin-top: 20px;
}

.jobtype-contrato-edit-float-field label {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 11px;
  padding: 0 4px;
  background: #fff;
  color: #74848e;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  pointer-events: none;
  transform: translateY(-50%);
  transition: top .16s ease, color .16s ease, font-size .16s ease, transform .16s ease;
}

.jobtype-contrato-edit-float-field--active label {
  top: 0;
  color: #008fa1;
  font-size: 10px;
  transform: translateY(-50%);
}

.jobtype-contrato-edit-control--new:focus,
:global(.jobtype-contrato-edit-control--select.p-select.p-focus) {
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
  outline: none;
}

:global(.jobtype-contrato-edit-control--select .p-select-label) {
  display: flex;
  align-items: center;
  padding: 0 9px;
  font-size: 13px;
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

.jobtype-contrato-unsaved__button--cancel,
.jobtype-contrato-unsaved__button--cancel:hover,
.jobtype-contrato-unsaved__button--cancel:focus,
.jobtype-contrato-unsaved__button--cancel:active {
  background: #fff;
  color: #0097a7;
}

.jobtype-contrato-unsaved__button--accept,
.jobtype-contrato-unsaved__button--accept:hover,
.jobtype-contrato-unsaved__button--accept:focus,
.jobtype-contrato-unsaved__button--accept:active {
  background: #00acc1;
  color: #fff;
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

  .jobtype-contrato-edit-float-field {
    margin-top: 0;
  }

  :global(.jobtype-contrato-edit-dialog .jobtype-contrato-edit-update) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
