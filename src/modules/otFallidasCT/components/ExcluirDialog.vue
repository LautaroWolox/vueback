<template>
  <Dialog
    :visible="visibleExc"
    modal
    :closable="false"
    class="fm-dialog otf-action-dialog otf-exclude-dialog"
    :style="{ '--fm-dialog-width': '36rem' }"
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
        <Select
          id="motivo-exclusion"
          v-if="status.motivos === 'loading'"
          v-model="motivoSelected"
          disabled
          placeholder="Cargando..."
        />
        <Select
          id="motivo-exclusion"
          v-else-if="status.motivos === 'loaded'"
          v-model="motivoSelected"
          :options="motivoOptions"
          optionLabel="nombre"
          placeholder=""
          appendTo="self"
        />
        <span v-else-if="status.motivos === 'error'" class="fm-field-error">Error al cargar.</span>
      </div>

      <div class="fm-field otf-nota-field">
        <label for="comentario-exclusion">Nota</label>
        <Textarea
          id="comentario-exclusion"
          v-model="comentario"
          class="otf-note-textarea"
          rows="4"
          placeholder="Opcional"
        />
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
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
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
  margin: 0 0 6px;
  color: #202020;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
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

:global(.otf-exclude-dialog .otf-motivo-field) {
  position: relative !important;
  width: min(360px, 100%) !important;
  max-width: 360px !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select) {
  width: 100% !important;
  height: 38px !important;
  min-height: 38px !important;
  border: 1px solid #bfc8cd !important;
  border-radius: 4px !important;
  background: #fff !important;
  box-shadow: none !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-label),
:global(.otf-exclude-dialog .otf-motivo-field .p-select-dropdown) {
  height: 36px !important;
  min-height: 36px !important;
  display: flex !important;
  align-items: center !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-label) {
  padding: 0 10px !important;
  color: #263746 !important;
  font-size: 13px !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-dropdown) {
  width: 40px !important;
  min-width: 40px !important;
  justify-content: center !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-overlay) {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  max-height: 190px !important;
  overflow: hidden !important;
  border-radius: 4px !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-list-container) {
  max-height: 190px !important;
  overflow-y: auto !important;
  scrollbar-width: thin;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-list) {
  padding: 4px 0 !important;
}

:global(.otf-exclude-dialog .otf-motivo-field .p-select-option) {
  min-height: 34px !important;
  padding: 6px 12px !important;
  color: #263746 !important;
  font-size: 13px !important;
  line-height: 1.25 !important;
  white-space: normal !important;
}

:global(.otf-exclude-dialog .otf-nota-field .otf-note-textarea.p-textarea) {
  width: 100% !important;
  max-width: 100% !important;
  height: 104px !important;
  min-height: 50px !important;
  max-height: none !important;
  display: block !important;
  padding: 10px !important;
  overflow: auto !important;
  resize: vertical !important;
  border: 1px solid #bfc8cd !important;
  border-radius: 4px !important;
  background: #fff !important;
  color: #263746 !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

:global(.otf-exclude-dialog .otf-nota-field .otf-note-textarea.p-textarea::placeholder) {
  color: #747474 !important;
  font-family: monospace;
  font-weight: 600;
  opacity: 1;
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

  :global(.otf-exclude-dialog .p-dialog-content) {
    padding: 16px 14px 18px !important;
  }

  :global(.otf-exclude-dialog .otf-motivo-field) {
    width: 100% !important;
    max-width: none !important;
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
