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

    <!--
      Layout de escritorio (>1100 px): 4 columnas en una fila
        Jobtype | Contrato actual | País | Nuevo Contrato
    -->
    <div class="joco-edit-body">
      <div class="joco-edit-form">
        <div class="joco-edit-field">
          <label for="joco-edit-jobtype">JobType</label>
          <InputText
            id="joco-edit-jobtype"
            :model-value="jobtype"
            disabled
            class="joco-edit-control joco-edit-control--readonly"
          />
        </div>

        <div class="joco-edit-field">
          <label for="joco-edit-contrato-actual">Contrato</label>
          <InputText
            id="joco-edit-contrato-actual"
            :model-value="contratoActual"
            disabled
            class="joco-edit-control joco-edit-control--readonly"
          />
        </div>

        <div class="joco-edit-field">
          <label for="joco-edit-pais">País</label>
          <InputText
            id="joco-edit-pais"
            :model-value="pais"
            disabled
            class="joco-edit-control joco-edit-control--readonly"
          />
        </div>

        <div class="joco-edit-field">
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
            @clear="contratoSelectedItem = null"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="joco-edit-footer">
        <FmButton
          label="ACTUALIZAR"
          class="joco-edit-update-btn"
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
  visible:         { type: Boolean, default: false },
  tareaContratoId: { type: Number,  default: 0 },
  jobtype:         { type: String,  default: '' },
  contratoActual:  { type: String,  default: '' },
  pais:            { type: String,  default: '' }
})

const emit = defineEmits(['update:visible', 'actualizado'])

const store = useJobtypeContratoStore()

const nuevoContrato        = ref('')
const contratoSuggestions  = ref([])
const contratoSelectedItem = ref(null)
const showConfirmCierre    = ref(false)

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

<!-- ─── Estilos del Dialog que se teletransporta a body ─── -->
<style>
.p-dialog.joco-edit-dialog {
  width: min(860px, calc(100dvw - 32px)) !important;
  max-width: calc(100dvw - 32px) !important;
  /* Sin altura fija — el diálogo se ajusta al contenido sin espacio vacío */
  overflow: hidden;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .28);
  box-sizing: border-box;
}

.joco-edit-dialog .p-dialog-header {
  padding: 0 !important;
  border-bottom: 1px solid #dedede;
  background: #fff;
}

.joco-edit-dialog .p-dialog-content {
  padding: 0 !important;
  background: #fff;
  overflow: visible !important;
}

.joco-edit-dialog .p-dialog-footer {
  padding: 0 !important;
  border-top: 1px solid #dedede;
  background: #fff;
}

/* Botón ACTUALIZAR compacto */
.joco-edit-dialog .joco-edit-update-btn.p-button {
  width: 110px !important;
  min-width: 110px !important;
  height: 32px !important;
  min-height: 32px !important;
  border-radius: 16px !important;
  font-size: 12px !important;
}

/* AutoComplete dentro del diálogo de edición */
.joco-edit-dialog .joco-edit-autocomplete.p-autocomplete {
  width: 100% !important;
}

.joco-edit-dialog .joco-edit-input {
  width: 100% !important;
  height: 32px !important;
  min-height: 32px !important;
  font-size: 13px !important;
  box-sizing: border-box !important;
}
</style>

<!-- ─── Estilos scoped para el layout interno ─── -->
<style scoped>
/* ── Header ── */
.joco-edit-header {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  box-sizing: border-box;
}

.joco-edit-header__title {
  margin: 0;
  color: #263746;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
}

.joco-edit-header__close {
  flex: 0 0 auto;
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
  transition: color .14s ease;
}

.joco-edit-header__close:hover { color: #00a9bd; }

/* ── Body ── */
.joco-edit-body {
  padding: 20px 16px 24px;
  box-sizing: border-box;
}

/* ── Formulario: 4 columnas en escritorio (>1100 px) ── */
.joco-edit-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
  box-sizing: border-box;
}

.joco-edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.joco-edit-field > label {
  color: #202020;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* Controles de solo lectura */
.joco-edit-control {
  width: 100%;
  height: 32px;
  min-height: 32px;
  box-sizing: border-box;
}

.joco-edit-control--readonly:disabled {
  border-color: #d1d1d1;
  background: #eeeeee;
  color: #444;
  opacity: 1;
}

/* ── Footer ── */
.joco-edit-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 16px;
  min-height: 52px;
  box-sizing: border-box;
}

/* ────────────────────────────
   Responsive
   ──────────────────────────── */

/* 700–1100 px: 2 columnas */
@media (max-width: 1100px) {
  .joco-edit-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* < 700 px: 1 columna */
@media (max-width: 700px) {
  .joco-edit-form {
    grid-template-columns: 1fr;
  }

  .joco-edit-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
