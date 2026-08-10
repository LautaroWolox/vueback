<template>
  <div class="fm-field fm-field--span-4 emulation-legajo-field">
    <label for="legajo">LEGAJO</label>

    <div class="emulation-legajo-control">
      <span class="emulation-legajo-icon" aria-hidden="true">
        <i class="pi pi-id-card"></i>
      </span>

      <InputText
        id="legajo"
        v-model="legajo"
        type="text"
        autocomplete="off"
        placeholder="Ingrese el legajo"
        :disabled="disable"
        @keyup.enter="capturarLegajo"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import emulacionStore from '../../../store/emulacionStore.js'

const store = emulacionStore()
const legajo = ref('')
const disable = ref(false)

watch(() => store.legajoSelected, (newValue) => {
  const normalizedValue = newValue ?? ''
  if (legajo.value !== normalizedValue) legajo.value = normalizedValue
}, { immediate: true })

watch(legajo, (newValue) => {
  store.$setlegajoSelected(newValue)
})

watch(() => store.toggleLoader, (newValue) => {
  disable.value = Boolean(newValue)
}, { immediate: true })

const capturarLegajo = () => {
  store.$setlegajoSelected(legajo.value)
}
</script>

<style scoped>
.emulation-legajo-field {
  min-width: 0;
}

.emulation-legajo-control {
  width: 100%;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.emulation-legajo-icon {
  width: 36px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #c8d8df;
  border-radius: 4px;
  background: #eafcff;
  color: #00a9bd;
  box-shadow: 0 5px 14px rgba(32, 57, 71, .3);
  box-sizing: border-box;
}

.emulation-legajo-icon i {
  font-size: 18px;
}

.emulation-legajo-control :deep(.p-inputtext) {
  width: 100%;
  height: 32px;
  min-height: 32px;
  border-color: #b8cbd3;
  box-shadow: 0 5px 14px rgba(32, 57, 71, .32);
  transition: border-color .16s ease, box-shadow .16s ease;
}

.emulation-legajo-control :deep(.p-inputtext:hover) {
  border-color: #8fb3bf;
  box-shadow: 0 6px 17px rgba(32, 57, 71, .36);
}

.emulation-legajo-control :deep(.p-inputtext:focus) {
  border-color: #00a9bd;
  box-shadow:
    0 0 0 2px rgba(0, 169, 189, .16),
    0 7px 19px rgba(32, 57, 71, .4);
}
</style>
