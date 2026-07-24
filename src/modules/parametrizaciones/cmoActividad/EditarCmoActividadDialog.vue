<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="true"
    :resizable="false"
    class="cmo-edit-dialog"
    :style="dialogStyle"
    @update:visible="manejarCambioVisible"
  >
    <template #header>
      <div class="cmo-edit-header">
        <h2>Edición CMO-Actividad</h2>
        <button
          type="button"
          class="cmo-edit-close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="solicitarCierre"
        >×</button>
      </div>
    </template>

    <div class="cmo-edit-content">
      <div class="cmo-edit-field">
        <label for="cmo-edit-actividad">Actividad</label>
        <InputText
          id="cmo-edit-actividad"
          :model-value="actividad"
          disabled
          class="cmo-edit-control cmo-edit-control--readonly"
        />
      </div>

      <div class="cmo-edit-field cmo-edit-field--cmo">
        <label for="cmo-edit-actual">CMO</label>
        <InputText
          id="cmo-edit-actual"
          :model-value="cmoActual"
          disabled
          class="cmo-edit-control cmo-edit-control--readonly"
        />

        <div
          class="cmo-edit-float-field"
          :class="{ 'cmo-edit-float-field--active': nuevoCmoFocused || nuevoCmo.length > 0 }"
        >
          <InputText
            id="cmo-edit-nuevo"
            v-model="nuevoCmo"
            class="cmo-edit-control cmo-edit-control--new"
            aria-label="Nuevo CMO"
            @focus="nuevoCmoFocused = true"
            @blur="nuevoCmoFocused = false"
            @keyup.enter="actualizar"
          />
          <label for="cmo-edit-nuevo">Nuevo CMO</label>
        </div>
      </div>
    </div>

    <template #footer>
      <FmButton
        label="ACTUALIZAR"
        class="cmo-edit-update"
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
    class="cmo-unsaved-dialog"
    :style="confirmDialogStyle"
  >
    <template #header>
      <div class="cmo-unsaved__header">
        <div class="cmo-unsaved__header-main">
          <span class="cmo-unsaved__icon-circle">
            <i class="pi pi-bell cmo-unsaved__header-icon" aria-hidden="true" />
          </span>
          <span class="cmo-unsaved__title">Confirmar Accion</span>
        </div>

        <button
          type="button"
          class="cmo-unsaved__close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cancelarCierre"
        >×</button>
      </div>
    </template>

    <div class="cmo-unsaved__content">
      <span class="cmo-unsaved__message">
        Hay cambios sin guardar. ¿Confirma que desea cancelar?
      </span>
    </div>

    <template #footer>
      <div class="cmo-unsaved__actions">
        <button
          type="button"
          class="cmo-unsaved__button cmo-unsaved__button--cancel"
          @click="cancelarCierre"
        >
          CANCELAR
        </button>
        <button
          type="button"
          class="cmo-unsaved__button cmo-unsaved__button--accept"
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

const props = defineProps({
  visible: { type: Boolean, default: false },
  actividad: { type: String, default: '' },
  cmoActual: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'actualizar'])
const nuevoCmo = ref('')
const nuevoCmoFocused = ref(false)
const mostrarConfirmacionCierre = ref(false)
const dialogStyle = 'width: min(520px, calc(100vw - 32px)); max-width: 520px;'
const confirmDialogStyle = 'width: min(540px, calc(100vw - 32px)); max-width: 540px;'

const nuevoCmoNormalizado = computed(() => nuevoCmo.value.trim())
const hayCambios = computed(() => Boolean(
  nuevoCmoNormalizado.value && nuevoCmoNormalizado.value !== props.cmoActual.trim()
))
const puedeActualizar = computed(() => hayCambios.value)

const limpiarFormulario = () => {
  nuevoCmo.value = ''
  nuevoCmoFocused.value = false
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
  emit('actualizar', nuevoCmoNormalizado.value)
  limpiarFormulario()
}
</script>

<style scoped>
.cmo-edit-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.cmo-edit-header h2 {
  margin: 0;
  color: #263746;
  font-size: 20px;
  font-weight: 400;
}

.cmo-edit-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #9aa4aa;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.cmo-edit-close:hover {
  color: #00a9bd;
}

.cmo-edit-content {
  min-height: 150px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 28px;
  padding: 22px 8px 24px;
}

.cmo-edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cmo-edit-field label {
  color: #202020;
  font-size: 14px;
  font-weight: 600;
}

.cmo-edit-field--cmo {
  gap: 12px;
}

.cmo-edit-control {
  width: 100%;
  height: 38px;
  box-sizing: border-box;
}

.cmo-edit-control--readonly:disabled {
  border-color: #d6dcdf;
  background: #f1f4f5;
  color: #8d969b;
  opacity: 1;
}

.cmo-edit-float-field {
  position: relative;
  margin-top: 2px;
}

.cmo-edit-float-field label {
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

.cmo-edit-float-field--active label {
  top: 0;
  color: #008fa1;
  font-size: 10px;
  transform: translateY(-50%);
}

.cmo-edit-control--new:focus {
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
  outline: none;
}

:global(.p-dialog.cmo-edit-dialog) {
  overflow: hidden;
  border-radius: 6px;
}

:global(.cmo-edit-dialog .p-dialog-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #d9dfe2;
}

:global(.cmo-edit-dialog .p-dialog-content) {
  padding: 0 16px;
}

:global(.cmo-edit-dialog .p-dialog-footer) {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 16px;
  border-top: 1px solid #d9dfe2;
}

:global(.cmo-edit-dialog .cmo-edit-update) {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  border-radius: 6px !important;
}

.cmo-unsaved__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.cmo-unsaved__header-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.cmo-unsaved__icon-circle {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8fa;
}

.cmo-unsaved__header-icon {
  color: #11aabd;
  font-size: 23px;
}

.cmo-unsaved__title {
  color: #252b33;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.cmo-unsaved__close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c7c7c7;
  font-size: 21px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.cmo-unsaved__close:hover {
  color: #00a9bd;
}

.cmo-unsaved__content {
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 18px 4px;
}

.cmo-unsaved__message {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.35;
}

.cmo-unsaved__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

:global(.p-dialog.cmo-unsaved-dialog) {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

:global(.cmo-unsaved-dialog .p-dialog-header) {
  min-height: 68px;
  padding: 12px 18px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

:global(.cmo-unsaved-dialog .p-dialog-content) {
  padding: 0 18px;
  background: #fff;
}

:global(.cmo-unsaved-dialog .p-dialog-footer) {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  border-top: 1px solid #dedede;
  background: #fff;
}

.cmo-unsaved__button {
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

.cmo-unsaved__button--cancel,
.cmo-unsaved__button--cancel:hover,
.cmo-unsaved__button--cancel:focus,
.cmo-unsaved__button--cancel:active {
  background: #fff;
  color: #0097a7;
}

.cmo-unsaved__button--accept,
.cmo-unsaved__button--accept:hover,
.cmo-unsaved__button--accept:focus,
.cmo-unsaved__button--accept:active {
  background: #00acc1;
  color: #fff;
}

@media (max-width: 560px) {
  .cmo-edit-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 18px 2px 22px;
  }

  :global(.cmo-edit-dialog .cmo-edit-update) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
