<template>
  <div class="fm-field fm-field--span-3">
    <label for="fecha-hasta">Fecha hasta</label>
    <CtDatePicker
      input-id="fecha-hasta"
      v-model="fechaHasta"
      placeholder="Seleccionar fecha"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CtDatePicker from '../CtDatePicker.vue'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const fechaHasta = computed({
  get: () => store.filters.fechaCierreOTHasta,
  set: (value) => store.setFilter('fechaCierreOTHasta', value || '')
})
</script>
