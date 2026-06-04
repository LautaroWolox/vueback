<template>
    <div>
        <Button id="BotonLimpiar" class="text-primary border-primary" label="LIMPIAR" severity="info" rounded outlined @click="limpiar" size="large" />
    </div>
</template>

<script setup>
import Button from 'primevue/button';

const emit = defineEmits(['clear']);

const limpiar = () => {
    emit("clear", true);
}


</script>

<style scoped>
</style>