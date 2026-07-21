<template>
  <Dialog
    :visible="visibleExc"
    modal
    :closable="false"
    class="fm-dialog otf-action-dialog otf-exclude-dialog"
    :style="{ '--fm-dialog-width': '34rem' }"
    @update:visible="$emit('update:visibleExc', $event)"
  >
    <template #header>
      <div class="otf-exclude-header">
        <span>Alerta</span>
        <button
          type="button"
          class="otf-exclude-close"
          aria-label="Cerrar ventana"
          title="Cerrar"
          @click="cerrar"
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>
    </template>

    <div class="otf-exclude-content">
      <p class="otf-exclude-confirmation">{{ confirmationMessage }}</p>

      <div class="fm-field otf-motivo-field">
        <label for="motivo-exclusion">Motivo</label>
        <select
          v-if="status.motivos === 'loading'"
          id="motivo-exclusion"
          class="otf-motivo-select"
          disabled
        >
          <option>Cargando...</option>
        </select>
        <select
          v-else-if="status.motivos === 'loaded'"
          id="motivo-exclusion"
          v-model="motivoSelected"
          class="otf-motivo-select"
        >
          <option :value="null"></option>
          <option
            v-for="motivo in motivoOptions"
            :key="motivo.nombreCorto"
            :value="motivo"
          >
            {{ motivo.nombre }}
          </option>
        </select>
        <span v-else-if="status.motivos === 'error'" class="fm-field-error">Error al cargar.</span>
      </div>

      <div class="fm-field otf-nota-field">
        <label for="comentario-exclusion">Nota</label>
        <textarea
          id="comentario-exclusion"
          v-model="comentario"
          class="otf-note-textarea"
          rows="5"
          placeholder="Opcional"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <FmButton
        class="otf-exclude-cancel"
        label="CANCELAR"
        variant="outline"
        @click="cerrar"
      />
      <FmButton
        class="otf-exclude-accept"
        label="ACEPTAR"
        :disabled="!motivoSelected?.nombreCorto || store.loading"
        @click="confirmar"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFallidasCtStore } from '../store/CtFallidaStore'
import { useCommonCtStore } from '@/store/commonCt'

const props = defineProps({
  visibleExc: Boolean,
  selectedRows: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visibleExc'])
const store = useFallidasCtStore()
const commonCT = useCommonCtStore()
const { motivos, status } = storeToRefs(commonCT)
const motivoSelected = ref(null)
const comentario = ref('')

const motivoOptions = computed(() => motivos.value ?? [])
const confirmationMessage = computed(() => (
  props.selectedRows.length > 1
    ? `¿Confirma que desea excluir las ${props.selectedRows.length} OTs seleccionadas?`
    : '¿Confirma que desea excluir la OT seleccionada?'
))

const reset = () => {
  motivoSelected.value = null
  comentario.value = ''
}

const confirmar = async () => {
  emit('update:visibleExc', false)
  await store.sendExcluidas(motivoSelected.value.nombreCorto, comentario.value)
  reset()
  await store.setData()
  store.selectedRows = []
}

const cerrar = () => {
  emit('update:visibleExc', false)
  reset()
}

onMounted(() => commonCT.setMotivosExcInc())
</script>

<style scoped>
.otf-exclude-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.otf-exclude-confirmation {
  margin: 0 0 2px;
  color: #202020;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
}

.otf-exclude-content .fm-field {
  width: 100%;
  min-width: 0;
}

.otf-exclude-content .fm-field label {
  display: block;
  margin: 0 0 6px;
  color: #202020;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
}

.otf-motivo-field {
  width: min(340px, 100%);
  max-width: 340px;
}

.otf-motivo-select {
  width: 100%;
  height: 38px;
  min-height: 38px;
  padding: 0 36px 0 10px;
  border: 1px solid #bfc8cd;
  border-radius: 4px;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 13px;
  line-height: 38px;
  cursor: pointer;
  box-shadow: none;
}

.otf-motivo-select:focus {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
}

.otf-motivo-select:disabled {
  background: #edf1f3;
  color: #84939c;
  cursor: not-allowed;
}

.otf-motivo-select option {
  padding: 4px 8px;
  color: #263746;
  background: #fff;
  font-size: 13px;
}

.otf-note-textarea {
  width: 100%;
  max-width: 100%;
  height: 112px;
  min-height: 64px;
  padding: 10px;
  overflow: auto;
  resize: vertical;
  border: 1px solid #bfc8cd;
  border-radius: 4px;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: none;
  box-sizing: border-box;
}

.otf-note-textarea:focus {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
}

.otf-note-textarea::placeholder {
  color: #747474;
  font-family: monospace;
  font-weight: 600;
  opacity: 1;
}

.otf-exclude-header {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #4a4a4a;
  font-size: 20px;
  font-weight: 400;
}

.otf-exclude-close {
  width: 30px;
  min-width: 30px;
  height: 30px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #999;
  font-family: Arial, sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
}

.otf-exclude-close:hover {
  background: transparent;
  color: #00a9bd;
}

:global(.otf-exclude-dialog) {
  border-radius: 0 !important;
}

:global(.otf-exclude-dialog .p-dialog-header) {
  min-height: 54px !important;
  padding: 0 16px !important;
  border-bottom: 1px solid #d5dadd !important;
  background: #fff !important;
}

:global(.otf-exclude-dialog .p-dialog-content) {
  padding: 20px 18px 22px !important;
  background: #fff !important;
  overflow: visible !important;
}

:global(.otf-exclude-dialog .p-dialog-footer) {
  min-height: 62px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  padding: 10px 16px !important;
  border-top: 1px solid #d5dadd !important;
  background: #fff !important;
}

:global(.otf-exclude-dialog .otf-exclude-cancel),
:global(.otf-exclude-dialog .otf-exclude-accept) {
  width: 132px !important;
  min-width: 132px !important;
  max-width: 132px !important;
  height: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  border-radius: 6px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  box-shadow: 0 4px 10px rgba(0, 91, 104, .12) !important;
  transform: none !important;
}

:global(.otf-exclude-dialog .otf-exclude-cancel) {
  border-color: #00a9bd !important;
  background: #fff !important;
  color: #00a0b4 !important;
}

:global(.otf-exclude-dialog .otf-exclude-accept:not(:disabled)) {
  border-color: #00a9bd !important;
  background: #00a9bd !important;
  color: #fff !important;
}

:global(.otf-exclude-dialog .otf-exclude-accept:disabled) {
  border-color: #d2d9dd !important;
  background: #e6eaec !important;
  color: #adb7bd !important;
  box-shadow: none !important;
}

@media (max-width: 600px) {
  .otf-exclude-header {
    min-height: 46px;
    font-size: 19px;
  }

  .otf-exclude-confirmation,
  .otf-exclude-content .fm-field label {
    font-size: 14px;
  }

  .otf-motivo-field {
    width: 100%;
    max-width: none;
  }

  :global(.otf-exclude-dialog .p-dialog-content) {
    padding: 16px 14px 18px !important;
  }

  :global(.otf-exclude-dialog .p-dialog-footer) {
    flex-direction: column-reverse !important;
  }

  :global(.otf-exclude-dialog .otf-exclude-cancel),
  :global(.otf-exclude-dialog .otf-exclude-accept) {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
  }
}
</style>
