<template>
  <Dialog
    :visible="visibleInc"
    modal
    header="Incluir orden de trabajo"
    class="fm-dialog otf-action-dialog"
    :style="{ width: '42rem' }"
    @update:visible="$emit('update:visibleInc', $event)"
  >
    <div class="fm-dialog-body otf-dialog-form">
      <div class="otf-dialog-summary otf-dialog-summary--include">
        <i class="pi pi-undo"></i>
        <span>Se incluirá nuevamente la OT {{ store.nroOT || '' }}.</span>
      </div>

      <div class="fm-field fm-field--span-12">
        <label for="motivo-inclusion">Motivo</label>
        <Select
          id="motivo-inclusion"
          v-if="status.motivos === 'loading'"
          v-model="motivoSelected"
          disabled
          placeholder="Cargando..."
        />
        <Select
          id="motivo-inclusion"
          v-else-if="status.motivos === 'loaded'"
          v-model="motivoSelected"
          :options="motivoOptions"
          optionLabel="nombre"
          placeholder="Seleccione un motivo"
        />
        <span v-else-if="status.motivos === 'error'" class="fm-field-error">Error al cargar.</span>
      </div>

      <div class="fm-field fm-field--span-12">
        <label for="comentario-inclusion">Comentario</label>
        <Textarea
          id="comentario-inclusion"
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
  visibleInc: Boolean
})

const emit = defineEmits(['update:visibleInc'])
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
  emit('update:visibleInc', false)
  await store.sendIncluir(store.nroOT, motivoSelected.value.nombreCorto, comentario.value)
  reset()
  await store.setData()
}

const cerrar = () => {
  emit('update:visibleInc', false)
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
  border: 1px solid #cfe9ec;
  border-radius: 6px;
  background: #effcfd;
  color: #285964;
}

.otf-dialog-summary i {
  color: #008fa1;
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
