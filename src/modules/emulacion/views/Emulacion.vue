
<template>
    <loadingOverlay :loading="store.toggleLoader"/>
    <div class="mx-2">
        <Accordion v-model:value="active" multiple>
            <AccordionPanel value="0">
                <AccordionHeader>
                    FILTROS DE BÚSQUEDA
                </AccordionHeader>
                    <cajon-filtros/>
                <AccordionContent>
                </AccordionContent>
            </AccordionPanel>
            <AccordionPanel value="1">
                <AccordionHeader>
                   OPERADORES
                </AccordionHeader>
                <AccordionContent>
                    <TablaEmulacion/>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>

<script setup>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import CajonFiltros from '../components/filtros/CajonFiltros.vue';
import TablaEmulacion from '../components/TablaEmulacion.vue';
import emulacionStore from '../store/emulacionStore.js';
import { ref, watch } from 'vue';
import loadingOverlay from '../../shared/components/LoadingOverlay.vue';

const active = ref(['0']);
const store = emulacionStore();

watch(() => store.activeTab, (newVal) => {
    active.value = [String(newVal)];
});

</script>

