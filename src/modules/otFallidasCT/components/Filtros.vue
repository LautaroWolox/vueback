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
        :disabled="store.loading"
        @click="store.setData"
      >
        <template #icon>
          <svg class="otf-button-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 4.5 4.5" />
          </svg>
        </template>
      </FmButton>

      <FmButton
        class="fm-filter-action-button otf-clean-button"
        label="LIMPIAR"
        variant="outline"
        :disabled="store.loading"
        @click="store.clearFilters"
      >
        <template #icon>
          <svg class="otf-button-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h14" />
            <path d="M4 12h10" />
            <path d="M4 18h6" />
          </svg>
        </template>
      </FmButton>
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
  --otf-control-height: 30px;
  width: 100%;
  margin: 0 !important;
  padding: 0 0 9px !important;
  overflow: visible !important;
  border-left: 3px solid #00a9bd !important;
  border-bottom: 0 !important;
  background: #fff !important;
  box-shadow: none !important;
}

.otf-filter-grid {
  align-items: end !important;
  margin: 0 !important;
  padding: 12px 14px 0 !important;
  column-gap: 14px !important;
  row-gap: 8px !important;
}

.otf-filter-grid :deep(.otf-filter-element) {
  width: 100% !important;
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-self: end !important;
}

.otf-filters :deep(.fm-field label) {
  height: 14px !important;
  min-height: 14px !important;
  margin: 0 0 4px !important;
  color: #111 !important;
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
  height: var(--otf-control-height) !important;
  min-height: var(--otf-control-height) !important;
  max-height: var(--otf-control-height) !important;
  margin: 0 !important;
  padding: 0 8px !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 3px !important;
  background: #fff !important;
  color: #263746 !important;
  font-size: 12px !important;
  line-height: normal !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}

.otf-filters :deep(.fm-field .p-inputtext),
.otf-filters :deep(.fm-field input),
.otf-filters :deep(.ct-date-button),
.otf-filters :deep(.p-select-label),
.otf-filters :deep(.p-select-dropdown) {
  display: flex !important;
  align-items: center !important;
}

.otf-filters :deep(.p-select-label) {
  height: calc(var(--otf-control-height) - 2px) !important;
  min-height: calc(var(--otf-control-height) - 2px) !important;
  max-height: calc(var(--otf-control-height) - 2px) !important;
  padding: 0 8px !important;
  font-size: 11px !important;
  line-height: normal !important;
}

.otf-filters :deep(.p-select-dropdown) {
  width: 30px !important;
  min-width: 30px !important;
  height: calc(var(--otf-control-height) - 2px) !important;
  min-height: calc(var(--otf-control-height) - 2px) !important;
  max-height: calc(var(--otf-control-height) - 2px) !important;
  justify-content: center !important;
}

.otf-filters :deep(.p-select-clear-icon) {
  display: none !important;
}

.otf-filters :deep(.ct-date-button) {
  justify-content: space-between !important;
}

.otf-filters :deep(.ct-date-button .pi),
.otf-filters :deep(.ct-date-button svg) {
  width: 14px !important;
  height: 14px !important;
  flex: 0 0 14px !important;
  font-size: 14px !important;
}

.otf-filter-actions {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 9px !important;
  margin: 8px 0 0 !important;
  padding: 9px 0 1px !important;
  border-top: 1px solid #e4e8eb !important;
  background: transparent !important;
}

.otf-filter-actions :deep(.fm-filter-action-button),
.otf-filter-actions :deep(.fm-action-button),
.otf-filter-actions :deep(.fm-ui-button),
.otf-filter-actions :deep(.p-button) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 13px !important;
  gap: 8px !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 4px 10px rgba(0, 78, 91, .16) !important;
  transform: none !important;
  white-space: nowrap !important;
}

.otf-filter-actions :deep(.otf-search-button.p-button),
.otf-filter-actions :deep(.otf-search-button) {
  border: 1px solid #00a9bd !important;
  background: #00a9bd !important;
  color: #fff !important;
}

.otf-filter-actions :deep(.otf-clean-button.p-button),
.otf-filter-actions :deep(.otf-clean-button) {
  border: 1px solid #00a9bd !important;
  background: #fff !important;
  color: #00a0b4 !important;
}

.otf-filter-actions :deep(.p-button-label) {
  font-size: 13px !important;
  font-weight: 400 !important;
}

.otf-filter-actions :deep(.otf-button-icon) {
  width: 16px !important;
  min-width: 16px !important;
  height: 16px !important;
  flex: 0 0 16px !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 2.2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
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
  border-color: #9eacb7 !important;
  background: #d5dde3 !important;
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
  top: 33px !important;
  width: 244px !important;
  padding: 8px !important;
  border-color: #00a9bd !important;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .18) !important;
}

.otf-filters :deep(.ct-days button) {
  height: 25px !important;
  font-size: 11px !important;
}

:global(.otf-filter-select-overlay.p-select-overlay),
:global(.otf-filter-select-overlay .p-select-list-container),
:global(.otf-filter-select-overlay .p-select-list) {
  background: #fff !important;
}

:global(.otf-filter-select-overlay.p-select-overlay) {
  padding: 0 !important;
  border: 1px solid #c7d1d8 !important;
  border-radius: 2px !important;
  box-shadow: 0 6px 14px rgba(0, 0, 0, .12) !important;
}

:global(.otf-filter-select-overlay .p-select-list) {
  margin: 0 !important;
  padding: 0 !important;
}

:global(.otf-filter-select-overlay .p-select-option) {
  min-height: 22px !important;
  height: 22px !important;
  margin: 0 !important;
  padding: 2px 8px !important;
  border-radius: 0 !important;
  background: #fff !important;
  color: #263746 !important;
  font-size: 10px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
}

:global(.otf-filter-select-overlay .p-select-option-label) {
  font-size: 10px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
}

:global(.otf-filter-select-overlay .p-select-option.p-disabled),
:global(.otf-filter-select-overlay .p-select-option[aria-disabled="true"]) {
  min-height: 18px !important;
  height: 18px !important;
  padding: 0 8px !important;
  background: #fff !important;
  color: transparent !important;
  opacity: 1 !important;
  cursor: default !important;
  pointer-events: none !important;
}

:global(.otf-filter-select-overlay .p-select-option:hover),
:global(.otf-filter-select-overlay .p-select-option.p-focus),
:global(.otf-filter-select-overlay .p-select-option.p-select-option-selected) {
  background: #dff8fb !important;
  color: #004f59 !important;
}

:global(.otf-filter-select-overlay .p-select-option.p-disabled:hover),
:global(.otf-filter-select-overlay .p-select-option.p-disabled.p-focus),
:global(.otf-filter-select-overlay .p-select-option[aria-disabled="true"]:hover),
:global(.otf-filter-select-overlay .p-select-option[aria-disabled="true"].p-focus) {
  background: #fff !important;
  color: transparent !important;
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
    width: min(120px, calc(50vw - 24px)) !important;
    min-width: 0 !important;
  }
}
</style>
