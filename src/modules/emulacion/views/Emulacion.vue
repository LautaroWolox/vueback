<template>
  <div class="fm-screen fm-screen--pad emulation-page">
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      title="Buscando operador"
      message="Consultando la información del legajo"
    />

    <Accordion v-model:value="active" multiple class="fm-accordion emulation-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>
          <span class="emulation-accordion__title">FILTROS DE BÚSQUEDA</span>
        </AccordionHeader>
        <AccordionContent>
          <CajonFiltros />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>
          <span class="emulation-accordion__title">
            OPERADORES
            <span v-if="store.data.length" class="emulation-accordion__count">
              {{ store.data.length }}
            </span>
          </span>
        </AccordionHeader>
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
  active.value = Array.isArray(newValue) ? newValue.map(String) : [String(newValue)]
}, { immediate: true, deep: true })
</script>

<style scoped>
.emulation-page {
  min-height: calc(100vh - 82px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f7fafb;
}

.emulation-accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.emulation-accordion__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #203947;
  font-size: 12px;
  font-weight: 700;
}

.emulation-accordion__count {
  min-width: 22px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 10px;
  background: #00a9bd;
  color: #fff;
  font-size: 10px;
  box-sizing: border-box;
}

.emulation-accordion :deep(.p-accordioncontent-content) {
  padding: 0;
}
</style>
