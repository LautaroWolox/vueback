<template>
    <div class="flex flex-column px-2">
        <label for="desc">Descripción Error</label>
        <InputText type="text" id="error" v-model="desc" />
    </div>
</template>


<script setup>
import { computed } from 'vue';
import InputText from 'primevue/inputtext';
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const desc = computed({
  get: () => store.filters.descripcionError,
  set: (desc) =>
    store.setFilter('descripcionError', desc? desc : '') 
})

</script>

<style scoped>
</style>
