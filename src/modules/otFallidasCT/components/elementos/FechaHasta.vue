<template>
    <div class="flex flex-column px-2">
        <label for="date">Fecha Hasta</label>
        <DatePicker id="date" dateFormat="dd/mm/yy" :manualInput="false" class="w-auto"
        v-model="fechaHasta" variant="filled" @clear-click="borrarFecha($event)" showIcon 
        selectOtherMonths showButtonBar />
    </div>
</template>

<script setup>

import DatePicker from 'primevue/datepicker';
import { computed } from "vue";
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const fechaHasta = computed({
  get: () => store.filters.fechaCierreOTHasta,
  set: (fechaHasta) =>
    store.setFilter('fechaCierreOTHasta', fechaHasta? fechaHasta : '') 
})
const borrarFecha = (event) => {
    store.setFilter('fechaCierreOTHasta',null)
}


</script>

<style scoped>
</style>
