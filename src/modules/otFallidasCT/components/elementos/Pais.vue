<template>
    <div class="flex flex-column px-2">
        <label for="pais">País</label>
        <Select id="pais" v-model="pais" :options="paises" optionLabel="valor" class="w-full md:w-56" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()

const paises = ref([
  { valor: '' },
  { valor: 'ARG' },
  { valor: 'UY' },
  { valor: 'PY' },
])

const pais = computed({
  get: () =>
    paises.value.find(p => p.valor === store.filters.pais) ?? paises.value[0],

  set: (value) =>
    store.setFilter('pais', value?.valor ?? '')
})

</script>

<style scoped>
</style>
