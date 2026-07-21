<template>
  <div
    class="fm-field fm-field--span-3 otf-filter-element"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="pais">País</label>
    <Select
      id="pais"
      v-model="pais"
      :options="paises"
      optionLabel="valor"
      placeholder="Seleccione"
      showClear
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

defineProps({
  disabled: { type: Boolean, default: false }
})

const store = useFallidasCtStore()
const paises = ref([
  { valor: '' },
  { valor: 'ARG' },
  { valor: 'UY' },
  { valor: 'PY' }
])

const pais = computed({
  get: () => paises.value.find((item) => item.valor === store.filters.pais) ?? paises.value[0],
  set: (value) => store.setFilter('pais', value?.valor ?? '')
})
</script>
