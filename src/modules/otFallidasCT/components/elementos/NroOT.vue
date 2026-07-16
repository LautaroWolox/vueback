<template>
    <div class="flex flex-column px-2">
        <label for="ot">Nro OT</label>
        <InputText type="text" id="ot" v-model="nroOt"/>
    </div>
</template>


<script setup>
import { computed } from 'vue';
import InputText from 'primevue/inputtext';
import { useFallidasCtStore } from '../../store/CtFallidaStore';

const store = useFallidasCtStore()

const nroOt = computed({
  get: () => store.filters.nroOT,
  set: (nroOt) =>
    store.setFilter('nroOT', nroOt? nroOt : '') 
})

</script>

<style scoped>
</style>
