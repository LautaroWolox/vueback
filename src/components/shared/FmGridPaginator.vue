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
      >&lt;</button>

      <span class="fm-page-label">Página</span>
      <input
        class="fm-page-input"
        type="number"
        min="1"
        :max="Math.max(pageCount, 1)"
        :value="pageCount ? page + 1 : 0"
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
      >&gt;</button>

      <button
        type="button"
        class="fm-page-button"
        title="Última página"
        aria-label="Última página"
        :disabled="disabled || pageCount === 0 || page >= pageCount - 1"
        @click="$emit('last-page')"
      >&gt;|</button>

      <select
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

    <span class="fm-custom-paginator__counter">
      Mostrando {{ totalRecords ? first + 1 : 0 }} - {{ last }} de {{ totalRecords }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  first: { type: Number, default: 0 },
  last: { type: Number, default: 0 },
  page: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  rows: { type: Number, default: 10 },
  totalRecords: { type: Number, default: 0 },
  rowsOptions: { type: Array, default: () => [10, 50, 100, 500] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits([
  'first-page',
  'prev-page',
  'next-page',
  'last-page',
  'page-change',
  'rows-change'
])

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
  min-height: 38px;
  display: grid;
  grid-template-columns: minmax(110px, 1fr) auto minmax(160px, 1fr);
  align-items: center;
  padding: 3px 8px;
  color: #111;
  font-size: 12px;
}

.fm-custom-paginator__actions {
  justify-self: start;
  min-width: 0;
}

.fm-custom-paginator__navigation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 0;
  max-width: 100%;
  color: #111;
  white-space: nowrap;
}

.fm-page-button {
  width: 22px;
  min-width: 22px;
  height: 28px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111;
  font-size: 15px;
  cursor: pointer;
}

.fm-page-button:hover:not(:disabled) {
  color: #00a9bd;
}

.fm-page-button:disabled {
  color: #b7c0c4;
  cursor: default;
}

.fm-page-input,
.fm-rows-select {
  height: 28px;
  min-height: 28px;
  border: 1px solid #cbd4db;
  border-radius: 4px;
  background: #fff;
  color: #111;
  font-size: 12px;
}

.fm-page-input {
  width: 46px;
  min-width: 46px;
  padding: 2px 6px;
  text-align: center;
}

.fm-rows-select {
  width: 58px;
  min-width: 58px;
  margin-left: 2px;
  padding: 0 6px;
}

.fm-page-input:focus,
.fm-rows-select:focus {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
}

.fm-custom-paginator__counter {
  justify-self: end;
  color: #222;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .fm-custom-paginator {
    min-height: 78px;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
    padding: 5px 8px;
  }

  .fm-custom-paginator__counter {
    justify-self: end;
  }

  .fm-custom-paginator__navigation {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: center;
  }
}

@media (max-width: 600px) {
  .fm-custom-paginator {
    min-height: 112px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 7px;
  }

  .fm-custom-paginator__navigation {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 2px 4px;
  }

  .fm-custom-paginator__counter {
    align-self: center;
  }
}

@media (pointer: coarse) {
  .fm-page-button {
    min-width: 40px;
    min-height: 40px;
  }
}
</style>
