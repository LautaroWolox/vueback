<template>
  <div ref="root" class="fm-compact-select" :class="{ 'fm-compact-select--open': open }">
    <button
      type="button"
      class="fm-compact-select__trigger"
      role="combobox"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :disabled="disabled"
      @click="toggle"
      @keydown="handleTriggerKeydown"
    >
      <span class="fm-compact-select__value" :class="{ 'fm-compact-select__value--placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="fm-compact-select__chevron" aria-hidden="true"></span>
    </button>

    <div
      v-if="open"
      class="fm-compact-select__panel"
      role="listbox"
      :style="{ maxHeight: `${maxPanelHeight}px` }"
    >
      <button
        v-for="(option, index) in options"
        :key="optionKey(option, index)"
        type="button"
        class="fm-compact-select__option"
        :class="{
          'fm-compact-select__option--selected': isSelected(option),
          'fm-compact-select__option--active': index === activeIndex
        }"
        role="option"
        :aria-selected="isSelected(option)"
        @mouseenter="activeIndex = index"
        @mousedown.prevent
        @click="selectOption(option)"
      >
        {{ optionText(option) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  modelValue: { default: null },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  maxPanelHeight: { type: Number, default: 190 }
})

const emit = defineEmits(['update:modelValue'])
const root = ref(null)
const open = ref(false)
const activeIndex = ref(-1)

const valueOf = (option) => {
  if (option === null || option === undefined) return option
  return props.optionValue ? option?.[props.optionValue] : option
}

const optionText = (option) => {
  if (option === null || option === undefined) return ''
  return props.optionLabel ? String(option?.[props.optionLabel] ?? '') : String(option)
}

const selectedOption = computed(() => props.options.find((option) => valueOf(option) === props.modelValue) ?? null)
const selectedLabel = computed(() => optionText(selectedOption.value))

const isSelected = (option) => valueOf(option) === props.modelValue
const optionKey = (option, index) => `${String(valueOf(option) ?? '')}-${index}`

const setInitialActive = () => {
  const selectedIndex = props.options.findIndex(isSelected)
  activeIndex.value = selectedIndex >= 0 ? selectedIndex : 0
}

const openPanel = async () => {
  if (props.disabled || !props.options.length) return
  open.value = true
  setInitialActive()
  await nextTick()
  root.value?.querySelector('.fm-compact-select__option--active')?.scrollIntoView({ block: 'nearest' })
}

const closePanel = () => {
  open.value = false
  activeIndex.value = -1
}

const toggle = () => {
  if (open.value) closePanel()
  else openPanel()
}

const selectOption = (option) => {
  emit('update:modelValue', valueOf(option))
  closePanel()
}

const moveActive = async (direction) => {
  if (!open.value) await openPanel()
  if (!props.options.length) return

  activeIndex.value = (activeIndex.value + direction + props.options.length) % props.options.length
  await nextTick()
  root.value?.querySelector('.fm-compact-select__option--active')?.scrollIntoView({ block: 'nearest' })
}

const handleTriggerKeydown = (event) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (open.value && activeIndex.value >= 0) selectOption(props.options[activeIndex.value])
    else openPanel()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
  }
}

const handleDocumentPointer = (event) => {
  if (!root.value?.contains(event.target)) closePanel()
}

onMounted(() => document.addEventListener('mousedown', handleDocumentPointer))
onUnmounted(() => document.removeEventListener('mousedown', handleDocumentPointer))
</script>

<style scoped>
.fm-compact-select {
  position: relative;
  width: 100%;
  min-width: 0;
}

.fm-compact-select__trigger {
  width: 100%;
  height: 38px;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid #bfc8cd;
  border-radius: 2px;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
}

.fm-compact-select__trigger:focus,
.fm-compact-select--open .fm-compact-select__trigger {
  outline: none;
  border-color: #00a9bd;
  box-shadow: 0 0 0 2px rgba(0, 169, 189, .14);
}

.fm-compact-select__trigger:disabled {
  background: #edf1f3;
  color: #84939c;
  cursor: not-allowed;
}

.fm-compact-select__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-compact-select__value--placeholder {
  color: #74848e;
}

.fm-compact-select__chevron {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-right: 2px solid #526b79;
  border-bottom: 2px solid #526b79;
  transform: rotate(45deg) translateY(-2px);
}

.fm-compact-select--open .fm-compact-select__chevron {
  transform: rotate(225deg) translate(-1px, -1px);
}

.fm-compact-select__panel {
  position: absolute;
  z-index: 15050;
  top: calc(100% + 3px);
  right: 0;
  left: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 0;
  border: 1px solid #bfc8cd;
  border-radius: 2px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(20, 48, 59, .18);
  scrollbar-width: thin;
}

.fm-compact-select__option {
  width: 100%;
  min-height: 34px;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border: 0;
  border-radius: 0;
  background: #fff;
  color: #263746;
  font: inherit;
  font-size: 13px;
  line-height: 1.25;
  text-align: left;
  cursor: pointer;
}

.fm-compact-select__option--selected {
  background: #eef2f4;
  color: #263746;
  font-weight: 500;
}

.fm-compact-select__option:hover,
.fm-compact-select__option--active,
.fm-compact-select__option--selected.fm-compact-select__option--active {
  background: #d9f8fa;
  color: #006f7d;
}

@media (max-width: 600px), (pointer: coarse) {
  .fm-compact-select__option {
    min-height: 42px;
    padding: 9px 12px;
  }
}
</style>
