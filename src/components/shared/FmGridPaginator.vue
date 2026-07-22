<template>
  <div class="fm-custom-paginator fm-responsive-paginator">
    <div class="fm-custom-paginator__actions">
      <slot name="actions" />
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
        :value="rows"
        :disabled="disabled"
        aria-label="Filas por página"
        @change="$emit('rows-change', Number($event.target.value))"
      >
        <option v-for="option in rowsOptions" :key="option" :value="option">
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
import { computed } from 'vue'

const props = defineProps({
  first: { type: Number, default: 0 },
  last: { type: Number, default: 0 },
  page: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  rows: { type: Number, default: 10 },
  totalRecords: { type: Number, default: 0 },
  rowsOptions: { type: Array, default: () => [10, 50, 100, 500] },
  disabled: { type: Boolean, default: false },
  showRowsSelect: { type: Boolean, default: true },
  showCounter: { type: Boolean, default: true },
  counterText: { type: String, default: '' },
  pageLabel: { type: String, default: 'Página' }
})

const emit = defineEmits([
  'first-page',
  'prev-page',
  'next-page',
  'last-page',
  'page-change',
  'rows-change'
])

const resolvedCounterText = computed(() => {
  if (props.counterText) return props.counterText
  return `Mostrando ${props.totalRecords ? props.first + 1 : 0} - ${props.last} de ${props.totalRecords}`
})

const changePage = (event) => {
  if (!props.pageCount) return

  const rawValue = Number(event.target.value)
  const requestedPage = Number.isFinite(rawValue) ? rawValue : 1
  const normalizedPage = Math.min(Math.max(requestedPage, 1), props.pageCount)

  event.target.value = String(normalizedPage)
  emit('page-change', normalizedPage - 1)
}
</script>

<style scoped>
.fm-custom-paginator {
  width: 100%;
  min-height: 36px;
  display: grid;
  grid-template-columns: minmax(130px, 1fr) auto minmax(170px, 1fr);
  align-items: center;
  padding: 2px 9px;
  color: #111;
  font-size: 11px;
  box-sizing: border-box;
}

.fm-custom-paginator__actions {
  justify-self: start;
  min-width: 0;
}

.fm-custom-paginator__navigation {
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
  justify-self: end;
  color: #111;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .fm-custom-paginator {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .fm-custom-paginator__actions,
  .fm-custom-paginator__navigation,
  .fm-custom-paginator__counter {
    justify-self: center;
  }
}
</style>
