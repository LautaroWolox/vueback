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
        class="fm-filter-action-button"
        label="BUSCAR"
        icon="pi-search"
        :disabled="store.loading"
        @click="store.setData"
      />
      <FmButton
        class="fm-filter-action-button"
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
  padding: 0 0 14px !important;
  margin: 0 !important;
  border-left: 4px solid #00a9bd !important;
  border-bottom: 0 !important;
  background: #fff !important;
  box-shadow: none !important;
  overflow: visible !important;
}

.otf-filter-grid {
  align-items: end !important;
  padding: 14px 20px 0 !important;
  column-gap: 14px !important;
  row-gap: 10px !important;
  margin: 0 !important;
}

.otf-filter-grid :deep(.otf-filter-element) {
  min-width: 0 !important;
  width: 100% !important;
}

.otf-filters :deep(.fm-field label) {
  margin: 0 0 5px !important;
  color: #000 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  line-height: 14px !important;
  white-space: nowrap !important;
}

.otf-filters :deep(.fm-field .p-inputtext),
.otf-filters :deep(.fm-field .p-select),
.otf-filters :deep(.fm-field .ct-date-button),
.otf-filters :deep(.fm-field input) {
  width: 100% !important;
  height: 26px !important;
  min-height: 26px !important;
  max-height: 26px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border: 1px solid #cbd4db !important;
  border-radius: 2px !important;
  background: #fff !important;
  color: #263746 !important;
  font-size: 12px !important;
  line-height: 24px !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

.otf-filters :deep(.p-select-label) {
  height: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 7px !important;
  font-size: 12px !important;
  line-height: 24px !important;
}

.otf-filters :deep(.p-select-dropdown) {
  width: 28px !important;
  min-width: 28px !important;
  height: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.otf-filters :deep(.p-select-clear-icon) {
  display: none !important;
}

.otf-filters :deep(.ct-date-button) {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 7px !important;
}

.otf-filters :deep(.ct-date-button .pi),
.otf-filters :deep(.ct-date-button svg) {
  width: 13px !important;
  height: 13px !important;
  font-size: 13px !important;
  flex: 0 0 13px !important;
}

.otf-filter-actions {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  margin: 12px 0 0 !important;
  padding: 12px 0 0 !important;
  border-top: 1px solid #e4e8eb !important;
  background: transparent !important;
}

.otf-filter-actions :deep(.fm-filter-action-button),
.otf-filter-actions :deep(.fm-action-button),
.otf-filter-actions :deep(.fm-ui-button),
.otf-filter-actions :deep(.p-button) {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  padding: 0 18px !important;
  gap: 12px !important;
  border-radius: 6px !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 5px 13px rgba(0, 0, 0, .16) !important;
  transform: none !important;
  white-space: nowrap !important;
}

.otf-filter-actions :deep(.p-button-label) {
  font-size: 16px !important;
  font-weight: 400 !important;
}

.otf-filter-actions :deep(.p-button-icon),
.otf-filter-actions :deep(.pi) {
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  font-size: 20px !important;
  line-height: 20px !important;
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
  border-color: #9eacb7 !important;
  color: #53636f !important;
  cursor: not-allowed !important;
  opacity: 1 !important;
}

.otf-filters :deep(.otf-filter-element--disabled .p-inputtext::placeholder),
.otf-filters :deep(.otf-filter-element--disabled .ct-date-button span),
.otf-filters :deep(.otf-filter-element--disabled .p-select-label),
.otf-filters :deep(.otf-filter-element--disabled .p-select-dropdown),
.otf-filters :deep(.otf-filter-element--disabled .ct-date-button .pi) {
  color: #53636f !important;
}

.otf-filters :deep(.fm-calendar),
.otf-filters :deep(.ct-calendar) {
  z-index: 13000 !important;
  top: 31px !important;
  width: 244px !important;
  padding: 8px !important;
  border-color: #00a9bd !important;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .18) !important;
}

.otf-filters :deep(.ct-days button) {
  height: 25px !important;
  font-size: 11px !important;
}

@media (max-width: 900px) {
  .otf-filter-grid :deep(.fm-field--span-2),
  .otf-filter-grid :deep(.fm-field--span-4) {
    grid-column: span 6;
  }
}

@media (max-width: 620px) {
  .otf-filter-grid :deep(.fm-field--span-2),
  .otf-filter-grid :deep(.fm-field--span-4) {
    grid-column: span 12;
  }

  .otf-filter-actions {
    flex-wrap: wrap !important;
  }

  .otf-filter-actions :deep(.fm-filter-action-button),
  .otf-filter-actions :deep(.p-button) {
    width: min(160px, calc(50vw - 22px)) !important;
    min-width: 128px !important;
  }
}
</style>
