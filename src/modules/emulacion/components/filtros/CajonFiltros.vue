<template>
  <div class="fm-panel-content fm-panel-content--accent fm-filters emulation-filters">
    <div class="fm-filter-grid emulation-filter-grid">
      <Legajo />
    </div>

    <div class="fm-actions fm-filter-actions emulation-filter-actions">
      <FmButton
        label="BUSCAR"
        :disabled="storeEmulacion.toggleLoader"
        @click="onSearch"
      />
      <FmButton
        label="LIMPIAR"
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
  toast.removeAllGroups()

  await storeEmulacion.$fetchData()

  if (storeEmulacion.error_code) {
    toast.add({
      severity: storeEmulacion.error_code === 400 ? 'warn' : 'info',
      summary: storeEmulacion.error_code === 400 ? 'Legajo requerido' : 'No se obtuvo información',
      detail: storeEmulacion.error_message || 'Contacte al administrador',
      life: 4500
    })
  }
}
</script>

<style scoped>
.emulation-filters {
  padding: 14px 20px 8px;
}

.emulation-filter-grid {
  width: min(100%, 520px);
  margin: 0 auto;
  grid-template-columns: minmax(0, 1fr);
}

.emulation-filters :deep(.fm-field--span-4) {
  grid-column: auto;
}

.emulation-filter-actions {
  justify-content: center;
  margin-top: 10px;
  padding: 0;
}
</style>
