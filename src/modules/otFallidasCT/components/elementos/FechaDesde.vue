<template>
  <div class="fm-field fm-field--span-3">
    <label for="fecha-desde">Fecha desde</label>
    <CtDatePicker
      input-id="fecha-desde"
      v-model="fechaDesde"
      placeholder="Seleccionar fecha"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CtDatePicker from '../CtDatePicker.vue'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const fechaDesde = computed({
  get: () => store.filters.fechaCierreOTDesde,
  set: (value) => store.setFilter('fechaCierreOTDesde', value || '')
})
</script>
