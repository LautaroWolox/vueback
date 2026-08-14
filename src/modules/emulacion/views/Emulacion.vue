<template>
  <div class="fm-screen fm-screen--pad emulation-page">
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      variant="emulation"
      title="Cargando emulación"
      message="Consultando la información del legajo"
    />

    <Accordion value="0" class="fm-accordion emulation-accordion">
      <AccordionPanel value="0" class="emulation-filter-panel">
        <AccordionHeader asChild v-slot="{ class: headerClass }">
          <div
            :class="[headerClass, 'emulation-accordion__locked-header']"
            role="heading"
            aria-level="2"
          >
            <span class="emulation-accordion__title">FILTROS DE BÚSQUEDA</span>
            <i class="pi pi-chevron-up emulation-accordion__locked-icon" aria-hidden="true"></i>
          </div>
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
import CajonFiltros from '../components/filtros/CajonFiltros.vue'
import ConfirmarEmulacionDialog from '../components/ConfirmarEmulacionDialog.vue'
import emulacionStore from '../store/emulacionStore.js'

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

.emulation-filter-panel :deep(.p-accordionheader),
.emulation-accordion__locked-header {
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 4px 4px 0 0;
}

.emulation-accordion__locked-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: default;
  user-select: none;
}

.emulation-accordion__locked-icon {
  flex: 0 0 auto;
  color: #203947;
  font-size: 10px;
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
