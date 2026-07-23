<template>
  <div ref="screenRoot" class="jobtype-contrato-screen">
    <JobtypeRelacion relation="contrato" />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import JobtypeRelacion from '../jobtypeRelacion/JobtypeRelacion.vue'

const screenRoot = ref(null)

const openResultsAccordion = async () => {
  await nextTick()

  const resultsHeader = screenRoot.value?.querySelector(
    '.jobtype-panel--results .jobtype-panel__header'
  )

  if (resultsHeader?.getAttribute('aria-expanded') !== 'true') {
    resultsHeader?.click()
  }
}

onMounted(openResultsAccordion)
</script>
