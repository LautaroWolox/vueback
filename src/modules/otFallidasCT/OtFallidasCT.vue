<template>
    <LoadingOverlay :loading="store.loading" />
    <div class="mx-2">
        <Accordion v-model:value=store.activeTab multiple>
            <AccordionPanel value="0">
                <AccordionHeader>
                    FILTROS DE BÚSQUEDA
                </AccordionHeader>
                <AccordionContent>
                    <Filtros />
                </AccordionContent>
            </AccordionPanel>
            <AccordionPanel value="1">
                <AccordionHeader>
                   OTS FALLIDAS REPROCESO
                </AccordionHeader>
                <AccordionContent>
                    <Table/>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>

<script setup>
import { useFallidasCtStore } from './store/CtFallidaStore'
import Table from './components/Table.vue';
import Filtros from './components/Filtros.vue';
import LoadingOverlay from '../shared/components/LoadingOverlay.vue';

const store = useFallidasCtStore()
//const active = store.activeTab

</script>

<style scoped></style>