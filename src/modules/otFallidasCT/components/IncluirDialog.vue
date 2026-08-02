<template>
  <Dialog
    :visible="visibleInc"
    modal
    header="Incluir Orden de Trabajo"
    class="fm-dialog otf-action-dialog otf-include-dialog"
    :style="{ width: '42rem' }"
    @update:visible="$emit('update:visibleInc', $event)"
  >
    <div class="otf-include-form">
      <p class="otf-include-confirmation">
        ¿Confirma que desea incluir la OT seleccionada?
      </p>

      <div class="fm-field otf-include-motivo-field">
        <label for="motivo-inclusion">Motivo</label>
        <FmCompactSelect
          v-if="status.motivos === 'loading'"
          id="motivo-inclusion"
          class="otf-include-motivo-select"
          disabled
          placeholder="Cargando..."
        />
        <FmCompactSelect
          v-else-if="status.motivos === 'loaded'"
          id="motivo-inclusion"
          v-model="motivoSelected"
          class="otf-include-motivo-select"
          :options="motivoOptions"
          option-label="nombre"
          placeholder="Seleccione un motivo"
          :max-panel-height="150"
        />
        <span v-else-if="status.motivos === 'error'" class="fm-field-error">Error al cargar.</span>
      </div>

      <div class="fm-field otf-include-comment-field">
        <label for="nota-inclusion">Nota</label>
        <textarea
          id="nota-inclusion"
          v-model="comentario"
          class="otf-include-comment"
          rows="2"
          placeholder="Opcional"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <FmDialogActions
        secondary-label="CANCELAR"
        primary-label="ACEPTAR"
        :primary-disabled="!motivoSelected?.nombreCorto || store.loading"
        @secondary="cerrar"
        @primary="confirmar"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import FmCompactSelect from '@/components/shared/FmCompactSelect.vue'
import FmDialogActions from '@/components/shared/FmDialogActions.vue'
import { useFallidasCtStore } from '../store/CtFallidaStore'
import { useCommonCtStore } from '@/store/commonCt'

const props = defineProps({
  visibleInc: Boolean
})

const emit = defineEmits(['update:visibleInc'])
const store = useFallidasCtStore()
const commonCT = useCommonCtStore()
const { motivos, status } = storeToRefs(commonCT)
const motivoSelected = ref(null)
const comentario = ref('')

const motivoOptions = computed(() => motivos.value ?? [])

const reset = () => {
  motivoSelected.value = null
  comentario.value = ''
}

const confirmar = async () => {
  if (!motivoSelected.value?.nombreCorto || store.loading) return

  const nroOT = store.nroOT
  emit('update:visibleInc', false)

  const response = await store.sendIncluir(
    String(nroOT ?? ''),
    motivoSelected.value.nombreCorto,
    comentario.value
  )

  if (response?.status) {
    store.markIncluded(nroOT)
    await store.setData()
    store.markIncluded(nroOT)
  }

  reset()
}

const cerrar = () => {
  emit('update:visibleInc', false)
  reset()
}

onMounted(() => commonCT.setMotivosExcInc())
</script>

<style scoped>
.otf-include-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.otf-include-confirmation {
  margin: 0 0 2px;
  color: #263746;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
}

.otf-include-form .fm-field {
  width: 100%;
  min-width: 0;
}

.otf-include-form .fm-field label {
  display: block;
  margin: 0 0 4px;
  color: #202020;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
}

.otf-include-motivo-field {
  width: min(240px, 100%) !important;
  max-width: 240px;
}

:deep(.otf-include-motivo-select .fm-compact-select__trigger) {
  height: 32px;
  min-height: 32px;
  padding: 0 8px;
  font-size: 11px;
}

:deep(.otf-include-motivo-select .fm-compact-select__value) {
  font-size: 11px;
  font-weight: 400;
}

:deep(.otf-include-motivo-select .fm-compact-select__chevron) {
  width: 7px;
  height: 7px;
  flex-basis: 7px;
  border-right-width: 1.5px;
  border-bottom-width: 1.5px;
}

:deep(.otf-include-motivo-select .fm-compact-select__panel) {
  padding: 2px 0;
}

:deep(.otf-include-motivo-select .fm-compact-select__option) {
  min-height: 27px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.15;
}

.otf-include-comment {
  width: 100%;
  min-width: 240px;
  max-width: 100%;
  height: 54px;
  min-height: 36px;
  max-height: 45vh;
  padding: 7px 9px;
  overflow: auto;
  resize: both;
  border: 1px solid #bfc8cd;
  border-radius: 2px;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 12px;
  line-height: 1.3;
  box-shadow: none;
  box-sizing: border-box;
}

.otf-include-comment:focus {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
}

:global(.p-dialog.otf-include-dialog.fm-dialog) {
  overflow: visible !important;
}

:global(.otf-include-dialog .p-dialog-content) {
  padding: 12px 12px 14px !important;
  overflow: visible !important;
}

:global(.otf-include-dialog .p-dialog-footer) {
  min-height: 52px !important;
  display: flex !important;
  align-items: center !important;
  padding: 8px 12px !important;
}

@media (max-width: 600px) {
  .otf-include-motivo-field,
  .otf-include-comment {
    width: 100% !important;
    min-width: 0;
    max-width: 100%;
  }

  .otf-include-comment {
    resize: vertical;
  }
}
</style>
