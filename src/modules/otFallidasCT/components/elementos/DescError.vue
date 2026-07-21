<template>
  <div
    class="fm-field fm-field--span-3 otf-filter-element"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="error">Descripción del error</label>
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
