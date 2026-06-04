<template>
    <div class="flex flex-column px-2">
        <label class ="legajo" for="legajo">legajo</label>
        <InputText type="text" id="ot" v-model="legajo" @blur="capturarlegajo($event)" :disabled="disable" style="margin-top: 5px;" />
    </div>
</template>


<script setup>
import { ref,watch } from 'vue';
import InputText from 'primevue/inputtext';
import emulacionStore from '../../../store/emulacionStore.js';

const store = emulacionStore();
const legajo = ref();
const disable = ref(false);

watch(() => store.legajoSelected, (newVal) => {
    legajo.value = newVal;
});

watch(() => store.disableNroOt, (newVal) => {
    disable.value = newVal;
});

const capturarlegajo = (event) => {
    store.$setlegajoSelected(legajo.value);
}

</script>

<style scoped>

.legajo { font-weight: bold; }
</style>
