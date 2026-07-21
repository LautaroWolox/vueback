<template>
    <div>
        <div v-if="loading === true" class="loading-overlay">
        <ProgressSpinner />
        </div>        
      </div>

</template>




<script setup>
import ProgressSpinner from 'primevue/progressspinner'


const props = defineProps({
    loading: Boolean
  })


</script>

<style scope>

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /*esto es para q aparezca por encima de los popups/modales/ etc. re-ver pq no funciona del todo bien! */
  }

</style>


