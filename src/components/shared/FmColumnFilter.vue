<template>
  <div class="fm-column-filter" role="search">
    <span class="fm-column-filter__prefix" aria-hidden="true">~</span>
    <input
      :value="modelValue ?? ''"
      type="text"
      class="fm-column-filter__input"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      @input="onInput"
      @keydown.escape="onClear"
    />
    <button
      v-if="modelValue"
      type="button"
      class="fm-column-filter__clear"
      title="Limpiar filtro"
      aria-label="Limpiar filtro de columna"
      @click="onClear"
    >×</button>
    <span v-else class="fm-column-filter__suffix" aria-hidden="true">...</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue:  { default: null },
  placeholder: { type: String, default: '' },
  ariaLabel:   { type: String, default: 'Filtrar columna' }
})

const emit = defineEmits(['update:modelValue', 'filter', 'clear'])

const onInput = (event) => {
  const val = event.target.value || null
  emit('update:modelValue', val)
  emit('filter', val)
}

const onClear = () => {
  emit('update:modelValue', null)
  emit('clear')
  emit('filter', null)
}
</script>

<style scoped>
.fm-column-filter {
  width: 100%;
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 2px;
}

.fm-column-filter__prefix,
.fm-column-filter__suffix,
.fm-column-filter__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fm-text-strong);
  font-size: var(--fm-font-size-sm);
  font-weight: 700;
  line-height: 1;
  user-select: none;
}

.fm-column-filter__clear {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: color var(--fm-transition-fast);
}

.fm-column-filter__clear:hover {
  color: var(--fm-cyan);
}

.fm-column-filter__suffix {
  font-weight: 400;
  color: var(--fm-text-muted);
}

.fm-column-filter__input {
  width: 100%;
  height: 26px;
  min-height: 26px;
  padding: 1px var(--fm-space-1);
  border: 1px solid var(--fm-border-strong);
  border-radius: var(--fm-radius-xs);
  background: var(--fm-white);
  color: var(--fm-text-strong);
  font: inherit;
  font-size: var(--fm-font-size-sm);
  box-shadow: none;
  box-sizing: border-box;
  transition: border-color var(--fm-transition-fast), box-shadow var(--fm-transition-fast);
}

.fm-column-filter__input:focus {
  outline: none;
  border-color: var(--fm-cyan);
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
}
</style>
