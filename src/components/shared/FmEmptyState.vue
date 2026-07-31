<template>
  <div class="fm-empty-state" :class="sizeClass" role="status" :aria-label="text">
    <i v-if="icon" :class="`pi pi-${icon}`" class="fm-empty-state__icon" aria-hidden="true" />
    <span class="fm-empty-state__text">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text:  { type: String,  default: 'No hay resultados' },
  icon:  { type: String,  default: '' },
  /**
   * 'sm'  → 60px alto
   * 'md'  → 100px (default)
   * 'lg'  → 140px
   */
  size:  { type: String,  default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) }
})

const sizeClass = computed(() => `fm-empty-state--${props.size}`)
</script>

<style scoped>
.fm-empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--fm-grid-empty);
  color: #075f6d;
}

.fm-empty-state--sm  { min-height: 60px; }
.fm-empty-state--md  { min-height: 100px; }
.fm-empty-state--lg  { min-height: 140px; }

.fm-empty-state__icon {
  font-size: 20px;
  opacity: .6;
}

.fm-empty-state__text {
  font-size: var(--fm-font-size-md);
  font-weight: 400;
  text-align: center;
}
</style>
