<template>
  <div class="fm-screen fm-screen--pad emulation-page">
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      title="Buscando operador"
      message="Consultando la información del legajo"
    />

    <Accordion v-model:value="active" multiple class="fm-accordion emulation-accordion">
      <AccordionPanel value="0" class="emulation-filter-panel">
        <AccordionHeader>
          <span class="emulation-accordion__title">FILTROS DE BÚSQUEDA</span>
        </AccordionHeader>
        <AccordionContent>
          <CajonFiltros />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <ConfirmarEmulacionDialog />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CajonFiltros from '../components/filtros/CajonFiltros.vue'
import ConfirmarEmulacionDialog from '../components/ConfirmarEmulacionDialog.vue'
import emulacionStore from '../store/emulacionStore.js'

const active = ref(['0'])
const store = emulacionStore()
</script>

<style scoped>
.emulation-page {
  min-height: calc(100vh - 82px);
  display: flex;
  flex-direction: column;
  background: #f7fafb;
}

.emulation-accordion {
  flex: 0 0 auto;
}

.emulation-filter-panel {
  border-radius: 4px;
}

.emulation-filter-panel :deep(.p-accordionheader) {
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 4px 4px 0 0;
}

.emulation-filter-panel :deep(.p-accordioncontent-content) {
  border-radius: 0 0 4px 4px;
}

.emulation-accordion__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #203947;
  font-size: 12px;
  font-weight: 700;
}

.emulation-accordion :deep(.p-accordioncontent-content) {
  padding: 0;
}
</style>
