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
    <template #header>
      <div class="joco-edit-header">
        <h2 class="joco-edit-header__title">Edición Jobtype-Contrato</h2>
        <button
          type="button"
          class="joco-edit-header__close"
          title="Cerrar"
          aria-label="Cerrar"
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
          :disabled="!puedeActualizar"
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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useJobtypeContratoStore } from '../store/jobtypeContratoStore'

const props = defineProps({
  visible: { type: Boolean, default: false },
  tareaContratoId: { type: Number, default: 0 },
  contratoTipoId: { type: Number, default: 0 },
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

const esParaguay = computed(() => {
  const paisNormalizado = props.pais.trim().toUpperCase()
  return paisNormalizado === 'PY' || paisNormalizado === '2'
})

const origenInicial = computed(() => {
  const actual = props.origenActual.trim()
  if (actual) return actual
  return esParaguay.value ? 'FAN' : ''
})

const origenOptions = computed(() => {
  const values = esParaguay.value ? ['FAN'] : ['', 'FAN', 'MXM']
  const actual = props.origenActual.trim()

  if (actual && !values.includes(actual)) values.push(actual)

  return values.map((value) => ({ label: value, value }))
})

const contratoFinalId = computed(() =>
  Number(contratoSelectedItem.value?.contratoId ?? props.contratoTipoId ?? 0)
)

const cambioContrato = computed(() => Boolean(contratoSelectedItem.value))
const cambioOrigen = computed(() => origenSeleccionado.value !== origenInicial.value)
const hayCambios = computed(() => cambioContrato.value || cambioOrigen.value)
const puedeActualizar = computed(() => Boolean(
  hayCambios.value &&
  contratoFinalId.value > 0 &&
  origenSeleccionado.value
))

watch(() => props.visible, (visible) => {
  if (visible) resetForm()
  else showConfirmCierre.value = false
})

const resetForm = () => {
  nuevoContrato.value = ''
  contratoSelectedItem.value = null
  origenSeleccionado.value = origenInicial.value
  showConfirmCierre.value = false
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

const actualizar = async () => {
  if (!puedeActualizar.value) return

  try {
    await store.actualizarRelacion(
      props.tareaContratoId,
      contratoFinalId.value,
      origenSeleccionado.value
    )
    cerrar()
    emit('actualizado')
  } catch {
    // El mensaje queda disponible en store.error.
  }
}

const solicitarCierre = () => {
  if (hayCambios.value) {
    showConfirmCierre.value = true
    return
  }
  cerrar()
}

const onVisibleChange = (visible) => {
  if (!visible) solicitarCierre()
}

const cancelarCierre = () => {
  showConfirmCierre.value = false
}

const confirmarCierre = () => {
  showConfirmCierre.value = false
  cerrar()
}

const cerrar = () => {
  resetForm()
  emit('update:visible', false)
}
</script>

<style>
.p-dialog.joco-edit-dialog {
  width: min(1220px, calc(100dvw - 48px)) !important;
  max-width: calc(100dvw - 48px) !important;
  overflow: hidden;
  border: 1px solid #cdd8de;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(18, 43, 53, .26);
}

.joco-edit-dialog .p-dialog-header {
  padding: 0 !important;
  border-bottom: 1px solid #d5dfe4;
  background: #fff;
}

.joco-edit-dialog .p-dialog-content {
  padding: 0 !important;
  overflow: visible !important;
  background: #fff;
}

.joco-edit-dialog .p-dialog-footer {
  padding: 0 !important;
  border-top: 1px solid #d5dfe4;
  background: #fff;
}

.joco-edit-dialog .joco-edit-autocomplete.p-autocomplete,
.joco-edit-dialog .joco-edit-select.p-select {
  width: 100% !important;
}

.joco-edit-dialog .joco-edit-input,
.joco-edit-dialog .joco-edit-select.p-select {
  height: 42px !important;
  min-height: 42px !important;
  font-size: 13px !important;
  box-sizing: border-box !important;
}

.joco-edit-dialog .joco-edit-input {
  width: 100% !important;
  padding: 0 12px !important;
}

.joco-edit-dialog .joco-edit-select.p-select .p-select-label {
  display: flex !important;
  align-items: center !important;
  padding: 0 12px !important;
  font-size: 13px !important;
}

.joco-edit-dialog .joco-edit-update-button.p-button {
  min-width: 150px !important;
  height: 42px !important;
  min-height: 42px !important;
  border-radius: 7px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
}

.joco-edit-select-overlay {
  min-width: 140px !important;
}
</style>

<style scoped>
.joco-edit-header {
  width: 100%;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px 0 42px;
  box-sizing: border-box;
}

.joco-edit-header__title {
  margin: 0;
  color: #263746;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.2;
}

.joco-edit-header__close {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 25px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.joco-edit-header__close:hover {
  color: #00a9bd;
}

.joco-edit-body {
  padding: 34px 42px 38px;
  box-sizing: border-box;
}

.joco-edit-form {
  display: grid;
  grid-template-columns: minmax(220px, 1.45fr) minmax(170px, 1fr) minmax(110px, .7fr) minmax(210px, 1.25fr) minmax(120px, .75fr);
  gap: 18px;
  align-items: end;
}

.joco-edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.joco-edit-field > label {
  color: #171717;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.joco-edit-control {
  width: 100%;
  height: 42px;
  min-height: 42px;
  padding: 0 12px;
  box-sizing: border-box;
  text-overflow: ellipsis;
}

.joco-edit-control--readonly:disabled {
  border-color: #cbd6dc;
  background: #eef2f4;
  color: #768a96;
  opacity: 1;
}

.joco-edit-footer {
  width: 100%;
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 42px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .joco-edit-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .joco-edit-body {
    padding: 28px 30px 32px;
  }
}

@media (max-width: 620px) {
  .joco-edit-header {
    padding: 0 16px 0 20px;
  }

  .joco-edit-header__title {
    font-size: 20px;
  }

  .joco-edit-form {
    grid-template-columns: 1fr;
  }

  .joco-edit-body {
    padding: 24px 18px 28px;
  }

  .joco-edit-footer {
    padding: 0 18px;
  }
}
</style>
