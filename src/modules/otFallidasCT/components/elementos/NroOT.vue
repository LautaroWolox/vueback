<template>
  <div
    class="fm-field fm-field--span-4 otf-filter-element otf-filter-element--nro-ot"
    :class="{ 'otf-filter-element--disabled': disabled }"
  >
    <label for="ot">Nro. OT</label>
    <InputText
      id="ot"
      v-model="nroOt"
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
const nroOt = computed({
  get: () => store.filters.nroOT,
  set: (value) => store.setFilter('nroOT', value || '')
})
</script>
