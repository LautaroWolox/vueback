<template>
  <div class="fm-panel-content fm-panel-content--accent fm-filters emulation-filters">
    <div class="fm-filter-grid">
      <Legajo />
    </div>

    <div class="fm-actions fm-filter-actions">
      <FmButton
        label="BUSCAR"
        icon="pi-search"
        :disabled="storeEmulacion.toggleLoader"
        @click="onSearch"
      />
      <FmButton
        label="LIMPIAR"
        icon="pi-filter-slash"
        variant="outline"
        :disabled="storeEmulacion.toggleLoader"
        @click="onClear"
      />
    </div>

    <Toast position="top-center" />
  </div>
</template>

<script setup>
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Legajo from './inputs/Legajo.vue'
import emulacionStore from '../../store/emulacionStore.js'

const toast = useToast()
const storeEmulacion = emulacionStore()

const onClear = () => {
  storeEmulacion.$resetFilters()
  toast.removeAllGroups()
}

const onSearch = async () => {
  await storeEmulacion.$fetchData()
  if (storeEmulacion.error_code === 500 || storeEmulacion.error_code === 404) {
    toast.add({
      severity: 'info',
      summary: 'No se obtuvo información',
      detail: 'Contacte al administrador'
    })
    return
  }
  storeEmulacion.$setActiveTab(1)
}
</script>

<style scoped>
.emulation-filters :deep(.fm-field--span-4) {
  grid-column: span 4;
}

@media (max-width: 900px) {
  .emulation-filters :deep(.fm-field--span-4) {
    grid-column: span 6;
  }
}

@media (max-width: 620px) {
  .emulation-filters :deep(.fm-field--span-4) {
    grid-column: span 12;
  }
}
</style>
