<template>
  <div class="fm-screen fm-screen--pad ot-fallidas-ct">
    <Accordion v-model:value="active" multiple class="fm-accordion">
      <AccordionPanel value="0">
        <AccordionHeader>FILTROS DE BÚSQUEDA</AccordionHeader>
        <AccordionContent>
          <Filtros />
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>OTS FALLIDAS REPROCESO</AccordionHeader>
        <AccordionContent>
          <Table />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Table from './components/Table.vue'
import Filtros from './components/Filtros.vue'
import {useFallidasCtStore} from './store/CtFallidaStore'

const active = ref(['0', '1'])
let exclusionLabelsObserver
const store = useFallidasCtStore()

const syncExclusionLabels = () => {
  document
    .querySelectorAll('.otf-grid-shell .fm-grid-actions-final button')
    .forEach((button) => {
      if (!button.querySelector('.pi-trash')) return

      if (button.getAttribute('title') !== 'Excluir OTs') {
        button.setAttribute('title', 'Excluir OTs')
      }

      if (button.getAttribute('aria-label') !== 'Excluir OTs') {
        button.setAttribute('aria-label', 'Excluir OTs')
      }
    })

  document
    .querySelectorAll('.otf-exclude-header > span:first-child')
    .forEach((title) => {
      if (title.textContent !== 'Excluir orden técnica') {
        title.textContent = 'Excluir orden técnica'
      }
    })

  document
    .querySelectorAll('.otf-row-action--include')
    .forEach((button) => {
      const unavailable = button.disabled || button.getAttribute('aria-disabled') === 'true'
      button.style.display = unavailable ? 'none' : ''
    })
}

onMounted(() => {
  syncExclusionLabels()

  exclusionLabelsObserver = new MutationObserver(syncExclusionLabels)
  exclusionLabelsObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'disabled']
  })
})

onBeforeUnmount(() => {
  exclusionLabelsObserver?.disconnect()
  exclusionLabelsObserver = undefined
  store.clearStore()
})
</script>

<style scoped>
.ot-fallidas-ct {
  min-height: calc(100vh - 82px);
}

.ot-fallidas-ct :deep(.fm-accordion) {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}

.ot-fallidas-ct :deep(.p-accordionpanel) {
  margin: 0 !important;
  border: 1px solid #d6dde2 !important;
  border-radius: 0 !important;
  background: #fff !important;
  overflow: visible !important;
}

.ot-fallidas-ct :deep(.p-accordionpanel:first-child) {
  position: relative !important;
  z-index: 20 !important;
}

.ot-fallidas-ct :deep(.p-accordionpanel:last-child) {
  position: relative !important;
  z-index: 10 !important;
}

.ot-fallidas-ct :deep(.p-accordionheader) {
  min-height: 28px !important;
  height: 28px !important;
  padding: 5px 10px !important;
  border: 0 !important;
  border-bottom: 1px solid #dfe4e8 !important;
  border-radius: 0 !important;
  background: #f7f7f7 !important;
  color: #000 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  line-height: 18px !important;
  box-shadow: none !important;
}

.ot-fallidas-ct :deep(.p-accordioncontent),
.ot-fallidas-ct :deep(.p-accordioncontent-content) {
  padding: 0 !important;
  border: 0 !important;
  background: #fff !important;
  overflow: visible !important;
}
</style>
