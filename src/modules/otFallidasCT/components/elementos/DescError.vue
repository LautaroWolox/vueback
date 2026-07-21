<template>
  <div
    class="fm-field fm-field--span-4 otf-filter-element otf-filter-element--descripcion"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="error">Descripcion Error</label>
    <InputText
      id="error"
      v-model="desc"
      type="text"
      autocomplete="off"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

defineProps({
  disabled: { type: Boolean, default: false }
})

const store = useFallidasCtStore()
const desc = computed({
  get: () => store.filters.descripcionError,
  set: (value) => store.setFilter('descripcionError', value || '')
})
</script>
