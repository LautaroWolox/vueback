<template>
    <iframe
        :src="iframeSrc"
        :title="titulo"
        id="iframe"
        frameborder="0"
        allowfullscreen
        @load="onIframeLoad"
    />
</template>

<script setup>
import { computed, watchEffect, onUnmounted, onMounted, watch } from 'vue';
import router from '@/router';

const urlBase = import.meta.env.VITE_FM_MV_URL;
const allowedOrigin = import.meta.env.VITE_ORIGIN;

const props = defineProps({
    urlParam: {
        type: String,
        required: true
    },
    titleParam: {
        type: String,
        required: true
    }
})

watchEffect(() => {
    sessionStorage.setItem('urlParam', props.urlParam);
    sessionStorage.setItem('titleParam', props.titleParam);
})

const iframeSrc = computed(() => {
    let pantalla = '';
    if (props.urlParam !== undefined) {
        pantalla = '/pc' + props.urlParam;
    } else {
        pantalla = '/pc'  + sessionStorage.getItem('urlParam');
    }
    return pantalla;
});

watch(iframeSrc, (newValue, oldValue) => { oldValue, newValue });

function onIframeLoad() {
    console.trace('IFRAME LOAD EVENT', iframeSrc.value);
}

const titulo = props.titleParam !== undefined ? props.titleParam : sessionStorage.getItem('titleParam');

function handleRedirect(event) {
    const origins = new Set([import.meta.env.VITE_ORIGIN,window.location.origin]);
    if (!origins.has(event.origin)) return
    console.log("origin: " + event.origin)
    const message = event.data;
    if (message && message.type === 'redirect' && message.nroActa && message.url) {
        const { nroActa, url } = message;
        console.log(url + ' - ' + nroActa);
        sessionStorage.setItem('nroActa', nroActa);
        sessionStorage.setItem('urlDetalle', url);
        const route = router.resolve({ name: 'DEAC' });
        window.open(route.href, '_blank');
    }
}

window.addEventListener('message', handleRedirect);

onUnmounted(() => {
    window.removeEventListener('message', handleRedirect);
});
</script>

<style scoped>
#iframe {
    position: absolute;
    width: 100%;
    height: 93%;
}
</style>

