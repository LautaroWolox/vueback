<template>
  <div class="fm-screen fm-screen--pad otf-page">
    <Accordion v-model:value="store.activeTab" multiple class="fm-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <Filtros />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>OTS FALLIDAS REPROCESO</AccordionHeader>
        <AccordionContent>
          <Table />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>
import { useFallidasCtStore } from './store/CtFallidaStore'
import Table from './components/Table.vue'
import Filtros from './components/Filtros.vue'

const store = useFallidasCtStore()
</script>

<style scoped>
.otf-page {
  min-height: calc(100vh - 82px);
}
</style>
