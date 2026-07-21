<template>
  <div class="fm-field fm-field--span-3">
    <label for="excl">Excluida</label>
    <Select
      id="excl"
      v-model="exc"
      :options="excluida"
      optionLabel="valor"
      placeholder="Seleccione"
      showClear
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const excluida = ref([
  { id: '', valor: '' },
  { id: 'S', valor: 'SI' },
  { id: 'N', valor: 'NO' }
])

const exc = computed({
  get: () => excluida.value.find((item) => item.id === store.filters.excluida) ?? excluida.value[0],
  set: (value) => store.setFilter('excluida', value?.id ?? '')
})
</script>
