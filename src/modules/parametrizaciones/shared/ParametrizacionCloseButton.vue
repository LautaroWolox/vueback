<template>
  <button
    type="button"
    class="parametrizacion-close-button"
    :title="title"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
  >×</button>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Cerrar' },
  ariaLabel: { type: String, default: 'Cerrar' }
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.parametrizacion-close-button {
  width: 28px;
  min-width: 28px;
  height: 28px;
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #a5afb4;
  font-family: inherit;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.parametrizacion-close-button:hover,
.parametrizacion-close-button:focus-visible {
  color: #00a9bd;
  outline: none;
}
</style>
