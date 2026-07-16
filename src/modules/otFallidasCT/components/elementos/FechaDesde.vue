<template>
    <div class="flex flex-column px-2">
        <label for="date">Fecha Desde</label>
        <DatePicker id="date" dateFormat="dd/mm/yy" :manualInput="false" class="w-auto"
        v-model="fechaDesde" variant="filled"  @clear-click="borrarFecha($event)" showIcon 
        selectOtherMonths showButtonBar />
    </div>
</template>

<script setup>

import DatePicker from 'primevue/datepicker';
import { computed } from "vue";
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const fechaDesde = computed({
  get: () => store.filters.fechaCierreOTDesde,
  set: (fechaDesde) =>
    store.setFilter('fechaCierreOTDesde', fechaDesde? fechaDesde : '') 
})
const borrarFecha = (event) => {
    store.setFilter('fechaCierreOTDesde',null)
}


</script>

<style scoped>
</style>

