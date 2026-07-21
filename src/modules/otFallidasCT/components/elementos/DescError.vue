<template>
  <div class="fm-field fm-field--span-3">
    <label for="error">Descripción del error</label>
    <InputText id="error" v-model="desc" type="text" autocomplete="off" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const desc = computed({
  get: () => store.filters.descripcionError,
  set: (value) => store.setFilter('descripcionError', value || '')
})
</script>
