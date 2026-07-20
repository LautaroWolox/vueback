<template>
    <div class="flex flex-column px-2">
        <label for="desc">Contratista</label>       
        <Select 
            v-if="status.contratistas === 'loading'"
            v-model="contratista"
            :disabled="true"
        />
        <Select
            v-else-if="status.contratistas === 'loaded'"
            v-model="contratista"
            :options="contratistaOptions"
            optionLabel="nombre"
        />
        <span v-else-if="status.contratistas === 'error'">
            Error al cargar.
        </span>
    </div>
</template>

<script setup>
import { useFallidasCtStore } from '../../store/CtFallidaStore'
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from 'pinia'
import { useCommonCtStore } from '@/store/commonCt'

const store = useFallidasCtStore()
const commonCT = useCommonCtStore()
const { contratistas, status } = storeToRefs(commonCT)

const contratista = computed({
  get: () => {
    if (!store.filters.contratista) {
      return contratistaOptions.value[0]
    }
    return (
      contratistaOptions.value.find(
        item => item.codigo === store.filters.contratista
      ) 
    )
  },
  set: value => {
    store.setFilter('contratista', value?.codigo ?? '')
  },
})

const contratistaOptions = computed (() => [
  {
    empresaId: 0,
    codigo: '',
    nombre: '',
    tipo: 'Contratista',
    activo: 'S',
  },
  ...(contratistas.value ?? []),
])

onMounted(() => commonCT.setContratistas())

</script>

<style scoped>
</style>

