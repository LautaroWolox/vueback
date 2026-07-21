<template>
  <div id="cajon">
    <div class="grid">
      <div class="col-3">
        <div>
          <legajo />
        </div>
      </div>

    </div>
    <Toast position="top-center" />
    <div class="flex flex-row justify-content-center gap-6 mt-3">
      <boton-buscar @search="onSearch($event)" />
      <boton-limpiar @clear="onClear($event)" />
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

import { storeToRefs } from 'pinia'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Legajo from './inputs/Legajo.vue'
import BotonLimpiar from './botones/BontonLimpiar.vue'
import BotonBuscar from './botones/BotonBuscar.vue'
import emulacionStore from '../../store/emulacionStore.js'

const toast = useToast()
const storeEmulacion = emulacionStore()


const showInfoToast = (val) => {
  toast.add({ severity: 'info', summary: 'No se obtuvo información ', detail: val })
}
const clearToasts = () => {
  toast.removeAllGroups()
}

const onClear = (event) => {
  storeEmulacion.$resetFilters()
  clearToasts()
}


const onSearch = async (event) => {
    await storeEmulacion.$fetchData()
    if (storeEmulacion.error_code === 500 || storeEmulacion.error_code === 404) {
      showInfoToast('Contacte al administrador')
    } else {
      storeEmulacion.$setActiveTab(1)
    }
  
}


</script>

<style scoped></style>
