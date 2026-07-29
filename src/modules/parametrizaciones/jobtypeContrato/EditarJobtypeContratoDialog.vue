<template>
  <Dialog
    :visible="visible"
    append-to="body"
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
      <div class="edit-header">
        <h2>Edición Jobtype-Contrato</h2>
        <ParametrizacionCloseButton @click="requestClose" />
      </div>
    </template>

    <div class="edit-content">
      <div class="edit-field">
        <label for="edit-contrato-jobtype">Jobtype</label>
        <InputText id="edit-contrato-jobtype" :model-value="jobtype" disabled class="edit-control edit-control--readonly" />
      </div>

      <div class="edit-field">
        <label for="edit-contrato-actual">Contrato</label>
        <InputText id="edit-contrato-actual" :model-value="contratoActual" disabled class="edit-control edit-control--readonly" />
      </div>

      <div class="edit-field">
        <label for="edit-contrato-pais">País</label>
        <InputText id="edit-contrato-pais" :model-value="pais" disabled class="edit-control edit-control--readonly" />
      </div>

      <div class="edit-field">
        <label for="edit-contrato-nuevo">Nuevo contrato</label>
        <InputText
          id="edit-contrato-nuevo"
          v-model="nuevoContrato"
          class="edit-control"
          @keyup.enter="update"
        />
      </div>

      <div class="edit-field">
        <label for="edit-contrato-origen">Origen</label>
        <Select
          id="edit-contrato-origen"
          v-model="origenSeleccionado"
          :options="origenOptions"
          option-label="label"
          option-value="value"
          class="edit-control"
        />
      </div>
    </div>

    <template #footer>
      <ParametrizacionButton
        label="ACTUALIZAR"
        size="wide"
        :disabled="!canUpdate"
        @click="update"
      />
    </template>
  </Dialog>

  <ConfirmarAccionDialog
    v-model:visible="showUnsavedConfirm"
    title="Confirmar acción"
    message="Hay cambios sin guardar. ¿Confirma que desea cancelar?"
    @accept="closeWithoutSaving"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ParametrizacionButton from '../shared/ParametrizacionButton.vue'
import ParametrizacionCloseButton from '../shared/ParametrizacionCloseButton.vue'
import ConfirmarAccionDialog from '../shared/ConfirmarAccionDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  jobtype: { type: String, default: '' },
  contratoActual: { type: String, default: '' },
  pais: { type: String, default: '' },
  origenActual: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'actualizar'])

const dialogStyle = 'width: min(900px, calc(100vw - 32px)); max-width: 900px;'
const nuevoContrato = ref('')
const origenSeleccionado = ref('')
const showUnsavedConfirm = ref(false)

const origenOptions = computed(() => {
  const values = props.pais === 'PY' ? ['FAN'] : ['', 'FAN', 'MXM']
  const actual = props.origenActual.trim()
  if (actual && !values.includes(actual)) values.push(actual)
  return values.map((value) => ({ label: value, value }))
})

const contratoIngresado = computed(() => nuevoContrato.value.trim())
const contratoFinal = computed(() => contratoIngresado.value || props.contratoActual.trim())
const changedContract = computed(() => Boolean(
  contratoIngresado.value && contratoIngresado.value !== props.contratoActual.trim()
))
const changedOrigin = computed(() => origenSeleccionado.value !== props.origenActual.trim())
const hasChanges = computed(() => changedContract.value || changedOrigin.value)
const canUpdate = computed(() => Boolean(
  hasChanges.value && contratoFinal.value && origenSeleccionado.value
))

const reset = () => {
  nuevoContrato.value = ''
  origenSeleccionado.value = props.origenActual.trim()
  showUnsavedConfirm.value = false
}

watch(() => props.visible, (visible) => {
  if (visible) reset()
})

const closeWithoutSaving = () => {
  reset()
  emit('update:visible', false)
}

const requestClose = () => {
  if (hasChanges.value) {
    showUnsavedConfirm.value = true
    return
  }
  closeWithoutSaving()
}

const onVisibleChange = (visible) => {
  if (!visible) requestClose()
}

const update = () => {
  if (!canUpdate.value) return

  emit('actualizar', {
    contrato: contratoFinal.value,
    origen: origenSeleccionado.value
  })
  reset()
}
</script>

<style scoped>
.edit-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.edit-header h2 {
  margin: 0;
  color: #263746;
  font-size: 18px;
  font-weight: 500;
}

.edit-content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  padding: 18px 0 26px;
}

.edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.edit-field label {
  color: #263746;
  font-size: 12px;
  font-weight: 600;
}

.edit-control {
  width: 100%;
  min-width: 0;
  height: 34px;
}

.edit-control--readonly:disabled {
  border-color: #d1d1d1;
  background: #eeeeee;
  color: #444;
  opacity: 1;
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
  padding: 0 20px;
}

:global(.jobtype-contrato-edit-dialog .p-dialog-footer) {
  padding: 12px 20px 16px;
  border-top: 1px solid #d9dfe2;
}

@media (max-width: 760px) {
  .edit-content {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
