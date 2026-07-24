<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="true"
    :resizable="false"
    class="jobtype-contrato-edit-dialog"
    :style="dialogStyle"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="jobtype-contrato-edit-header">
        <h2>Edición Jobtype-Contrato</h2>
        <button
          type="button"
          class="jobtype-contrato-edit-close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cerrar"
        >×</button>
      </div>
    </template>

    <div class="jobtype-contrato-edit-content">
      <div class="jobtype-contrato-edit-field">
        <label for="jobtype-contrato-edit-jobtype">Jobtype</label>
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

        <div
          class="jobtype-contrato-edit-float-field"
          :class="{ 'jobtype-contrato-edit-float-field--active': nuevoContratoFocused || nuevoContrato.length > 0 }"
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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

const props = defineProps({
  visible: { type: Boolean, default: false },
  jobtype: { type: String, default: '' },
  contratoActual: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'actualizar'])
const nuevoContrato = ref('')
const nuevoContratoFocused = ref(false)
const dialogStyle = 'width: min(520px, calc(100vw - 32px)); max-width: 520px;'

const puedeActualizar = computed(() => {
  const value = nuevoContrato.value.trim()
  return Boolean(value && value !== props.contratoActual.trim())
})

watch(() => props.visible, (visible) => {
  if (visible) {
    nuevoContrato.value = ''
    nuevoContratoFocused.value = false
  }
})

const cerrar = () => {
  nuevoContrato.value = ''
  nuevoContratoFocused.value = false
  emit('update:visible', false)
}

const actualizar = () => {
  if (!puedeActualizar.value) return
  emit('actualizar', nuevoContrato.value.trim())
  nuevoContrato.value = ''
  nuevoContratoFocused.value = false
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
  font-size: 20px;
  font-weight: 400;
}

.jobtype-contrato-edit-close {
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

.jobtype-contrato-edit-close:hover {
  color: #00a9bd;
}

.jobtype-contrato-edit-content {
  min-height: 150px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 28px;
  padding: 22px 8px 24px;
}

.jobtype-contrato-edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jobtype-contrato-edit-field label {
  color: #202020;
  font-size: 14px;
  font-weight: 600;
}

.jobtype-contrato-edit-field--contrato {
  gap: 12px;
}

.jobtype-contrato-edit-control {
  width: 100%;
  height: 38px;
  box-sizing: border-box;
}

.jobtype-contrato-edit-control--readonly:disabled {
  border-color: #d6dcdf;
  background: #f1f4f5;
  color: #8d969b;
  opacity: 1;
}

.jobtype-contrato-edit-float-field {
  position: relative;
  margin-top: 2px;
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

.jobtype-contrato-edit-control--new:focus {
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
  outline: none;
}

:global(.p-dialog.jobtype-contrato-edit-dialog) {
  overflow: hidden;
  border-radius: 6px;
}

:global(.jobtype-contrato-edit-dialog .p-dialog-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #d9dfe2;
}

:global(.jobtype-contrato-edit-dialog .p-dialog-content) {
  padding: 0 16px;
}

:global(.jobtype-contrato-edit-dialog .p-dialog-footer) {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 16px;
  border-top: 1px solid #d9dfe2;
}

:global(.jobtype-contrato-edit-dialog .jobtype-contrato-edit-update) {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  border-radius: 6px !important;
}

@media (max-width: 560px) {
  .jobtype-contrato-edit-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 18px 2px 22px;
  }

  :global(.jobtype-contrato-edit-dialog .jobtype-contrato-edit-update) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
