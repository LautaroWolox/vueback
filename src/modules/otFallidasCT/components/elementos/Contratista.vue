<template>
  <div
    class="fm-field fm-field--span-4 otf-filter-element otf-filter-element--contratista"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="contratista">Contratista</label>
    <Select
      id="contratista"
      v-if="status.contratistas === 'loading'"
      v-model="contratista"
      disabled
      placeholder="Cargando..."
    />
    <Select
      id="contratista"
      v-else-if="status.contratistas === 'loaded'"
      v-model="contratista"
      :options="contratistaOptions"
      optionLabel="nombre"
      placeholder="Seleccione"
      :disabled="disabled"
    />
    <span v-else-if="status.contratistas === 'error'" class="fm-field-error">
      Error al cargar.
    </span>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFallidasCtStore } from '../../store/CtFallidaStore'
import { useCommonCtStore } from '@/store/commonCt'

defineProps({
  disabled: { type: Boolean, default: false }
})

const store = useFallidasCtStore()
const commonCT = useCommonCtStore()
const { contratistas, status } = storeToRefs(commonCT)

const contratistaOptions = computed(() => [
  { empresaId: 0, codigo: '', nombre: '', tipo: 'Contratista', activo: 'S' },
  ...(contratistas.value ?? [])
])

const contratista = computed({
  get: () => {
    if (!store.filters.contratista) return contratistaOptions.value[0]
    return contratistaOptions.value.find((item) => item.codigo === store.filters.contratista)
  },
  set: (value) => store.setFilter('contratista', value?.codigo ?? '')
})

onMounted(() => commonCT.setContratistas())
</script>
