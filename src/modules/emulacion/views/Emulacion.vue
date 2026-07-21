<template>
  <div class="fm-screen fm-screen--pad emulation-page">
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      title="Cargando perfil"
      message="Aplicando la emulación"
    />

    <Accordion v-model:value="active" multiple class="fm-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <CajonFiltros />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>OPERADORES</AccordionHeader>
        <AccordionContent>
          <TablaEmulacion />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import CajonFiltros from '../components/filtros/CajonFiltros.vue'
import TablaEmulacion from '../components/TablaEmulacion.vue'
import emulacionStore from '../store/emulacionStore.js'

const active = ref(['0'])
const store = emulacionStore()

watch(() => store.activeTab, (newValue) => {
  active.value = [String(newValue)]
})
</script>

<style scoped>
.emulation-page {
  min-height: calc(100vh - 82px);
}
</style>
