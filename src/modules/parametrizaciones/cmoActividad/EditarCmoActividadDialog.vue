<template>
  <Dialog
    :visible="visible"
    appendTo="body"
    modal
    :closable="false"
    :draggable="true"
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
const dialogStyle = 'width: min(520px, calc(100vw - 32px)); max-width: 520px;'

const puedeActualizar = computed(() => {
  const value = nuevoCmo.value.trim()
  return Boolean(value && value !== props.cmoActual.trim())
})

watch(() => props.visible, (visible) => {
  if (visible) {
    nuevoCmo.value = ''
    nuevoCmoFocused.value = false
  }
})

const cerrar = () => {
  nuevoCmo.value = ''
  nuevoCmoFocused.value = false
  emit('update:visible', false)
}

const actualizar = () => {
  if (!puedeActualizar.value) return
  emit('actualizar', nuevoCmo.value.trim())
  nuevoCmo.value = ''
  nuevoCmoFocused.value = false
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
