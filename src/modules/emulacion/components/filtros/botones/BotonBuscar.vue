<template>
    <div>
        <Button id="BotonBuscar" class="text-white" label="BUSCAR" 
        severity="info" rounded @click="buscar" 
        size="large" />
    </div>
    <!-- :disabled="disabled"  -->
</template>

<script setup>
import Button from 'primevue/button';
const emit = defineEmits(['search']);

const buscar = () => {
    emit("search", true);
}

</script>

<style scoped>
</style>