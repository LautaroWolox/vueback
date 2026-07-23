<template>
  <div class="fm-panel-content fm-panel-content--accent fm-filters emulation-filters">
    <div class="emulation-filter-layout">
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
    </div>

    <p class="emulation-filter-help">
      Ingrese el legajo del operador que desea emular.
    </p>

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
  padding: 18px 20px 14px;
}

.emulation-filter-layout {
  display: grid;
  grid-template-columns: minmax(280px, 520px) auto;
  align-items: end;
  justify-content: center;
  gap: 24px;
}

.emulation-filter-grid {
  width: 100%;
  grid-template-columns: minmax(0, 1fr);
}

.emulation-filters :deep(.fm-field--span-4) {
  grid-column: auto;
}

.emulation-filter-actions {
  align-self: end;
  justify-content: flex-start;
  padding-bottom: 0;
}

.emulation-filter-actions :deep(.p-button) {
  min-width: 104px;
  height: 32px;
  min-height: 32px;
  border-radius: 3px;
}

.emulation-filter-help {
  max-width: 760px;
  margin: 10px auto 0;
  color: #607887;
  font-size: 12px;
  text-align: left;
}

@media (max-width: 760px) {
  .emulation-filter-layout {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .emulation-filter-actions {
    justify-content: center;
  }
}
</style>
