<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="cmo-edit-dialog"
    :style="dialogStyle"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="cmo-edit-header">
        <h2>Edición CMO-Actividad</h2>
        <button
          type="button"
          class="cmo-edit-close"
          title="Cerrar"
          aria-label="Cerrar"
          @click="cerrar"
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
        <InputText
          id="cmo-edit-nuevo"
          v-model="nuevoCmo"
          class="cmo-edit-control"
          aria-label="Nuevo CMO"
          @keyup.enter="actualizar"
        />
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
const dialogStyle = 'width: min(640px, calc(100vw - 32px)); max-width: 640px;'

const puedeActualizar = computed(() => {
  const value = nuevoCmo.value.trim()
  return Boolean(value && value !== props.cmoActual.trim())
})

watch(() => props.visible, (visible) => {
  if (visible) nuevoCmo.value = ''
})

const cerrar = () => {
  nuevoCmo.value = ''
  emit('update:visible', false)
}

const actualizar = () => {
  if (!puedeActualizar.value) return
  emit('actualizar', nuevoCmo.value.trim())
  nuevoCmo.value = ''
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
  font-size: 21px;
  font-weight: 400;
}

.cmo-edit-close {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #9aa4aa;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.cmo-edit-close:hover {
  color: #00a9bd;
}

.cmo-edit-content {
  min-height: 210px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 42px;
  padding: 28px 14px 34px;
}

.cmo-edit-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cmo-edit-field label {
  color: #202020;
  font-size: 16px;
  font-weight: 600;
}

.cmo-edit-field--cmo {
  gap: 14px;
}

.cmo-edit-field--cmo label {
  margin-bottom: -4px;
}

.cmo-edit-control {
  width: 100%;
  height: 42px;
  box-sizing: border-box;
}

.cmo-edit-control--readonly:disabled {
  border-color: #d6dcdf;
  background: #f6f7f7;
  color: #8d969b;
  opacity: 1;
}

:global(.p-dialog.cmo-edit-dialog) {
  overflow: hidden;
  border-radius: 4px;
}

:global(.cmo-edit-dialog .p-dialog-header) {
  padding: 22px 28px;
  border-bottom: 1px solid #d9dfe2;
}

:global(.cmo-edit-dialog .p-dialog-content) {
  padding: 0 18px;
}

:global(.cmo-edit-dialog .p-dialog-footer) {
  display: flex;
  justify-content: flex-end;
  padding: 16px 28px 22px;
  border-top: 1px solid #d9dfe2;
}

:global(.cmo-edit-dialog .cmo-edit-update) {
  width: 150px !important;
  min-width: 150px !important;
  max-width: 150px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  border-radius: 18px !important;
}

@media (max-width: 640px) {
  .cmo-edit-content {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 22px 4px 28px;
  }

  :global(.cmo-edit-dialog .cmo-edit-update) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
