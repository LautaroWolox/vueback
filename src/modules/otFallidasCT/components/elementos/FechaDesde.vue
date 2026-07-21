<template>
  <div
    class="fm-field fm-field--span-3 otf-filter-element"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="fecha-desde">Fecha desde</label>
    <CtDatePicker
      input-id="fecha-desde"
      v-model="fechaDesde"
      placeholder="Seleccionar fecha"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CtDatePicker from '../CtDatePicker.vue'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

defineProps({
  disabled: { type: Boolean, default: false }
})

const store = useFallidasCtStore()
const fechaDesde = computed({
  get: () => store.filters.fechaCierreOTDesde,
  set: (value) => store.setFilter('fechaCierreOTDesde', value || null)
})
</script>
