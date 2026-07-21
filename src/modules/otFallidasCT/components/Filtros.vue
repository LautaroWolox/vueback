<template>
  <div class="fm-panel-content fm-panel-content--accent fm-filters otf-filters">
    <div class="fm-filter-grid otf-filter-grid">
      <NroOT :disabled="disableNroOt" />
      <FechaDesde :disabled="disableAdvancedFilters" />
      <FechaHasta :disabled="disableAdvancedFilters" />
      <Contratista :disabled="disableAdvancedFilters" />
      <DescError :disabled="disableAdvancedFilters" />
      <Excluida :disabled="disableAdvancedFilters" />
      <Pais :disabled="disableAdvancedFilters" />
    </div>

    <div class="fm-actions fm-filter-actions otf-filter-actions">
      <FmButton
        class="fm-filter-action-button otf-search-button"
        label="BUSCAR"
        icon="pi-search"
        :disabled="store.loading"
        @click="store.setData"
      />
      <FmButton
        class="fm-filter-action-button otf-clear-button"
        label="LIMPIAR"
        icon="pi-filter-slash"
        variant="outline"
        :disabled="store.loading"
        @click="store.clearFilters"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Contratista from './elementos/Contratista.vue'
import DescError from './elementos/DescError.vue'
import Excluida from './elementos/Excluida.vue'
import FechaDesde from './elementos/FechaDesde.vue'
import FechaHasta from './elementos/FechaHasta.vue'
import NroOT from './elementos/NroOT.vue'
import Pais from './elementos/Pais.vue'
import { useFallidasCtStore } from '../store/CtFallidaStore'

const store = useFallidasCtStore()

const hasValue = (value) => {
  if (value === null || value === undefined) return false
  if (value instanceof Date) return true
  return String(value).trim().length > 0
}

const hasNroOt = computed(() => hasValue(store.filters.nroOT))
const hasAdvancedFilters = computed(() => [
  store.filters.fechaCierreOTDesde,
  store.filters.fechaCierreOTHasta,
  store.filters.contratista,
  store.filters.descripcionError,
  store.filters.excluida,
  store.filters.pais
].some(hasValue))

const disableAdvancedFilters = computed(() => hasNroOt.value)
const disableNroOt = computed(() => !hasNroOt.value && hasAdvancedFilters.value)
</script>

<style scoped>
.otf-filters {
  width: 100%;
  padding: 14px 18px 12px !important;
}

.otf-filter-grid {
  align-items: end;
}

.otf-filter-actions {
  margin-top: 14px !important;
  gap: 10px !important;
}

.otf-filter-actions :deep(.p-button.fm-filter-action-button),
.otf-filter-actions :deep(.fm-action-button.fm-filter-action-button) {
  width: 160px !important;
  min-width: 160px !important;
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 18px !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  gap: 9px !important;
}

.otf-filter-actions :deep(.p-button.fm-filter-action-button .p-button-icon),
.otf-filter-actions :deep(.fm-filter-action-button .pi) {
  width: 17px !important;
  height: 17px !important;
  font-size: 17px !important;
  line-height: 17px !important;
}

.otf-filters :deep(.otf-filter-element--disabled) {
  opacity: 1 !important;
}

.otf-filters :deep(.otf-filter-element--disabled label) {
  color: #52616c !important;
}

.otf-filters :deep(.otf-filter-element--disabled .p-inputtext),
.otf-filters :deep(.otf-filter-element--disabled .p-select),
.otf-filters :deep(.otf-filter-element--disabled .ct-date-button) {
  background: #d5dde3 !important;
  background-color: #d5dde3 !important;
  border-color: #9eacb7 !important;
  color: #53636f !important;
  cursor: not-allowed !important;
  opacity: 1 !important;
}

.otf-filters :deep(.otf-filter-element--disabled .p-inputtext::placeholder),
.otf-filters :deep(.otf-filter-element--disabled .ct-date-button span),
.otf-filters :deep(.otf-filter-element--disabled .p-select-label) {
  color: #53636f !important;
}

.otf-filters :deep(.otf-filter-element--disabled .p-select-dropdown),
.otf-filters :deep(.otf-filter-element--disabled .ct-date-button .pi) {
  color: #53636f !important;
}

@media (max-width: 900px) {
  .otf-filters :deep(.fm-field--span-3) {
    grid-column: span 6;
  }
}

@media (max-width: 620px) {
  .otf-filters :deep(.fm-field--span-3) {
    grid-column: span 12;
  }

  .otf-filter-actions :deep(.p-button.fm-filter-action-button),
  .otf-filter-actions :deep(.fm-action-button.fm-filter-action-button) {
    width: 100% !important;
  }
}
</style>
