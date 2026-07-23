<template>
  <div class="fm-screen fm-screen--pad emulation-page">
    <FmTypingLoader
      v-if="store.toggleLoader"
      fullscreen
      title="Buscando operador"
      message="Consultando la información del legajo"
    />

    <div class="emulation-page__intro">
      <div>
        <h1>Emulación de operador</h1>
        <p>Busque un legajo, revise sus datos y confirme la emulación del perfil.</p>
      </div>
      <span class="emulation-page__badge">
        <i class="pi pi-user-edit"></i>
      </span>
    </div>

    <Accordion v-model:value="active" multiple class="fm-accordion emulation-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>
          <span class="emulation-accordion__title">
            <i class="pi pi-filter"></i>
            FILTROS DE BÚSQUEDA
          </span>
        </AccordionHeader>
        <AccordionContent>
          <CajonFiltros />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>
          <span class="emulation-accordion__title">
            <i class="pi pi-users"></i>
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
  gap: 14px;
  background: #f7fafb;
}

.emulation-page__intro {
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 18px;
  border: 1px solid #d5e1e6;
  border-left: 4px solid #00a9bd;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
}

.emulation-page__intro h1 {
  margin: 0 0 4px;
  color: #203947;
  font-size: 20px;
  font-weight: 600;
}

.emulation-page__intro p {
  margin: 0;
  color: #607887;
  font-size: 12px;
}

.emulation-page__badge {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e4f9fc;
  color: #00a9bd;
}

.emulation-page__badge i {
  font-size: 20px;
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

.emulation-accordion__title > i {
  color: #00a9bd;
  font-size: 14px;
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
