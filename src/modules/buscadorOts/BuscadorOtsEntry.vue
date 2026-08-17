<template>
  <BuscadorOtsView v-if="useMigratedView" />
  <IframeView
    v-else
    url-param="/busquedaOtsGcc.html"
    title-param="Búsqueda de OTs"
  />
</template>

<script setup>
import BuscadorOtsView from './BuscadorOtsView.vue'
import IframeView from '@/views/IframeView.vue'

const useMigratedView = import.meta.env.DEV
</script>
