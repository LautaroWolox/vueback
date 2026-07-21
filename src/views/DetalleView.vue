<template>
    <iframe :src=iframeSrc :title=titulo id="iframe" frameborder="0" allowfullscreen />
</template>

<script setup>
import { computed } from 'vue';


//const urlBase = import.meta.env.VITE_FM_MV_URL;
const iframeSrc = computed(() => {
    return window.location.origin + '/pc' + sessionStorage.getItem('urlDetalle') + '?nroActa=' + sessionStorage.getItem('nroActa');
}); 

const titulo = 'Detalle Acta - ' + sessionStorage.getItem('nroActa');

</script>

<style scoped>
#iframe {
    position: absolute;
    width: 100%;
    height: 93%;
}
</style>