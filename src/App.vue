<template>
  <FmLoaderShowcase v-if="showLoaderShowcase" />

  <template v-else>
    <FmTypingLoader
      v-if="isRouteLoading"
      fullscreen
      :variant="routeLoader.variant"
      :title="routeLoader.title"
      :message="routeLoader.message"
    />

    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        v-if="Component"
      />
    </RouterView>
  </template>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalAccordionSearch } from '@/composables/useGlobalAccordionSearch'
import FmLoaderShowcase from '@/components/shared/FmLoaderShowcase.vue'
import { getLoaderProfile } from '@/components/shared/fmLoaderProfiles.js'

const router = useRouter()
const isRouteLoading = ref(true)
const routeLoader = ref(getLoaderProfile(router.currentRoute.value))
const showLoaderShowcase = new URLSearchParams(window.location.search).get('loaderShowcase') === '1'
let navigationNumber = 0

useGlobalAccordionSearch()

/*
* Se ejecuta antes de comenzar una navegación.
* También cubre la descarga de componentes importados dinámicamente.
*/
const removeBeforeEach = router.beforeEach((to) => {
  navigationNumber++
  routeLoader.value = getLoaderProfile(to)
  isRouteLoading.value = true
})
/*
* Se ejecuta cuando la navegación terminó.
*/
const removeAfterEach = router.afterEach(async (to) => {
  const completedNavigation = navigationNumber
  routeLoader.value = getLoaderProfile(to)
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
  .then(() => {
    routeLoader.value = getLoaderProfile(router.currentRoute.value)
  })
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
