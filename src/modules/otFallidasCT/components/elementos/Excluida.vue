<template>
  <div
    class="fm-field fm-field--span-2 otf-filter-element otf-filter-element--excluida"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="excl">Excluida</label>
    <Select
      id="excl"
      v-model="exc"
      :options="excluida"
      optionLabel="valor"
      optionDisabled="disabled"
      placeholder="Seleccione"
      overlayClass="otf-filter-select-overlay"
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
const excluida = ref([
  { id: '', valor: '', disabled: true },
  { id: 'S', valor: 'SI' },
  { id: 'N', valor: 'NO' }
])

const exc = computed({
  get: () => excluida.value.find((item) => item.id === store.filters.excluida && !item.disabled) ?? null,
  set: (value) => store.setFilter('excluida', value?.id ?? '')
})
</script>
