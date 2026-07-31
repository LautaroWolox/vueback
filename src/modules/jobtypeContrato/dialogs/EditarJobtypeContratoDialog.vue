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
        <label for="jc-edit-jobtype">JobType</label>
        <InputText
          id="jc-edit-jobtype"
          :model-value="jobtype"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--contrato">
        <label for="jc-edit-contrato-actual">Contrato</label>
        <InputText
          id="jc-edit-contrato-actual"
          :model-value="contratoActual"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--pais">
        <label for="jc-edit-pais">País</label>
        <InputText
          id="jc-edit-pais"
          :model-value="pais"
          disabled
          class="jobtype-contrato-edit-control jobtype-contrato-edit-control--readonly"
        />
      </div>

      <div class="jobtype-contrato-edit-field jobtype-contrato-edit-field--nuevo">
        <label for="jc-edit-nuevo-contrato">Nuevo Contrato</label>
        <AutoComplete
          id="jc-edit-nuevo-contrato"
          v-model="nuevoContrato"
          :suggestions="contratoSuggestions"
          optionLabel="valor"
          :minLength="4"
          class="jobtype-contrato-edit-control"
          inputClass="jobtype-contrato-edit-control"
          @complete="buscarContratos"
          @item-select="onContratoSelect"
          @clear="contratoSelectedItem = null"
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

  <!-- Guard: cambios sin guardar -->
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
  visible:         { type: Boolean, default: false },
  tareaContratoId: { type: Number,  default: 0 },
  jobtype:         { type: String,  default: '' },
  contratoActual:  { type: String,  default: '' },
  pais:            { type: String,  default: '' }
})

const emit = defineEmits(['update:visible', 'actualizado'])

const store = useJobtypeContratoStore()

const dialogStyle         = 'width: min(900px, calc(100vw - 32px)); max-width: 900px;'
const nuevoContrato       = ref('')
const contratoSuggestions = ref([])
const contratoSelectedItem = ref(null)
const showConfirmCierre   = ref(false)

const hayCambios      = computed(() => Boolean(contratoSelectedItem.value))
const puedeActualizar = computed(() => hayCambios.value)

watch(() => props.visible, (val) => {
  if (val) {
    nuevoContrato.value        = ''
    contratoSelectedItem.value = null
    showConfirmCierre.value    = false
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
    cerrar()
    emit('actualizado')
  } catch { /* error en store.error */ }
}

const solicitarCierre = () => {
  if (hayCambios.value) { showConfirmCierre.value = true; return }
  cerrar()
}

const onVisibleChange = (val) => { if (!val) solicitarCierre() }
const cancelarCierre  = () => { showConfirmCierre.value = false }
const confirmarCierre = () => { showConfirmCierre.value = false; cerrar() }

const cerrar = () => {
  nuevoContrato.value        = ''
  contratoSelectedItem.value = null
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

.jobtype-contrato-edit-close {
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

.jobtype-contrato-edit-close:hover {
  color: #00a9bd;
}

.jobtype-contrato-edit-content {
  min-height: 170px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'jobtype contrato pais'
    '. nuevo .';
  align-items: start;
  column-gap: 20px;
  row-gap: 14px;
  padding: 16px 0 28px;
}

.jobtype-contrato-edit-field--jobtype  { grid-area: jobtype; }
.jobtype-contrato-edit-field--contrato { grid-area: contrato; }
.jobtype-contrato-edit-field--pais     { grid-area: pais; }
.jobtype-contrato-edit-field--nuevo    { grid-area: nuevo; }

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

@media (max-width: 760px) {
  .jobtype-contrato-edit-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      'jobtype'
      'contrato'
      'pais'
      'nuevo';
    row-gap: 14px;
    padding: 16px 0 22px;
  }
}
</style>

<style>
/* Dialog styles — no-scoped porque el Dialog se teletransporta a body */
.jobtype-contrato-edit-dialog.p-dialog {
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
}

.jobtype-contrato-edit-dialog .p-dialog-header {
  min-height: 56px;
  padding: 12px 16px;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

.jobtype-contrato-edit-dialog .p-dialog-content {
  padding: 0 16px;
  background: #fff;
}

.jobtype-contrato-edit-dialog .p-dialog-footer {
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 16px;
  border-top: 1px solid #dedede;
  background: #fff;
}

.jobtype-contrato-edit-dialog .jobtype-contrato-edit-update {
  width: 108px !important;
  min-width: 108px !important;
  height: 32px !important;
  min-height: 32px !important;
  border-radius: 16px !important;
  font-size: 12px !important;
}
</style>
