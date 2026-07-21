<template>
  <Dialog
    :visible="visibleExc"
    modal
    header="Excluir órdenes seleccionadas"
    class="fm-dialog otf-action-dialog"
    :style="{ width: '42rem' }"
    @update:visible="$emit('update:visibleExc', $event)"
  >
    <div class="fm-dialog-body otf-dialog-form">
      <div class="otf-dialog-summary">
        <i class="pi pi-trash"></i>
        <span>Se excluirán {{ selectedRows.length }} OT{{ selectedRows.length === 1 ? '' : 's' }}.</span>
      </div>

      <div class="fm-field fm-field--span-12">
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
  gap: 14px;
}

.otf-dialog-summary {
  grid-column: span 12;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #f0d8db;
  border-radius: 6px;
  background: #fff7f8;
  color: #77303a;
}

.otf-dialog-summary i {
  color: #d9363e;
  font-size: 20px;
}

:deep(.p-textarea) {
  width: 100%;
  min-height: 92px;
  border: 1px solid #c5d1d8;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
}
</style>
