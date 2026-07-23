<template>
  <FmTypingLoader
    v-if="isRouteLoading"
    fullscreen
    title="Cargando"
    message="Cargando pantalla"
  />
  <RouterView v-slot="{ Component }">
    <component
      :is="Component"
      v-if="Component"
    />
  </RouterView>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const isRouteLoading = ref(true)
let navigationNumber = 0
/*
* Se ejecuta antes de comenzar una navegación.
* También cubre la descarga de componentes importados dinámicamente.
*/
const removeBeforeEach = router.beforeEach(() => {
  navigationNumber++
  isRouteLoading.value = true
})
/*
* Se ejecuta cuando la navegación terminó.
*/
const removeAfterEach = router.afterEach(async () => {
  const completedNavigation = navigationNumber
  await nextTick()
  /*
  * Evita que una navegación anterior apague el loader
  * si comenzó una navegación nueva.
  */
  if (completedNavigation === navigationNumber) {
    isRouteLoading.value = false
  }
})
/*
* Apaga el loader si falla la carga de una ruta
* o de un componente importado dinámicamente.
*/
const removeRouterError = router.onError((error) => {
  console.error('Error cargando la ruta:', error)
  isRouteLoading.value = false
})
/*
* Controla la carga inicial de la aplicación.
*/
router
  .isReady()
  .catch((error) => {
    console.error('Error inicializando el router:', error)
  })
  .finally(() => {
    isRouteLoading.value = false
  })
/*
* Elimina los guards si el componente se desmonta.
*/
onBeforeUnmount(() => {
  removeBeforeEach()
  removeAfterEach()
  removeRouterError()
})
</script>