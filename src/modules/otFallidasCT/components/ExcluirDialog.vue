<template>
  <Dialog
    :visible="visibleExc"
    modal
    :closable="false"
    class="fm-dialog otf-action-dialog otf-exclude-dialog"
    :style="{ width: '38rem' }"
    @update:visible="$emit('update:visibleExc', $event)"
  >
    <template #header>
      <div class="otf-exclude-header">
        <span>Excluir órdenes seleccionadas</span>
        <button
          type="button"
          class="otf-exclude-close"
          aria-label="Cerrar ventana"
          title="Cerrar"
          @click="cerrar"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      </div>
    </template>

    <div class="fm-dialog-body otf-dialog-form">
      <div class="fm-field fm-field--span-12 otf-motivo-field">
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
          placeholder="Seleccione un motivo"
        />
        <span v-else-if="status.motivos === 'error'" class="fm-field-error">Error al cargar.</span>
      </div>

      <div class="fm-field fm-field--span-12">
        <label for="comentario-exclusion">Comentario</label>
        <Textarea
          id="comentario-exclusion"
          v-model="comentario"
          rows="4"
          autoResize
        />
      </div>
    </div>

    <template #footer>
      <FmButton label="CANCELAR" variant="outline" @click="cerrar" />
      <FmButton
        label="ACEPTAR"
        icon="pi-check"
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

const motivoOptions = computed(() => [
  { id: 0, nombre: '', nombreCorto: '', activo: '' },
  ...(motivos.value ?? [])
])

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
.otf-dialog-form {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.otf-motivo-field {
  width: min(330px, 100%);
}

.otf-motivo-field :deep(.p-select) {
  width: 100% !important;
  height: 32px !important;
  min-height: 32px !important;
}

.otf-motivo-field :deep(.p-select-label),
.otf-motivo-field :deep(.p-select-dropdown) {
  height: 30px !important;
  min-height: 30px !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.p-textarea) {
  width: 100%;
  min-height: 92px;
  border: 1px solid #c5d1d8;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
}

.otf-exclude-header {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #263746;
  font-size: 20px;
  font-weight: 400;
}

.otf-exclude-close {
  width: 34px;
  min-width: 34px;
  height: 34px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #97a8b2;
  cursor: pointer;
}

.otf-exclude-close:hover {
  background: #edf9fa;
  color: #008fa1;
}

.otf-exclude-close svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
}

:global(.otf-exclude-dialog .p-dialog-header) {
  min-height: 58px !important;
  padding: 0 16px !important;
}

:global(.otf-exclude-dialog .p-dialog-content) {
  padding: 18px !important;
}

:global(.otf-exclude-dialog .p-dialog-footer) {
  padding: 12px 18px !important;
}
</style>
