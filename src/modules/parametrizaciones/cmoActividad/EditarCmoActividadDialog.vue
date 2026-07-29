<template>
  <Dialog
    :visible="visible"
    append-to="body"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="true"
    :resizable="false"
    class="cmo-edit-dialog"
    :style="dialogStyle"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="edit-header">
        <h2>Edición CMO-Actividad</h2>
        <button type="button" class="edit-close" title="Cerrar" aria-label="Cerrar" @click="requestClose">×</button>
      </div>
    </template>

    <div class="edit-content">
      <div class="edit-field">
        <label for="edit-cmo-actividad">Actividad</label>
        <InputText id="edit-cmo-actividad" :model-value="actividad" disabled class="edit-control edit-control--readonly" />
      </div>

      <div class="edit-field">
        <label for="edit-cmo-actual">CMO actual</label>
        <InputText id="edit-cmo-actual" :model-value="cmoActual" disabled class="edit-control edit-control--readonly" />
      </div>

      <div class="edit-field">
        <label for="edit-cmo-nuevo">Nuevo CMO</label>
        <InputText
          id="edit-cmo-nuevo"
          v-model="nuevoCmo"
          class="edit-control"
          @keyup.enter="update"
        />
      </div>
    </div>

    <template #footer>
      <FmButton label="ACTUALIZAR" class="edit-update" :disabled="!canUpdate" @click="update" />
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
import ConfirmarAccionDialog from '../shared/ConfirmarAccionDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  actividad: { type: String, default: '' },
  cmoActual: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'actualizar'])

const dialogStyle = 'width: min(620px, calc(100vw - 32px)); max-width: 620px;'
const nuevoCmo = ref('')
const showUnsavedConfirm = ref(false)

const normalizedCmo = computed(() => nuevoCmo.value.trim())
const hasChanges = computed(() => Boolean(
  normalizedCmo.value && normalizedCmo.value !== props.cmoActual.trim()
))
const canUpdate = computed(() => hasChanges.value)

const reset = () => {
  nuevoCmo.value = ''
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
  emit('actualizar', normalizedCmo.value)
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

.edit-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #a5afb4;
  font-size: 22px;
  cursor: pointer;
}

.edit-close:hover {
  color: #00a9bd;
}

.edit-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding: 18px 0 26px;
}

.edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.edit-field:last-child {
  grid-column: 2;
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

.edit-update {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
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
  padding: 0 20px;
}

:global(.cmo-edit-dialog .p-dialog-footer) {
  padding: 12px 20px 16px;
  border-top: 1px solid #d9dfe2;
}

@media (max-width: 620px) {
  .edit-content {
    grid-template-columns: minmax(0, 1fr);
  }

  .edit-field:last-child {
    grid-column: auto;
  }
}
</style>
