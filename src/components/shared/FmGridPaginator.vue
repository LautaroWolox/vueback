<template>
  <div class="fm-custom-paginator">
    <div class="fm-custom-paginator__actions">
      <div class="fm-custom-paginator__actions-inner">
        <slot name="actions" />
      </div>
    </div>

    <div class="fm-custom-paginator__navigation" aria-label="Paginación">
      <button
        type="button"
        class="fm-page-button"
        title="Primera página"
        aria-label="Primera página"
        :disabled="disabled || page === 0 || pageCount === 0"
        @click="$emit('first-page')"
      >|&lt;</button>

      <button
        type="button"
        class="fm-page-button"
        title="Página anterior"
        aria-label="Página anterior"
        :disabled="disabled || page === 0 || pageCount === 0"
        @click="$emit('prev-page')"
      >&lt;&lt;</button>

      <span class="fm-page-label">{{ pageLabel }}</span>
      <input
        class="fm-page-input"
        type="number"
        min="1"
        :max="Math.max(pageCount, 1)"
        :value="pageCount ? page + 1 : 1"
        :disabled="disabled || pageCount === 0"
        aria-label="Número de página"
        @change="changePage"
      />
      <span class="fm-page-total">de {{ pageCount }}</span>

      <button
        type="button"
        class="fm-page-button"
        title="Página siguiente"
        aria-label="Página siguiente"
        :disabled="disabled || pageCount === 0 || page >= pageCount - 1"
        @click="$emit('next-page')"
      >&gt;&gt;</button>

      <button
        type="button"
        class="fm-page-button"
        title="Última página"
        aria-label="Última página"
        :disabled="disabled || pageCount === 0 || page >= pageCount - 1"
        @click="$emit('last-page')"
      >&gt;|</button>

      <select
        v-if="showRowsSelect"
        class="fm-rows-select"
        :value="displayRows"
        :disabled="disabled"
        aria-label="Filas por página"
        @change="changeRows"
      >
        <option v-for="option in normalizedRowsOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>

    <span v-if="showCounter" class="fm-custom-paginator__counter">
      {{ resolvedCounterText }}
    </span>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, watch } from 'vue'

const props = defineProps({
  first: { type: Number, default: 0 },
  last: { type: Number, default: 0 },
  page: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  rows: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
  rowsOptions: { type: Array, default: () => [10, 50, 100, 500] },
  disabled: { type: Boolean, default: false },
  showRowsSelect: { type: Boolean, default: true },
  showCounter: { type: Boolean, default: true },
  counterText: { type: String, default: '' },
  pageLabel: { type: String, default: 'Página' },
  autoMaxRows: { type: Boolean, default: true }
})

const emit = defineEmits([
  'first-page',
  'prev-page',
  'next-page',
  'last-page',
  'page-change',
  'rows-change'
])

const normalizedRowsOptions = computed(() => (
  [...new Set(props.rowsOptions.map(Number).filter((value) => Number.isFinite(value) && value > 0))]
))

const maxRowsOption = computed(() => (
  normalizedRowsOptions.value.length ? Math.max(...normalizedRowsOptions.value) : 0
))

const displayRows = computed(() => (
  props.rows > 0 ? props.rows : maxRowsOption.value
))

const resolvedCounterText = computed(() => {
  if (props.counterText) return props.counterText
  return `Mostrando ${props.last} de ${props.totalRecords}`
})

const applyMaximumRows = () => {
  if (!props.autoMaxRows || !props.showRowsSelect || props.disabled) return
  if (!maxRowsOption.value || props.rows === maxRowsOption.value) return

  emit('rows-change', maxRowsOption.value)
}

const scheduleMaximumRows = () => {
  nextTick(() => {
    requestAnimationFrame(applyMaximumRows)
  })
}

const changeRows = (event) => {
  emit('rows-change', Number(event.target.value))
}

const changePage = (event) => {
  if (!props.pageCount) return

  const rawValue = Number(event.target.value)
  const requestedPage = Number.isFinite(rawValue) ? rawValue : 1
  const normalizedPage = Math.min(Math.max(requestedPage, 1), props.pageCount)

  event.target.value = String(normalizedPage)
  emit('page-change', normalizedPage - 1)
}

onMounted(scheduleMaximumRows)
watch(() => props.rowsOptions, scheduleMaximumRows, { deep: true })
</script>

<style scoped>
.fm-custom-paginator {
  position: relative;
  width: 100%;
  min-height: 36px;
  display: grid !important;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 2px 4px;
  color: #111;
  font-size: 11px;
  box-sizing: border-box;
}

.fm-custom-paginator__actions {
  position: absolute !important;
  left: 4px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  display: block !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
  z-index: 2;
}

.fm-custom-paginator__actions-inner {
  width: max-content !important;
  min-width: 0 !important;
  max-width: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
  white-space: nowrap !important;
}

.fm-custom-paginator__actions-inner :deep(.fm-grid-actions-final) {
  width: max-content !important;
  min-width: 0 !important;
  max-width: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 4px !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
}

.fm-custom-paginator__actions-inner :deep(.fm-grid-actions-final > .p-button),
.fm-custom-paginator__actions-inner :deep(.fm-grid-actions-final > .fm-grid-action-final) {
  width: 24px !important;
  min-width: 24px !important;
  max-width: 24px !important;
  height: 24px !important;
  min-height: 24px !important;
  max-height: 24px !important;
  flex: 0 0 24px !important;
  margin: 0 !important;
}

.fm-custom-paginator__actions-inner :deep(.fm-grid-actions-final--large > .p-button),
.fm-custom-paginator__actions-inner :deep(.fm-grid-actions-final--large > .fm-grid-action-final) {
  width: 28px !important;
  min-width: 28px !important;
  max-width: 28px !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  flex-basis: 28px !important;
}

.fm-custom-paginator__navigation {
  grid-column: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  color: #111;
  white-space: nowrap;
}

.fm-page-button {
  width: 20px;
  min-width: 20px;
  height: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.fm-page-button:hover:not(:disabled) {
  color: #00a9bd;
}

.fm-page-button:disabled {
  color: #b7b7b7;
  cursor: default;
}

.fm-page-input,
.fm-rows-select {
  height: 25px;
  min-height: 25px;
  border: 1px solid #d5d5d5;
  border-radius: 2px;
  background: #fff;
  color: #111;
  font-size: 11px;
}

.fm-page-input {
  width: 58px;
  min-width: 58px;
  padding: 1px 5px;
  text-align: left;
}

.fm-rows-select {
  width: 48px;
  min-width: 48px;
  margin-left: 5px;
  padding: 0 3px;
}

.fm-page-input:focus,
.fm-rows-select:focus {
  outline: none;
  border-color: #00a9bd;
}

.fm-custom-paginator__counter {
  grid-column: 3;
  justify-self: end;
  color: #111;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .fm-custom-paginator {
    min-height: 72px;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 4px;
    padding-top: 34px;
  }

  .fm-custom-paginator__actions {
    left: 4px !important;
    top: 4px !important;
    transform: none !important;
  }

  .fm-custom-paginator__navigation,
  .fm-custom-paginator__counter {
    grid-column: 1;
    justify-self: center;
  }
}
</style>
