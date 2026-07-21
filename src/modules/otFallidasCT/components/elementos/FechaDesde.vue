<template>
  <div
    class="fm-field fm-field--span-2 otf-filter-element otf-filter-element--fecha-desde"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="fecha-desde">Fecha Cierre OT Desde</label>
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
