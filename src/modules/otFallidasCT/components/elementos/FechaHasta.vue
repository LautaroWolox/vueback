<template>
  <div
    class="fm-field fm-field--span-3 otf-filter-element"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="fecha-hasta">Fecha Cierre OT Hasta</label>
    <CtDatePicker
      input-id="fecha-hasta"
      v-model="fechaHasta"
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
const fechaHasta = computed({
  get: () => store.filters.fechaCierreOTHasta,
  set: (value) => store.setFilter('fechaCierreOTHasta', value || null)
})
</script>
