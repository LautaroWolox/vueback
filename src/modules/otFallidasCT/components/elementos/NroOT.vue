<template>
  <div class="fm-field fm-field--span-3">
    <label for="ot">Nro. OT</label>
    <InputText id="ot" v-model="nroOt" type="text" autocomplete="off" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import { useFallidasCtStore } from '../../store/CtFallidaStore'

const store = useFallidasCtStore()
const nroOt = computed({
  get: () => store.filters.nroOT,
  set: (value) => store.setFilter('nroOT', value || '')
})
</script>
