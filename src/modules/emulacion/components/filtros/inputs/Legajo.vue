<template>
  <div class="fm-field fm-field--span-4">
    <label for="legajo">Legajo</label>
    <InputText
      id="legajo"
      v-model="legajo"
      type="text"
      autocomplete="off"
      :disabled="disable"
      @blur="capturarLegajo"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import emulacionStore from '../../../store/emulacionStore.js'

const store = emulacionStore()
const legajo = ref()
const disable = ref(false)

watch(() => store.legajoSelected, (newValue) => {
  legajo.value = newValue
})

watch(() => store.disableNroOt, (newValue) => {
  disable.value = newValue
})

const capturarLegajo = () => {
  store.$setlegajoSelected(legajo.value)
}
</script>
